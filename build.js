#!/usr/bin/env node

// Alternative build script for Vercel
const { execSync } = require('child_process')
const path = require('path')

console.log('🔧 Starting custom build process...')

try {
  // Ensure we're in the right directory
  process.chdir(__dirname)
  
  // Install dependencies if needed
  console.log('📦 Installing dependencies...')
  execSync('npm install', { stdio: 'inherit' })
  
  // Run Vite build
  console.log('🏗️  Building with Vite...')
  execSync('npx vite build', { stdio: 'inherit' })
  
  console.log('✅ Build completed successfully!')
} catch (error) {
  console.error('❌ Build failed:', error.message)
  process.exit(1)
}