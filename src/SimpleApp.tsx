import React, { useState } from 'react'

function SimpleApp() {
  const [count, setCount] = useState(0)

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '2rem',
        color: '#ef4444'
      }}>
        🎬 Client Flow 360 - Simple Test
      </h1>
      
      <div style={{
        backgroundColor: '#374151',
        padding: '2rem',
        borderRadius: '0.5rem',
        border: '2px solid #ef4444',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>React is Working!</h2>
        
        <div style={{ marginBottom: '1rem' }}>
          <p>Counter: <span style={{ color: '#f87171', fontWeight: 'bold' }}>{count}</span></p>
          <button 
            onClick={() => setCount(count + 1)}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '0.25rem',
              marginTop: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Click Me!
          </button>
        </div>
        
        <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1rem' }}>
          <p>API URL: https://3001-isb1z1ujd4x5imgop7xj8.e2b.dev/api</p>
          <p>If you can see this, React rendering works!</p>
        </div>
        
        <div>
          <button 
            onClick={() => window.location.href = '/login-test.html'}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Go to Login Test
          </button>
        </div>
      </div>
    </div>
  )
}

export default SimpleApp