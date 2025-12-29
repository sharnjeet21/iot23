# CyberShield - ESP32 Security Platform

A professional-grade IoT security monitoring platform featuring real-time malware detection, machine learning analysis, and an enterprise-class web dashboard.

## 🛡️ Quick Start

### 1. Launch CyberShield Platform
```bash
./start_dashboard.sh
```

### 2. Access the Dashboard
Open your browser and navigate to:
- **Local Access**: http://localhost:5001
- **Network Access**: http://192.168.1.37:5001

### 3. Deploy ESP32 Security Client
Upload `esp32_malware_client.ino` to your ESP32 using Arduino IDE.

## 🎯 Professional Dashboard Features

### Real-Time Security Monitoring
- **Live threat detection with professional visualizations**
- **Advanced analytics with gradient charts and smooth animations**
- **Enterprise-grade color palette and typography**
- **Responsive design optimized for all screen sizes**

### Security Analytics
- **Threat timeline with professional Chart.js integration**
- **Traffic pattern analysis with interactive doughnut charts**
- **Real-time statistics with animated counters**
- **Professional status indicators and badges**

### Modern UI/UX Design
- **Glass morphism effects with backdrop blur**
- **Professional gradient color schemes**
- **Smooth hover animations and transitions**
- **Custom scrollbars and loading indicators**
- **Inter font family for professional typography**

## 🏗️ System Architecture

### ML Security Engine (Port 8080)
- **Multi-model threat detection (Binary RF, Isolation Forest, Multiclass)**
- **RESTful API with comprehensive error handling**
- **Real-time processing with sub-second response times**

### CyberShield Dashboard (Port 5001)
- **Professional Flask + SocketIO real-time interface**
- **SQLite database with automated logging**
- **Intelligent simulation mode for demonstration**
- **WebSocket-based live updates**

### ESP32 Security Client
- **Automated network traffic pattern generation**
- **30-second security scan intervals**
- **Multi-LED threat indication system**
- **Comprehensive serial debugging output**

## 🎨 Professional Color Palette

- **Primary Background**: Deep Space Blue (#0f0f23)
- **Secondary Background**: Midnight Navy (#1a1a2e)
- **Card Background**: Professional Blue (#16213e)
- **Accent Colors**: Gradient combinations for visual hierarchy
- **Success**: Emerald Green (#00d4aa)
- **Danger**: Coral Red (#ff4757)
- **Warning**: Amber Orange (#ffa502)
- **Info**: Electric Blue (#3742fa)

## 🌐 Network Configuration

**Current Network Settings** (update if WiFi changes):
- **Server IP**: 192.168.1.37
- **WiFi Network**: BSNL_4G
- **Security API Port**: 8080
- **Dashboard Port**: 5001

## 💡 LED Security Indicators (ESP32)

- **🟢 Green LED (D2)**: Safe traffic patterns detected
- **🔴 Red LED (D4)**: Malicious activity identified
- **🔵 Blue LED (D5)**: System status and connectivity

## 🔧 Professional Troubleshooting

### ESP32 Connectivity Issues
1. **Verify WiFi credentials** in ESP32 firmware
2. **Confirm IP addresses** match your network configuration
3. **Check firewall settings** for port 8080 access
4. **Monitor ESP32 serial output** for detailed diagnostics

### Dashboard Access Problems
1. **Ensure both services are running** via startup script
2. **Verify port availability** (5001/8080 not in use)
3. **Try localhost access** if network access fails
4. **Check browser console** for WebSocket connection errors

### Data Visualization Issues
- **Dashboard displays intelligent simulation** when ESP32 disconnected
- **Real ESP32 data automatically replaces** simulated content
- **Charts update with smooth animations** for professional appearance
- **WebSocket status indicators** show connection health

## 📁 Professional File Structure

```
CyberShield/
├── esp32_malware_client.ino     # ESP32 security firmware
├── cloud_api_server.py          # ML security engine
├── dashboard_server.py          # Professional dashboard server
├── templates/dashboard.html     # Enterprise-grade UI
├── start_dashboard.sh           # Platform launcher
├── *.pkl                        # Pre-trained ML models
└── README.md                    # This documentation
```

## 🚀 Professional Usage Workflow

1. **Launch Platform**: Execute `./start_dashboard.sh`
2. **Access Dashboard**: Open browser to dashboard URL
3. **Deploy ESP32**: Upload firmware and monitor connection
4. **Monitor Security**: Watch real-time threat detection
5. **Analyze Patterns**: Review charts and statistics
6. **Export Data**: Use professional reporting features

## 🎯 Enterprise Features

- **Professional gradient-based design system**
- **Smooth animations and micro-interactions**
- **Responsive layout for desktop and mobile**
- **Real-time WebSocket communication**
- **Intelligent data simulation for demonstrations**
- **Professional typography and spacing**
- **Glass morphism and backdrop blur effects**
- **Custom scrollbars and loading states**

The CyberShield platform delivers enterprise-grade security monitoring with a professional interface that rivals commercial security solutions.