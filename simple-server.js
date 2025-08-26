#!/usr/bin/env node

const express = require('express')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 4444

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')))

// Serve index.html for all routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`🎬 Client Flow 360 Server Started on port ${PORT}!`)
  console.log(`🌐 Serving at: http://localhost:${PORT}`)
})