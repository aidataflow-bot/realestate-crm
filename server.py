#!/usr/bin/env python3
import http.server
import socketserver
import os
import signal
import sys
from pathlib import Path

# Set the directory to serve files from
os.chdir('/home/user/webapp/dist')

# Define the port
PORT = 4444

# Custom handler to serve index.html for all routes (SPA support)
class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Check if the requested path is a file that exists
        path = Path(self.path.lstrip('/'))
        
        # If it's a file and exists, serve it
        if path.exists() and path.is_file():
            return super().do_GET()
        
        # If it's an API route, let it pass through
        if self.path.startswith('/api/'):
            return super().do_GET()
        
        # Otherwise, serve index.html for SPA routing
        self.path = '/index.html'
        return super().do_GET()

# Signal handler for graceful shutdown
def signal_handler(sig, frame):
    print('\n🛑 Shutting down Netflix Real Estate CRM server...')
    sys.exit(0)

# Register signal handler
signal.signal(signal.SIGINT, signal_handler)

try:
    # Create and start the server
    with socketserver.TCPServer(("", PORT), SPAHandler) as httpd:
        print("🎬 Netflix Real Estate CRM Server Started!")
        print(f"🌐 Serving at: http://localhost:{PORT}")
        print("📱 Demo Login: rodrigo@realtor.com / admin123")
        print("🎯 Features:")
        print("   ✅ Netflix-style dark UI with client tiles")
        print("   ✅ Comprehensive client profiles with full history")
        print("   ✅ Transaction tracking with commissions")
        print("   ✅ Birthday and anniversary reminders")
        print("   ✅ Email integration and call logging")
        print("   ✅ Advanced search and filtering")
        print("\n💡 Press Ctrl+C to stop the server")
        httpd.serve_forever()

except OSError as e:
    if e.errno == 98:  # Address already in use
        print(f"❌ Port {PORT} is already in use. Trying to find an available port...")
        # Try ports 4445-4450
        for port in range(4445, 4451):
            try:
                with socketserver.TCPServer(("", port), SPAHandler) as httpd:
                    print(f"🎬 Netflix Real Estate CRM Server Started on port {port}!")
                    print(f"🌐 Serving at: http://localhost:{port}")
                    httpd.serve_forever()
                    break
            except OSError:
                continue
        else:
            print("❌ No available ports found. Please stop other services or use a different port.")
            sys.exit(1)
    else:
        print(f"❌ Server error: {e}")
        sys.exit(1)
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    sys.exit(1)