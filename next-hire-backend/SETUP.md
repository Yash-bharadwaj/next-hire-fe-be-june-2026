# Quick Setup Guide

## 🚀 Automated Setup

Run the setup script for automatic configuration:

```bash
./setup.sh
```

## 📋 Manual Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit with your settings
nano .env
```

### 3. Database Setup

```bash
# Start PostgreSQL
sudo service postgresql start

# Create database
createdb next_hire_dev

# Create user (optional)
psql -c "CREATE USER next_hire_user WITH PASSWORD 'your_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE next_hire_dev TO next_hire_user;"
```

### 4. Start Development Server

```bash
npm run dev
```

## 🔧 Environment Variables

### Required Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=next_hire_dev
DB_USERNAME=postgres
DB_PASSWORD=your_password

# JWT Secrets (generate strong secrets!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-this-in-production

# Email (for OTP and notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Email Setup (Gmail Example)

1. Enable 2-factor authentication on your Gmail account
2. Generate an app password: https://support.google.com/accounts/answer/185833
3. Use the app password in `SMTP_PASS`

## 🧪 Testing the Setup

### 1. Health Check

```bash
curl http://localhost:5000/health
```

### 2. Test Signup

```bash
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testPassword123",
    "role": "candidate"
  }'
```

### 3. Check Database Tables

```bash
psql next_hire_dev -c "\dt"
```

## 🚨 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo service postgresql status

# Check if database exists
psql -l | grep next_hire

# Test connection
psql -h localhost -U postgres -d next_hire_dev -c "SELECT 1;"
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 $(lsof -t -i:5000)
```

### Email Issues

- Verify SMTP credentials
- For Gmail: Use app passwords, not regular password
- Check firewall settings for SMTP ports

### Permission Issues

```bash
# Make sure you have write permissions
chmod 755 logs/
chmod 755 uploads/
```

## 🎯 Quick Start Commands

```bash
# Install and setup
npm install && cp env.example .env

# Start development
npm run dev

# Build for production
npm run build

# Start production
npm start

# Run tests (when implemented)
npm test
```

## 📊 Database Schema

The system will automatically create these tables:

- `users` - User accounts and authentication
- `candidates` - Candidate profiles
- `recruiters` - Recruiter profiles
- `vendors` - Vendor profiles
- `jobs` - Job postings
- `submissions` - Job applications
- `interviews` - Interview scheduling
- `tasks` - Task management

## 🔐 Security Notes

- Change default JWT secrets in production
- Use environment variables for sensitive data
- Enable SSL/HTTPS in production
- Set up proper database user permissions
- Use strong passwords for all accounts

## 📞 Support

If you encounter issues:

1. Check the logs in `logs/` directory
2. Verify all environment variables are set
3. Ensure PostgreSQL is running and accessible
4. Check Node.js and npm versions

---

**Ready to start building? Run `npm run dev` and visit http://localhost:5000/health** 🚀
