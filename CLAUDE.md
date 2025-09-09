# Claude AI Assistant - Project Context

## 🎯 **PROJECT OVERVIEW: CLIENT FLOW 360 CRM**
- **Application**: Complete Real Estate CRM System
- **Status**: ✅ **FULLY OPERATIONAL IN PRODUCTION**
- **Last Updated**: September 6, 2025
- **Current Version**: v2.4 (with Supabase integration)

## 🔧 **ENVIRONMENT SETUP (PRE-CONFIGURED)**
- **GitHub Repository**: aidataflow-bot/realestate-crm
- **GitHub Authentication**: ✅ Pre-configured and working (no setup needed)
- **Production URL**: https://realestate-crm-2.vercel.app/
- **Platform**: Vercel (auto-deploy from main branch)
- **Domain**: Custom domain active and working

## 🗄️ **DATABASE CONFIGURATION (ACTIVE)**
- **Database**: Supabase PostgreSQL ✅ **CONNECTED**
- **Project ID**: kgezacvwtcetwdlxetji
- **URL**: https://kgezacvwtcetwdlxetji.supabase.co
- **Environment Variables**: ✅ Configured in Vercel production
- **Status**: Connected and operational (shows "DB: Supabase PostgreSQL")
- **Data Persistence**: Real database - data persists permanently

## 🎯 **DEMO ACCESS CREDENTIALS**
- **Email**: rodrigo@clientflow360.com
- **Password**: demo123
- **Login Method**: Use landing page login modal

## 🔥 **CRITICAL ISSUES ALREADY RESOLVED**
- ✅ **Properties tab black screen** - FIXED (React compatibility)
- ✅ **Incorrect property valuations** - FIXED (Orlando $210/sqft calculations working)
- ✅ **"DB: undefined" display** - FIXED (now shows "DB: Supabase PostgreSQL")
- ✅ **Property search accuracy** - FIXED (real ATTOM API data integration)
- ✅ **Area-based valuation calculation** - FIXED (2,761 sqft × $210 = $579,810)
- ✅ **Client location parsing** - FIXED (shows proper Orlando, FL instead of Los Angeles)
- ✅ **Nationwide property search** - FIXED (all 50 US states supported)
- ✅ **Authentication redirect loops** - FIXED in production
- ✅ **Landing page content** - RESTORED (complete Netflix-style interface)

## 🏗️ **KEY TECHNICAL ARCHITECTURE**
### **Core Files Structure:**
- **`index.html`** - Main CRM application (363KB, fully functional)
- **`landing.html`** - Netflix-style landing page with auth
- **`api/index.js`** - Supabase integration layer with fallback
- **`vercel.json`** - Routing configuration

### **API Integration Status:**
- **ATTOM Data API** - ✅ Active with property valuation fixes
- **Area-based calculations** - ✅ Orlando $210/sqft implemented
- **50-state coordinate mapping** - ✅ Complete nationwide coverage
- **Property parsing corrections** - ✅ 4BR/3BA correction system active

### **Database Schema:**
- **clients table** - ✅ Active with sample data (2 clients)
- **properties table** - ✅ Ready for property management
- **tasks table** - ✅ Ready for task tracking

## 📋 **NO SETUP NEEDED - EVERYTHING IS WORKING**
```bash
# GitHub: ✅ Already authenticated (aidataflow-bot)
# Supabase: ✅ Environment variables set in Vercel
# Production: ✅ Live at https://realestate-crm-2.vercel.app/
# Database: ✅ Connected ("DB: Supabase PostgreSQL")
# API Health: ✅ Returns {"status":"ok", "storage":"Supabase PostgreSQL"}
```

## 🚀 **DEPLOYMENT WORKFLOW (AUTOMATED)**
1. **Work on**: `genspark_ai_developer` branch
2. **MANDATORY**: Commit immediately after ANY code change
3. **MANDATORY**: Create/update PR to main branch after every commit
4. **Auto-deploy**: Merge PR triggers Vercel production deployment
5. **Verification**: Check https://realestate-crm-2.vercel.app/api/health

## 📊 **CURRENT PRODUCTION STATUS**
- **API Health**: ✅ `{"status":"ok", "storage":"Supabase PostgreSQL"}`
- **Database Connection**: ✅ Connected (2 clients in database)
- **CRM Header**: ✅ Shows "DB: Supabase PostgreSQL" (green badge)
- **Property Valuations**: ✅ Orlando calculations: 2,761 sqft × $210/sqft = $579,810
- **Authentication Flow**: ✅ Landing page → Login → Main CRM
- **Property Search**: ✅ ATTOM API integration with 50-state support

## 🎯 **WHAT USER WANTED & STATUS**
- ✅ **Fix properties tab black screen** - COMPLETED
- ✅ **Enhance MLS search functionality** - COMPLETED  
- ✅ **Add auto-populate property details** - COMPLETED
- ✅ **Get real property data for ANY address** - COMPLETED
- ✅ **Accurate Orlando valuations at $210/sqft** - COMPLETED
- ✅ **Fix property search accuracy** - COMPLETED (real ATTOM API data)
- ✅ **Deploy to production with Supabase** - COMPLETED
- ✅ **Configure Supabase environment variables** - COMPLETED

## ⚠️ **IMPORTANT: NEVER RESTART THESE**
- **GitHub setup** - Already authenticated, never redo
- **Supabase configuration** - Already in Vercel, never reconfigure  
- **Environment variables** - Already set in production
- **Database connection** - Already working, don't touch
- **Production deployment** - Already live and operational

## 🔗 **QUICK VERIFICATION LINKS**
- **API Health**: https://realestate-crm-2.vercel.app/api/health
- **Landing Page**: https://realestate-crm-2.vercel.app/landing.html
- **Main CRM**: https://realestate-crm-2.vercel.app/ (requires login)
- **GitHub Repo**: https://github.com/aidataflow-bot/realestate-crm

## 🏆 **PRODUCTION READY - NO FURTHER SETUP REQUIRED**
The CRM is fully operational with enterprise-grade Supabase database, real property data integration, and all user-requested features implemented and deployed.