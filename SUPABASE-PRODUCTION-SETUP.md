# Supabase Production Setup for CLIENT FLOW 360 CRM

## Overview
This guide configures the Supabase database connection for production deployment, replacing the in-memory fallback storage with a persistent database.

## Environment Variables Configuration

### Required Supabase Credentials
```bash
SUPABASE_URL=https://kgezacvwtcetwdlxetji.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnZXphY3Z3dGNldHdkbHhldGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMzk4NjMsImV4cCI6MjA3MTgxNTg2M30.ocfsrS-uc-Ayle6oKeqvbVlSoERNdpCKaCGMq4A8b58
```

## Deployment Methods

### Method 1: Vercel CLI Configuration
```bash
# Login to Vercel (if not already logged in)
npx vercel login

# Link to existing project or create new one
npx vercel link

# Set environment variables
npx vercel env add SUPABASE_URL production
# Enter: https://kgezacvwtcetwdlxetji.supabase.co

npx vercel env add SUPABASE_ANON_KEY production  
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnZXphY3Z3dGNldHdkbHhldGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMzk4NjMsImV4cCI6MjA3MTgxNTg2M30.ocfsrS-uc-Ayle6oKeqvbVlSoERNdpCKaCGMq4A8b58

# Deploy to production
npx vercel --prod
```

### Method 2: Vercel Dashboard Configuration
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables for **Production**:

| Variable Name | Value |
|---------------|-------|
| `SUPABASE_URL` | `https://kgezacvwtcetwdlxetji.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnZXphY3Z3dGNldHdkbHhldGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMzk4NjMsImV4cCI6MjA3MTgxNTg2M30.ocfsrS-uc-Ayle6oKeqvbVlSoERNdpCKaCGMq4A8b58` |

4. Trigger a new deployment

### Method 3: GitHub Integration (Recommended)
1. Push code to your GitHub repository
2. Configure environment variables in Vercel dashboard
3. Vercel will auto-deploy when you push to main branch

## Database Schema Setup

The Supabase database needs the following table structure:

```sql
-- Create clients table
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  tags TEXT[],
  notes TEXT,
  birthday DATE,
  address TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create properties table
CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(10),
  price DECIMAL(12,2),
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  square_feet INTEGER,
  lot_size DECIMAL(10,2),
  year_built INTEGER,
  property_type VARCHAR(50),
  mls_id VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  priority VARCHAR(10) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Verification Steps

1. **Check API Health**: Visit `https://your-domain.vercel.app/api/health`
2. **Expected Response**:
   ```json
   {
     "status": "ok",
     "timestamp": "2024-09-06T12:00:00.000Z",
     "storage": "Supabase Connected",
     "clients": 0,
     "debug": {
       "hasSupabaseUrl": true,
       "hasSupabaseKey": true,
       "supabaseUrlPrefix": "https://kgezacvwtcetwdlxetji",
       "isConnected": true
     }
   }
   ```

3. **Check CRM Header**: The header should show "DB: Supabase Connected" instead of "DB: Fallback Storage"

## Troubleshooting

### Issue: Still seeing "DB: Fallback Storage"
- **Cause**: Environment variables not set correctly
- **Solution**: Double-check variable names and values in Vercel dashboard

### Issue: API returns 500 errors
- **Cause**: Database tables don't exist
- **Solution**: Run the SQL schema creation script in Supabase SQL editor

### Issue: "Connection refused" errors
- **Cause**: Incorrect Supabase URL or credentials
- **Solution**: Verify the project ID and anon key match your Supabase project

## Production Benefits

Once configured, your CRM will have:
- ✅ **Persistent data storage** (no more lost data on restart)
- ✅ **Real-time database** with Supabase's real-time features
- ✅ **Automatic backups** through Supabase
- ✅ **Scalable architecture** that can handle multiple users
- ✅ **Professional grade** database with security features

## Next Steps

After successful configuration:
1. **Create initial admin user** in the CRM
2. **Import existing client data** (if any)
3. **Configure additional Supabase features** (auth, real-time, etc.)
4. **Set up automated backups** and monitoring