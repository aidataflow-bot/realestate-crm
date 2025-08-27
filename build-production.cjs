#!/usr/bin/env node

/**
 * CLIENT FLOW 360 - Production Build Script
 * 
 * This script prepares optimized production assets for deployment.
 * - Copies essential files to dist directory
 * - Adds production optimizations
 * - Prepares for Cloudflare Pages deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 CLIENT FLOW 360 - Production Build Starting...\n');

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Production files to copy
const filesToCopy = [
    'index.html',
    'landing.html',
    '_redirects',
    'wrangler.toml'
];

// Optional files (copy if they exist)
const optionalFiles = [
    'public',
    'favicon.ico',
    'robots.txt',
    'sitemap.xml'
];

console.log('📂 Copying essential files to dist...');

// Copy essential files
filesToCopy.forEach(file => {
    const srcPath = path.join(__dirname, file);
    const destPath = path.join(distDir, file);
    
    try {
        if (fs.existsSync(srcPath)) {
            if (fs.statSync(srcPath).isDirectory()) {
                // Copy directory recursively
                copyDir(srcPath, destPath);
                console.log(`✅ Copied directory: ${file}`);
            } else {
                // Copy file
                fs.copyFileSync(srcPath, destPath);
                console.log(`✅ Copied file: ${file}`);
            }
        } else {
            console.log(`⚠️  File not found: ${file}`);
        }
    } catch (error) {
        console.error(`❌ Error copying ${file}:`, error.message);
    }
});

// Copy optional files
optionalFiles.forEach(file => {
    const srcPath = path.join(__dirname, file);
    const destPath = path.join(distDir, file);
    
    try {
        if (fs.existsSync(srcPath)) {
            if (fs.statSync(srcPath).isDirectory()) {
                copyDir(srcPath, destPath);
                console.log(`✅ Copied optional directory: ${file}`);
            } else {
                fs.copyFileSync(srcPath, destPath);
                console.log(`✅ Copied optional file: ${file}`);
            }
        }
    } catch (error) {
        // Optional files - don't error out
        console.log(`ℹ️  Optional file not found: ${file}`);
    }
});

// Helper function to copy directories
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Add production optimizations to HTML files
console.log('\n🔧 Applying production optimizations...');

const htmlFiles = ['index.html', 'landing.html'];

htmlFiles.forEach(filename => {
    const filePath = path.join(distDir, filename);
    
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Add production meta tags
        const productionMeta = `
        <meta name="robots" content="index, follow">
        <meta name="author" content="CLIENT FLOW 360">
        <meta name="theme-color" content="#dc2626">
        <meta name="msapplication-TileColor" content="#dc2626">
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="CLIENT FLOW 360">
        <meta name="twitter:card" content="summary_large_image">
        
        <!-- Performance optimizations -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://cdn.tailwindcss.com">
        <link rel="preconnect" href="https://ui-avatars.com">
        <link rel="dns-prefetch" href="https://unpkg.com">
        `;
        
        // Insert production meta tags after existing meta tags
        content = content.replace('</head>', `${productionMeta}</head>`);
        
        // Add production environment indicator
        const prodScript = `
        <script>
            // Production environment marker
            window.PRODUCTION_ENV = true;
            window.CLIENT_FLOW_360_VERSION = '1.0.0';
            
            // Performance monitoring
            window.addEventListener('load', function() {
                console.log('🎬 CLIENT FLOW 360 Production v1.0.0 - Loaded in', performance.now().toFixed(2) + 'ms');
            });
        </script>`;
        
        content = content.replace('</body>', `${prodScript}</body>`);
        
        fs.writeFileSync(filePath, content);
        console.log(`✅ Optimized ${filename} for production`);
    }
});

// Create production info file
const productionInfo = {
    name: "CLIENT FLOW 360",
    version: "1.0.0",
    environment: "production",
    buildDate: new Date().toISOString(),
    features: [
        "Landing Page with Cinematic Design",
        "Complete CRM Dashboard",
        "Voice Recognition Client Search",
        "Task Management System",
        "Client Profile Management",
        "Session-based Authentication"
    ],
    deployment: {
        platform: "Cloudflare Pages",
        domain: "TBD",
        cdn: "Global Edge Network",
        ssl: "Automatic HTTPS"
    }
};

fs.writeFileSync(
    path.join(distDir, 'production-info.json'), 
    JSON.stringify(productionInfo, null, 2)
);

console.log('\n✨ Production Build Complete!');
console.log('📁 Build output directory: ./dist');
console.log('🌐 Ready for Cloudflare Pages deployment');
console.log('\n🎯 Next Steps:');
console.log('   1. Deploy to Cloudflare Pages');
console.log('   2. Configure custom domain');
console.log('   3. Set up SSL certificates');
console.log('   4. Configure DNS settings');