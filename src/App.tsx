import React, { useState, useEffect } from 'react'
import axios from 'axios'

// Get API URL from environment variables
const BASE_API_URL = import.meta.env.VITE_API_URL || '/api'
const API_URL = BASE_API_URL.startsWith('http') 
  ? BASE_API_URL 
  : `https://3000-isb1z1ujd4x5imgop7xj8.e2b.dev${BASE_API_URL}`

console.log('Environment variables:', import.meta.env)
console.log('API URL being used:', API_URL)

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

interface Transaction {
  id: string
  type: string
  status: string
  propertyAddress: string
  salePrice?: number
  listPrice?: number
  commissionRate?: number
  grossCommission?: number
  netCommission?: number
  splitPercentage?: number
  brokerageFee?: number
  closeDate?: string
  listDate?: string
  contractDate?: string
  notes?: string
  createdAt: string
}

interface Property {
  id: string
  address: string
  city?: string
  state?: string
  price?: number
  type: string
  bedrooms?: number
  bathrooms?: number
  sqft?: number
  yearBuilt?: number
  mls?: string
  description?: string
  status: string
  createdAt: string
}

interface Call {
  id: string
  phoneNumber: string
  duration?: number
  notes?: string
  outcome?: string
  followUp: boolean
  createdAt: string
}

interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: string
  dueDate?: string
  createdAt: string
}

interface Activity {
  id: string
  type: string
  title: string
  description: string
  createdAt: string
}

interface Reminder {
  id: string
  title: string
  description?: string
  reminderDate: string
  type: string
  completed: boolean
  recurring: boolean
}

interface Email {
  id: string
  subject: string
  body: string
  to: string[]
  status: string
  sentAt?: string
  createdAt: string
}

