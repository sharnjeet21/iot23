#!/bin/bash

echo "🧪 Testing ESP32 API Connection"
echo "================================"
echo ""

# Test the exact request ESP32 is sending
echo "📤 Simulating ESP32 request..."
echo ""

curl -X POST http://192.0.0.2:8080/predict/simple \
  -H "Content-Type: application/json" \
  -d '{"id_orig_p":3291,"id_resp_p":420,"duration":0.69,"orig_bytes":996,"resp_bytes":160,"missed_bytes":0,"orig_pkts":9,"orig_ip_bytes":996,"resp_pkts":5,"resp_ip_bytes":160}'

echo ""
echo ""
echo "✅ If you see a JSON response above, the server is working!"
echo "❌ If ESP32 still can't connect, it's a network isolation issue."
