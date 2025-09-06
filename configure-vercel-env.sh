#!/bin/bash

# Configure Vercel Environment Variables for Production Deployment
# This script sets up Supabase credentials and other environment variables

echo "🔧 Configuring Vercel Environment Variables..."

# Supabase Configuration
echo "📍 Setting up Supabase credentials..."
vercel env add SUPABASE_URL production <<< "https://kgezacvwtcetwdlxetji.supabase.co"
vercel env add SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnZXphY3Z3dGNldHdkbHhldGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMzk4NjMsImV4cCI6MjA3MTgxNTg2M30.ocfsrS-uc-Ayle6oKeqvbVlSoERNdpCKaCGMq4A8b58"

# Application Configuration
echo "⚙️ Setting up application config..."
vercel env add JWT_SECRET production <<< "$(openssl rand -hex 32)"
vercel env add VITE_API_URL production <<< "/api"
vercel env add VITE_APP_NAME production <<< "CLIENT FLOW 360 CRM"
vercel env add VITE_APP_VERSION production <<< "1.0.0"

echo "✅ Environment variables configured!"
echo "🚀 Ready for production deployment"