// Login API route
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body
    
    // For now, just check demo credentials without database
    if (email === 'rodrigo@realtor.com' && password === 'admin123') {
      // Mock JWT token for testing
      const mockToken = 'mock-jwt-token-' + Date.now()
      
      return res.status(200).json({
        token: mockToken,
        user: {
          id: '1',
          email: 'rodrigo@realtor.com',
          firstName: 'Rodrigo',
          lastName: 'Silva',
          role: 'agent'
        },
        message: 'Login successful (mock mode)'
      })
    }
    
    return res.status(401).json({ error: 'Invalid credentials' })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ 
      error: 'Login failed', 
      details: error.message 
    })
  }
}