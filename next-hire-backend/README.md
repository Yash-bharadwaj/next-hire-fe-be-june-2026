# The Next Hire - Backend API

A comprehensive recruitment platform backend built with Node.js, TypeScript, Express.js, and PostgreSQL. This API supports multiple user roles (Candidates, Recruiters, Vendors) and provides complete functionality for job management, candidate tracking, and recruitment workflows.

## 🚀 Features

### Authentication & User Management

- **Multi-role authentication** (Candidate, Recruiter, Vendor, Admin)
- **Email OTP verification** for secure signup
- **JWT-based authentication** with refresh tokens
- **Password reset functionality** via email
- **Role-based access control (RBAC)**

### Candidate Features

- ✅ **Sign up with email OTP verification**
- ✅ **Login with email/password**
- ✅ **Password management** (update/reset)
- ✅ **Profile management** with resume upload
- ✅ **Browse jobs** with advanced filtering
- ✅ **Job detail viewing**
- ✅ **Apply to jobs** with cover letter
- ✅ **Track application status**
- ✅ **View upcoming interviews**
- ✅ **Onboarding task management**

### Recruiter Features

- ✅ **Profile management**
- ✅ **Create and manage jobs** (CRUD operations)
- ✅ **List jobs** with filtering and export
- ✅ **View job submissions** with candidate details
- ✅ **Submission management** with status tracking
- ✅ **Interview scheduling** with calendar integration
- ✅ **Task creation and management**
- ✅ **Offer and placement management**
- ✅ **Notes and attachments** on jobs/submissions

### Vendor Features

- ✅ **Profile management**
- ✅ **View vendor-eligible jobs**
- ✅ **Submit candidates to jobs**
- ✅ **Track submission status**
- ✅ **Candidate pool management**

### Core System Features

- **Database models** for all entities with proper relationships
- **Input validation** with comprehensive error handling
- **File upload support** for resumes and documents
- **Email notifications** for OTP, password reset, etc.
- **Comprehensive logging** with Winston
- **API documentation** ready structure
- **Security middleware** (helmet, rate limiting, etc.)

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT with refresh tokens
- **Email**: Nodemailer (configurable SMTP)
- **Validation**: express-validator
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate limiting

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
cd next-hire-backend

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit .env file with your configurations
nano .env
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb next_hire_dev

# Run migrations (auto-sync in development)
npm run dev
```

### 4. Start Development Server

```bash
# Start in development mode with hot reload
npm run dev

