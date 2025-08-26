import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

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

interface Client {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  role: string
  stage: string
  city?: string
  state?: string
  tags: string[]
  lifetimeGrossCommission?: number
  lifetimeNetCommission?: number
  transactions?: Transaction[]
  properties?: Property[]
  calls?: Call[]
  activities?: Activity[]
  todos?: Todo[]
  createdAt?: string
  lastContact?: string
  notes?: string
}

interface Property {
  id: string
  address: string
  price?: number
  type: string
  status: string
  bedrooms?: number
  bathrooms?: number
  sqft?: number
  notes?: string
  dateAdded: string
}

interface Call {
  id: string
  date: string
  duration?: number
  type: 'INBOUND' | 'OUTBOUND'
  outcome: string
  notes: string
  followUpDate?: string
}

interface Activity {
  id: string
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'SHOWING' | 'NOTE'
  title: string
  description?: string
  date: string
  completed?: boolean
}

interface Todo {
  id: string
  title: string
  description?: string
  dueDate?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  completed: boolean
  createdAt: string
}

interface Transaction {
  id: string
  type: string
  propertyAddress: string
  status: string
  price?: number
  grossCommission?: number
  netCommissionToMe?: number
  closeDate?: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddClient, setShowAddClient] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  // Check for existing auth
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchClients()
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with API URL:', API_URL)
      
      // Try API first, fall back to mock if API fails
      try {
        const response = await api.post('/auth/login', { email, password })
        console.log('Login response:', response.data)
        const { token, user: userData } = response.data
        
        localStorage.setItem('auth_token', token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser(userData)
        fetchClients()
        setError('')
        return
      } catch (apiError) {
        console.log('API login failed, trying mock authentication...')
      }
      
      // Mock authentication fallback
      if (email === 'rodrigo@realtor.com' && password === 'admin123') {
        console.log('✅ Mock login successful!')
        const mockToken = 'mock-token-' + Date.now()
        const mockUser = {
          id: '1',
          email: 'rodrigo@realtor.com',
          firstName: 'Rodrigo',
          lastName: 'Silva',
          role: 'agent'
        }
        
        localStorage.setItem('auth_token', mockToken)
        api.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`
        setUser(mockUser)
        
        // Load mock clients with enhanced data
        setClients([
          {
            id: '1',
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@email.com',
            phone: '(555) 123-4567',
            role: 'BUYER',
            stage: 'ACTIVE',
            city: 'Miami',
            state: 'FL',
            tags: ['first-time-buyer'],
            lifetimeGrossCommission: 12500,
            lifetimeNetCommission: 10000,
            createdAt: '2024-01-15',
            lastContact: '2024-08-20',
            notes: 'Looking for a family home in Miami. Budget around $400K.',
            properties: [
              {
                id: 'p1',
                address: '123 Ocean Drive, Miami, FL',
                price: 425000,
                type: 'Single Family',
                status: 'INTERESTED',
                bedrooms: 3,
                bathrooms: 2,
                sqft: 1800,
                notes: 'Client loves the location but concerned about price',
                dateAdded: '2024-08-15'
              }
            ],
            calls: [
              {
                id: 'c1',
                date: '2024-08-20',
                duration: 15,
                type: 'OUTBOUND',
                outcome: 'Follow-up scheduled',
                notes: 'Discussed property options and budget',
                followUpDate: '2024-08-27'
              }
            ],
            activities: [
              {
                id: 'a1',
                type: 'CALL',
                title: 'Initial consultation call',
                description: 'Discussed client needs and budget',
                date: '2024-08-20',
                completed: true
              },
              {
                id: 'a2',
                type: 'SHOWING',
                title: 'Property showing scheduled',
                description: '123 Ocean Drive showing',
                date: '2024-08-27',
                completed: false
              }
            ],
            todos: [
              {
                id: 't1',
                title: 'Send mortgage pre-approval info',
                description: 'Email client mortgage broker contacts',
                dueDate: '2024-08-25',
                priority: 'HIGH',
                completed: false,
                createdAt: '2024-08-20'
              }
            ]
          },
          {
            id: '2',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.j@email.com',
            phone: '(555) 987-6543',
            role: 'SELLER',
            stage: 'SHOWING',
            city: 'Miami',
            state: 'FL',
            tags: ['luxury'],
            lifetimeGrossCommission: 25000,
            lifetimeNetCommission: 20000,
            createdAt: '2024-02-10',
            lastContact: '2024-08-18',
            notes: 'Selling luxury condo. Wants quick sale.',
            properties: [
              {
                id: 'p2',
                address: '456 Biscayne Blvd, Miami, FL',
                price: 750000,
                type: 'Condo',
                status: 'LISTED',
                bedrooms: 2,
                bathrooms: 2.5,
                sqft: 1200,
                notes: 'Luxury unit with bay views',
                dateAdded: '2024-08-10'
              }
            ],
            calls: [
              {
                id: 'c2',
                date: '2024-08-18',
                duration: 20,
                type: 'INBOUND',
                outcome: 'Price adjustment discussed',
                notes: 'Client considering price reduction',
                followUpDate: '2024-08-25'
              }
            ],
            activities: [
              {
                id: 'a3',
                type: 'MEETING',
                title: 'Listing agreement signed',
                description: 'Contract signed, marketing materials prepared',
                date: '2024-08-10',
                completed: true
              }
            ],
            todos: [
              {
                id: 't2',
                title: 'Schedule professional photos',
                description: 'Book photographer for property',
                dueDate: '2024-08-24',
                priority: 'MEDIUM',
                completed: false,
                createdAt: '2024-08-18'
              }
            ]
          }
        ])
        
        setError('')
        return
      } else {
        throw new Error('Invalid credentials')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError('Invalid credentials. Use rodrigo@realtor.com / admin123')
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    setClients([])
    setSelectedClient(null)
  }

  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await api.get('/clients')
      setClients(response.data.clients)
      if (!user) {
        // If we successfully fetched clients, we must be logged in
        setUser({ id: '1', email: 'rodrigo@realtor.com', firstName: 'Rodrigo', lastName: 'Martinez', role: 'admin' })
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClientDetails = async (clientId: string) => {
    try {
      const response = await api.get(`/clients/${clientId}`)
      setSelectedClient(response.data.client)
    } catch (error) {
      console.error('Failed to fetch client details:', error)
      // Fallback to mock data for selected client
      const client = clients.find(c => c.id === clientId)
      if (client) {
        setSelectedClient(client)
      }
    }
  }

  const addClient = (newClient: Omit<Client, 'id' | 'createdAt'>) => {
    const client: Client = {
      ...newClient,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      properties: [],
      calls: [],
      activities: [],
      todos: []
    }
    setClients(prev => [...prev, client])
    setShowAddClient(false)
  }

  const updateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c))
    if (selectedClient?.id === updatedClient.id) {
      setSelectedClient(updatedClient)
    }
  }

  const addCall = (clientId: string, call: Omit<Call, 'id'>) => {
    const newCall: Call = { ...call, id: Date.now().toString() }
    const updatedClient = clients.find(c => c.id === clientId)
    if (updatedClient) {
      const updated = {
        ...updatedClient,
        calls: [...(updatedClient.calls || []), newCall],
        lastContact: call.date
      }
      updateClient(updated)
    }
  }

  const addTodo = (clientId: string, todo: Omit<Todo, 'id' | 'createdAt'>) => {
    const newTodo: Todo = {
      ...todo,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    }
    const updatedClient = clients.find(c => c.id === clientId)
    if (updatedClient) {
      const updated = {
        ...updatedClient,
        todos: [...(updatedClient.todos || []), newTodo]
      }
      updateClient(updated)
    }
  }

  const toggleTodo = (clientId: string, todoId: string) => {
    const updatedClient = clients.find(c => c.id === clientId)
    if (updatedClient) {
      const updated = {
        ...updatedClient,
        todos: updatedClient.todos?.map(t => 
          t.id === todoId ? { ...t, completed: !t.completed } : t
        ) || []
      }
      updateClient(updated)
    }
  }

  const addProperty = (clientId: string, property: Omit<Property, 'id' | 'dateAdded'>) => {
    const newProperty: Property = {
      ...property,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString().split('T')[0]
    }
    const updatedClient = clients.find(c => c.id === clientId)
    if (updatedClient) {
      const updated = {
        ...updatedClient,
        properties: [...(updatedClient.properties || []), newProperty]
      }
      updateClient(updated)
    }
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getStatusColor = (stage: string) => {
    const colors = {
      NEW: 'bg-blue-500',
      NURTURE: 'bg-yellow-500',
      SHOWING: 'bg-purple-500',
      ACTIVE: 'bg-green-500',
      CLOSED: 'bg-gray-500',
    }
    return colors[stage as keyof typeof colors] || 'bg-gray-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm onLogin={login} error={error} />
  }

  if (showAddClient) {
    return (
      <AddClientForm
        onSave={addClient}
        onCancel={() => setShowAddClient(false)}
      />
    )
  }

  if (selectedClient) {
    return (
      <ClientDetail
        client={selectedClient}
        onBack={() => setSelectedClient(null)}
        onAddCall={(call) => addCall(selectedClient.id, call)}
        onAddTodo={(todo) => addTodo(selectedClient.id, todo)}
        onToggleTodo={(todoId) => toggleTodo(selectedClient.id, todoId)}
        onAddProperty={(property) => addProperty(selectedClient.id, property)}
      />
    )
  }

  return (
    <ClientList
      clients={clients}
      user={user}
      onLogout={logout}
      onSelectClient={fetchClientDetails}
      onAddClient={() => setShowAddClient(true)}
    />
  )
}

// Login Component
const LoginForm: React.FC<{ onLogin: (email: string, password: string) => void, error: string }> = ({ onLogin, error }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(email, password)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Real Estate CRM</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
            required
          />
          {error && (
            <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </form>
        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-sm font-medium text-gray-200 mb-2">Demo Account</h3>
          <div className="text-xs text-gray-400 space-y-1">
            <div>Email: rodrigo@realtor.com</div>
            <div>Password: admin123</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Client List Component
const ClientList: React.FC<{
  clients: Client[]
  user: User
  onLogout: () => void
  onSelectClient: (id: string) => void
  onAddClient: () => void
}> = ({ clients, user, onLogout, onSelectClient, onAddClient }) => {
  const getFollowUpStatus = (client: Client) => {
    if (!client.lastContact) return null
    const lastContact = new Date(client.lastContact)
    const today = new Date()
    const daysSince = Math.floor((today.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSince >= 7) {
      return { status: 'overdue', days: daysSince, text: `${daysSince} days overdue` }
    } else if (daysSince >= 5) {
      return { status: 'due', days: daysSince, text: `Due in ${7 - daysSince} days` }
    }
    return { status: 'good', days: daysSince, text: `Last contact ${daysSince} days ago` }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getStatusColor = (stage: string) => {
    const colors = {
      NEW: 'bg-blue-500',
      NURTURE: 'bg-yellow-500',
      SHOWING: 'bg-purple-500',
      ACTIVE: 'bg-green-500',
      CLOSED: 'bg-gray-500',
    }
    return colors[stage as keyof typeof colors] || 'bg-gray-500'
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Real Estate CRM</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Welcome, {user.firstName}!</span>
            <button
              onClick={onLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Your Clients ({clients.length})</h2>
            <button
              onClick={onAddClient}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>+</span>
              <span>Add New Client</span>
            </button>
          </div>
          
          {clients.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">No clients yet. Let's create some sample data!</div>
              <button
                onClick={async () => {
                  try {
                    await api.post('/seed')
                    window.location.reload()
                  } catch (error) {
                    console.error('Failed to seed data:', error)
                  }
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Sample Data
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {clients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => onSelectClient(client.id)}
                  className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-750 transition-colors border border-gray-700 relative"
                >
                  {/* Avatar */}
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold">{getInitials(client.firstName, client.lastName)}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{client.firstName} {client.lastName}</h3>
                      <p className="text-gray-400 text-sm">{client.role}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mb-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(client.stage)}`}>
                      {client.stage}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="text-gray-300 text-sm space-y-1 mb-3">
                    {client.email && <div>📧 {client.email}</div>}
                    {client.phone && <div>📞 {client.phone}</div>}
                    {client.city && client.state && <div>📍 {client.city}, {client.state}</div>}
                  </div>

                  {/* Commission */}
                  {client.lifetimeNetCommission && client.lifetimeNetCommission > 0 && (
                    <div className="text-green-400 font-medium text-sm">
                      💰 {formatCurrency(client.lifetimeNetCommission)} earned
                    </div>
                  )}

                  {/* Follow-up Status */}
                  {(() => {
                    const followUp = getFollowUpStatus(client)
                    if (followUp) {
                      return (
                        <div className={`text-xs mb-2 ${
                          followUp.status === 'overdue' ? 'text-red-400' :
                          followUp.status === 'due' ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          📅 {followUp.text}
                        </div>
                      )
                    }
                    return null
                  })()} 

                  {/* Tags */}
                  {client.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {client.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quick Stats */}
                  <div className="mt-3 flex justify-between text-xs text-gray-400">
                    <span>{client.properties?.length || 0} properties</span>
                    <span>{client.todos?.filter(t => !t.completed).length || 0} todos</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// Add Client Form Component
const AddClientForm: React.FC<{
  onSave: (client: Omit<Client, 'id' | 'createdAt'>) => void
  onCancel: () => void
}> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'BUYER',
    stage: 'NEW',
    city: '',
    state: '',
    notes: '',
    tags: [] as string[]
  })
  const [newTag, setNewTag] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName || !formData.lastName) {
      alert('First name and last name are required')
      return
    }
    onSave({
      ...formData,
      lifetimeGrossCommission: 0,
      lifetimeNetCommission: 0,
      properties: [],
      calls: [],
      activities: [],
      todos: []
    })
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
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onCancel}
            className="text-gray-300 hover:text-white transition-colors"
          >
            ← Cancel
          </button>
          <h1 className="text-2xl font-bold text-white">Add New Client</h1>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="BUYER">Buyer</option>
                  <option value="SELLER">Seller</option>
                  <option value="BOTH">Both</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Stage</label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData(prev => ({ ...prev, stage: e.target.value }))}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="NEW">New</option>
                  <option value="NURTURE">Nurture</option>
                  <option value="SHOWING">Showing</option>
                  <option value="ACTIVE">Active</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="FL"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none h-24 resize-none"
                placeholder="Client notes and preferences..."
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Tags</label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Add tag..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-red-400 hover:text-red-300 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors font-medium"
              >
                Save Client
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

// Client Detail Component (360° View)
const ClientDetail: React.FC<{
  client: Client
  onBack: () => void
  onAddCall: (call: Omit<Call, 'id'>) => void
  onAddTodo: (todo: Omit<Todo, 'id' | 'createdAt'>) => void
  onToggleTodo: (todoId: string) => void
  onAddProperty: (property: Omit<Property, 'id' | 'dateAdded'>) => void
}> = ({ client, onBack, onAddCall, onAddTodo, onToggleTodo, onAddProperty }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'calls' | 'activities' | 'todos'>('overview')
  const [showAddCall, setShowAddCall] = useState(false)
  const [showAddTodo, setShowAddTodo] = useState(false)
  const [showAddProperty, setShowAddProperty] = useState(false)
  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDate = (date?: string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
  }

  const formatDateTime = (date?: string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString()
  }

  const getDaysSinceLastCall = () => {
    if (!client.calls || client.calls.length === 0) return null
    const lastCall = client.calls.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    const daysSince = Math.floor((new Date().getTime() - new Date(lastCall.date).getTime()) / (1000 * 60 * 60 * 24))
    return { lastCall, daysSince }
  }

  const getFollowUpStatus = () => {
    const callInfo = getDaysSinceLastCall()
    if (!callInfo) return { status: 'no-calls', text: 'No calls logged' }
    
    const { daysSince } = callInfo
    if (daysSince >= 7) {
      return { status: 'overdue', text: `${daysSince} days since last call - Follow-up overdue!`, color: 'text-red-400' }
    } else if (daysSince >= 5) {
      return { status: 'due', text: `Follow-up due in ${7 - daysSince} days`, color: 'text-yellow-400' }
    }
    return { status: 'good', text: `Last call ${daysSince} days ago`, color: 'text-green-400' }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const followUpStatus = getFollowUpStatus()

  const tabs = [
    { id: 'overview', label: 'Overview', count: null },
    { id: 'properties', label: 'Properties', count: client.properties?.length || 0 },
    { id: 'calls', label: 'Call Log', count: client.calls?.length || 0 },
    { id: 'activities', label: 'Activities', count: client.activities?.length || 0 },
    { id: 'todos', label: 'To-dos', count: client.todos?.filter(t => !t.completed).length || 0 }
  ] as const

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-gray-300 hover:text-white transition-colors"
            >
              ← Back to Clients
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">{getInitials(client.firstName, client.lastName)}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {client.firstName} {client.lastName}
                </h1>
                <p className="text-gray-400 text-sm">{client.role} • {client.stage}</p>
              </div>
            </div>
          </div>
          
          {/* Follow-up Status Alert */}
          <div className={`px-4 py-2 rounded-lg border ${followUpStatus.status === 'overdue' ? 'bg-red-900 border-red-600' : followUpStatus.status === 'due' ? 'bg-yellow-900 border-yellow-600' : 'bg-green-900 border-green-600'}`}>
            <span className={`text-sm font-medium ${followUpStatus.color}`}>📞 {followUpStatus.text}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-blue-500' : 'bg-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Client Information */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Client Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                  <div><span className="text-gray-400">Email:</span> <span className="text-white">{client.email || 'Not provided'}</span></div>
                  <div><span className="text-gray-400">Phone:</span> <span className="text-white">{client.phone || 'Not provided'}</span></div>
                  <div><span className="text-gray-400">Role:</span> <span className="text-white">{client.role}</span></div>
                  <div><span className="text-gray-400">Stage:</span> <span className="text-white">{client.stage}</span></div>
                  <div><span className="text-gray-400">Location:</span> <span className="text-white">{client.city && client.state ? `${client.city}, ${client.state}` : 'Not provided'}</span></div>
                  <div><span className="text-gray-400">Client Since:</span> <span className="text-white">{formatDate(client.createdAt)}</span></div>
                </div>
                {client.notes && (
                  <div className="mt-4">
                    <span className="text-gray-400">Notes:</span>
                    <p className="text-white mt-1">{client.notes}</p>
                  </div>
                )}
                {client.tags.length > 0 && (
                  <div className="mt-4">
                    <span className="text-gray-400">Tags:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {client.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Activity Summary */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                {client.activities && client.activities.length > 0 ? (
                  <div className="space-y-3">
                    {client.activities.slice(0, 3).map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          activity.type === 'CALL' ? 'bg-blue-600 text-white' :
                          activity.type === 'EMAIL' ? 'bg-green-600 text-white' :
                          activity.type === 'MEETING' ? 'bg-purple-600 text-white' :
                          activity.type === 'SHOWING' ? 'bg-orange-600 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {activity.type.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{activity.title}</p>
                          <p className="text-gray-400 text-sm">{formatDate(activity.date)}</p>
                        </div>
                        {activity.completed && (
                          <div className="text-green-400 text-sm">✓</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No recent activity</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Commission Summary */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Commission Summary</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm">Lifetime Gross</p>
                    <p className="text-2xl font-bold text-green-400">
                      {formatCurrency(client.lifetimeGrossCommission)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Lifetime Net</p>
                    <p className="text-2xl font-bold text-green-400">
                      {formatCurrency(client.lifetimeNetCommission)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowAddCall(true)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center justify-center space-x-2"
                  >
                    <span>📞</span>
                    <span>Log Call</span>
                  </button>
                  <button
                    onClick={() => setShowAddProperty(true)}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-sm flex items-center justify-center space-x-2"
                  >
                    <span>🏠</span>
                    <span>Add Property</span>
                  </button>
                  <button
                    onClick={() => setShowAddTodo(true)}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors text-sm flex items-center justify-center space-x-2"
                  >
                    <span>✓</span>
                    <span>Add To-do</span>
                  </button>
                </div>
              </div>

              {/* Upcoming To-dos */}
              {client.todos && client.todos.filter(t => !t.completed).length > 0 && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Upcoming To-dos</h3>
                  <div className="space-y-2">
                    {client.todos.filter(t => !t.completed).slice(0, 3).map((todo) => (
                      <div key={todo.id} className="flex items-center space-x-2">
                        <button
                          onClick={() => onToggleTodo(todo.id)}
                          className="w-4 h-4 border border-gray-500 rounded hover:bg-gray-600 transition-colors"
                        />
                        <div className="flex-1">
                          <p className="text-white text-sm">{todo.title}</p>
                          {todo.dueDate && (
                            <p className="text-gray-400 text-xs">Due: {formatDate(todo.dueDate)}</p>
                          )}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded ${
                          todo.priority === 'HIGH' ? 'bg-red-600 text-white' :
                          todo.priority === 'MEDIUM' ? 'bg-yellow-600 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {todo.priority}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <PropertiesTab client={client} onAddProperty={onAddProperty} showAddProperty={showAddProperty} setShowAddProperty={setShowAddProperty} />
        )}

        {activeTab === 'calls' && (
          <CallsTab client={client} onAddCall={onAddCall} showAddCall={showAddCall} setShowAddCall={setShowAddCall} />
        )}

        {activeTab === 'activities' && (
          <ActivitiesTab client={client} />
        )}

        {activeTab === 'todos' && (
          <TodosTab client={client} onAddTodo={onAddTodo} onToggleTodo={onToggleTodo} showAddTodo={showAddTodo} setShowAddTodo={setShowAddTodo} />
        )}
      </main>
    </div>
  )
}

// Properties Tab Component
const PropertiesTab: React.FC<{
  client: Client
  onAddProperty: (property: Omit<Property, 'id' | 'dateAdded'>) => void
  showAddProperty: boolean
  setShowAddProperty: (show: boolean) => void
}> = ({ client, onAddProperty, showAddProperty, setShowAddProperty }) => {
  const [formData, setFormData] = useState({
    address: '',
    price: '',
    type: 'Single Family',
    status: 'INTERESTED',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    notes: ''
  })

  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDate = (date?: string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
  }

  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.address) {
      alert('Address is required')
      return
    }
    
    onAddProperty({
      address: formData.address,
      price: formData.price ? parseFloat(formData.price) : undefined,
      type: formData.type,
      status: formData.status,
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
      bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : undefined,
      sqft: formData.sqft ? parseInt(formData.sqft) : undefined,
      notes: formData.notes || undefined
    })
    
    setFormData({
      address: '',
      price: '',
      type: 'Single Family',
      status: 'INTERESTED',
      bedrooms: '',
      bathrooms: '',
      sqft: '',
      notes: ''
    })
    setShowAddProperty(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Properties</h2>
        <button
          onClick={() => setShowAddProperty(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add Property</span>
        </button>
      </div>

      {showAddProperty && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Add New Property</h3>
          <form onSubmit={handleAddProperty} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-gray-300 text-sm font-medium mb-2">Address *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="123 Main St, City, State"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Price</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="425000"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Single Family">Single Family</option>
                  <option value="Condo">Condo</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Multi-Family">Multi-Family</option>
                  <option value="Land">Land</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="INTERESTED">Interested</option>
                  <option value="SHOWING">Showing Scheduled</option>
                  <option value="OFFER_MADE">Offer Made</option>
                  <option value="UNDER_CONTRACT">Under Contract</option>
                  <option value="CLOSED">Closed</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Bedrooms</label>
                <input
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: e.target.value }))}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="3"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Bathrooms</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: e.target.value }))}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="2"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Square Feet</label>
                <input
                  type="number"
                  value={formData.sqft}
                  onChange={(e) => setFormData(prev => ({ ...prev, sqft: e.target.value }))}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="1800"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-300 text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none h-20 resize-none"
                  placeholder="Property notes..."
                />
              </div>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Add Property
              </button>
              <button
                type="button"
                onClick={() => setShowAddProperty(false)}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Properties List */}
      {client.properties && client.properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {client.properties.map((property) => (
            <div key={property.id} className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-white font-medium">{property.address}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  property.status === 'INTERESTED' ? 'bg-blue-600 text-white' :
                  property.status === 'SHOWING' ? 'bg-purple-600 text-white' :
                  property.status === 'OFFER_MADE' ? 'bg-orange-600 text-white' :
                  property.status === 'UNDER_CONTRACT' ? 'bg-yellow-600 text-white' :
                  property.status === 'CLOSED' ? 'bg-green-600 text-white' :
                  'bg-red-600 text-white'
                }`}>
                  {property.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-300">
                <div><span className="text-gray-400">Type:</span> <span className="text-white">{property.type}</span></div>
                {property.price && (
                  <div><span className="text-gray-400">Price:</span> <span className="text-white font-medium">{formatCurrency(property.price)}</span></div>
                )}
                {(property.bedrooms || property.bathrooms) && (
                  <div>
                    <span className="text-gray-400">Beds/Baths:</span> 
                    <span className="text-white"> {property.bedrooms || '?'} bed, {property.bathrooms || '?'} bath</span>
                  </div>
                )}
                {property.sqft && (
                  <div><span className="text-gray-400">Sq Ft:</span> <span className="text-white">{property.sqft.toLocaleString()}</span></div>
                )}
                <div><span className="text-gray-400">Added:</span> <span className="text-white">{formatDate(property.dateAdded)}</span></div>
              </div>
              
              {property.notes && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-gray-300 text-sm">{property.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No properties tracked yet</div>
          <button
            onClick={() => setShowAddProperty(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
          >
            Add First Property
          </button>
        </div>
      )}
    </div>
  )
}

// Calls Tab Component
const CallsTab: React.FC<{
  client: Client
  onAddCall: (call: Omit<Call, 'id'>) => void
  showAddCall: boolean
  setShowAddCall: (show: boolean) => void
}> = ({ client, onAddCall, showAddCall, setShowAddCall }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    duration: '',
    type: 'OUTBOUND' as 'INBOUND' | 'OUTBOUND',
    outcome: '',
    notes: '',
    followUpDate: ''
  })

  const formatDateTime = (date?: string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString()
  }

  const handleAddCall = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.outcome || !formData.notes) {
      alert('Outcome and notes are required')
      return
    }

    const callDateTime = `${formData.date}T${formData.time}`
    
    onAddCall({
      date: callDateTime,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      type: formData.type,
      outcome: formData.outcome,
      notes: formData.notes,
      followUpDate: formData.followUpDate || undefined
    })
    
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      duration: '',
      type: 'OUTBOUND',
      outcome: '',
      notes: '',
      followUpDate: ''
    })
    setShowAddCall(false)
  }

  const getDaysSince = (date: string) => {
    const daysSince = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
    return daysSince
  }

  const sortedCalls = client.calls?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || []

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">Call Log</h2>
          {sortedCalls.length > 0 && (
            <p className="text-gray-400 text-sm mt-1">
              Last call: {getDaysSince(sortedCalls[0].date)} days ago
              {getDaysSince(sortedCalls[0].date) >= 7 && (
                <span className="text-red-400 ml-2 font-medium">⚠️ Follow-up overdue</span>
              )}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowAddCall(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>📞</span>
          <span>Log Call</span>
        </button>
      </div>

      {showAddCall && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Log New Call</h3>
          <form onSubmit={handleAddCall} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="15"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Call Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'INBOUND' | 'OUTBOUND' }))}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="OUTBOUND">Outbound</option>
                  <option value="INBOUND">Inbound</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Follow-up Date</label>
                <input
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Outcome *</label>
              <input
                type="text"
                value={formData.outcome}
                onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value }))}
                className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="e.g., Follow-up scheduled, Showing booked, Contract signed"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Notes *</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none h-24 resize-none"
                placeholder="Call details, client feedback, next steps..."
                required
              />
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Log Call
              </button>
              <button
                type="button"
                onClick={() => setShowAddCall(false)}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Calls List */}
      {sortedCalls.length > 0 ? (
        <div className="space-y-4">
          {sortedCalls.map((call, index) => {
            const daysSince = getDaysSince(call.date)
            const isFollowUpDue = call.followUpDate && new Date(call.followUpDate) <= new Date()
            
            return (
              <div key={call.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      call.type === 'INBOUND' ? 'bg-green-600' : 'bg-blue-600'
                    }`}>
                      <span className="text-white text-sm">
                        {call.type === 'INBOUND' ? '📞' : '📱'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{call.outcome}</h3>
                      <p className="text-gray-400 text-sm">
                        {formatDateTime(call.date)} • {call.type}
                        {call.duration && ` • ${call.duration} min`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      daysSince === 0 ? 'bg-green-600 text-white' :
                      daysSince <= 3 ? 'bg-blue-600 text-white' :
                      daysSince <= 7 ? 'bg-yellow-600 text-white' :
                      'bg-red-600 text-white'
                    }`}>
                      {daysSince === 0 ? 'Today' : `${daysSince}d ago`}
                    </span>
                    {isFollowUpDue && (
                      <span className="text-xs px-2 py-1 rounded bg-red-600 text-white">
                        Follow-up Due
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-700 rounded p-3 mb-3">
                  <p className="text-gray-300">{call.notes}</p>
                </div>
                
                {call.followUpDate && (
                  <div className="text-sm text-gray-400">
                    📅 Follow-up scheduled for {new Date(call.followUpDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No calls logged yet</div>
          <button
            onClick={() => setShowAddCall(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Log First Call
          </button>
        </div>
      )}
    </div>
  )
}

// Activities Tab Component
const ActivitiesTab: React.FC<{ client: Client }> = ({ client }) => {
  const formatDateTime = (date?: string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString()
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'CALL': return '📞'
      case 'EMAIL': return '📧'
      case 'MEETING': return '🤝'
      case 'SHOWING': return '🏠'
      case 'NOTE': return '📝'
      default: return '📋'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'CALL': return 'bg-blue-600'
      case 'EMAIL': return 'bg-green-600'
      case 'MEETING': return 'bg-purple-600'
      case 'SHOWING': return 'bg-orange-600'
      case 'NOTE': return 'bg-gray-600'
      default: return 'bg-gray-600'
    }
  }

  const sortedActivities = client.activities?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || []

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Activity Timeline</h2>
        <div className="text-sm text-gray-400">
          {sortedActivities.length} total activities
        </div>
      </div>

      {sortedActivities.length > 0 ? (
        <div className="space-y-4">
          {sortedActivities.map((activity, index) => (
            <div key={activity.id} className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                  <span className="text-white text-lg">{getActivityIcon(activity.type)}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-white font-medium">{activity.title}</h3>
                      <p className="text-gray-400 text-sm">
                        {formatDateTime(activity.date)} • {activity.type}
                      </p>
                    </div>
                    {activity.completed !== undefined && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        activity.completed ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                      }`}>
                        {activity.completed ? 'Completed' : 'Pending'}
                      </span>
                    )}
                  </div>
                  
                  {activity.description && (
                    <div className="bg-gray-700 rounded p-3 mt-3">
                      <p className="text-gray-300">{activity.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No activities recorded yet</div>
          <p className="text-gray-500 text-sm">Activities are automatically created from calls, meetings, and other interactions</p>
        </div>
      )}
    </div>
  )
}

// Todos Tab Component
const TodosTab: React.FC<{
  client: Client
  onAddTodo: (todo: Omit<Todo, 'id' | 'createdAt'>) => void
  onToggleTodo: (todoId: string) => void
  showAddTodo: boolean
  setShowAddTodo: (show: boolean) => void
}> = ({ client, onAddTodo, onToggleTodo, showAddTodo, setShowAddTodo }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH'
  })

  const formatDate = (date?: string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
  }

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) {
      alert('Title is required')
      return
    }
    
    onAddTodo({
      title: formData.title,
      description: formData.description || undefined,
      dueDate: formData.dueDate || undefined,
      priority: formData.priority,
      completed: false
    })
    
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      priority: 'MEDIUM'
    })
    setShowAddTodo(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-600 text-white'
      case 'MEDIUM': return 'bg-yellow-600 text-white'
      case 'LOW': return 'bg-green-600 text-white'
      default: return 'bg-gray-600 text-white'
    }
  }

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  const sortedTodos = client.todos?.sort((a, b) => {
    // Sort by completion status, then by priority, then by due date
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    }
    return 0
  }) || []

  const completedCount = sortedTodos.filter(t => t.completed).length
  const overdueCount = sortedTodos.filter(t => !t.completed && isOverdue(t.dueDate)).length

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">To-dos</h2>
          <div className="flex space-x-4 text-sm text-gray-400 mt-1">
            <span>{sortedTodos.length - completedCount} pending</span>
            <span>{completedCount} completed</span>
            {overdueCount > 0 && (
              <span className="text-red-400">{overdueCount} overdue</span>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowAddTodo(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add To-do</span>
        </button>
      </div>

      {showAddTodo && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Add New To-do</h3>
          <form onSubmit={handleAddTodo} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="e.g., Send property listings"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none h-20 resize-none"
                placeholder="Additional details..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' }))}
                  className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Add To-do
              </button>
              <button
                type="button"
                onClick={() => setShowAddTodo(false)}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Todos List */}
      {sortedTodos.length > 0 ? (
        <div className="space-y-3">
          {sortedTodos.map((todo) => (
            <div
              key={todo.id}
              className={`bg-gray-800 rounded-lg p-4 ${todo.completed ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => onToggleTodo(todo.id)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors ${
                    todo.completed
                      ? 'bg-green-600 border-green-600'
                      : 'border-gray-500 hover:border-gray-400'
                  }`}
                >
                  {todo.completed && <span className="text-white text-xs">✓</span>}
                </button>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-medium ${todo.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                      {todo.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                        {todo.priority}
                      </span>
                      {todo.dueDate && !todo.completed && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          isOverdue(todo.dueDate) ? 'bg-red-600 text-white' : 'bg-gray-600 text-white'
                        }`}>
                          {isOverdue(todo.dueDate) ? 'Overdue' : `Due ${formatDate(todo.dueDate)}`}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {todo.description && (
                    <p className={`text-sm mb-2 ${todo.completed ? 'text-gray-500' : 'text-gray-300'}`}>
                      {todo.description}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>Created {formatDate(todo.createdAt)}</span>
                    {todo.dueDate && !isOverdue(todo.dueDate) && !todo.completed && (
                      <span>Due {formatDate(todo.dueDate)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No to-dos yet</div>
          <button
            onClick={() => setShowAddTodo(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors"
          >
            Create First To-do
          </button>
        </div>
      )}
    </div>
  )
}

export default App
