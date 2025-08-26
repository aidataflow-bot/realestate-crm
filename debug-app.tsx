import React, { useState } from 'react'

function DebugApp() {
  const [user, setUser] = useState<any>(null)

  const login = (email: string, password: string) => {
    if (email === 'rodrigo@realtor.com' && password === 'admin123') {
      setUser({ firstName: 'Rodrigo', lastName: 'Silva' })
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-md">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent text-center mb-8">
            REALTOR CRM
          </h1>
          <button
            onClick={() => login('rodrigo@realtor.com', 'admin123')}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-md font-semibold"
          >
            Sign In (Demo)
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <h1 className="text-white text-2xl">Welcome {user.firstName}! Debug mode working.</h1>
    </div>
  )
}

export default DebugApp