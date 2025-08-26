#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Starting Netflix Real Estate CRM build process...');

try {
  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Generate Prisma client
  console.log('🏗️ Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Build with Vite
  console.log('🏗️ Building with Vite...');
  execSync('npx vite build', { stdio: 'inherit' });

  console.log('✅ Build completed successfully!');
  console.log('');
  console.log('🚀 Netflix Real Estate CRM Features:');
  console.log('   ✅ Netflix-style dark UI with client tiles');
  console.log('   ✅ Comprehensive client profiles with full history');
  console.log('   ✅ Transaction tracking with commissions (gross & net)');
  console.log('   ✅ Property management');
  console.log('   ✅ Birthday and anniversary reminders');
  console.log('   ✅ Email integration');
  console.log('   ✅ Call logging');
  console.log('   ✅ Activity tracking');
  console.log('   ✅ Advanced search and filtering');
  console.log('');
  console.log('📱 Demo Login: rodrigo@realtor.com / admin123');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}