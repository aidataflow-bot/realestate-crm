import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet())
app.use(morgan('combined'))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use(limiter)

// CORS middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://5173-isb1z1ujd4x5imgop7xj8-6532622b.e2b.dev'
  ],
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
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
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Real Estate CRM Backend Running' })
})

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    )

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
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Client routes
app.get('/api/clients', authenticateToken, async (req: any, res) => {
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

app.get('/api/clients/:id', authenticateToken, async (req: any, res) => {
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

const transactionCreateSchema = z.object({
  clientId: z.string(),
  type: z.enum(['BUY', 'SELL']).default('BUY'),
  propertyAddress: z.string().min(1, 'Property address is required'),
  city: z.string().optional(),
  state: z.string().optional(),
  status: z.enum(['ACTIVE', 'UNDER_CONTRACT', 'CLOSED', 'CANCELLED']).default('ACTIVE'),
  closeDate: z.string().optional(),
  price: z.number().optional(),
  commissionRatePct: z.number().default(3.0),
  mySplitPct: z.number().default(80.0),
  grossCommission: z.number().optional(),
  netCommissionToMe: z.number().optional()
})

// Create client
app.post('/api/clients', authenticateToken, async (req: any, res) => {
  try {
    const validatedData = clientCreateSchema.parse(req.body)
    
    // Convert birthday string to Date if provided
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

// Update client
app.put('/api/clients/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    const validatedData = clientUpdateSchema.parse(req.body)
    
    // Convert birthday string to Date if provided
    const updateData = {
      ...validatedData,
      birthday: validatedData.birthday ? new Date(validatedData.birthday) : undefined
    }
    
    const client = await prisma.client.update({
      where: { id },
      data: updateData,
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })
    
    res.json({ client })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    console.error('Update client error:', error)
    res.status(500).json({ error: 'Failed to update client' })
  }
})

// Delete client
app.delete('/api/clients/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    
    await prisma.client.delete({ where: { id } })
    res.json({ message: 'Client deleted successfully' })
  } catch (error) {
    console.error('Delete client error:', error)
    res.status(500).json({ error: 'Failed to delete client' })
  }
})

// Transaction routes
app.get('/api/transactions', authenticateToken, async (req: any, res) => {
  try {
    const { page = '1', limit = '50', status, clientId } = req.query
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const offset = (pageNum - 1) * limitNum
    
    let where: any = {}
    if (status) where.status = status
    if (clientId) where.clientId = clientId
    
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          client: {
            select: { firstName: true, lastName: true, email: true }
          }
        },
        skip: offset,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.transaction.count({ where })
    ])
    
    res.json({
      transactions,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    })
  } catch (error) {
    console.error('Get transactions error:', error)
    res.status(500).json({ error: 'Failed to fetch transactions' })
  }
})

// Create transaction
app.post('/api/transactions', authenticateToken, async (req: any, res) => {
  try {
    const validatedData = transactionCreateSchema.parse(req.body)
    
    const transactionData = {
      ...validatedData,
      closeDate: validatedData.closeDate ? new Date(validatedData.closeDate) : null
    }
    
    // Calculate commissions if price is provided
    if (transactionData.price) {
      transactionData.grossCommission = (transactionData.price * transactionData.commissionRatePct) / 100
      transactionData.netCommissionToMe = (transactionData.grossCommission * transactionData.mySplitPct) / 100
    }
    
    const transaction = await prisma.transaction.create({
      data: transactionData,
      include: {
        client: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    })
    
    res.status(201).json({ transaction })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    console.error('Create transaction error:', error)
    res.status(500).json({ error: 'Failed to create transaction' })
  }
})

// Update transaction
app.put('/api/transactions/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    const validatedData = transactionCreateSchema.partial().parse(req.body)
    
    const updateData = {
      ...validatedData,
      closeDate: validatedData.closeDate ? new Date(validatedData.closeDate) : undefined
    }
    
    // Recalculate commissions if price or rates changed
    if (updateData.price || updateData.commissionRatePct || updateData.mySplitPct) {
      const currentTransaction = await prisma.transaction.findUnique({ where: { id } })
      if (currentTransaction) {
        const price = updateData.price ?? currentTransaction.price
        const commissionRate = updateData.commissionRatePct ?? currentTransaction.commissionRatePct
        const splitRate = updateData.mySplitPct ?? currentTransaction.mySplitPct
        
        if (price) {
          updateData.grossCommission = (Number(price) * Number(commissionRate)) / 100
          updateData.netCommissionToMe = (updateData.grossCommission * Number(splitRate)) / 100
        }
      }
    }
    
    const transaction = await prisma.transaction.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    })
    
    res.json({ transaction })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    console.error('Update transaction error:', error)
    res.status(500).json({ error: 'Failed to update transaction' })
  }
})

// Delete transaction
app.delete('/api/transactions/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    
    await prisma.transaction.delete({ where: { id } })
    res.json({ message: 'Transaction deleted successfully' })
  } catch (error) {
    console.error('Delete transaction error:', error)
    res.status(500).json({ error: 'Failed to delete transaction' })
  }
})

// Dashboard analytics
app.get('/api/dashboard/stats', authenticateToken, async (req: any, res) => {
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
    
    // Monthly revenue trend
    const monthlyRevenue = await prisma.transaction.findMany({
      where: {
        status: 'CLOSED',
        closeDate: {
          gte: new Date(new Date().getFullYear(), 0, 1) // This year
        }
      },
      select: {
        closeDate: true,
        netCommissionToMe: true
      },
      orderBy: { closeDate: 'asc' }
    })
    
    res.json({
      clientStats,
      transactionStats,
      revenueStats,
      monthlyRevenue
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

app.listen(PORT, () => {
  console.log(`🚀 Real Estate CRM Backend running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`📊 Database: Connected to PostgreSQL`)
  console.log(`🔐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
})