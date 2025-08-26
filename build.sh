#!/bin/bash

echo "🔨 Building CLIENT FLOW 360 for Vercel deployment..."

# Create output directory
mkdir -p production-deployment

# Copy main files
cp index.html production-deployment/

# Verify the build
if [ -f "production-deployment/index.html" ]; then
    echo "✅ Build successful - index.html copied to production-deployment/"
    echo "📄 File size: $(du -h production-deployment/index.html | cut -f1)"
    echo "🎬 CLIENT FLOW 360 v2.1 with Database - Ready for deployment!"
else
    echo "❌ Build failed - index.html not found in output directory"
    exit 1
fi