const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 5000;

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  let filePath = '.';
  if (req.url === '/' || req.url === '/index.html') {
    filePath = path.join(__dirname, 'index.html');
  } else if (req.url === '/landing.html') {
    filePath = path.join(__dirname, 'landing.html');
  } else {
    // For other requests, try to serve the file
    filePath = path.join(__dirname, req.url);
  }

  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'});
      res.end('<h1>404 - File Not Found</h1>');
      return;
    }

    // Determine content type
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.wav': 'audio/wav',
      '.mp4': 'video/mp4',
      '.woff': 'application/font-woff',
      '.ttf': 'application/font-ttf',
      '.eot': 'application/vnd.ms-fontobject',
      '.otf': 'application/font-otf',
      '.wasm': 'application/wasm'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // Read and serve the file
    fs.readFile(filePath, (error, content) => {
      if (error) {
        if(error.code === 'ENOENT') {
          res.writeHead(404, {'Content-Type': 'text/html'});
          res.end('<h1>404 - File Not Found</h1>');
        } else {
          res.writeHead(500);
          res.end(`Server Error: ${error.code}`);
        }
      } else {
        res.writeHead(200, { 
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        });
        res.end(content, 'utf-8');
      }
    });
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 CLIENT FLOW 360 CRM Server running on http://0.0.0.0:${port}`);
  console.log(`📅 Started at: ${new Date().toISOString()}`);
  console.log(`🏠 Serving latest implementation with Property Editing & API Integration`);
});
