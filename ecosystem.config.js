module.exports = {
  apps: [
    {
      name: 'netflix-crm',
      script: './server.js',
      port: 4444,
      env: {
        PORT: 4444
      }
    }
  ]
}