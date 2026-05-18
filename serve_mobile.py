#!/usr/bin/env python3
"""Serves the mobile traffic sender page"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

class CORSHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()
    def log_message(self, format, *args):
        print(f"📱 Mobile access: {format % args}")

if __name__ == '__main__':
    server_ip = os.environ.get('MAC_IP', '192.168.1.38')
    server = HTTPServer(('0.0.0.0', 8090), CORSHandler)
    print("📱 Mobile Traffic Sender Page")
    print("=" * 40)
    print(f"Open on your phone: http://{server_ip}:8090/mobile_traffic_sender.html")
    print()
    server.serve_forever()
