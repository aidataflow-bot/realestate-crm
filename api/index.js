const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')

const app = express()
const prisma = new PrismaClient()

// Middleware
app.use(cors())
app.use(express.json())

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' })
    }
    req.user = user
    next()
  })
}

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
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
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Auth check error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Client Routes
app.get('/api/clients', authenticateToken, async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      where: { agentId: req.user.userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' }
        },
        properties: {
          orderBy: { createdAt: 'desc' }
        },
        calls: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        todos: {
          where: { completed: false },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        reminders: {
          where: { completed: false },
          orderBy: { reminderDate: 'asc' }
        },
        emails: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    res.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    res.status(500).json({ error: 'Failed to fetch clients' })
  }
})

app.get('/api/clients/:id', authenticateToken, async (req, res) => {
  try {
    const client = await prisma.client.findFirst({
      where: { 
        id: req.params.id,
        agentId: req.user.userId
      },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' }
        },
        properties: {
          orderBy: { createdAt: 'desc' }
        },
        calls: {
          orderBy: { createdAt: 'desc' }
        },
        todos: {
          orderBy: { createdAt: 'desc' }
        },
        activities: {
          orderBy: { createdAt: 'desc' }
        },
        reminders: {
          orderBy: { reminderDate: 'asc' }
        },
        emails: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!client) {
      return res.status(404).json({ error: 'Client not found' })
    }

    res.json(client)
  } catch (error) {
    console.error('Error fetching client:', error)
    res.status(500).json({ error: 'Failed to fetch client' })
  }
})

app.post('/api/clients', authenticateToken, async (req, res) => {
  try {
    const clientData = {
      ...req.body,
      agentId: req.user.userId,
      birthday: req.body.birthday ? new Date(req.body.birthday) : null,
      anniversary: req.body.anniversary ? new Date(req.body.anniversary) : null
    }

    const client = await prisma.client.create({
      data: clientData,
      include: {
        transactions: true,
        properties: true,
        calls: true,
        todos: true,
        activities: true,
        reminders: true,
        emails: true
      }
    })

    // Create activity for new client
    await prisma.activity.create({
      data: {
        clientId: client.id,
        type: 'client_added',
        title: 'Client Added',
        description: `${client.firstName} ${client.lastName} was added to the CRM`
      }
    })

    // Create birthday reminder if birthday is provided
    if (client.birthday) {
      const nextBirthday = new Date(client.birthday)
      nextBirthday.setFullYear(new Date().getFullYear())
      if (nextBirthday < new Date()) {
        nextBirthday.setFullYear(nextBirthday.getFullYear() + 1)
      }

      await prisma.reminder.create({
        data: {
          clientId: client.id,
          agentId: req.user.userId,
          title: `${client.firstName}'s Birthday`,
          description: `Send birthday wishes to ${client.firstName} ${client.lastName}`,
          reminderDate: nextBirthday,
          type: 'birthday',
          recurring: true
        }
      })
    }

    // Create anniversary reminder if anniversary is provided
    if (client.anniversary) {
      const nextAnniversary = new Date(client.anniversary)
      nextAnniversary.setFullYear(new Date().getFullYear())
      if (nextAnniversary < new Date()) {
        nextAnniversary.setFullYear(nextAnniversary.getFullYear() + 1)
      }

      await prisma.reminder.create({
        data: {
          clientId: client.id,
          agentId: req.user.userId,
          title: `${client.firstName} & ${client.spouse || 'Partner'}'s Anniversary`,
          description: `Congratulate ${client.firstName} ${client.lastName} on their anniversary`,
          reminderDate: nextAnniversary,
          type: 'anniversary',
          recurring: true
        }
      })
    }

    res.json(client)
  } catch (error) {
    console.error('Error creating client:', error)
    res.status(500).json({ error: 'Failed to create client' })
  }
})

app.put('/api/clients/:id', authenticateToken, async (req, res) => {
  try {
    const client = await prisma.client.findFirst({
      where: { 
        id: req.params.id,
        agentId: req.user.userId
      }
    })

    if (!client) {
      return res.status(404).json({ error: 'Client not found' })
    }

    const updatedClient = await prisma.client.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        birthday: req.body.birthday ? new Date(req.body.birthday) : null,
        anniversary: req.body.anniversary ? new Date(req.body.anniversary) : null
      },
      include: {
        transactions: true,
        properties: true,
        calls: true,
        todos: true,
        activities: true,
        reminders: true,
        emails: true
      }
    })

    // Create activity for client update
    await prisma.activity.create({
      data: {
        clientId: updatedClient.id,
        type: 'client_updated',
        title: 'Client Information Updated',
        description: `${updatedClient.firstName} ${updatedClient.lastName}'s information was updated`
      }
    })

    res.json(updatedClient)
  } catch (error) {
    console.error('Error updating client:', error)
    res.status(500).json({ error: 'Failed to update client' })
  }
})

// Transaction Routes
app.post('/api/clients/:clientId/transactions', authenticateToken, async (req, res) => {
  try {
    const client = await prisma.client.findFirst({
      where: { 
        id: req.params.clientId,
        agentId: req.user.userId
      }
    })

    if (!client) {
      return res.status(404).json({ error: 'Client not found' })
    }

    const transaction = await prisma.transaction.create({
      data: {
        ...req.body,
        clientId: req.params.clientId,
        agentId: req.user.userId,
        salePrice: req.body.salePrice ? parseFloat(req.body.salePrice) : null,
        listPrice: req.body.listPrice ? parseFloat(req.body.listPrice) : null,
        commissionRate: req.body.commissionRate ? parseFloat(req.body.commissionRate) : null,
        grossCommission: req.body.grossCommission ? parseFloat(req.body.grossCommission) : null,
        netCommission: req.body.netCommission ? parseFloat(req.body.netCommission) : null,
        splitPercentage: req.body.splitPercentage ? parseFloat(req.body.splitPercentage) : null,
        brokerageFee: req.body.brokerageFee ? parseFloat(req.body.brokerageFee) : null,
        closeDate: req.body.closeDate ? new Date(req.body.closeDate) : null,
        listDate: req.body.listDate ? new Date(req.body.listDate) : null,
        contractDate: req.body.contractDate ? new Date(req.body.contractDate) : null
      }
    })

    // Create activity for new transaction
    await prisma.activity.create({
      data: {
        clientId: req.params.clientId,
        type: 'transaction_added',
        title: `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} Transaction Added`,
        description: `New ${transaction.type} transaction for ${transaction.propertyAddress}`
      }
    })

    res.json(transaction)
  } catch (error) {
    console.error('Error creating transaction:', error)
    res.status(500).json({ error: 'Failed to create transaction' })
  }
})

// Property Routes
app.post('/api/clients/:clientId/properties', authenticateToken, async (req, res) => {
  try {
    const client = await prisma.client.findFirst({
      where: { 
        id: req.params.clientId,
        agentId: req.user.userId
      }
    })

    if (!client) {
      return res.status(404).json({ error: 'Client not found' })
    }

    const property = await prisma.property.create({
      data: {
        ...req.body,
        clientId: req.params.clientId,
        price: req.body.price ? parseFloat(req.body.price) : null,
        bathrooms: req.body.bathrooms ? parseFloat(req.body.bathrooms) : null,
        lotSize: req.body.lotSize ? parseFloat(req.body.lotSize) : null
      }
    })

    // Create activity for new property
    await prisma.activity.create({
      data: {
        clientId: req.params.clientId,
        type: 'property_added',
        title: 'Property Added',
        description: `Added property: ${property.address}`
      }
    })

    res.json(property)
  } catch (error) {
    console.error('Error creating property:', error)
    res.status(500).json({ error: 'Failed to create property' })
  }
})

