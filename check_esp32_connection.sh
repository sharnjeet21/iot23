#!/bin/bash

echo "🔍 ESP32 Connection Diagnostics"
echo "================================"
echo ""

echo "📍 MacBook Server:"
echo "   IP: 192.168.1.33"
echo "   Port: 8080"
echo "   Status: $(curl -s http://192.168.1.33:8080/health | grep -o '"status":"[^"]*"' | cut -d'"' -f4)"
echo ""

echo "🌐 Network Scan (looking for ESP32):"
echo "   Scanning 192.168.1.0/24 network..."
echo ""

# Scan for devices on network
for i in {1..254}; do
    (ping -c 1 -W 1 192.168.1.$i > /dev/null 2>&1 && echo "   ✓ 192.168.1.$i is alive") &
done
wait

echo ""
echo "📱 Known devices on network:"
arp -a | grep "192.168.1" | grep -v "incomplete"
echo ""

echo "🔥 Firewall: $(if [ $(/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate | grep -c 'disabled') -eq 1 ]; then echo 'OFF ✅'; else echo 'ON ⚠️'; fi)"
echo ""

echo "💡 ESP32 Troubleshooting:"
echo "   1. Check Serial Monitor - what IP does ESP32 show?"
echo "   2. ESP32 should show: 192.168.1.xxx"
echo "   3. If different, ESP32 is on wrong WiFi network"
echo "   4. Update WiFi credentials in code and re-upload"
