# 🚀 Vercel Deployment Guide

This guide will help you deploy the Real Estate CRM to Vercel in just a few minutes.

## Prerequisites

1. **GitHub Account** with the repository
2. **Vercel Account** (free tier works great)
3. **PostgreSQL Database** (we recommend Railway, Supabase, or Neon)

## Step 1: Database Setup

### Option A: Railway (Recommended)
1. Go to [Railway.app](https://railway.app)
2. Create a new project
3. Add a PostgreSQL database
4. Copy the connection string from the database settings

### Option B: Supabase
1. Go to [Supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string (use the "Connection pooling" URL for better performance)

### Option C: Neon
1. Go to [Neon.tech](https://neon.tech)
2. Create a new database
3. Copy the connection string from the dashboard

## Step 2: Deploy to Vercel

### Method 1: Vercel Dashboard (Easiest)

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign in or create an account

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository: `realestate-crm`
   - Vercel will automatically detect the framework

3. **Configure Environment Variables**
   Click "Environment Variables" and add:
   ```
   DATABASE_URL = your_postgresql_connection_string
   JWT_SECRET = a-very-secure-random-string-at-least-32-characters
   NODE_ENV = production
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (2-3 minutes)

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from your project directory
cd realestate-crm
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NODE_ENV

# Redeploy with environment variables
vercel --prod
```

## Step 3: Database Migration

After deployment, you need to set up the database:

1. **Install Vercel CLI** (if not already done)
   ```bash
   npm install -g vercel
   ```

2. **Run Database Migration**
   ```bash
   # Clone your repo locally if needed
   git clone https://github.com/your-username/realestate-crm.git
   cd realestate-crm
   
   # Install dependencies
   cd api && npm install
   
   # Set your DATABASE_URL environment variable
   export DATABASE_URL="your_connection_string_here"
   
   # Run migrations
   npx prisma migrate deploy
   
   # Seed with sample data
   npx prisma db seed
   ```

## Step 4: Test Your Deployment

1. **Visit Your App**
   - Vercel will provide you with a URL like: `https://realestate-crm-xxx.vercel.app`

2. **Test Login**
   - Use the demo credentials:
     - Email: `rodrigo@realtor.com`
     - Password: `admin123`

3. **Verify Features**
   - Check if clients load properly
   - Try creating a new client
   - Test the dashboard analytics

## Environment Variables Reference

Here are the required environment variables for Vercel:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secure-32-char-secret` |
| `NODE_ENV` | Environment mode | `production` |

## Troubleshooting

### Build Errors

**Issue**: Build fails during frontend compilation
**Solution**: Check that all dependencies are listed in `frontend/package.json`

**Issue**: API routes return 500 errors
**Solution**: Verify your `DATABASE_URL` is correct and the database is accessible

### Database Connection Issues

**Issue**: "Can't connect to database"
**Solution**: 
1. Check your DATABASE_URL format
2. Ensure the database server allows connections from Vercel's IP ranges
3. For Railway/Supabase, make sure the connection string includes SSL parameters

### Authentication Issues

**Issue**: Login fails with "Invalid token"
**Solution**: Make sure your `JWT_SECRET` is set and is the same across all deployments

## Custom Domain Setup

1. **In Vercel Dashboard**
   - Go to your project settings
   - Click "Domains"
   - Add your custom domain

2. **DNS Configuration**
   - Add a CNAME record pointing to `cname.vercel-dns.com`
   - Or add A records pointing to Vercel's IP addresses

## Monitoring and Maintenance

### View Logs
```bash
vercel logs your-deployment-url.vercel.app
```

### Update Environment Variables
```bash
vercel env add VARIABLE_NAME
vercel env rm VARIABLE_NAME
```

### Redeploy
```bash
vercel --prod
```

## Database Maintenance

### Backup Database
```bash
# For Railway
railway db:backup

# For Supabase - use their dashboard backup feature

# Manual backup with pg_dump
pg_dump $DATABASE_URL > backup.sql
```

### Update Schema
```bash
# After making changes to prisma/schema.prisma
npx prisma db push
# or for production migrations
npx prisma migrate deploy
```

## Support

If you encounter issues:

1. Check the [Vercel documentation](https://vercel.com/docs)
2. Review logs in the Vercel dashboard
3. Check the GitHub repository issues
4. Ensure all environment variables are set correctly

## Success! 🎉

Your Real Estate CRM is now live on Vercel! You can:

- ✅ Manage clients and transactions
- ✅ View analytics and reports  
- ✅ Access from anywhere
- ✅ Scale automatically
- ✅ Enjoy fast global CDN

Your app is production-ready and can handle real estate business operations!