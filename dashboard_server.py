#!/usr/bin/env python3
"""
CyberShield Backend Server for React Dashboard
Handles WebSocket connections and serves the React app
"""

from flask import Flask, send_from_directory, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import requests
import json
import threading
import time
from datetime import datetime
import sqlite3
import os

app = Flask(__name__, static_folder='dist', static_url_path='')
app.config['SECRET_KEY'] = 'cybershield_2024'
CORS(app, origins=["http://localhost:5001", "http://10.128.138.251:5001"])
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:5001", "http://10.128.138.251:5001"])

# Configuration
API_SERVER_URL = "http://10.128.138.251:8080"
BACKEND_PORT = 5002

# Global data storage
dashboard_data = {
    'threats': [],
    'system_status': {
        'api_server_online': False,
        'esp32_connected': False,
        'total_checks': 0,
        'threats_detected': 0,
        'threat_rate': 0.0,
        'last_update': None
    },
    'traffic_stats': {}
}

def init_dashboard_db():
    """Initialize dashboard database"""
    conn = sqlite3.connect('dashboard.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS dashboard_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            source_ip TEXT,
            ports TEXT,
            is_malicious BOOLEAN,
            confidence REAL,
            threat_level TEXT,
            traffic_type TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

def check_api_server():
    """Check if API server is online"""
    try:
        response = requests.get(f"{API_SERVER_URL}/health", timeout=5)
        return response.status_code == 200
    except:
        return False

def simulate_realtime_data():
    """Simulation completely removed - only real ESP32 data"""
    pass  # No simulation - ESP32 only

@app.route('/')
def serve_react_app():
    """Serve the React app"""
    if os.path.exists('dist/index.html'):
        return send_from_directory('dist', 'index.html')
    else:
        return jsonify({
            'message': 'CyberShield Backend Running',
            'status': 'React app not built yet',
            'instruction': 'Run "npm run build" to build the React app'
        })

@app.route('/<path:path>')
def serve_static_files(path):
    """Serve static files from React build"""
    if os.path.exists(f'dist/{path}'):
        return send_from_directory('dist', path)
    else:
        return send_from_directory('dist', 'index.html')

def check_esp32_connection():
    """Check if ESP32 is still connected based on last update time"""
    if dashboard_data['system_status']['last_update']:
        try:
            last_update = datetime.fromisoformat(dashboard_data['system_status']['last_update'])
            time_diff = (datetime.now() - last_update).total_seconds()
            
            # Consider ESP32 disconnected if no data for more than 60 seconds
            if time_diff > 60:
                dashboard_data['system_status']['esp32_connected'] = False
                socketio.emit('status_update', dashboard_data['system_status'])
        except:
            pass

def periodic_status_check():
    """Periodically check system status"""
    while True:
        time.sleep(30)  # Check every 30 seconds
        check_esp32_connection()

@app.route('/api/esp32_data', methods=['POST'])
def receive_esp32_data():
    """Receive real data from ESP32 via ML API"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Mark ESP32 as connected
        dashboard_data['system_status']['esp32_connected'] = True
        dashboard_data['system_status']['last_update'] = datetime.now().isoformat()
        
        # Process real ESP32 data
        detection = {
            'timestamp': datetime.now().isoformat(),
            'source_ip': 'ESP32_Real_Device',
            'traffic_type': data.get('traffic_type', 'ESP32 Detection'),
            'ports': data.get('ports', 'N/A'),
            'is_malicious': data.get('is_malicious', False),
            'confidence': data.get('confidence', 0.0),
            'threat_level': data.get('threat_level', 'LOW'),
            'recommendation': data.get('recommendation', 'MONITOR'),
            'id_orig_p': data.get('id_orig_p', 0),
            'id_resp_p': data.get('id_resp_p', 0)
        }
        
        # Update statistics
        dashboard_data['system_status']['total_checks'] += 1
        if detection['is_malicious']:
            dashboard_data['system_status']['threats_detected'] += 1
        
        # Calculate threat rate
        total_checks = dashboard_data['system_status']['total_checks']
        threats_detected = dashboard_data['system_status']['threats_detected']
        dashboard_data['system_status']['threat_rate'] = round((threats_detected / total_checks * 100), 1) if total_checks > 0 else 0.0
        
        # Add to threats list
        dashboard_data['threats'].append(detection)
        if len(dashboard_data['threats']) > 100:
            dashboard_data['threats'] = dashboard_data['threats'][-100:]
        
        # Broadcast to connected clients
        socketio.emit('new_detection', detection)
        socketio.emit('status_update', dashboard_data['system_status'])
        
        print(f"📡 Real ESP32 Data: {detection['traffic_type']} - {'🚨 THREAT' if detection['is_malicious'] else '✅ SAFE'}")
        print(f"📊 Status Update: Checks={dashboard_data['system_status']['total_checks']}, Threats={dashboard_data['system_status']['threats_detected']}, Rate={dashboard_data['system_status']['threat_rate']}%")
        
        return jsonify({'status': 'success', 'message': 'Data received'})
        
    except Exception as e:
        print(f"Error processing ESP32 data: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/status')
def get_status():
    """Get current system status"""
    return jsonify(dashboard_data['system_status'])

@app.route('/api/debug')
def get_debug_info():
    """Get debug information"""
    return jsonify({
        'dashboard_data': dashboard_data,
        'connected_clients': len(socketio.server.manager.rooms.get('/', {}).get('/', set()))
    })

@app.route('/api/traffic_stats')
def get_traffic_stats():
    """Get traffic statistics"""
    return jsonify(dashboard_data['traffic_stats'])

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print(f"📱 React client connected")
    emit('status_update', dashboard_data['system_status'])
    emit('traffic_stats', dashboard_data['traffic_stats'])
    
    # Send recent threats
    if dashboard_data['threats']:
        for threat in dashboard_data['threats'][-10:]:
            emit('new_detection', threat)

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print(f"📱 React client disconnected")

if __name__ == '__main__':
    print("🛡️  Starting CyberShield Backend Server...")
    print("=" * 50)
    
    # Initialize database
    init_dashboard_db()
    print("✅ Dashboard database initialized")
    
    # Check API server
    if check_api_server():
        print(f"✅ API Server online at {API_SERVER_URL}")
    else:
        print(f"⚠️  API Server offline at {API_SERVER_URL}")
        print("📊 Waiting for ESP32 real data only")
    
    # Start periodic status check thread
    status_thread = threading.Thread(target=periodic_status_check, daemon=True)
    status_thread.start()
    print("🔄 Periodic status monitoring started")
    
    print(f"🌐 Backend server: http://localhost:{BACKEND_PORT}")
    print(f"🌐 Network access: http://10.128.138.251:{BACKEND_PORT}")
    print("📊 WebSocket server ready for React connections")
    print("🎯 Features:")
    print("   • React + Tailwind CSS frontend")
    print("   • Real-time WebSocket updates")
    print("   • Working Chart.js graphs")
    print("   • Professional UI components")
    print("   • ESP32 Real Data Only - No Simulation")
    print()
    
    # Run the backend server
    socketio.run(app, host='0.0.0.0', port=BACKEND_PORT, debug=False, allow_unsafe_werkzeug=True)