#!/bin/bash

# Vercel Deployment Script for WebContainer
echo "🚀 Deploying DevSync Hub to Vercel with WebContainer support..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel..."
    vercel login
fi

# Build the project
echo "📦 Building project..."
npm run build:simple

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

# Check deployment status
if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Open your Vercel URL"
    echo "2. Check browser DevTools → Network tab"
    echo "3. Look for CORS headers in the response"
    echo "4. Verify WebContainer works"
    echo ""
    echo "🔍 To verify CORS headers are working:"
    echo "1. Open DevTools → Console"
    echo "2. Run: console.log('crossOriginIsolated:', window.crossOriginIsolated)"
    echo "3. Should return: true"
else
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi
