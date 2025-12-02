#!/usr/bin/env python3
"""
Test Client for IoT-23 ML API
Test the cloud-hosted API before deploying to ESP32
"""

import requests
import json
import time
from datetime import datetime

class APITester:
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'IoT23-API-Tester/1.0'
        })
    
    def test_health_check(self):
        """Test the health check endpoint"""
        print("🏥 Testing health check...")
        
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Health check passed")
                print(f"   Status: {data.get('status')}")
                print(f"   Models loaded: {data.get('models_loaded')}")
                print(f"   Available models: {data.get('available_models')}")
                return True
            else:
                print(f"❌ Health check failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Health check error: {e}")
            return False
    
    def test_model_info(self):
        """Test the model info endpoint"""
        print("\n📊 Testing model info...")
        
        try:
            response = self.session.get(f"{self.base_url}/models", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Model info retrieved")
                print(f"   Models: {data.get('models')}")
                print(f"   Model count: {data.get('model_count')}")
                print(f"   Scaler available: {data.get('scaler_available')}")
                return True
            else:
                print(f"❌ Model info failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Model info error: {e}")
            return False
    
    def test_prediction(self, test_data, test_name):
        """Test a prediction with given data"""
        print(f"\n🔍 Testing prediction: {test_name}")
        
        try:
            response = self.session.post(
                f"{self.base_url}/predict",
                json=test_data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Prediction successful")
                
                # Display consensus results
                if 'consensus' in result:
                    consensus = result['consensus']
                    print(f"   Malicious: {consensus.get('is_malicious')}")
                    print(f"   Threat Level: {consensus.get('threat_level')}")
                    print(f"   Confidence: {consensus.get('consensus_score', 0):.3f}")
                    print(f"   Recommendation: {consensus.get('recommendation')}")
                
                # Display individual model results
                if 'predictions' in result:
                    predictions = result['predictions']
                    
                    if 'binary' in predictions:
                        binary = predictions['binary']
                        print(f"   Binary RF: {'Malicious' if binary['is_malicious'] else 'Benign'} ({binary['confidence']:.3f})")
                    
                    if 'multiclass' in predictions:
                        multi = predictions['multiclass']
                        print(f"   Attack Type: {multi['predicted_attack']} ({multi['confidence']:.3f})")
                
                return True
            else:
                print(f"❌ Prediction failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Prediction error: {e}")
            return False
    
    def test_simple_prediction(self, test_data, test_name):
        """Test the simplified prediction endpoint"""
        print(f"\n🎯 Testing simple prediction: {test_name}")
        
        try:
            response = self.session.post(
                f"{self.base_url}/predict/simple",
                json=test_data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Simple prediction successful")
                print(f"   Malicious: {result.get('is_malicious')}")
                print(f"   Threat Level: {result.get('threat_level')}")
                print(f"   Confidence: {result.get('confidence', 0):.3f}")
                print(f"   Recommendation: {result.get('recommendation')}")
                return True
            else:
                print(f"❌ Simple prediction failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Simple prediction error: {e}")
            return False
    
    def run_comprehensive_test(self):
        """Run comprehensive API tests"""
        print("🚀 Starting comprehensive API test")
        print("=" * 50)
        
        # Test cases
        test_cases = [
            {
                'name': 'Normal Web Traffic',
                'data': {
                    'id_orig_p': 443,
                    'id_resp_p': 80,
                    'duration': 0.5,
                    'orig_bytes': 1500,
                    'resp_bytes': 8000,
                    'missed_bytes': 0,
                    'orig_pkts': 10,
                    'orig_ip_bytes': 1500,
                    'resp_pkts': 15,
                    'resp_ip_bytes': 8000
                }
            },
            {
                'name': 'Suspicious Port Scan',
                'data': {
                    'id_orig_p': 17576,
                    'id_resp_p': 8081,
                    'duration': 0.000002,
                    'orig_bytes': 0,
                    'resp_bytes': 0,
                    'missed_bytes': 0,
                    'orig_pkts': 2,
                    'orig_ip_bytes': 80,
                    'resp_pkts': 0,
                    'resp_ip_bytes': 0
                }
            },
            {
                'name': 'Potential DDoS Attack',
                'data': {
                    'id_orig_p': 12345,
                    'id_resp_p': 80,
                    'duration': 0.001,
                    'orig_bytes': 50,
                    'resp_bytes': 0,
                    'missed_bytes': 0,
                    'orig_pkts': 1,
                    'orig_ip_bytes': 50,
                    'resp_pkts': 0,
                    'resp_ip_bytes': 0
                }
            },
            {
                'name': 'IoT Device Communication',
                'data': {
                    'id_orig_p': 1883,  # MQTT port
                    'id_resp_p': 1883,
                    'duration': 0.1,
                    'orig_bytes': 100,
                    'resp_bytes': 50,
                    'missed_bytes': 0,
                    'orig_pkts': 3,
                    'orig_ip_bytes': 100,
                    'resp_pkts': 2,
                    'resp_ip_bytes': 50
                }
            }
        ]
        
        results = {
            'health_check': False,
            'model_info': False,
            'predictions': [],
            'simple_predictions': []
        }
        
        # Test health check
        results['health_check'] = self.test_health_check()
        
        # Test model info
        results['model_info'] = self.test_model_info()
        
        # Test predictions
        for test_case in test_cases:
            # Full prediction
            success = self.test_prediction(test_case['data'], test_case['name'])
            results['predictions'].append({
                'name': test_case['name'],
                'success': success
            })
            
            # Simple prediction
            success = self.test_simple_prediction(test_case['data'], test_case['name'])
            results['simple_predictions'].append({
                'name': test_case['name'],
                'success': success
            })
            
            time.sleep(1)  # Small delay between tests
        
        # Summary
        print("\n" + "=" * 50)
        print("📋 TEST SUMMARY")
        print("=" * 50)
        
        print(f"Health Check: {'✅ PASS' if results['health_check'] else '❌ FAIL'}")
        print(f"Model Info: {'✅ PASS' if results['model_info'] else '❌ FAIL'}")
        
        pred_success = sum(1 for p in results['predictions'] if p['success'])
        print(f"Full Predictions: {pred_success}/{len(results['predictions'])} passed")
        
        simple_success = sum(1 for p in results['simple_predictions'] if p['success'])
        print(f"Simple Predictions: {simple_success}/{len(results['simple_predictions'])} passed")
        
        total_tests = 2 + len(results['predictions']) + len(results['simple_predictions'])
        passed_tests = (
            (1 if results['health_check'] else 0) +
            (1 if results['model_info'] else 0) +
            pred_success + simple_success
        )
        
        print(f"\nOverall: {passed_tests}/{total_tests} tests passed ({passed_tests/total_tests*100:.1f}%)")
        
        if passed_tests == total_tests:
            print("🎉 All tests passed! API is ready for ESP32 deployment.")
        else:
            print("⚠️  Some tests failed. Please check the API configuration.")
        
        return passed_tests == total_tests
    
    def benchmark_performance(self, num_requests=10):
        """Benchmark API performance"""
        print(f"\n⚡ Running performance benchmark ({num_requests} requests)...")
        
        test_data = {
            'id_orig_p': 443,
            'id_resp_p': 80,
            'duration': 0.5,
            'orig_bytes': 1500,
            'resp_bytes': 8000,
            'missed_bytes': 0,
            'orig_pkts': 10,
            'orig_ip_bytes': 1500,
            'resp_pkts': 15,
            'resp_ip_bytes': 8000
        }
        
        response_times = []
        successful_requests = 0
        
        for i in range(num_requests):
            start_time = time.time()
            
            try:
                response = self.session.post(
                    f"{self.base_url}/predict/simple",
                    json=test_data,
                    timeout=30
                )
                
                end_time = time.time()
                response_time = end_time - start_time
                
                if response.status_code == 200:
                    response_times.append(response_time)
                    successful_requests += 1
                    print(f"  Request {i+1}: {response_time:.3f}s")
                else:
                    print(f"  Request {i+1}: Failed ({response.status_code})")
                    
            except Exception as e:
                print(f"  Request {i+1}: Error ({e})")
            
            time.sleep(0.1)  # Small delay between requests
        
        if response_times:
            avg_time = sum(response_times) / len(response_times)
            min_time = min(response_times)
            max_time = max(response_times)
            
            print(f"\n📊 Performance Results:")
            print(f"   Successful requests: {successful_requests}/{num_requests}")
            print(f"   Average response time: {avg_time:.3f}s")
            print(f"   Min response time: {min_time:.3f}s")
            print(f"   Max response time: {max_time:.3f}s")
            print(f"   Requests per second: {1/avg_time:.1f}")
        else:
            print("❌ No successful requests for benchmarking")

def main():
    """Main test function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Test IoT-23 ML API')
    parser.add_argument('--url', default='http://localhost:5000', 
                       help='API base URL (default: http://localhost:5000)')
    parser.add_argument('--benchmark', action='store_true',
                       help='Run performance benchmark')
    parser.add_argument('--requests', type=int, default=10,
                       help='Number of requests for benchmark (default: 10)')
    
    args = parser.parse_args()
    
    print("🔒 IoT-23 ML API Tester")
    print(f"🌐 Testing API at: {args.url}")
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    tester = APITester(args.url)
    
    # Run comprehensive tests
    success = tester.run_comprehensive_test()
    
    # Run benchmark if requested
    if args.benchmark:
        tester.benchmark_performance(args.requests)
    
    print(f"\n⏰ Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    if success:
        print("\n🎉 API is ready for production deployment!")
        print("\n📱 ESP32 Configuration:")
        print(f'const char* api_server = "{args.url}";')
        print('const char* api_endpoint = "/predict/simple";')
    else:
        print("\n⚠️  Please fix API issues before deployment.")

if __name__ == "__main__":
    main()