const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const app = express()

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

// JWT Secret
const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production'

// In-memory user for demo (replace with database in production)
const demoUser = {
  id: '1',
  email: 'rodrigo@realtor.com',
  firstName: 'Rodrigo',
  lastName: 'Garcia',
  password: '$2b$10$Y44bjPY0rwqZQUHD.ie3RemQTimOqJ8F7ZnIUUyi7MVFbyYtZc1Da', // admin123 hashed
  role: 'agent'
}

// Sample clients data
const sampleClients = [
  {
    id: '1',
    firstName: 'Maria',
    lastName: 'Rodriguez',
    email: 'maria.rodriguez@email.com',
    phone: '(305) 555-0123',
    address: '1234 Ocean Drive',
    city: 'Miami',
    state: 'FL',
    zipCode: '33139',
    birthday: '1985-06-15',
    anniversary: '2010-09-20',
    occupation: 'Marketing Manager',
    spouse: 'Carlos Rodriguez',
    children: 'Sofia (8), Diego (5)',
    notes: 'Looking for a family home with good schools nearby. Budget around $650K.',
    preferredContact: 'email',
    leadSource: 'Zillow',
    referredBy: 'John Smith',
    tags: ['First-time Buyer', 'Family', 'Qualified'],
    createdAt: '2024-01-15T10:00:00Z',
    transactions: [
      {
        id: '1',
        type: 'Purchase',
        propertyAddress: '5678 Sunset Blvd, Miami, FL 33140',
        salePrice: 625000,
        saleDate: '2024-03-15',
        grossCommission: 18750,
        netCommission: 14062.50,
        splitPercentage: 75,
        brokerageFee: 4687.50,
        status: 'Closed'
      }
    ]
  },
  {
    id: '2',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@email.com',
    phone: '(305) 555-0124',
    address: '2468 Pine Street',
    city: 'Miami Beach',
    state: 'FL',
    zipCode: '33141',
    birthday: '1978-09-22',
    occupation: 'Software Engineer',
    notes: 'Interested in luxury condos with ocean views. No budget constraints.',
    preferredContact: 'phone',
    leadSource: 'Referral',
    referredBy: 'Maria Rodriguez',
    tags: ['Luxury', 'Investment', 'Hot Lead'],
    createdAt: '2024-02-01T14:30:00Z',
    transactions: [
      {
        id: '2',
        type: 'Purchase',
        propertyAddress: '9999 Ocean Ave, Miami Beach, FL 33154',
        salePrice: 850000,
        saleDate: '2024-04-20',
        grossCommission: 25500,
        netCommission: 20400,
        splitPercentage: 80,
        brokerageFee: 5100,
        status: 'Closed'
      }
    ]
  },
  {
    id: '3',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@email.com',
    phone: '(305) 555-0125',
    address: '1357 Maple Ave',
    city: 'Coral Gables',
    state: 'FL',
    zipCode: '33134',
    birthday: '1990-12-08',
    occupation: 'Doctor',
    spouse: 'David Chen',
    notes: 'First-time buyer, pre-approved for $400K. Looking in Coral Gables area.',
    preferredContact: 'email',
    leadSource: 'Website',
    tags: ['First-time Buyer', 'Professional'],
    createdAt: '2024-02-15T09:15:00Z',
    transactions: []
  },
  {
    id: '4',
    firstName: 'Michael',
    lastName: 'Johnson',
    email: 'michael.johnson@email.com',
    phone: '(305) 555-0126',
    address: '7890 Oak Street',
    city: 'Aventura',
    state: 'FL',
    zipCode: '33180',
    birthday: '1965-04-17',
    occupation: 'Business Owner',
    spouse: 'Linda Johnson',
    children: 'Mike Jr. (22), Ashley (19)',
    notes: 'Looking to downsize after kids moved out. Wants a condo.',
    preferredContact: 'phone',
    leadSource: 'Facebook Ad',
    tags: ['Downsizing', 'Empty Nesters'],
    createdAt: '2024-03-01T11:45:00Z',
    transactions: [
      {
        id: '3',
        type: 'Sale',
        propertyAddress: '7890 Oak Street, Aventura, FL 33180',
        salePrice: 720000,
        saleDate: '2024-05-10',
        grossCommission: 21600,
        netCommission: 16200,
        splitPercentage: 75,
        brokerageFee: 5400,
        status: 'Closed'
      }
    ]
  },
  {
    id: '5',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@email.com',
    phone: '(305) 555-0127',
    address: '4567 Elm Drive',
    city: 'Homestead',
    state: 'FL',
    zipCode: '33030',
    birthday: '1988-07-25',
    occupation: 'Teacher',
    spouse: 'Robert Davis',
    children: 'Emma (6), Jack (4)',
    notes: 'Young family looking for affordable starter home with good schools.',
    preferredContact: 'email',
    leadSource: 'Realtor.com',
    tags: ['First-time Buyer', 'Family', 'Budget Conscious'],
    createdAt: '2024-03-10T16:20:00Z',
    transactions: []
  },
  {
    id: '6',
    firstName: 'Robert',
    lastName: 'Brown',
    email: 'robert.brown@email.com',
    phone: '(305) 555-0128',
    address: '9876 Palm Way',
    city: 'Key Biscayne',
    state: 'FL',
    zipCode: '33149',
    birthday: '1955-11-30',
    occupation: 'Retired Executive',
    spouse: 'Margaret Brown',
    notes: 'Looking for vacation rental investment properties. Cash buyer.',
    preferredContact: 'phone',
    leadSource: 'Past Client Referral',
    tags: ['Investment', 'Cash Buyer', 'VIP'],
    createdAt: '2024-03-20T13:10:00Z',
    transactions: [
      {
        id: '4',
        type: 'Purchase',
        propertyAddress: '1122 Beachfront Dr, Key Biscayne, FL 33149',
        salePrice: 950000,
        saleDate: '2024-06-01',
        grossCommission: 28500,
        netCommission: 22800,
        splitPercentage: 80,
        brokerageFee: 5700,
        status: 'Closed'
      }
    ]
  }
]

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}

// Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    if (email !== demoUser.email) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, demoUser.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: demoUser.id, 
        email: demoUser.email 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Return user info and token
    const { password: _, ...userWithoutPassword } = demoUser
    res.json({
      token,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const { password: _, ...userWithoutPassword } = demoUser
  res.json({ user: userWithoutPassword })
})

// Get all clients
app.get('/api/clients', authenticateToken, (req, res) => {
  res.json(sampleClients)
})

// Get single client
app.get('/api/clients/:id', authenticateToken, (req, res) => {
  const client = sampleClients.find(c => c.id === req.params.id)
  if (!client) {
    return res.status(404).json({ error: 'Client not found' })
  }
  res.json(client)
})

// Add new client
app.post('/api/clients', authenticateToken, (req, res) => {
  const newClient = {
    id: String(sampleClients.length + 1),
    ...req.body,
    createdAt: new Date().toISOString(),
    transactions: []
  }
  sampleClients.push(newClient)
  res.status(201).json(newClient)
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Client Flow 360 API is running',
    timestamp: new Date().toISOString()
  })
})

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Client Flow 360 API Server',
    status: 'Running',
    version: '1.0.0',
    apiBase: '/api'
  })
})

app.get('/api', (req, res) => {
  res.json({ 
    message: 'Welcome to Client Flow 360 API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/login',
      clients: '/api/clients',
      health: '/api/health'
    }
  })
})

// Start server
const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`🚀 Client Flow 360 API Server running on port ${PORT}`)
  console.log(`📱 Demo Login: rodrigo@realtor.com / admin123`)
})

module.exports = app