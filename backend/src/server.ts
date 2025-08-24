import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())

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

// Create sample data
app.post('/api/seed', async (req, res) => {
  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await prisma.user.create({
      data: {
        email: 'rodrigo@realtor.com',
        password: hashedPassword,
        firstName: 'Rodrigo',
        lastName: 'Martinez',
        role: 'admin'
      }
    })

    // Create sample clients
    const clients = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '555-0123',
        role: 'BUYER',
        stage: 'SHOWING',
        city: 'Orlando',
        state: 'FL',
        tags: ['First Time Buyer']
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '555-0124',
        role: 'SELLER',
        stage: 'ACTIVE',
        city: 'Tampa',
        state: 'FL',
        tags: ['Luxury', 'Repeat Client']
      }
    ]

    for (const clientData of clients) {
      const client = await prisma.client.create({ data: clientData })

      // Add sample transaction
      await prisma.transaction.create({
        data: {
          clientId: client.id,
          type: clientData.role === 'BUYER' ? 'BUY' : 'SELL',
          propertyAddress: '123 Sample Street',
          city: clientData.city,
          state: clientData.state,
          status: 'CLOSED',
          price: 425000.00,
          commissionRatePct: 3.0,
          mySplitPct: 80.0,
          grossCommission: 12750.00,
          netCommissionToMe: 10200.00,
          closeDate: new Date('2024-06-01')
        }
      })
    }

    res.json({ message: 'Sample data created successfully!' })
  } catch (error) {
    console.error('Seed error:', error)
    res.status(500).json({ error: 'Failed to create sample data' })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Real Estate CRM Backend running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
})