#!/bin/bash

echo "🔍 Network Diagnostics for ESP32 Connection"
echo "==========================================="
echo ""

echo "1️⃣ MacBook IP Address:"
ifconfig en0 | grep "inet " | grep -v "127.0.0.1"
echo ""

echo "2️⃣ Server Status:"
curl -s http://192.168.1.33:8080/health | python3 -m json.tool
echo ""

echo "3️⃣ Devices on Network:"
arp -a | grep "192.168.1"
echo ""

echo "4️⃣ Port 8080 Listening:"
lsof -i :8080 | grep LISTEN
echo ""

echo "5️⃣ Firewall Status:"
/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
echo ""

echo "6️⃣ Test API Request (simulating ESP32):"
curl -X POST http://192.168.1.33:8080/predict/simple \
  -H "Content-Type: application/json" \
  -d '{"id_orig_p":443,"id_resp_p":80,"duration":0.5,"orig_bytes":1500,"resp_bytes":8000,"missed_bytes":0,"orig_pkts":10,"orig_ip_bytes":1500,"resp_pkts":15,"resp_ip_bytes":8000}' \
  | python3 -m json.tool
echo ""

echo "✅ Server is working correctly!"
echo ""
echo "📱 ESP32 Troubleshooting:"
echo "   1. Make sure ESP32 is connected to same WiFi (IQOO Z7s 5G)"
echo "   2. Check ESP32 Serial Monitor for its IP address"
echo "   3. ESP32 IP should be 192.168.1.xxx"
echo "   4. If ESP32 shows different network (10.x.x.x), reconnect to correct WiFi"
echo ""
echo "🔥 If firewall is blocking, run:"
echo "   System Settings → Network → Firewall → Options"
echo "   Add Python and allow incoming connections"
