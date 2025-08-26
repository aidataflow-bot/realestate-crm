#!/usr/bin/env node

// Simple build script to copy index.html to production-deployment directory
import { promises as fs } from 'fs';
import path from 'path';

async function build() {
  console.log('🔨 Building static site for Vercel...');
  
  try {
    // Ensure production-deployment directory exists
    await fs.mkdir('production-deployment', { recursive: true });
    
    // Copy index.html to production-deployment
    await fs.copyFile('index.html', 'production-deployment/index.html');
    
    console.log('✅ Successfully copied index.html to production-deployment/');
    console.log('🎬 CLIENT FLOW 360 v2.1 with Database - Ready for deployment!');
    
    // Verify the file exists and has content
    const stats = await fs.stat('production-deployment/index.html');
    console.log(`📄 Output file size: ${(stats.size / 1024).toFixed(1)} KB`);
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();