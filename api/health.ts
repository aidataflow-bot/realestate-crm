import { VercelRequest, VercelResponse } from '@vercel/node'
import { PrismaClient } from '@prisma/client'

// Handle different database URL formats from Vercel/Supabase
const getDatabaseUrl = () => {
  const dbUrl = process.env.DATABASE_URL || 
                process.env.POSTGRES_URL || 
                process.env.SUPABASE_DB_URL ||
                process.env.DATABASE_DIRECT_URL
  return dbUrl
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  }
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    res.json({ 
      status: 'OK', 
      message: 'Real Estate CRM API Running on Vercel',
      database: 'Connected',
      timestamp: new Date().toISOString(),
      env: {
        hasDbUrl: !!getDatabaseUrl(),
        hasJwtSecret: !!process.env.JWT_SECRET,
        nodeEnv: process.env.NODE_ENV
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      env: {
        hasDbUrl: !!getDatabaseUrl(),
        hasJwtSecret: !!process.env.JWT_SECRET,
        availableEnvVars: Object.keys(process.env).filter(key => 
          key.includes('DATABASE') || key.includes('POSTGRES') || key.includes('SUPABASE')
        )
      }
    })
  }
}