# 💻 MacBook Local Server Setup Guide

## 🎯 **Use Your MacBook as IoT-23 ML Server**

Perfect for development, testing, and local network IoT protection!

---

## 🚀 **Quick Local Setup (5 minutes)**

### **Step 1: Start Local API Server**

```bash
# Navigate to your project directory
cd /path/to/your/iot23-project

# Start the Flask API server
python3 cloud_api_server.py
```

**Expected Output:**
```
🚀 IoT-23 Malware Detection API Server Starting...
📊 Loaded 5 models
🔗 API Endpoints:
   • POST /predict - Full prediction with detailed results
   • POST /predict/simple - Simplified prediction for ESP32
   • GET /health - Health check
   • GET /models - Model information
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://192.168.1.XXX:5000
```

### **Step 2: Find Your MacBook's IP Address**

```bash
# Get your local IP address
ifconfig | grep "inet " | grep -v 127.0.0.1

# Or use this simpler command
ipconfig getifaddr en0
```

**Example Output:** `192.168.1.105`

### **Step 3: Test Your Local API**

```bash
# Test health endpoint
curl http://192.168.1.105:5000/health

# Test prediction endpoint
curl -X POST http://192.168.1.105:5000/predict/simple \
  -H "Content-Type: application/json" \
  -d '{"id_orig_p": 443, "id_resp_p": 80, "duration": 0.5, "orig_bytes": 1500}'
```

---

## 📱 **Configure ESP32 for Local Server**

### **Update ESP32 Code:**

Open `esp32_malware_client.ino` and update:

```cpp
// WiFi Configuration
const char* ssid = "YOUR_WIFI_NETWORK";
const char* password = "YOUR_WIFI_PASSWORD";

// Local MacBook API Configuration
const char* api_server = "http://192.168.1.105:5000";  // Your MacBook IP
const char* api_endpoint = "/predict/simple";
const int api_timeout = 10000;
```

**Important:** Replace `192.168.1.105` with your actual MacBook IP address!

---

## 🔧 **Advanced Local Setup Options**

### **Option 1: Run with Auto-Restart**

```bash
# Install watchdog for auto-restart on file changes
pip3 install watchdog

# Run with auto-restart
python3 -c "
import time
import subprocess
import sys
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class RestartHandler(FileSystemEventHandler):
    def __init__(self):
        self.process = None
        self.start_server()
    
    def start_server(self):
        if self.process:
            self.process.terminate()
        print('🔄 Starting server...')
        self.process = subprocess.Popen([sys.executable, 'cloud_api_server.py'])
    
    def on_modified(self, event):
        if event.src_path.endswith('.py'):
            print(f'📝 File changed: {event.src_path}')
            self.start_server()

handler = RestartHandler()
observer = Observer()
observer.schedule(handler, '.', recursive=False)
observer.start()

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    observer.stop()
    if handler.process:
        handler.process.terminate()
observer.join()
"
```

### **Option 2: Run as Background Service**

```bash
# Start server in background
nohup python3 cloud_api_server.py > api_server.log 2>&1 &

# Check if running
ps aux | grep cloud_api_server

# View logs
tail -f api_server.log

# Stop server
pkill -f cloud_api_server.py
```

### **Option 3: Use Screen for Persistent Session**

```bash
# Install screen if not available
brew install screen

# Start screen session
screen -S iot23-api

# Run server in screen
python3 cloud_api_server.py

# Detach from screen (Ctrl+A, then D)
# Reattach later with: screen -r iot23-api
```

---

## 🌐 **Network Configuration**

### **Make MacBook Accessible on Local Network:**

1. **Check Firewall Settings:**
```bash
# Check firewall status
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Allow Python through firewall (if needed)
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/bin/python3
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblock /usr/bin/python3
```

2. **Ensure WiFi Network Access:**
- Make sure your MacBook and ESP32 are on the same WiFi network
- Most home routers allow device-to-device communication by default

### **Find All Network Interfaces:**

```bash
# List all network interfaces
networksetup -listallhardwareports

# Get IP for specific interface
ipconfig getifaddr en0    # Usually WiFi
ipconfig getifaddr en1    # Usually Ethernet
```

---

## 🧪 **Testing Your Local Setup**

### **Test 1: API Health Check**

```bash
# Test from MacBook
curl http://localhost:5000/health

# Test from network (replace with your IP)
curl http://192.168.1.105:5000/health
```

### **Test 2: Prediction Endpoint**

