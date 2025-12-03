#!/usr/bin/env python3

import subprocess
import time
import requests
import json

def get_local_ip():
    try:
        result = subprocess.run(['ipconfig', 'getifaddr', 'en0'], 
                              capture_output=True, text=True)
        return result.stdout.strip()
    except:
        return None

def test_local_api(ip_address):
    base_url = f"http://{ip_address}:8080"
    
    print(f"🧪 Testing local API at {base_url}")
    
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check passed")
            
            test_data = {
                "id_orig_p": 443,
                "id_resp_p": 80,
                "duration": 0.5,
                "orig_bytes": 1500,
                "resp_bytes": 8000,
                "orig_pkts": 10,
                "resp_pkts": 15
            }
            
            response = requests.post(f"{base_url}/predict/simple", 
                                   json=test_data, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Prediction test passed")
                print(f"   Result: {'Malicious' if result.get('is_malicious') else 'Benign'}")
                print(f"   Confidence: {result.get('confidence', 0):.3f}")
                return True
            else:
                print(f"❌ Prediction test failed: {response.status_code}")
                return False
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API server")
        print("   Make sure the server is running with: python3 cloud_api_server.py")
        return False
    except Exception as e:
        print(f"❌ Test error: {e}")
        return False

def main():
    print("🍎 MacBook Local Server Test")
    print("===========================")
    
    ip_address = get_local_ip()
    
    if not ip_address:
        print("❌ Could not get MacBook IP address")
        print("   Make sure you're connected to WiFi")
        return
    
    print(f"📍 MacBook IP: {ip_address}")
    print(f"🔗 API URL: http://{ip_address}:8080")
    
    print("\n📱 ESP32 Configuration:")
    print(f'const char* api_server = "http://{ip_address}:8080";')
    
    print(f"\n🧪 Testing API connection...")
    
    if test_local_api(ip_address):
        print("\n🎉 Local setup is working perfectly!")
        print("\n📋 Next steps:")
        print("1. Update ESP32 code with the IP address above")
        print("2. Upload code to ESP32")
        print("3. Monitor serial output for threat detection")
    else:
        print("\n⚠️  Local setup needs attention")
        print("\n🔧 Troubleshooting:")
        print("1. Start server: python3 cloud_api_server.py")
        print("2. Check model files: ls *.pkl")
        print("3. Verify network: ping", ip_address)

if __name__ == "__main__":
    main()