// Call Routes
app.post('/api/clients/:clientId/calls', authenticateToken, async (req, res) => {
  try {
    const client = await prisma.client.findFirst({
      where: { 
        id: req.params.clientId,
        agentId: req.user.userId
      }
    })

    if (!client) {
      return res.status(404).json({ error: 'Client not found' })
    }

    const call = await prisma.call.create({
      data: {
        ...req.body,
        clientId: req.params.clientId
      }
    })

    // Create activity for call
    await prisma.activity.create({
      data: {
        clientId: req.params.clientId,
        type: 'call_logged',
        title: 'Call Logged',
        description: `Called ${call.phoneNumber} - ${call.outcome || 'No outcome recorded'}`
      }
    })

    res.json(call)
  } catch (error) {
    console.error('Error creating call:', error)
    res.status(500).json({ error: 'Failed to create call' })
  }
})

// Todo Routes
app.post('/api/clients/:clientId/todos', authenticateToken, async (req, res) => {
  try {
    const client = await prisma.client.findFirst({
      where: { 
        id: req.params.clientId,
        agentId: req.user.userId
      }
    })

    if (!client) {
      return res.status(404).json({ error: 'Client not found' })
    }

    const todo = await prisma.todo.create({
      data: {
        ...req.body,
        clientId: req.params.clientId,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null
      }
    })

    // Create activity for new todo
    await prisma.activity.create({
      data: {
        clientId: req.params.clientId,
        type: 'todo_added',
        title: 'Task Added',
        description: `New task: ${todo.title}`
      }
    })

    res.json(todo)
  } catch (error) {
    console.error('Error creating todo:', error)
    res.status(500).json({ error: 'Failed to create todo' })
  }
})

app.put('/api/todos/:id', authenticateToken, async (req, res) => {
  try {
    const todo = await prisma.todo.findFirst({
      where: { id: req.params.id },
      include: { client: true }
    })

    if (!todo || todo.client.agentId !== req.user.userId) {
      return res.status(404).json({ error: 'Todo not found' })
    }

    const updatedTodo = await prisma.todo.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null
      }
    })

    // Create activity if todo was completed
    if (req.body.completed && !todo.completed) {
      await prisma.activity.create({
        data: {
          clientId: todo.clientId,
          type: 'todo_completed',
          title: 'Task Completed',
          description: `Completed task: ${updatedTodo.title}`
        }
      })
    }

    res.json(updatedTodo)
  } catch (error) {
    console.error('Error updating todo:', error)
    res.status(500).json({ error: 'Failed to update todo' })
  }
})

// Reminder Routes
app.post('/api/clients/:clientId/reminders', authenticateToken, async (req, res) => {
  try {
    const client = await prisma.client.findFirst({
      where: { 
        id: req.params.clientId,
        agentId: req.user.userId
      }
    })

    if (!client) {
      return res.status(404).json({ error: 'Client not found' })
    }

    const reminder = await prisma.reminder.create({
      data: {
        ...req.body,
        clientId: req.params.clientId,
        agentId: req.user.userId,
        reminderDate: new Date(req.body.reminderDate)
      }
    })

    // Create activity for new reminder
    await prisma.activity.create({
      data: {
        clientId: req.params.clientId,
        type: 'reminder_added',
        title: 'Reminder Set',
        description: `Set reminder: ${reminder.title}`
      }
    })

    res.json(reminder)
  } catch (error) {
    console.error('Error creating reminder:', error)
    res.status(500).json({ error: 'Failed to create reminder' })
  }
})

// Email Routes
app.post('/api/clients/:clientId/emails', authenticateToken, async (req, res) => {
  try {
    const client = await prisma.client.findFirst({
      where: { 
        id: req.params.clientId,
        agentId: req.user.userId
      }
    })

    if (!client) {
      return res.status(404).json({ error: 'Client not found' })
    }

    const email = await prisma.email.create({
      data: {
        ...req.body,
        clientId: req.params.clientId,
        agentId: req.user.userId,
        sentAt: req.body.status === 'sent' ? new Date() : null
      }
    })

    // Create activity for email
    await prisma.activity.create({
      data: {
        clientId: req.params.clientId,
        type: 'email_sent',
        title: 'Email Sent',
        description: `Sent email: ${email.subject}`
      }
    })

    res.json(email)
  } catch (error) {
    console.error('Error creating email:', error)
    res.status(500).json({ error: 'Failed to create email' })
  }
})

