#!/usr/bin/env python3
import http.server
import socketserver
import os
from urllib.parse import urlparse

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# Rewrites from vercel.json
REWRITES = {
    '/survey': '/pages/survey.html',
    '/survey.html': '/pages/survey.html',
    '/dashboard': '/pages/dashboard.html',
    '/dashboard.html': '/pages/dashboard.html',
    '/comparison': '/pages/comparison.html',
    '/comparison.html': '/pages/comparison.html',
    '/suggestions': '/pages/suggestions.html',
    '/suggestions.html': '/pages/suggestions.html',
    '/impact': '/pages/impact.html',
    '/impact.html': '/pages/impact.html',
}

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Remove query string
        if '?' in path:
            path = path.split('?')[0]
        
        # Check for rewrites
        if path in REWRITES:
            path = REWRITES[path]
        
        # Handle root
        if path == '' or path == '/':
            path = '/index.html'
        
        # Build file path
        file_path = os.path.join(DIRECTORY, path.lstrip('/'))
        
        # Security: prevent directory traversal
        try:
            if os.path.commonpath([DIRECTORY, os.path.abspath(file_path)]) != DIRECTORY:
                self.send_error(403, "Forbidden")
                return
        except ValueError:
            self.send_error(403, "Forbidden")
            return
        
        # If it's a directory, serve index.html
        if os.path.isdir(file_path):
            file_path = os.path.join(file_path, 'index.html')
        
        # If file doesn't exist, return 404 with helpful message
        if not os.path.exists(file_path):
            self.send_error(404, f"File not found: {path}")
            return
        
        self.path = '/' + os.path.relpath(file_path, DIRECTORY).replace('\\', '/')
        return http.server.SimpleHTTPRequestHandler.do_GET(self)
    
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        return super().end_headers()

if __name__ == "__main__":
    os.chdir(DIRECTORY)
    handler = MyHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"✓ Server running at http://localhost:{PORT}")
        print(f"✓ Serving from: {DIRECTORY}")
        print(f"✓ Rewrites enabled (from vercel.json)")
        print(f"✓ Press Ctrl+C to stop")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n✓ Server stopped")