```bash
# Normal traffic test
curl -X POST http://192.168.1.105:5000/predict/simple \
  -H "Content-Type: application/json" \
  -d '{
    "id_orig_p": 443,
    "id_resp_p": 80,
    "duration": 0.5,
    "orig_bytes": 1500,
    "resp_bytes": 8000,
    "orig_pkts": 10,
    "resp_pkts": 15
  }'

# Malicious traffic test
curl -X POST http://192.168.1.105:5000/predict/simple \
  -H "Content-Type: application/json" \
  -d '{
    "id_orig_p": 17576,
    "id_resp_p": 8081,
    "duration": 0.000002,
    "orig_bytes": 0,
    "resp_bytes": 0,
    "orig_pkts": 2,
    "resp_pkts": 0
  }'
```

### **Test 3: Comprehensive API Test**

```bash
# Run full test suite against local server
python3 test_api_client.py --url http://192.168.1.105:5000
```

---

## 📊 **Monitor Your Local Server**

### **Real-time Monitoring:**

```bash
# Monitor API requests in real-time
tail -f api_server.log | grep "Prediction request"

# Monitor system resources
top -pid $(pgrep -f cloud_api_server.py)

# Check network connections
lsof -i :5000
```

### **Performance Monitoring:**

```bash
# Check memory usage
ps -o pid,ppid,rss,vsz,comm -p $(pgrep -f cloud_api_server.py)

# Monitor network traffic
nettop -p $(pgrep -f cloud_api_server.py)
```

---

## 🔒 **Security for Local Development**

### **Basic Security Measures:**

1. **Firewall Configuration:**
```bash
# Only allow local network access
sudo pfctl -f /etc/pf.conf
```

2. **Network Binding:**
```python
# In cloud_api_server.py, you can restrict to local network only
app.run(
    host='192.168.1.105',  # Your specific IP instead of 0.0.0.0
    port=5000,
    debug=False
)
```

3. **Simple Authentication (Optional):**
```python
# Add to cloud_api_server.py for basic protection
@app.before_request
def require_local_network():
    client_ip = request.remote_addr
    if not client_ip.startswith('192.168.1.'):
        return jsonify({'error': 'Access denied'}), 403
```

---

## 🚨 **Troubleshooting Local Setup**

### **Common Issues:**

**Issue 1: "Connection Refused"**
```bash
# Check if server is running
ps aux | grep cloud_api_server

# Check if port is in use
lsof -i :5000

# Restart server
pkill -f cloud_api_server.py
python3 cloud_api_server.py
```

**Issue 2: "Can't reach from ESP32"**
```bash
# Verify IP address
ipconfig getifaddr en0

# Test from another device on network
ping 192.168.1.105

# Check firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
```

**Issue 3: "Models not loading"**
```bash
# Check model files exist
ls -la *.pkl

# Check file permissions
chmod 644 *.pkl

# Verify Python can load models
python3 -c "import joblib; print(joblib.load('advanced_iot23_binary_rf.pkl'))"
```

---

## 🎯 **Local Development Workflow**

### **Daily Development Routine:**

1. **Start Server:**
```bash
python3 cloud_api_server.py
```

2. **Get IP Address:**
```bash
ipconfig getifaddr en0
```

3. **Update ESP32 if IP changed:**
```cpp
const char* api_server = "http://NEW_IP_ADDRESS:5000";
```

4. **Test Everything:**
```bash
python3 test_api_client.py --url http://YOUR_IP:5000
```

5. **Monitor Logs:**
```bash
tail -f api_server.log
```

---

## 🌟 **Benefits of Local MacBook Server**

### **Advantages:**
- ✅ **No cloud costs** - completely free
- ✅ **Fast development** - instant changes
- ✅ **Full control** - complete access to logs and debugging
- ✅ **Privacy** - all data stays local
- ✅ **Offline capable** - works without internet
- ✅ **Easy debugging** - direct access to server code

### **Perfect For:**
- Development and testing
- Home IoT network protection
- Learning and experimentation
- Proof of concept demonstrations
- Local network security monitoring

---

## 🚀 **Ready to Start!**

Your MacBook is now ready to serve as your IoT-23 malware detection server:

1. **Start the server:** `python3 cloud_api_server.py`
2. **Get your IP:** `ipconfig getifaddr en0`
3. **Update ESP32 code** with your MacBook's IP
4. **Upload to ESP32** and start detecting threats!

**Your MacBook is now protecting your IoT devices with AI-powered malware detection!** 🔒🤖

---

*Local server setup complete - no cloud required!* ✨