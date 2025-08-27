#!/usr/bin/env node

import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5555

// Serve static files from current directory
app.use(express.static(__dirname))

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

// Handle 404s by serving index.html (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎬 CLIENT FLOW 360 Static Server Started!`)
  console.log(`🌐 Local: http://localhost:${PORT}`)
  console.log(`🌐 Network: http://0.0.0.0:${PORT}`)
})