// Seed data endpoint
app.post('/api/seed', async (req, res) => {
  try {
    // Check if admin user exists
    let adminUser = await prisma.user.findUnique({
      where: { email: 'rodrigo@realtor.com' }
    })

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      adminUser = await prisma.user.create({
        data: {
          email: 'rodrigo@realtor.com',
          firstName: 'Rodrigo',
          lastName: 'Garcia',
          password: hashedPassword,
          role: 'agent'
        }
      })
    }

    // Create sample clients
    const sampleClients = [
      {
        firstName: 'Maria',
        lastName: 'Rodriguez',
        email: 'maria.rodriguez@email.com',
        phone: '(305) 555-0123',
        address: '1234 Ocean Drive',
        city: 'Miami',
        state: 'FL',
        zipCode: '33139',
        birthday: new Date('1985-06-15'),
        anniversary: new Date('2010-09-20'),
        occupation: 'Marketing Manager',
        spouse: 'Carlos Rodriguez',
        children: 'Sofia (8), Diego (5)',
        notes: 'Looking for a family home with good schools nearby. Budget around $650K.',
        preferredContact: 'email',
        leadSource: 'Zillow',
        referredBy: 'John Smith',
        tags: ['First-time Buyer', 'Family', 'Qualified'],
        agentId: adminUser.id
      },
      {
        firstName: 'David',
        lastName: 'Chen',
        email: 'david.chen@techcorp.com',
        phone: '(415) 555-0198',
        address: '567 Market Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        birthday: new Date('1990-11-03'),
        occupation: 'Software Engineer',
        notes: 'Tech executive looking for luxury condo in SOMA. Cash buyer, budget $2M+.',
        preferredContact: 'phone',
        leadSource: 'Website',
        tags: ['Luxury', 'Cash Buyer', 'Tech'],
        agentId: adminUser.id
      },
      {
        firstName: 'Jennifer',
        lastName: 'Williams',
        email: 'jen.williams@gmail.com',
        phone: '(972) 555-0167',
        address: '890 Highland Park',
        city: 'Dallas',
        state: 'TX',
        zipCode: '75205',
        birthday: new Date('1978-03-22'),
        anniversary: new Date('2005-07-14'),
        occupation: 'Real Estate Investor',
        spouse: 'Michael Williams',
        children: 'Emma (12), Jack (10), Lily (7)',
        notes: 'Experienced investor looking for rental properties. Prefers properties under $400K.',
        preferredContact: 'text',
        leadSource: 'Referral',
        referredBy: 'Sarah Johnson',
        tags: ['Investor', 'Repeat Client', 'Rental Properties'],
        agentId: adminUser.id
      }
    ]

    const createdClients = []
    for (const clientData of sampleClients) {
      const client = await prisma.client.create({
        data: clientData
      })
      createdClients.push(client)
    }

    // Create sample transactions
    const sampleTransactions = [
      {
        clientId: createdClients[0].id,
        agentId: adminUser.id,
        type: 'buy',
        status: 'closed',
        propertyAddress: '1456 Coral Way, Miami, FL 33145',
        salePrice: 625000,
        listPrice: 649000,
        commissionRate: 3.0,
        grossCommission: 18750,
        netCommission: 13125,
        splitPercentage: 70.0,
        brokerageFee: 500,
        closeDate: new Date('2024-01-15'),
        listDate: new Date('2023-11-20'),
        contractDate: new Date('2023-12-18'),
        notes: 'Great first-time buyers. Smooth transaction with quick closing.'
      },
      {
        clientId: createdClients[1].id,
        agentId: adminUser.id,
        type: 'sell',
        status: 'pending',
        propertyAddress: '789 Mission Street, San Francisco, CA 94103',
        salePrice: 1850000,
        listPrice: 1899000,
        commissionRate: 2.5,
        grossCommission: 46250,
        netCommission: 32375,
        splitPercentage: 70.0,
        brokerageFee: 750,
        listDate: new Date('2024-06-01'),
        contractDate: new Date('2024-07-15'),
        notes: 'Luxury condo with city views. Multiple offers received.'
      },
      {
        clientId: createdClients[2].id,
        agentId: adminUser.id,
        type: 'buy',
        status: 'closed',
        propertyAddress: '2234 Elm Street, Dallas, TX 75226',
        salePrice: 385000,
        listPrice: 399000,
        commissionRate: 2.75,
        grossCommission: 10587.50,
        netCommission: 7411.25,
        splitPercentage: 70.0,
        brokerageFee: 300,
        closeDate: new Date('2024-03-10'),
        listDate: new Date('2024-01-05'),
        contractDate: new Date('2024-02-20'),
        notes: 'Investment property with great rental potential. Cash purchase.'
      }
    ]

    for (const transactionData of sampleTransactions) {
      await prisma.transaction.create({
        data: transactionData
      })
    }

    // Create sample properties
    const sampleProperties = [
      {
        clientId: createdClients[0].id,
        address: '1456 Coral Way',
        city: 'Miami',
        state: 'FL',
        zipCode: '33145',
        price: 625000,
        type: 'Single Family',
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1850,
        yearBuilt: 1995,
        description: 'Beautiful single-family home with updated kitchen and pool',
        status: 'sold'
      },
      {
        clientId: createdClients[1].id,
        address: '789 Mission Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94103',
        price: 1850000,
        type: 'Condo',
        bedrooms: 2,
        bathrooms: 2.5,
        sqft: 1200,
        yearBuilt: 2018,
        description: 'Modern luxury condo with panoramic city views',
        status: 'pending'
      }
    ]

    for (const propertyData of sampleProperties) {
      await prisma.property.create({
        data: propertyData
      })
    }

    // Create sample activities
    for (const client of createdClients) {
      await prisma.activity.create({
        data: {
          clientId: client.id,
          type: 'client_added',
          title: 'Client Added',
          description: `${client.firstName} ${client.lastName} was added to the CRM`
        }
      })

      await prisma.activity.create({
        data: {
          clientId: client.id,
          type: 'initial_contact',
          title: 'Initial Contact',
          description: `First meeting scheduled with ${client.firstName} ${client.lastName}`
        }
      })
    }

    // Create sample reminders
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

    await prisma.reminder.create({
      data: {
        clientId: createdClients[0].id,
        agentId: adminUser.id,
        title: 'Follow up on home warranty',
        description: 'Check if Maria needs help with home warranty setup',
        reminderDate: nextWeek,
        type: 'follow_up'
      }
    })

    await prisma.reminder.create({
      data: {
        clientId: createdClients[1].id,
        agentId: adminUser.id,
        title: 'Property inspection reminder',
        description: 'Remind David about upcoming property inspection',
        reminderDate: nextMonth,
        type: 'closing'
      }
    })

    res.json({ 
      message: 'Sample data created successfully',
      clientsCreated: createdClients.length,
      transactionsCreated: sampleTransactions.length
    })
  } catch (error) {
    console.error('Seed error:', error)
    res.status(500).json({ error: 'Failed to seed data' })
  }
})

// Dashboard stats endpoint
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const [
      totalClients,
      totalTransactions,
      pendingTransactions,
      totalCommissions,
      upcomingReminders
    ] = await Promise.all([
      prisma.client.count({
        where: { agentId: req.user.userId }
      }),
      prisma.transaction.count({
        where: { agentId: req.user.userId }
      }),
      prisma.transaction.count({
        where: { 
          agentId: req.user.userId,
          status: 'pending'
        }
      }),
      prisma.transaction.aggregate({
        where: { 
          agentId: req.user.userId,
          status: 'closed'
        },
        _sum: {
          netCommission: true,
          grossCommission: true
        }
      }),
      prisma.reminder.count({
        where: {
          agentId: req.user.userId,
          completed: false,
          reminderDate: {
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
          }
        }
      })
    ])

    res.json({
      totalClients,
      totalTransactions,
      pendingTransactions,
      totalGrossCommissions: totalCommissions._sum.grossCommission || 0,
      totalNetCommissions: totalCommissions._sum.netCommission || 0,
      upcomingReminders
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    res.status(500).json({ error: 'Failed to fetch dashboard stats' })
  }
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = app