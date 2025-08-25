import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const app = express()

// Handle different database URL formats from Vercel/Supabase
const getDatabaseUrl = () => {
  // Check for various environment variable names that Vercel might use
  const dbUrl = process.env.DATABASE_URL || 
                process.env.POSTGRES_URL || 
                process.env.SUPABASE_DB_URL ||
                process.env.DATABASE_DIRECT_URL

  if (!dbUrl) {
    console.error('❌ No database URL found. Available env vars:', Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('POSTGRES') || key.includes('SUPABASE')))
  } else {
    console.log('✅ Database URL found:', dbUrl.substring(0, 30) + '...')
  }
  
  return dbUrl
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  }
})

// Security middleware
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use(limiter)

// CORS middleware - Allow all origins for Vercel deployment
app.use(cors({
  origin: true,
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Auth middleware
const authenticateToken = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Access token required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, firstName: true, lastName: true }
    })

    if (!user) {
      return res.status(403).json({ error: 'Invalid token' })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' })
  }
}

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    res.json({ 
      status: 'OK', 
      message: 'Real Estate CRM API Running on Vercel',
      database: 'Connected',
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
})

// Validation schemas
const clientCreateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(['BUYER', 'SELLER', 'INVESTOR', 'RENTER']).default('BUYER'),
  stage: z.enum(['NEW', 'NURTURE', 'SHOWING', 'ACTIVE', 'CLOSED']).default('NEW'),
  city: z.string().optional(),
  state: z.string().optional(),
  birthday: z.string().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional()
})

const clientUpdateSchema = clientCreateSchema.partial()

// Auth routes
app.post('/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt for:', req.body.email)
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Check if database is connected
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError)
      return res.status(500).json({ error: 'Database connection failed' })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    console.log('👤 User found:', user ? 'Yes' : 'No')

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret'
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      { expiresIn: '24h' }
    )

    console.log('✅ Login successful for:', email)
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    })
  } catch (error) {
    console.error('❌ Login error:', error)
    res.status(500).json({ 
      error: 'Login failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Client routes
app.get('/clients', authenticateToken, async (req: any, res) => {
  try {
    const { search, page = '1', limit = '50' } = req.query
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const offset = (pageNum - 1) * limitNum

    let where = {}
    if (search) {
      where = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        include: {
          transactions: {
            select: { grossCommission: true, netCommissionToMe: true, status: true }
          }
        },
        skip: offset,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.client.count({ where })
    ])

    // Calculate commission totals
    const clientsWithTotals = clients.map(client => {
      const closedTransactions = client.transactions.filter(t => t.status === 'CLOSED')
      const lifetimeGrossCommission = closedTransactions.reduce((sum, t) => 
        sum + (parseFloat(t.grossCommission?.toString() || '0')), 0)
      const lifetimeNetCommission = closedTransactions.reduce((sum, t) => 
        sum + (parseFloat(t.netCommissionToMe?.toString() || '0')), 0)
      
      return {
        ...client,
        lifetimeGrossCommission,
        lifetimeNetCommission
      }
    })

    res.json({
      clients: clientsWithTotals,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    })
  } catch (error) {
    console.error('Get clients error:', error)
    res.status(500).json({ error: 'Failed to fetch clients' })
  }
})

app.get('/clients/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!client) {
      return res.status(404).json({ error: 'Client not found' })
    }

    // Calculate commission totals
    const closedTransactions = client.transactions.filter(t => t.status === 'CLOSED')
    const lifetimeGrossCommission = closedTransactions.reduce((sum, t) => 
      sum + (parseFloat(t.grossCommission?.toString() || '0')), 0)
    const lifetimeNetCommission = closedTransactions.reduce((sum, t) => 
      sum + (parseFloat(t.netCommissionToMe?.toString() || '0')), 0)

    res.json({
      client: {
        ...client,
        lifetimeGrossCommission,
        lifetimeNetCommission
      }
    })
  } catch (error) {
    console.error('Get client error:', error)
    res.status(500).json({ error: 'Failed to fetch client' })
  }
})

// Create client
app.post('/clients', authenticateToken, async (req: any, res) => {
  try {
    const validatedData = clientCreateSchema.parse(req.body)
    
    const clientData = {
      ...validatedData,
      birthday: validatedData.birthday ? new Date(validatedData.birthday) : undefined
    }
    
    const client = await prisma.client.create({ data: clientData })
    res.status(201).json({ client })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    console.error('Create client error:', error)
    res.status(500).json({ error: 'Failed to create client' })
  }
})

// Dashboard analytics
app.get('/dashboard/stats', authenticateToken, async (req: any, res) => {
  try {
    const [clientStats, transactionStats, revenueStats] = await Promise.all([
      // Client statistics
      prisma.client.groupBy({
        by: ['stage'],
        _count: { stage: true }
      }),
      
      // Transaction statistics
      prisma.transaction.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      
      // Revenue statistics
      prisma.transaction.aggregate({
        where: { status: 'CLOSED' },
        _sum: {
          grossCommission: true,
          netCommissionToMe: true
        },
        _count: true
      })
    ])
    
    res.json({
      clientStats,
      transactionStats,
      revenueStats
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' })
  }
})

// Global error handler
app.use((error: any, req: any, res: any, next: any) => {
  console.error('Global error handler:', error)
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

export default app