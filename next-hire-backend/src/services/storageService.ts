import fs from "fs/promises";
import path from "path";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { logger } from "../utils/logger";

// STORAGE_PROVIDER=s3 (with DOCUMENTS_BUCKET set) uploads to S3 via the App
// Runner instance role's IAM permissions - no static credentials needed.
// Anything else falls back to local disk storage under uploads/documents/,
// served statically (mirrors the EMAIL_PROVIDER ses/smtp toggle).
const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || "local";
const DOCUMENTS_BUCKET = process.env.DOCUMENTS_BUCKET;
const AWS_REGION = process.env.AWS_REGION || process.env.SES_REGION || "us-east-1";

const isS3Enabled = STORAGE_PROVIDER === "s3" && !!DOCUMENTS_BUCKET;

const s3Client = isS3Enabled ? new S3Client({ region: AWS_REGION }) : null;

const localDocumentsDir = path.join(__dirname, "../../uploads/documents");

if (isS3Enabled) {
  logger.info(`Document storage configured (provider: s3, bucket: ${DOCUMENTS_BUCKET})`);
} else {
  logger.info("Document storage configured (provider: local, uploads/documents)");
}

export interface UploadedDocument {
  /** S3 object key, or local relative path (e.g. "/uploads/documents/xyz.pdf") - stored in the DB. */
  key: string;
  /** Immediately-usable URL: presigned (S3) or static path (local). */
  url: string;
}

/**
 * Move a temp upload (written by multer to a local temp dir) into permanent
 * storage - S3 if configured, otherwise uploads/documents/. Deletes the temp
 * file afterwards.
 */
export async function uploadDocument(
  localFilePath: string,
  fileName: string,
  mimetype: string
): Promise<UploadedDocument> {
  if (isS3Enabled && s3Client) {
    const key = `documents/${fileName}`;
    const body = await fs.readFile(localFilePath);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: DOCUMENTS_BUCKET,
        Key: key,
        Body: body,
        ContentType: mimetype,
      })
    );

    await fs.unlink(localFilePath).catch((error) => {
      logger.warn(`Failed to remove temp upload ${localFilePath}`, error);
    });

    return { key, url: await getFileUrl(key) };
  }

  await fs.mkdir(localDocumentsDir, { recursive: true });
  const destPath = path.join(localDocumentsDir, fileName);
  await fs.rename(localFilePath, destPath);

  const key = `/uploads/documents/${fileName}`;
  return { key, url: key };
}

/**
 * Resolve a stored key/path to a URL the frontend can open directly.
 * S3 keys -> presigned GetObject URL (1h expiry). Local paths (starting with
 * /uploads/) -> returned as-is, served by express.static.
 */
export async function getFileUrl(storedKey: string): Promise<string> {
  if (!isS3Enabled || !s3Client || storedKey.startsWith("/uploads/")) {
    return storedKey;
  }

  try {
    const command = new GetObjectCommand({ Bucket: DOCUMENTS_BUCKET, Key: storedKey });
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch (error) {
    logger.error(`Failed to generate presigned URL for ${storedKey}`, error);
    return storedKey;
  }
}

/**
 * Read a previously-uploaded file's full contents into memory, given the
 * key/path stored in the DB. Mirrors getFileUrl's storage-mode branching.
 * Used for server-side document preview (text extraction) - small
 * resumes/JDs only, not meant for large files.
 */
export async function readDocumentBuffer(storedKey: string): Promise<Buffer> {
  // A handful of older records stored a full URL instead of a bare
  // key/relative path - fetch those directly rather than trying to resolve
  // them as a storage key.
  if (storedKey.startsWith("http://") || storedKey.startsWith("https://")) {
    const response = await fetch(storedKey);
    if (!response.ok) throw new Error(`Failed to fetch ${storedKey}: ${response.status}`);
    return Buffer.from(await response.arrayBuffer());
  }

  if (isS3Enabled && s3Client && !storedKey.startsWith("/uploads/")) {
    const response = await s3Client.send(
      new GetObjectCommand({ Bucket: DOCUMENTS_BUCKET, Key: storedKey })
    );
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  const localPath = storedKey.startsWith("/uploads/")
    ? path.join(__dirname, "../../", storedKey)
    : path.join(localDocumentsDir, storedKey);
  return fs.readFile(localPath);
}

/**
 * Best-effort delete of a previously-uploaded file, given the key/path
 * stored in the DB. Mirrors getFileUrl's storage-mode branching.
 */
export async function deleteStoredDocument(storedKey: string): Promise<void> {
  if (!storedKey) return;

  if (isS3Enabled && s3Client && !storedKey.startsWith("/uploads/")) {
    try {
      await s3Client.send(new DeleteObjectCommand({ Bucket: DOCUMENTS_BUCKET, Key: storedKey }));
    } catch (error) {
      logger.warn(`Failed to delete S3 object ${storedKey}`, error);
    }
    return;
  }

  const localPath = path.join(__dirname, "../../", storedKey);
  await fs.unlink(localPath).catch(() => {});
}
