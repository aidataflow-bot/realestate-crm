#!/bin/bash

# 🚀 CLIENT FLOW 360 CRM v2.4 - Production Deployment Script
# Enhanced MLS Bridge API Integration Deployment

echo "🎯 Starting CLIENT FLOW 360 CRM v2.4 Deployment..."
echo "📦 Version: 2.4 - Complete MLS Bridge API Integration"
echo "📅 Date: $(date)"

# Build info
BUILD_HASH=$(date +%s)
VERSION="2.4"
TITLE="CLIENT FLOW 360 - Real Estate CRM Platform - v${VERSION} MLS Bridge Integration"

echo "🏗️  Creating production build..."

# Update build hash in index.html
sed -i "s/content=\"[0-9]*\"/content=\"${BUILD_HASH}\"/" index.html
sed -i "s/<title>.*<\/title>/<title>${TITLE}<\/title>/" index.html

echo "✅ Updated build metadata:"
echo "   - Build Hash: ${BUILD_HASH}"
echo "   - Version: ${VERSION}"
echo "   - Title: ${TITLE}"

# Create build info file
echo "Build: ${BUILD_HASH}" > build-info.txt
echo "Version: ${VERSION}" >> build-info.txt
echo "Date: $(date)" >> build-info.txt
echo "Features: MLS Bridge API Integration, Enhanced Add Client Form, Targeted Property Search" >> build-info.txt

echo "📄 Generated build-info.txt"

# Verify critical files exist
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found"
    exit 1
fi

if [ ! -f "vercel.json" ]; then
    echo "❌ Error: vercel.json not found"
    exit 1
fi

echo "✅ All critical files verified"

# Display deployment summary
echo ""
echo "🎉 DEPLOYMENT SUMMARY:"
echo "   📋 Version: CLIENT FLOW 360 CRM v${VERSION}"
echo "   🔍 Features: Complete MLS Bridge API Integration"
echo "   🏠 Property Search: Street + City + State + Zip targeting"
echo "   📱 Enhanced Add Client Form with Property Interest section"
echo "   🔧 Bridge Data Output API integration"
echo "   ✨ Interactive property selection dialog"
echo ""
echo "🚀 Ready for production deployment!"
echo "   • Vercel: Deploy from genspark_ai_developer branch"
echo "   • Cloudflare: Project name set to 'client-flow-360-crm'"
echo ""
echo "🔗 Pull Request Status: Pushed to genspark_ai_developer branch"
echo "   • Ready for manual PR creation: https://github.com/aidataflow-bot/realestate-crm/compare/main...genspark_ai_developer"
echo ""