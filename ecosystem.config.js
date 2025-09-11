module.exports = {
  apps: [{
    name: 'clientflow360-dev',
    script: 'npx',
    args: 'vite dev --host 0.0.0.0 --port 3000',
    cwd: '/home/user/webapp',
    watch: false,
    env: {
      NODE_ENV: 'development',
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY
    },
    instances: 1,
    exec_mode: 'fork',
    error_file: '/home/user/webapp/logs/dev-error.log',
    out_file: '/home/user/webapp/logs/dev-out.log',
    log_file: '/home/user/webapp/logs/dev-combined.log',
    time: true
  }]
}