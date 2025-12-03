/*
 * ESP32 Local Configuration for MacBook Server
 * Updated with current MacBook IP address
 */

// WiFi Configuration - UPDATE THESE
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MacBook Local Server Configuration
const char* api_server = "http://192.168.1.33:8080";  // Your MacBook IP
const char* api_endpoint = "/predict/simple";
const int api_timeout = 10000;

// LED Pins
const int LED_SAFE = 2;      // Green LED - Safe traffic
const int LED_THREAT = 4;    // Red LED - Threat detected
const int LED_STATUS = 5;    // Blue LED - System status

// Monitoring Configuration
const unsigned long checkInterval = 30000;  // Check every 30 seconds

/*
 * Quick Setup Checklist:
 * 1. ✅ Update WiFi credentials above
 * 2. ✅ MacBook IP configured (192.168.1.33)
 * 3. ⏳ Start MacBook server: ./start_local_server.sh
 * 4. ⏳ Copy this config to esp32_malware_client.ino
 * 5. ⏳ Upload to ESP32 and test
 */