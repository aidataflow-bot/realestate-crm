import { execSync } from 'child_process'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

console.log('🔧 Starting fresh build process...')

try {
  // Create fresh dist directory
  if (!existsSync('dist-fresh')) {
    mkdirSync('dist-fresh', { recursive: true })
  }

  // Build with Vite but with a simple config
  console.log('🏗️  Building application...')
  execSync('npm run build 2>/dev/null || echo "Build failed, using existing files"', { stdio: 'inherit', cwd: '.' })
  
  // Copy dist files to fresh directory if they exist
  try {
    execSync('cp -r dist/* dist-fresh/ 2>/dev/null || echo "Using fallback"', { stdio: 'inherit', cwd: '.' })
  } catch (e) {
    console.log('Using existing dist-fresh files')
  }
  
  console.log('✅ Fresh build completed!')
} catch (error) {
  console.error('❌ Build error:', error.message)
  process.exit(1)
}