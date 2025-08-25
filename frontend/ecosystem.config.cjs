module.exports = {
  apps: [
    {
      name: 'realestate-crm-frontend',
      script: 'npx',
      args: 'vite --host 0.0.0.0 --port 5173',
      cwd: '/home/user/webapp/frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 5173
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5173
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
}