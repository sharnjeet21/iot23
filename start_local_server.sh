#!/bin/bash

echo "🍎 Starting IoT-23 ML Server on MacBook"
echo "======================================"

echo "📍 Getting MacBook IP address..."
IP_ADDRESS=$(ipconfig getifaddr en0)

if [ -z "$IP_ADDRESS" ]; then
    echo "❌ Could not get IP address. Make sure you're connected to WiFi."
    exit 1
fi

echo "✅ MacBook IP Address: $IP_ADDRESS"
echo "🔗 API will be available at: http://$IP_ADDRESS:8080"

echo ""
echo "📋 ESP32 Configuration:"
echo "const char* api_server = \"http://$IP_ADDRESS:8080\";"
echo ""

echo "🔍 Checking model files..."
if [ ! -f "advanced_iot23_binary_rf.pkl" ]; then
    echo "❌ Model files not found! Please ensure .pkl files are in this directory."
    exit 1
fi

echo "✅ Model files found"

echo ""
echo "🚀 Starting Flask API server..."
echo "Press Ctrl+C to stop the server"
echo ""

python3 cloud_api_server.py