#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys

PORT = 8080

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        sys.stdout.write(f"{self.log_date_time_string()} - {format%args}\n")
        sys.stdout.flush()

    def end_headers(self):
        # Add security headers
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('X-XSS-Protection', '1; mode=block')
        super().end_headers()

if __name__ == "__main__":
    os.chdir('/home/user/webapp')
    
    with socketserver.TCPServer(("0.0.0.0", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🌐 HTTP Server running on port {PORT}")
        print(f"📁 Serving files from: {os.getcwd()}")
        sys.stdout.flush()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")
            sys.stdout.flush()