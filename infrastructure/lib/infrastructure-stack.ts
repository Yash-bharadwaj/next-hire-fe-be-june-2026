import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apprunner from 'aws-cdk-lib/aws-apprunner';
import * as amplify from 'aws-cdk-lib/aws-amplify';

const GITHUB_REPO_URL = 'https://github.com/Yash-bharadwaj/next-hire-fe-be-june-2026';
const GITHUB_BRANCH = 'main';

// Amplify app domain is stable once created (https://<branch>.<appId>.amplifyapp.com).
// Hardcoded (rather than Fn::GetAtt off FrontendApp) to avoid a circular CFN
// dependency, since FrontendApp's env vars also reference BackendService's URL.
const AMPLIFY_FRONTEND_URL = 'https://main.d2iuw7uqhboofs.amplifyapp.com';

// AWS::AppRunner::Connection is not a CloudFormation resource type - it can
// only be created via the CLI/console (`aws apprunner create-connection`).
// This connection was created out-of-band; CDK just references its ARN.
const APP_RUNNER_GITHUB_CONNECTION_ARN =
  'arn:aws:apprunner:us-east-1:736375071569:connection/next-hire-github-connection/e1ab8cf782f4457897f546f0e604246b';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ------------------------------------------------------------------
    // Networking: reuse the account's default VPC (avoids NAT Gateway cost
    // since App Runner does not run inside this VPC).
    // ------------------------------------------------------------------
    const vpc = ec2.Vpc.fromLookup(this, 'DefaultVpc', { isDefault: true });

    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
      vpc,
      description: 'Next Hire RDS Postgres - allows TLS connections from anywhere',
      allowAllOutbound: true,
    });
    dbSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(5432),
      'Postgres (TLS enforced via parameter group)'
    );

    // ------------------------------------------------------------------
    // RDS PostgreSQL (free-tier eligible db.t4g.micro, public subnet)
    // ------------------------------------------------------------------
    const postgresEngine = rds.DatabaseInstanceEngine.postgres({
      version: rds.PostgresEngineVersion.VER_16,
    });

    const dbParameterGroup = new rds.ParameterGroup(this, 'DbParameterGroup', {
      engine: postgresEngine,
      description: 'Next Hire - enforce SSL connections',
      parameters: {
        'rds.force_ssl': '1',
      },
    });

    const database = new rds.DatabaseInstance(this, 'Database', {
      engine: postgresEngine,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE4_GRAVITON, ec2.InstanceSize.MICRO),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      securityGroups: [dbSecurityGroup],
      publiclyAccessible: true,
      databaseName: 'nexthire',
      credentials: rds.Credentials.fromGeneratedSecret('nexthire_admin', {
        secretName: 'nexthire/db-credentials',
      }),
      allocatedStorage: 20,
      storageType: rds.StorageType.GP3,
      parameterGroup: dbParameterGroup,
      backupRetention: cdk.Duration.days(1),
      deleteAutomatedBackups: true,
      removalPolicy: cdk.RemovalPolicy.SNAPSHOT,
    });
    const dbSecret = database.secret!;

    // ------------------------------------------------------------------
    // Application secrets
    // ------------------------------------------------------------------
    const jwtSecret = new secretsmanager.Secret(this, 'JwtSecret', {
      secretName: 'nexthire/jwt-secret',
      generateSecretString: {
        secretStringTemplate: '{}',
        generateStringKey: 'value',
        excludePunctuation: true,
        passwordLength: 64,
      },
    });

    const jwtRefreshSecret = new secretsmanager.Secret(this, 'JwtRefreshSecret', {
      secretName: 'nexthire/jwt-refresh-secret',
      generateSecretString: {
        secretStringTemplate: '{}',
        generateStringKey: 'value',
        excludePunctuation: true,
        passwordLength: 64,
      },
    });

    const resendApiKeySecret = new secretsmanager.Secret(this, 'ResendApiKeySecret', {
      secretName: 'nexthire/resend-api-key',
      secretStringValue: cdk.SecretValue.unsafePlainText(process.env.RESEND_API_KEY || 'placeholder'),
    });

    // ------------------------------------------------------------------
    // App Runner instance role - lets the running container read secrets
    // ------------------------------------------------------------------
    const appRunnerInstanceRole = new iam.Role(this, 'AppRunnerInstanceRole', {
      assumedBy: new iam.ServicePrincipal('tasks.apprunner.amazonaws.com'),
    });
    dbSecret.grantRead(appRunnerInstanceRole);
    jwtSecret.grantRead(appRunnerInstanceRole);
    jwtRefreshSecret.grantRead(appRunnerInstanceRole);
    resendApiKeySecret.grantRead(appRunnerInstanceRole);

    // Allow the backend to send OTP / password-reset emails via SES using
    // its instance role - no SMTP credentials to manage.
    appRunnerInstanceRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['ses:SendEmail', 'ses:SendRawEmail'],
        resources: [
          `arn:aws:ses:${this.region}:${this.account}:identity/*`,
        ],
      })
    );

    // ------------------------------------------------------------------
    // S3 bucket for AI-parsed resume / job description documents
    // ------------------------------------------------------------------
    const documentsBucket = new s3.Bucket(this, 'DocumentsBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    documentsBucket.grantReadWrite(appRunnerInstanceRole);

    // ------------------------------------------------------------------
    // App Runner service (backend)
    //
    // Bootstrap note: App Runner refuses to create a service whose
    // `connectionArn` points at a connection that hasn't completed the
    // GitHub handshake yet (PENDING_HANDSHAKE). So the very first deploy
    // is done with `-c enableBackendService=true` left OFF, which creates
    // everything except this service + its URL. After authorizing the
    // GitHubConnection in the App Runner console, redeploy with
    // `-c enableBackendService=true` (and persist that in cdk.json) to
    // create the service for good.
    // ------------------------------------------------------------------
    const enableBackendService = this.node.tryGetContext('enableBackendService') === true
      || this.node.tryGetContext('enableBackendService') === 'true';

    let backendServiceUrl: string | undefined;

    if (enableBackendService) {
      const backendService = new apprunner.CfnService(this, 'BackendService', {
        serviceName: 'next-hire-backend',
        sourceConfiguration: {
          autoDeploymentsEnabled: true,
          authenticationConfiguration: {
            connectionArn: APP_RUNNER_GITHUB_CONNECTION_ARN,
          },
          codeRepository: {
            repositoryUrl: GITHUB_REPO_URL,
            sourceCodeVersion: {
              type: 'BRANCH',
              value: GITHUB_BRANCH,
            },
            sourceDirectory: 'next-hire-backend',
            codeConfiguration: {
              configurationSource: 'API',
              codeConfigurationValues: {
                runtime: 'NODEJS_22',
                buildCommand: 'npm ci && npm run build',
                startCommand: 'npm run start',
                port: '5001',
                runtimeEnvironmentVariables: [
                  { name: 'NODE_ENV', value: 'production' },
                  { name: 'API_VERSION', value: 'v1' },
                  { name: 'DB_HOST', value: database.dbInstanceEndpointAddress },
                  { name: 'DB_PORT', value: database.dbInstanceEndpointPort },
                  { name: 'DB_NAME', value: 'nexthire' },
                  { name: 'EMAIL_PROVIDER', value: 'ses' },
                  { name: 'SES_REGION', value: this.region },
                  { name: 'FROM_EMAIL', value: 'exclusivesvr@gmail.com' },
                  { name: 'FROM_NAME', value: 'The Next Hire' },
                  { name: 'FRONTEND_URL', value: AMPLIFY_FRONTEND_URL },
                  { name: 'STORAGE_PROVIDER', value: 's3' },
                  { name: 'DOCUMENTS_BUCKET', value: documentsBucket.bucketName },
                ],
                runtimeEnvironmentSecrets: [
                  { name: 'DB_USERNAME', value: `${dbSecret.secretArn}:username::` },
                  { name: 'DB_PASSWORD', value: `${dbSecret.secretArn}:password::` },
                  { name: 'JWT_SECRET', value: `${jwtSecret.secretArn}:value::` },
                  { name: 'JWT_REFRESH_SECRET', value: `${jwtRefreshSecret.secretArn}:value::` },
                  { name: 'RESEND_API_KEY', value: resendApiKeySecret.secretArn },
                ],
              },
            },
          },
        },
        instanceConfiguration: {
          cpu: '0.25 vCPU',
          memory: '0.5 GB',
          instanceRoleArn: appRunnerInstanceRole.roleArn,
        },
        healthCheckConfiguration: {
          protocol: 'HTTP',
          path: '/health',
          interval: 10,
          timeout: 5,
          healthyThreshold: 1,
          unhealthyThreshold: 5,
        },
      });
      backendServiceUrl = `https://${backendService.attrServiceUrl}`;

      new cdk.CfnOutput(this, 'BackendServiceUrl', {
        value: backendServiceUrl,
        description: 'App Runner backend base URL',
      });
    }

    // ------------------------------------------------------------------
    // Amplify Hosting (frontend)
    //
    // AWS::Amplify::App requires a GitHub auth token (accessToken or
    // oauthToken) up front when `repository` is set. The token is stored
    // in Secrets Manager (created out-of-band via the CLI:
    // `aws secretsmanager create-secret --name nexthire/github-token ...`)
    // and referenced here via a CloudFormation dynamic reference, so this
    // resource is always defined - a `cdk deploy` that forgets a CLI flag
    // can never accidentally delete the frontend app.
    // ------------------------------------------------------------------
    const githubTokenSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'GitHubTokenSecret',
      'nexthire/github-token'
    );

    const amplifyApp = new amplify.CfnApp(this, 'FrontendApp', {
      name: 'next-hire-frontend',
      repository: GITHUB_REPO_URL,
      accessToken: githubTokenSecret.secretValue.unsafeUnwrap(),
      environmentVariables: [
        { name: 'AMPLIFY_MONOREPO_APP_ROOT', value: 'next-hire-frontend' },
        ...(backendServiceUrl ? [{ name: 'VITE_API_BASE_URL', value: backendServiceUrl }] : []),
      ],
      customRules: [
        {
          source: '/<*>',
          target: '/index.html',
          status: '404-200',
        },
      ],
    });

    const amplifyBranch = new amplify.CfnBranch(this, 'FrontendBranch', {
      appId: amplifyApp.attrAppId,
      branchName: GITHUB_BRANCH,
      enableAutoBuild: true,
      environmentVariables: backendServiceUrl
        ? [{ name: 'VITE_API_BASE_URL', value: backendServiceUrl }]
        : [],
    });
    amplifyBranch.addDependency(amplifyApp);

    new cdk.CfnOutput(this, 'FrontendUrl', {
      value: `https://${GITHUB_BRANCH}.${amplifyApp.attrDefaultDomain}`,
      description: 'Amplify frontend URL',
    });

    // ------------------------------------------------------------------
    // Outputs
    // ------------------------------------------------------------------
    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: database.dbInstanceEndpointAddress,
      description: 'RDS Postgres endpoint',
    });
    new cdk.CfnOutput(this, 'DatabaseSecretArn', {
      value: dbSecret.secretArn,
      description: 'Secrets Manager ARN for DB credentials',
    });
    new cdk.CfnOutput(this, 'DocumentsBucketName', {
      value: documentsBucket.bucketName,
      description: 'S3 bucket for AI-parsed resume / job description documents',
    });
    new cdk.CfnOutput(this, 'GitHubConnectionArn', {
      value: APP_RUNNER_GITHUB_CONNECTION_ARN,
      description: 'App Runner GitHub connection - must be authorized in the console (PENDING_HANDSHAKE -> AVAILABLE)',
    });
  }
}
