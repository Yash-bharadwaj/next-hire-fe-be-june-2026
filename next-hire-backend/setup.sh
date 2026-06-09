#!/bin/bash

# The Next Hire Backend Setup Script
echo "🚀 Setting up The Next Hire Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="16.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js v16 or higher."
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION detected"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL v12 or higher."
    exit 1
fi

echo "✅ PostgreSQL detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file from template
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "✅ .env file created from template"
    echo "⚠️  Please edit .env file with your database and email configurations"
else
    echo "⚠️  .env file already exists, skipping..."
fi

# Create logs directory
if [ ! -d "logs" ]; then
    echo "📁 Creating logs directory..."
    mkdir logs
    echo "✅ Logs directory created"
fi

# Create uploads directory
if [ ! -d "uploads" ]; then
    echo "📁 Creating uploads directory..."
    mkdir uploads
    echo "✅ Uploads directory created"
fi

# Database setup instructions
echo ""
echo "🗄️  Database Setup Instructions:"
echo "1. Make sure PostgreSQL is running:"
echo "   sudo service postgresql start"
echo ""
echo "2. Create a database:"
echo "   createdb next_hire_dev"
echo ""
echo "3. Update .env file with your database credentials"
echo ""
echo "4. Start the development server:"
echo "   npm run dev"
echo ""
echo "🎉 Setup complete! Edit your .env file and run 'npm run dev' to start the server."
echo ""
echo "📚 API will be available at: http://localhost:5000"
echo "🔍 Health check: http://localhost:5000/health"
echo ""
echo "Happy coding! 🚀"
