#!/usr/bin/env node

const express = require('express')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = process.env.PORT || 4444

// Serve static files from dist directory
const distPath = path.join(__dirname, 'dist')

// Check if dist directory exists
if (!fs.existsSync(distPath)) {
  console.log('🏗️ Building application...')
  const { execSync } = require('child_process')
  try {
    execSync('npm run build', { stdio: 'inherit' })
    console.log('✅ Build completed!')
  } catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}

// Serve static files
app.use(express.static(distPath))

// Serve index.html for all routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`🎬 Client Flow 360 Server Started on port ${PORT}!`)
  console.log(`🌐 Serving at: http://localhost:${PORT}`)
})