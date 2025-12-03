#!/bin/bash

# Production Build Script for TalentBridge

echo "🚀 Starting TalentBridge Production Build..."

# Frontend Build
echo "📦 Building Frontend..."
cd frontend || cd .
npm install
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

# Backend Build
echo "🔧 Building Backend..."
cd backend
npm install
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Backend build successful"
else
    echo "❌ Backend build failed"
    exit 1
fi

# Database Operations
echo "🗄️ Setting up Database..."
npm run db:generate

if [ $? -eq 0 ]; then
    echo "✅ Prisma client generated"
else
    echo "❌ Prisma client generation failed"
    exit 1
fi

echo "🎉 Build completed successfully!"
echo "📁 Frontend build: ./dist"
echo "📁 Backend build: ./backend/dist"