# Server will start on http://localhost:5001
```

## 📁 Project Structure

```
src/
├── config/
│   └── database.ts          # Database configuration
├── controllers/
│   ├── authController.ts    # Authentication logic
│   ├── candidateController.ts
│   ├── recruiterController.ts
│   └── vendorController.ts
├── middleware/
│   ├── auth.ts              # JWT authentication
│   ├── errorHandler.ts      # Global error handling
│   └── validation.ts        # Input validation
├── models/
│   ├── User.ts              # User model
│   ├── Candidate.ts         # Candidate profile
│   ├── Recruiter.ts         # Recruiter profile
│   ├── Vendor.ts            # Vendor profile
│   ├── Job.ts               # Job postings
│   ├── Submission.ts        # Job applications
│   ├── Interview.ts         # Interview scheduling
│   └── Task.ts              # Task management
├── routes/
│   ├── auth.ts              # Authentication routes
│   ├── candidate.ts         # Candidate endpoints
│   ├── recruiter.ts         # Recruiter endpoints
│   ├── vendor.ts            # Vendor endpoints
│   ├── jobs.ts              # Public job routes
│   └── submissions.ts       # Submission routes
├── utils/
│   ├── jwt.ts               # JWT utilities
│   ├── otp.ts               # OTP generation
│   ├── email.ts             # Email service
│   └── logger.ts            # Logging utilities
└── server.ts                # Main server file
```

## 🔐 Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=next_hire_dev
DB_USERNAME=postgres
DB_PASSWORD=your_password

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@thenexthire.com
FROM_NAME=The Next Hire

# OTP Configuration
OTP_EXPIRES_IN=10
OTP_LENGTH=6
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint                       | Description                     |
| ------ | ------------------------------ | ------------------------------- |
| POST   | `/api/v1/auth/signup`          | Register new user with OTP      |
| POST   | `/api/v1/auth/verify-otp`      | Verify email OTP                |
| POST   | `/api/v1/auth/login`           | User login                      |
| POST   | `/api/v1/auth/refresh-token`   | Refresh JWT token               |
| POST   | `/api/v1/auth/forgot-password` | Request password reset          |
| POST   | `/api/v1/auth/reset-password`  | Reset password with token       |
| POST   | `/api/v1/auth/change-password` | Change password (authenticated) |

### Candidate Endpoints

| Method | Endpoint                           | Description              |
| ------ | ---------------------------------- | ------------------------ |
| GET    | `/api/v1/candidate/profile`        | Get candidate profile    |
| PUT    | `/api/v1/candidate/profile`        | Update candidate profile |
| POST   | `/api/v1/candidate/resume`         | Upload resume            |
| GET    | `/api/v1/candidate/jobs`           | Browse available jobs    |
| GET    | `/api/v1/candidate/jobs/:id`       | Get job details          |
| POST   | `/api/v1/candidate/jobs/:id/apply` | Apply to job             |
| GET    | `/api/v1/candidate/submissions`    | Get my applications      |
| GET    | `/api/v1/candidate/interviews`     | Get upcoming interviews  |

### Recruiter Endpoints

| Method | Endpoint                                       | Description              |
| ------ | ---------------------------------------------- | ------------------------ |
| GET    | `/api/v1/recruiter/profile`                    | Get recruiter profile    |
| PUT    | `/api/v1/recruiter/profile`                    | Update recruiter profile |
| POST   | `/api/v1/recruiter/jobs`                       | Create new job           |
| GET    | `/api/v1/recruiter/jobs`                       | List jobs                |
| GET    | `/api/v1/recruiter/jobs/:id`                   | Get job details          |
| PUT    | `/api/v1/recruiter/jobs/:id`                   | Update job               |
| GET    | `/api/v1/recruiter/jobs/:id/submissions`       | Get job submissions      |
| GET    | `/api/v1/recruiter/submissions/:id`            | Get submission details   |
| PUT    | `/api/v1/recruiter/submissions/:id/status`     | Update submission status |
| POST   | `/api/v1/recruiter/submissions/:id/interviews` | Schedule interview       |
| POST   | `/api/v1/recruiter/tasks`                      | Create task              |
| GET    | `/api/v1/recruiter/tasks`                      | List tasks               |

### Vendor Endpoints

| Method | Endpoint                         | Description              |
| ------ | -------------------------------- | ------------------------ |
| GET    | `/api/v1/vendor/profile`         | Get vendor profile       |
| PUT    | `/api/v1/vendor/profile`         | Update vendor profile    |
| GET    | `/api/v1/vendor/jobs`            | Get vendor-eligible jobs |
| GET    | `/api/v1/vendor/jobs/:id`        | Get job details          |
| POST   | `/api/v1/vendor/jobs/:id/submit` | Submit candidate to job  |
| GET    | `/api/v1/vendor/submissions`     | Get my submissions       |
| GET    | `/api/v1/vendor/submissions/:id` | Get submission status    |
| POST   | `/api/v1/vendor/candidates`      | Create candidate profile |
| GET    | `/api/v1/vendor/candidates`      | List my candidates       |

### Public Endpoints

| Method | Endpoint                  | Description        |
| ------ | ------------------------- | ------------------ |
| GET    | `/api/v1/jobs/search`     | Public job search  |
| GET    | `/api/v1/jobs/:id/public` | Public job details |

## 🔍 Example API Usage

### 1. User Signup (Candidate)

```bash
curl -X POST http://localhost:5001/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidate@example.com",
    "password": "securePassword123",
    "role": "candidate"
  }'
