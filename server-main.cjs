#!/usr/bin/env node

const express = require('express')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 4444

// Serve static files from current directory
app.use(express.static(__dirname))

// Route for landing page (default)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing.html'))
})

// Route for landing page explicitly
app.get('/landing.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing.html'))
})

// Route for main CRM app
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

// Route for CRM app (alternative)
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

// Handle all other requests
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'landing.html'))
})

app.listen(PORT, () => {
  console.log(`🎬 Client Flow 360 Server Started on port ${PORT}!`)
  console.log(`🌐 Landing Page: http://localhost:${PORT}`)
  console.log(`🏠 CRM App: http://localhost:${PORT}/index.html`)
})