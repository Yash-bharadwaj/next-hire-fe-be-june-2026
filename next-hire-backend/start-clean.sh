#!/bin/bash

echo "🧹 Cleaning up database..."
rm -f database.sqlite
rm -f *_backup.sqlite 2>/dev/null || true

echo "🚀 Starting server with fresh database..."
NODE_ENV=development yarn dev