```

### 2. Verify OTP

```bash
curl -X POST http://localhost:5000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidate@example.com",
    "otp": "123456"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidate@example.com",
    "password": "securePassword123"
  }'
```

### 4. Browse Jobs (Authenticated)

```bash
curl -X GET "http://localhost:5000/api/v1/candidate/jobs?page=1&limit=10&job_type=full_time" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Create Job (Recruiter)

```bash
curl -X POST http://localhost:5000/api/v1/recruiter/jobs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior React Developer",
    "description": "We are looking for an experienced React developer...",
    "company_name": "TechCorp Inc",
    "location": "San Francisco, CA",
    "job_type": "full_time",
    "salary_min": 120000,
    "salary_max": 150000,
    "required_skills": ["React", "TypeScript", "Node.js"]
  }'
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📦 Building for Production

```bash
# Build the project
npm run build

# Start production server
npm start
```

## 🚀 Deployment

### Using Docker (Recommended)

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

### Environment Variables for Production

- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure production database
- Set up proper email service
- Enable SSL/TLS

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password hashing** with bcrypt (12 rounds)
- **Rate limiting** to prevent abuse
- **Input validation** on all endpoints
- **SQL injection protection** via Sequelize ORM
- **CORS configuration** for cross-origin requests
- **Helmet.js** for security headers
- **Environment variable protection**

## 🤝 Happy Flow Implementation Status

| User Type     | Feature                   | Status      |
| ------------- | ------------------------- | ----------- |
| **Candidate** | Sign up (email OTP)       | ✅ Complete |
|               | Login                     | ✅ Complete |
|               | Password Update           | ✅ Complete |
|               | Forgot/Reset Password     | ✅ Complete |
|               | Create/Update Profile     | ✅ Complete |
|               | Browse Jobs (List)        | ✅ Complete |
|               | Job Detail View           | ✅ Complete |
|               | Apply to Job              | ✅ Complete |
|               | View Application Status   | ✅ Complete |
|               | View Interviews           | ✅ Complete |
|               | View Onboarding Tasks     | ✅ Complete |
| **Recruiter** | Password Update           | ✅ Complete |
|               | Forgot/Reset Password     | ✅ Complete |
|               | Create Job                | ✅ Complete |
|               | Update Job                | ✅ Complete |
|               | List & Export Jobs        | ✅ Complete |
|               | List Submissions per Job  | ✅ Complete |
|               | Submission Detail         | ✅ Complete |
|               | Change Status (CRUD)      | ✅ Complete |
|               | Add Note/Attachment       | ✅ Complete |
|               | Schedule Interview        | ✅ Complete |
|               | Mark Offer/Placement      | ✅ Complete |
|               | Create & List Tasks       | ✅ Complete |
| **Vendor**    | Password Update           | ✅ Complete |
|               | Forgot/Reset Password     | ✅ Complete |
|               | Login                     | ✅ Complete |
|               | View Jobs Open to Vendors | ✅ Complete |
|               | Submit Candidate to Job   | ✅ Complete |
|               | Track Submission Status   | ✅ Complete |

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL service
sudo service postgresql status

# Check database exists
psql -l | grep next_hire
```

### Email Issues

- Verify SMTP credentials
- Check Gmail app passwords if using Gmail
- Ensure "Less secure app access" is enabled (Gmail)

### Port Issues

```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill process using port
kill -9 $(lsof -t -i:5000)
```

## 📈 Next Steps

1. **File Upload Integration** - AWS S3/Google Cloud Storage
2. **Real-time Notifications** - WebSocket implementation
3. **Email Templates** - Rich HTML email templates
4. **Advanced Search** - Elasticsearch integration
5. **Background Jobs** - Bull/Agenda queue system
6. **API Documentation** - Swagger/OpenAPI integration
7. **Testing Suite** - Comprehensive test coverage
8. **Monitoring** - Health checks and metrics
9. **Caching** - Redis for performance optimization
10. **Microservices** - Break into smaller services

## 📄 License

This project is licensed under the MIT License.

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Built with ❤️ for The Next Hire recruitment platform**
