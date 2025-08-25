// Next.js home page - redirects to Vite app
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    // Redirect to the main React app
    if (typeof window !== 'undefined') {
      window.location.href = '/dist/index.html'
    }
  }, [])

  return (
    <div>
      <h1>Real Estate CRM</h1>
      <p>Loading...</p>
    </div>
  )
}