#!/usr/bin/env node

const express = require('express')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 7777

// Serve static files from current directory
app.use(express.static(__dirname))

// Serve index.html for all routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎬 CLIENT FLOW 360 Test Server Started!`)
  console.log(`🌐 Server URL: http://0.0.0.0:${PORT}`)
  console.log(`📂 Serving: ${__dirname}`)
  console.log(`📄 Index file: ${path.join(__dirname, 'index.html')}`)
})