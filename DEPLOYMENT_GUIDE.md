# CLIENT FLOW 360 - Production Deployment Guide

## 🚀 Step 1: Set Up Supabase Database

1. **Create Supabase Account:**
   - Go to [supabase.com](https://supabase.com)
   - Sign up/login with GitHub account
   - Click "New Project"

2. **Create New Project:**
   - **Organization:** Choose or create one
   - **Name:** `client-flow-360` or any name you prefer
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to your users
   - Click "Create new project"

3. **Set Up Database Schema:**
   - Wait for project to be ready (2-3 minutes)
   - Go to **SQL Editor** in left sidebar
   - Copy and paste the entire content from `supabase-schema.sql`
   - Click **RUN** to execute the schema
   - ✅ You should see tables created: `clients`, `properties`, `tasks`, `calls`

4. **Get Your Credentials:**
   - Go to **Settings** → **API**
   - Copy these two values:
     - **Project URL** (starts with `https://xyz.supabase.co`)
     - **anon/public key** (starts with `eyJhbGc...`)

## 🔧 Step 2: Deploy to Vercel

1. **Push Code to GitHub:**
   - Make sure all changes are committed
   - Push to your GitHub repository

2. **Connect Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "Import Git Repository"
   - Select your `realestate-crm` repository
   - Click "Import"

3. **Configure Environment Variables:**
   **BEFORE DEPLOYING**, click "Configure Project"
   - Add these environment variables:
     ```
     SUPABASE_URL=https://your-project.supabase.co
     SUPABASE_ANON_KEY=your-anon-key-here
     ```
   - Click "Deploy"

## 🧪 Step 3: Test Production Database

After deployment:

1. **Visit Your App:**
   - Vercel will give you a URL like `https://realestate-crm-xyz.vercel.app`
   - Open the app

2. **Test Database Functions:**
   - ✅ Should see 2 sample clients (John Smith, Sarah Johnson)
   - ✅ Header should show "DB: Supabase Connected" 
   - ✅ Add a new client → should persist
   - ✅ Refresh page → client should still be there

3. **Verify API Health:**
   - Visit `https://your-app.vercel.app/api/health`
   - Should show: `{"status":"ok","storage":"Supabase Connected"}`

## 🎯 Step 4: Confirm Success

**✅ Production Database Working If:**
- Header shows "DB: Supabase Connected"
- Clients persist after page refresh
- Can add new clients that stay saved
- API health shows "Supabase Connected"

**❌ Fallback Mode If:**
- Header shows "DB: In-Memory Fallback"  
- Clients reset when you refresh
- API health shows "In-Memory Fallback"
- → Check environment variables in Vercel dashboard

## 🐛 Troubleshooting

**If Database Not Connecting:**
1. Check Vercel environment variables are set correctly
2. Verify Supabase URL and key are correct
3. Check Vercel function logs in dashboard
4. Ensure schema was run successfully in Supabase

**If Deployment Fails:**
1. Check Vercel build logs
2. Ensure all dependencies are in package.json
3. Verify API routes are working locally first

## 📝 Current Status

- ✅ **Local Development:** Working with Netflix UI + Database
- ⏳ **Production:** Ready to deploy
- 🎯 **Goal:** Confirm production database persistence works

After successful deployment, we can restore additional CRM features!