interface Client {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  birthday?: string
  anniversary?: string
  occupation?: string
  spouse?: string
  children?: string
  notes?: string
  preferredContact: string
  leadSource?: string
  referredBy?: string
  tags: string[]
  avatar?: string
  createdAt: string
  transactions?: Transaction[]
  properties?: Property[]
  calls?: Call[]
  todos?: Todo[]
  activities?: Activity[]
  reminders?: Reminder[]
  emails?: Email[]
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddClient, setShowAddClient] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')

  // Check for existing auth
  useEffect(() => {
    console.log('App: useEffect - checking for existing auth')
    const token = localStorage.getItem('auth_token')
    console.log('App: Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'null')
    
    if (token) {
      console.log('App: Token found, calling loadUserData')
      loadUserData()
    } else {
      console.log('App: No token found, setting loading to false')
      setLoading(false)
    }
  }, [])

  const loadUserData = async () => {
    try {
      console.log('loadUserData: Checking token...')
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.log('loadUserData: No token found')
        setLoading(false)
        return
      }
      
      console.log('loadUserData: Token found, checking with backend...')
      const response = await api.get('/auth/me')
      console.log('loadUserData: Backend response:', response.data)
      setUser(response.data.user)
      await loadClients()
    } catch (error: any) {
      console.error('Auth check failed:', error.response?.status, error.response?.data || error.message)
      // Only clear token if it's actually invalid (401/403), not network errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('loadUserData: Token invalid, clearing...')
        localStorage.removeItem('auth_token')
      }
      setLoading(false)
    }
  }

  const loadClients = async () => {
    try {
      const response = await api.get('/clients')
      setClients(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load clients:', error)
      setError('Failed to load clients')
      setLoading(false)
    }
  }

  const onLogin = async (email: string, password: string) => {
    try {
      console.log('onLogin: Attempting login with:', email)
      setError('')
      setLoading(true)
      
      const response = await api.post('/auth/login', { email, password })
      console.log('onLogin: Login successful, storing token and user')
      
      localStorage.setItem('auth_token', response.data.token)
      setUser(response.data.user)
      
      console.log('onLogin: Loading clients...')
      await loadClients()
      
      console.log('onLogin: Complete - user should be logged in')
    } catch (error: any) {
      console.error('onLogin: Login failed:', error.response?.data || error.message)
      setError(error.response?.data?.error || 'Login failed')
      setLoading(false)
    }
  }

  const onLogout = () => {
    localStorage.removeItem('auth_token')
    setUser(null)
    setClients([])
    setSelectedClient(null)
  }

  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'transactions' | 'properties' | 'calls' | 'todos' | 'activities' | 'reminders' | 'emails'>) => {
    try {
      const response = await api.post('/clients', clientData)
      const newClient = response.data
      setClients(prev => [...prev, newClient])
      setShowAddClient(false)
    } catch (error) {
      console.error('Failed to add client:', error)
    }
  }

  // Helper functions
  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDate = (date?: string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
  }

  const getClientInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getTotalCommissions = (client: Client) => {
    const transactions = client.transactions || []
    const gross = transactions.reduce((sum, t) => sum + (t.grossCommission || 0), 0)
    const net = transactions.reduce((sum, t) => sum + (t.netCommission || 0), 0)
    return { gross, net }
  }

  const getNextBirthday = (birthday?: string) => {
    if (!birthday) return null
    const today = new Date()
    const birthDate = new Date(birthday)
    const thisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
    
    if (thisYear < today) {
      thisYear.setFullYear(today.getFullYear() + 1)
    }
    
    const diffTime = thisYear.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getAllTags = () => {
    const allTags = clients.flatMap(client => client.tags)
    return [...new Set(allTags)].filter(Boolean)
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = searchTerm === '' || 
      `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm)
    
    const matchesTag = selectedTag === '' || client.tags.includes(selectedTag)
    
    return matchesSearch && matchesTag
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    console.log('App: Showing login form - user is:', user)
    console.log('App: onLogin function is:', typeof onLogin)
    console.log('App: error is:', error)
    
    // Check if we just logged in and should bypass the form
    const hasValidToken = localStorage.getItem('auth_token')
    if (hasValidToken && !loading) {
      console.log('App: Found token but no user, forcing loadUserData...')
      loadUserData()
    }
    
    // Force visible login form with aggressive styling
    return (
      <div style={{
        minHeight: '100vh',
        background: '#111827', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 99999
      }}>
        <div style={{
          background: '#1f2937',
          padding: '2rem',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '28rem',
          border: '2px solid #ef4444',
          color: 'white'
        }}>
          <h2 style={{
            color: '#ef4444',
            textAlign: 'center',
            marginBottom: '1.5rem',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>🎬 CLIENT FLOW 360</h2>
          
          <form onSubmit={(e) => {
            e.preventDefault()
            const email = (e.target as any).email.value
            const password = (e.target as any).password.value
            console.log('Login attempt with:', email, password)
            onLogin(email, password)
          }} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <input
              name="email"
              type="email"
              placeholder="Email (rodrigo@realtor.com)"
              defaultValue="rodrigo@realtor.com"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                color: 'white',
                fontSize: '1rem'
              }}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password (admin123)"
              defaultValue="admin123"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                color: 'white',
                fontSize: '1rem'
              }}
              required
            />
            {error && (
              <div style={{
                background: '#7f1d1d',
                border: '1px solid #dc2626',
                color: '#fca5a5',
                padding: '0.75rem',
                borderRadius: '6px'
              }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Sign In to CRM
            </button>
          </form>
          
          <div style={{
            marginTop: '1rem',
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '0.875rem'
          }}>
            Demo: rodrigo@realtor.com / admin123
          </div>
        </div>
      </div>
    )
  }

  if (selectedClient) {
    return (
      <ClientDetailView 
        client={selectedClient} 
        onBack={() => setSelectedClient(null)}
        onUpdate={loadClients}
      />
    )
  }

  if (showAddClient) {
    return (
      <AddClientForm
        onSave={addClient}
        onCancel={() => setShowAddClient(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Netflix-style Header */}
      <header className="bg-gradient-to-r from-black via-gray-900 to-black px-6 py-4 sticky top-0 z-50 border-b border-red-600/20">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
              REALTOR CRM
            </h1>
            <nav className="hidden md:flex space-x-6">
              <button className="text-white hover:text-red-400 transition-colors">Clients</button>
              <button className="text-gray-400 hover:text-red-400 transition-colors">Properties</button>
              <button className="text-gray-400 hover:text-red-400 transition-colors">Transactions</button>
              <button className="text-gray-400 hover:text-red-400 transition-colors">Reports</button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Welcome, {user.firstName}!</span>
            <button
              onClick={onLogout}
              className="bg-gray-800 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-all duration-200 border border-gray-700 hover:border-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
              >
                <option value="">All Tags</option>
                {getAllTags().map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
              <button
                onClick={() => setShowAddClient(true)}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg"
              >
                <span>+</span>
                <span>Add Client</span>
              </button>
            </div>
          </div>
        </div>

        {/* Clients Grid - Netflix Style */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Your Clients ({filteredClients.length})</h2>
          {filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">No clients found. Add your first client to get started!</div>
              <button
                onClick={() => setShowAddClient(true)}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Add Your First Client
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {filteredClients.map((client) => (
                <ClientTile
                  key={client.id}
                  client={client}
                  onClick={() => setSelectedClient(client)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Client Tile Component - Netflix Style
const ClientTile: React.FC<{
  client: Client
  onClick: () => void
}> = ({ client, onClick }) => {
  const commissions = client.transactions?.reduce((sum, t) => sum + (t.netCommission || 0), 0) || 0
  const nextBirthday = client.birthday ? (() => {
    const today = new Date()
    const birthDate = new Date(client.birthday!)
    const thisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
    
    if (thisYear < today) {
      thisYear.setFullYear(today.getFullYear() + 1)
    }
    
    const diffTime = thisYear.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  })() : null

  return (
    <div
      onClick={onClick}
      className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-gray-700 hover:border-red-500"
    >
      {/* Client Avatar */}
      <div className="aspect-[3/4] bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center relative overflow-hidden">
        {client.avatar ? (
          <img src={client.avatar} alt={`${client.firstName} ${client.lastName}`} className="w-full h-full object-cover" />
        ) : (
          <div className="text-4xl font-bold text-white">
            {client.firstName.charAt(0)}{client.lastName.charAt(0)}
          </div>
        )}
        
        {/* Birthday indicator */}
        {nextBirthday !== null && nextBirthday <= 30 && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
            🎂 {nextBirthday}d
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-white text-sm font-semibold">
            View Details
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2 truncate">
          {client.firstName} {client.lastName}
        </h3>
        
        <div className="space-y-1 text-sm text-gray-400">
          {client.email && (
            <div className="truncate">{client.email}</div>
          )}
          {client.phone && (
            <div>{client.phone}</div>
          )}
          
          {/* Commission info */}
          {commissions > 0 && (
            <div className="text-green-400 font-semibold">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(commissions)}
            </div>
          )}

          {/* Transaction count */}
          <div className="text-xs text-gray-500">
            {(client.transactions?.length || 0)} transaction{(client.transactions?.length || 0) !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Tags */}
        {client.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {client.tags.slice(0, 2).map(tag => (
              <span key={tag} className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                {tag}
              </span>
            ))}
            {client.tags.length > 2 && (
              <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded-full">
                +{client.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Client Detail View Component
const ClientDetailView: React.FC<{
  client: Client
  onBack: () => void
  onUpdate: () => void
}> = ({ client, onBack, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'properties' | 'communications' | 'reminders'>('overview')
  
  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDate = (date?: string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
  }

  const totalCommissions = client.transactions?.reduce((acc, t) => ({
    gross: acc.gross + (t.grossCommission || 0),
    net: acc.net + (t.netCommission || 0)
  }), { gross: 0, net: 0 }) || { gross: 0, net: 0 }

  const getAge = (birthday?: string) => {
    if (!birthday) return null
    const today = new Date()
    const birthDate = new Date(birthday)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-gray-900 to-black px-6 py-4 border-b border-red-600/20">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-red-400 hover:text-red-300 text-2xl"
            >
              ←
            </button>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center text-2xl font-bold">
                {client.avatar ? (
                  <img src={client.avatar} alt={`${client.firstName} ${client.lastName}`} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  `${client.firstName.charAt(0)}${client.lastName.charAt(0)}`
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{client.firstName} {client.lastName}</h1>
                <p className="text-gray-400">{client.email || client.phone}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Total Commissions</div>
              <div className="text-2xl font-bold text-green-400">{formatCurrency(totalCommissions.net)}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-gray-900 px-6 border-b border-gray-700">
        <div className="max-w-7xl mx-auto">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'transactions', label: 'Transactions' },
              { id: 'properties', label: 'Properties' },
              { id: 'communications', label: 'Communications' },
              { id: 'reminders', label: 'Reminders' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-400'
                    : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <OverviewTab client={client} />
        )}
        
        {activeTab === 'transactions' && (
          <TransactionsTab client={client} />
        )}
        
        {activeTab === 'properties' && (
          <PropertiesTab client={client} />
        )}
        
        {activeTab === 'communications' && (
          <CommunicationsTab client={client} />
        )}
        
        {activeTab === 'reminders' && (
          <RemindersTab client={client} />
        )}
      </div>
    </div>
  )
}

// Overview Tab
const OverviewTab: React.FC<{ client: Client }> = ({ client }) => {
  const formatDate = (date?: string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const getAge = (birthday?: string) => {
    if (!birthday) return null
    const today = new Date()
    const birthDate = new Date(birthday)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const totalCommissions = client.transactions?.reduce((acc, t) => ({
    gross: acc.gross + (t.grossCommission || 0),
    net: acc.net + (t.netCommission || 0)
  }), { gross: 0, net: 0 }) || { gross: 0, net: 0 }

  return (
    <div className="space-y-8">
      {/* Personal Information */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-6">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="text-gray-400 text-sm">Email</label>
            <div className="text-white font-medium">{client.email || 'N/A'}</div>
          </div>
          <div>
            <label className="text-gray-400 text-sm">Phone</label>
            <div className="text-white font-medium">
              {client.phone ? (
                <a href={`tel:${client.phone}`} className="text-red-400 hover:text-red-300">
                  {client.phone}
                </a>
              ) : 'N/A'}
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-sm">Birthday</label>
            <div className="text-white font-medium">
              {client.birthday ? (
                <span>
                  {formatDate(client.birthday)} 
                  {getAge(client.birthday) && <span className="text-gray-400 ml-2">({getAge(client.birthday)} years old)</span>}
                </span>
              ) : 'N/A'}
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-sm">Anniversary</label>
            <div className="text-white font-medium">{formatDate(client.anniversary)}</div>
          </div>
          <div>
            <label className="text-gray-400 text-sm">Occupation</label>
            <div className="text-white font-medium">{client.occupation || 'N/A'}</div>
          </div>
          <div>
            <label className="text-gray-400 text-sm">Spouse</label>
            <div className="text-white font-medium">{client.spouse || 'N/A'}</div>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label className="text-gray-400 text-sm">Address</label>
            <div className="text-white font-medium">
              {[client.address, client.city, client.state, client.zipCode].filter(Boolean).join(', ') || 'N/A'}
            </div>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label className="text-gray-400 text-sm">Children</label>
            <div className="text-white font-medium">{client.children || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-6">Financial Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold">{formatCurrency(totalCommissions.gross)}</div>
            <div className="text-green-100 mt-2">Gross Commission</div>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold">{formatCurrency(totalCommissions.net)}</div>
            <div className="text-blue-100 mt-2">Net Commission</div>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold">{client.transactions?.length || 0}</div>
            <div className="text-purple-100 mt-2">Total Transactions</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {client.activities?.slice(0, 5).map(activity => (
            <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-white font-medium">{activity.title}</div>
                <div className="text-gray-400 text-sm">{activity.description}</div>
              </div>
              <div className="text-gray-500 text-sm">{formatDate(activity.createdAt)}</div>
            </div>
          )) || (
            <div className="text-gray-400 text-center py-8">No recent activity</div>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-6">Notes</h3>
        <div className="text-gray-300">
          {client.notes || 'No notes available'}
        </div>
      </div>
    </div>
  )
}

// Transactions Tab
const TransactionsTab: React.FC<{ client: Client }> = ({ client }) => {
  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDate = (date?: string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'closed': return 'bg-green-600'
      case 'pending': return 'bg-yellow-600'
      case 'cancelled': return 'bg-red-600'
      default: return 'bg-gray-600'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'buy': return '🏠'
      case 'sell': return '💰'
      case 'lease': return '📋'
      default: return '📄'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Transaction History</h3>
        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
          Add Transaction
        </button>
      </div>

      {client.transactions?.length ? (
        <div className="space-y-4">
          {client.transactions.map(transaction => (
            <div key={transaction.id} className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{getTypeIcon(transaction.type)}</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{transaction.propertyAddress}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(transaction.status)}`}>
                        {transaction.status.toUpperCase()}
                      </span>
                      <span className="text-gray-400 text-sm">{transaction.type.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{formatCurrency(transaction.salePrice)}</div>
                  <div className="text-green-400 font-medium">{formatCurrency(transaction.netCommission)} net</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">List Price:</span>
                  <div className="text-white font-medium">{formatCurrency(transaction.listPrice)}</div>
                </div>
                <div>
                  <span className="text-gray-400">Commission Rate:</span>
                  <div className="text-white font-medium">{transaction.commissionRate}%</div>
                </div>
                <div>
                  <span className="text-gray-400">Gross Commission:</span>
                  <div className="text-white font-medium">{formatCurrency(transaction.grossCommission)}</div>
                </div>
                <div>
                  <span className="text-gray-400">Close Date:</span>
                  <div className="text-white font-medium">{formatDate(transaction.closeDate)}</div>
                </div>
              </div>

              {transaction.notes && (
                <div className="mt-4 p-3 bg-gray-800 rounded">
                  <span className="text-gray-400 text-sm">Notes:</span>
                  <div className="text-gray-300 mt-1">{transaction.notes}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-900 rounded-lg">
          <div className="text-6xl mb-4">💼</div>
          <div className="text-gray-400 mb-4">No transactions yet</div>
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors">
            Record First Transaction
          </button>
        </div>
      )}
    </div>
  )
}

