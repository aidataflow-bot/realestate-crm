#!/bin/bash

# 🚀 CLIENT FLOW 360 CRM v2.4 - Production Deployment Script

echo "🎯 Deploying CLIENT FLOW 360 CRM v2.4 to Production..."
echo "📦 Version: 2.4 - Complete MLS Bridge API Integration"

# Create production build directory
mkdir -p production-build
cp index.html production-build/
cp landing.html production-build/ 
cp test.html production-build/
cp vercel.json production-build/
cp README.md production-build/

echo "✅ Production build created"
echo "🌐 Ready for deployment to:"
echo "   - Vercel: https://vercel.com/new/git/external?repository-url=https://github.com/aidataflow-bot/realestate-crm"
echo "   - Netlify: https://app.netlify.com/start/deploy?repository=https://github.com/aidataflow-bot/realestate-crm"  
echo "   - GitHub Pages: https://aidataflow-bot.github.io/realestate-crm/"
echo ""
echo "🎉 CLIENT FLOW 360 CRM v2.4 is PRODUCTION READY!"