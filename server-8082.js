import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = 8082

// Serve static files from dist directory
app.use(express.static(join(__dirname, 'dist')))

// Fallback to serve index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Netflix-style Real Estate CRM running on http://0.0.0.0:${PORT}`)
  console.log(`Serving files from: ${join(__dirname, 'dist')}`)
})