// Properties Tab
const PropertiesTab: React.FC<{ client: Client }> = ({ client }) => {
  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600'
      case 'sold': return 'bg-blue-600'
      case 'pending': return 'bg-yellow-600'
      default: return 'bg-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Properties</h3>
        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
          Add Property
        </button>
      </div>

      {client.properties?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {client.properties.map(property => (
            <div key={property.id} className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                <div className="text-6xl">🏠</div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-lg font-semibold text-white">{property.address}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(property.status)}`}>
                    {property.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-gray-400 text-sm mb-3">
                  {[property.city, property.state].filter(Boolean).join(', ')}
                </div>
                <div className="text-2xl font-bold text-white mb-3">{formatCurrency(property.price)}</div>
                <div className="grid grid-cols-3 gap-2 text-sm text-gray-300">
                  <div>
                    <div className="text-gray-400">Beds</div>
                    <div className="font-medium">{property.bedrooms || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Baths</div>
                    <div className="font-medium">{property.bathrooms || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Sq Ft</div>
                    <div className="font-medium">{property.sqft?.toLocaleString() || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-900 rounded-lg">
          <div className="text-6xl mb-4">🏠</div>
          <div className="text-gray-400 mb-4">No properties yet</div>
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors">
            Add First Property
          </button>
        </div>
      )}
    </div>
  )
}

// Communications Tab
const CommunicationsTab: React.FC<{ client: Client }> = ({ client }) => {
  const [activeComTab, setActiveComTab] = useState<'emails' | 'calls'>('emails')

  const formatDate = (date?: string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveComTab('emails')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeComTab === 'emails' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Emails
          </button>
          <button
            onClick={() => setActiveComTab('calls')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeComTab === 'calls' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Calls
          </button>
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
          {activeComTab === 'emails' ? 'Compose Email' : 'Log Call'}
        </button>
      </div>

      {activeComTab === 'emails' && (
        <div className="space-y-4">
          {client.emails?.length ? (
            client.emails.map(email => (
              <div key={email.id} className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{email.subject}</h4>
                    <div className="text-gray-400 text-sm">To: {email.to.join(', ')}</div>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      email.status === 'sent' ? 'bg-green-600' : 
                      email.status === 'failed' ? 'bg-red-600' : 'bg-gray-600'
                    } text-white`}>
                      {email.status.toUpperCase()}
                    </div>
                    <div className="text-gray-400 text-sm mt-1">{formatDate(email.sentAt || email.createdAt)}</div>
                  </div>
                </div>
                <div className="text-gray-300 text-sm bg-gray-800 p-3 rounded">
                  {email.body.substring(0, 200)}...
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-900 rounded-lg">
              <div className="text-6xl mb-4">📧</div>
              <div className="text-gray-400 mb-4">No emails yet</div>
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors">
                Send First Email
              </button>
            </div>
          )}
        </div>
      )}

      {activeComTab === 'calls' && (
        <div className="space-y-4">
          {client.calls?.length ? (
            client.calls.map(call => (
              <div key={call.id} className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white">
                      <a href={`tel:${call.phoneNumber}`} className="text-red-400 hover:text-red-300">
                        {call.phoneNumber}
                      </a>
                    </h4>
                    <div className="text-gray-400 text-sm">
                      {call.duration && `Duration: ${Math.floor(call.duration / 60)}:${(call.duration % 60).toString().padStart(2, '0')}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      call.outcome === 'answered' ? 'bg-green-600' : 
                      call.outcome === 'voicemail' ? 'bg-yellow-600' : 'bg-gray-600'
                    } text-white`}>
                      {call.outcome?.toUpperCase() || 'UNKNOWN'}
                    </div>
                    <div className="text-gray-400 text-sm mt-1">{formatDate(call.createdAt)}</div>
                  </div>
                </div>
                {call.notes && (
                  <div className="text-gray-300 text-sm bg-gray-800 p-3 rounded">
                    {call.notes}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-900 rounded-lg">
              <div className="text-6xl mb-4">📞</div>
              <div className="text-gray-400 mb-4">No calls logged yet</div>
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors">
                Log First Call
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Reminders Tab
const RemindersTab: React.FC<{ client: Client }> = ({ client }) => {
  const formatDate = (date?: string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'birthday': return '🎂'
      case 'anniversary': return '💒'
      case 'follow_up': return '📞'
      case 'closing': return '🏠'
      default: return '⏰'
    }
  }

  const isOverdue = (date: string) => {
    return new Date(date) < new Date()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Reminders & Important Dates</h3>
        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
          Add Reminder
        </button>
      </div>

      {client.reminders?.length ? (
        <div className="space-y-4">
          {client.reminders.map(reminder => (
            <div key={reminder.id} className={`bg-gray-900 rounded-lg p-6 border-l-4 ${
              isOverdue(reminder.reminderDate) ? 'border-red-500' : 'border-blue-500'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{getTypeIcon(reminder.type)}</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{reminder.title}</h4>
                    <div className="text-gray-400 text-sm">{reminder.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    isOverdue(reminder.reminderDate) ? 'text-red-400' : 'text-blue-400'
                  }`}>
                    {formatDate(reminder.reminderDate)}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    {reminder.type.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              </div>
              {!reminder.completed && (
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors">
                  Mark Complete
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-900 rounded-lg">
          <div className="text-6xl mb-4">⏰</div>
          <div className="text-gray-400 mb-4">No reminders set</div>
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors">
            Set First Reminder
          </button>
        </div>
      )}
    </div>
  )
}

// Login Form Component
const LoginForm: React.FC<{
  onLogin: (email: string, password: string) => void
  error: string
}> = ({ onLogin, error }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(email, password)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-md border border-red-500/30">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent mb-2">
            REALTOR CRM
          </h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-4 rounded-lg transition-all duration-200 font-medium"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center text-gray-400 text-sm">
          Demo: rodrigo@realtor.com / admin123
        </div>
      </div>
    </div>
  )
}

// Add Client Form Component
const AddClientForm: React.FC<{
  onSave: (client: Omit<Client, 'id' | 'createdAt' | 'transactions' | 'properties' | 'calls' | 'todos' | 'activities' | 'reminders' | 'emails'>) => void
  onCancel: () => void
}> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    birthday: '',
    anniversary: '',
    occupation: '',
    spouse: '',
    children: '',
    notes: '',
    preferredContact: 'email',
    leadSource: '',
    referredBy: '',
    tags: [] as string[],
  })

  const [newTag, setNewTag] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-gray-900 rounded-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Add New Client</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Birthday</label>
                  <input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                    className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Anniversary</label>
                  <input
                    type="date"
                    value={formData.anniversary}
                    onChange={(e) => setFormData(prev => ({ ...prev, anniversary: e.target.value }))}
                    className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Occupation</label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                    className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Spouse</label>
                  <input
                    type="text"
                    value={formData.spouse}
                    onChange={(e) => setFormData(prev => ({ ...prev, spouse: e.target.value }))}
                    className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-300 text-sm font-medium mb-2">Children</label>
                  <input
                    type="text"
                    value={formData.children}
                    onChange={(e) => setFormData(prev => ({ ...prev, children: e.target.value }))}
                    className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                    placeholder="Names and ages..."
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-gray-300 text-sm font-medium mb-2">Street Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                    className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Lead Source</label>
                  <input
                    type="text"
                    value={formData.leadSource}
                    onChange={(e) => setFormData(prev => ({ ...prev, leadSource: e.target.value }))}
                    className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                    placeholder="e.g., Zillow, Referral, Website..."
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Referred By</label>
                  <input
                    type="text"
                    value={formData.referredBy}
                    onChange={(e) => setFormData(prev => ({ ...prev, referredBy: e.target.value }))}
                    className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Preferred Contact</label>
                  <select
                    value={formData.preferredContact}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferredContact: e.target.value }))}
                    className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="text">Text</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Tags</h3>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="flex-1 p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span key={tag} className="bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-red-200 hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Notes</h3>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
                className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                placeholder="Any additional notes about this client..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-6 rounded-lg transition-all duration-200 font-medium"
              >
                Save Client
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default App