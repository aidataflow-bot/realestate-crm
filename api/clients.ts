import { VercelRequest, VercelResponse } from '@vercel/node'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

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

// Auth middleware
const authenticateToken = async (req: VercelRequest) => {
  const authHeader = req.headers['authorization'] as string
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    throw new Error('Access token required')
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, email: true, role: true, firstName: true, lastName: true }
  })

  if (!user) {
    throw new Error('Invalid token')
  }

  return user
}

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const user = await authenticateToken(req)

    if (req.method === 'GET') {
      const { search, page = '1', limit = '50' } = req.query
      const pageNum = parseInt(page as string)
      const limitNum = parseInt(limit as string)
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

      return res.json({
        clients: clientsWithTotals,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
      })
    }

    if (req.method === 'POST') {
      const validatedData = clientCreateSchema.parse(req.body)
      
      const clientData = {
        ...validatedData,
        birthday: validatedData.birthday ? new Date(validatedData.birthday) : undefined
      }
      
      const client = await prisma.client.create({ data: clientData })
      return res.status(201).json({ client })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    if (error instanceof Error && error.message.includes('token')) {
      return res.status(401).json({ error: error.message })
    }
    console.error('Clients API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}