#!/usr/bin/env python3

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
import logging
import os
from datetime import datetime
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

class IoTMalwareDetector:
    def __init__(self):
        self.models = {}
        self.scaler = None
        self.model_loaded = False
        self.load_models()
    
    def load_models(self):
        try:
            model_files = {
                'binary_rf': 'advanced_iot23_binary_rf.pkl',
                'isolation_forest': 'advanced_iot23_isolation_forest.pkl',
                'multiclass': 'advanced_iot23_multiclass_smote.pkl'
            }
            
            fallback_files = {
                'binary_rf': 'iot23_random_forest_model.pkl',
                'scaler': 'iot23_scaler.pkl'
            }
            
            loaded_count = 0
            
            for model_name, filename in model_files.items():
                if os.path.exists(filename):
                    self.models[model_name] = joblib.load(filename)
                    logger.info(f"✅ Loaded {model_name} from {filename}")
                    loaded_count += 1
            
            scaler_files = ['advanced_iot23_scaler.pkl', 'iot23_scaler.pkl']
            for scaler_file in scaler_files:
                if os.path.exists(scaler_file):
                    self.scaler = joblib.load(scaler_file)
                    logger.info(f"✅ Loaded scaler from {scaler_file}")
                    break
            
            if loaded_count == 0:
                for model_name, filename in fallback_files.items():
                    if os.path.exists(filename):
                        if model_name == 'scaler':
                            self.scaler = joblib.load(filename)
                        else:
                            self.models[model_name] = joblib.load(filename)
                        logger.info(f"✅ Loaded fallback {model_name} from {filename}")
                        loaded_count += 1
            
            if loaded_count > 0:
                self.model_loaded = True
                logger.info(f"🎉 Successfully loaded {loaded_count} models")
            else:
                logger.error("❌ No models found! Please train models first.")
                
        except Exception as e:
            logger.error(f"❌ Error loading models: {e}")
            self.model_loaded = False
    
    def predict_threat(self, network_data):
        if not self.model_loaded:
            return {
                'error': 'Models not loaded',
                'status': 'error'
            }
        
        try:
            features = self._prepare_features(network_data)
            
            results = {
                'timestamp': datetime.now().isoformat(),
                'input_data': network_data,
                'predictions': {},
                'consensus': {},
                'status': 'success'
            }
            
            if 'binary_rf' in self.models:
                binary_pred = self.models['binary_rf'].predict(features)[0]
                binary_prob = self.models['binary_rf'].predict_proba(features)[0]
                
                results['predictions']['binary'] = {
                    'is_malicious': bool(binary_pred),
                    'confidence': float(max(binary_prob)),
                    'malware_probability': float(binary_prob[1] if len(binary_prob) > 1 else binary_prob[0])
                }
            
            if 'isolation_forest' in self.models and self.scaler:
                features_scaled = self.scaler.transform(features)
                iso_pred = self.models['isolation_forest'].predict(features_scaled)[0]
                iso_score = self.models['isolation_forest'].decision_function(features_scaled)[0]
                
                results['predictions']['anomaly'] = {
                    'is_anomaly': iso_pred == -1,
                    'anomaly_score': float(-iso_score),
                    'confidence': float(abs(iso_score))
                }
            
            if 'multiclass' in self.models:
                multi_pred = self.models['multiclass'].predict(features)[0]
                multi_prob = self.models['multiclass'].predict_proba(features)[0]
                classes = self.models['multiclass'].classes_
                
                top_indices = np.argsort(multi_prob)[-3:][::-1]
                top_predictions = [
                    {
                        'attack_type': str(classes[i]),
                        'probability': float(multi_prob[i])
                    }
                    for i in top_indices
                ]
                
                results['predictions']['multiclass'] = {
                    'predicted_attack': str(multi_pred),
                    'confidence': float(max(multi_prob)),
                    'top_predictions': top_predictions,
                    'is_benign': str(multi_pred) == 'Benign'
                }
            
            threat_votes = 0
            total_votes = 0
            
            if 'binary' in results['predictions']:
                if results['predictions']['binary']['is_malicious']:
                    threat_votes += 1
                total_votes += 1
            
            if 'anomaly' in results['predictions']:
                if results['predictions']['anomaly']['is_anomaly']:
                    threat_votes += 1
                total_votes += 1
            
            if 'multiclass' in results['predictions']:
                if not results['predictions']['multiclass']['is_benign']:
                    threat_votes += 1
                total_votes += 1
            
            consensus_score = threat_votes / total_votes if total_votes > 0 else 0
            
            results['consensus'] = {
                'threat_votes': threat_votes,
                'total_votes': total_votes,
                'consensus_score': consensus_score,
                'is_malicious': consensus_score >= 0.5,
                'threat_level': self._get_threat_level(consensus_score),
                'recommendation': self._get_recommendation(consensus_score)
            }
            
            return results
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return {
                'error': str(e),
                'status': 'error',
                'timestamp': datetime.now().isoformat()
            }
    
    def _prepare_features(self, data):
        defaults = {
            'id_orig_p': 0,
            'id_resp_p': 0,
            'duration': 0.0,
            'orig_bytes': 0,
            'resp_bytes': 0,
            'missed_bytes': 0,
            'orig_pkts': 0,
            'orig_ip_bytes': 0,
            'resp_pkts': 0,
            'resp_ip_bytes': 0
        }
        
        for key, value in data.items():
            if key in defaults:
                defaults[key] = float(value)
        
        features = np.array([[
            defaults['id_orig_p'],
            defaults['id_resp_p'],
            defaults['duration'],
            defaults['orig_bytes'],
            defaults['resp_bytes'],
            defaults['missed_bytes'],
            defaults['orig_pkts'],
            defaults['orig_ip_bytes'],
            defaults['resp_pkts'],
            defaults['resp_ip_bytes']
        ]])
        
        return features
    
    def _get_threat_level(self, consensus_score):
        if consensus_score >= 0.8:
            return "HIGH"
        elif consensus_score >= 0.5:
            return "MEDIUM"
        elif consensus_score >= 0.2:
            return "LOW"
        else:
            return "MINIMAL"
    
    def _get_recommendation(self, consensus_score):
        if consensus_score >= 0.8:
            return "BLOCK_IMMEDIATELY"
        elif consensus_score >= 0.5:
            return "INVESTIGATE_AND_MONITOR"
        elif consensus_score >= 0.2:
            return "MONITOR_CLOSELY"
        else:
            return "ALLOW_NORMAL_OPERATION"

detector = IoTMalwareDetector()

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'service': 'IoT-23 Malware Detection API',
        'version': '1.0.0',
        'status': 'online' if detector.model_loaded else 'models_not_loaded',
        'models_loaded': len(detector.models),
        'endpoints': {
            'predict': '/predict (POST)',
            'health': '/health (GET)',
            'models': '/models (GET)'
        },
        'timestamp': datetime.now().isoformat()
    })

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy' if detector.model_loaded else 'unhealthy',
        'models_loaded': detector.model_loaded,
        'available_models': list(detector.models.keys()),
        'scaler_loaded': detector.scaler is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/models', methods=['GET'])
def model_info():
    return jsonify({
        'models': list(detector.models.keys()),
        'scaler_available': detector.scaler is not None,
        'model_count': len(detector.models),
        'status': 'ready' if detector.model_loaded else 'not_ready',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided',
                'status': 'error',
                'timestamp': datetime.now().isoformat()
            }), 400
        
        logger.info(f"Prediction request from {request.remote_addr}")
        
        result = detector.predict_threat(data)
        if result.get('status') == 'error':
            return jsonify(result), 500
        else:
            return jsonify(result), 200
            
    except Exception as e:
        logger.error(f"API error: {e}")
        return jsonify({
            'error': 'Internal server error',
            'details': str(e),
            'status': 'error',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/predict/simple', methods=['POST'])
def predict_simple():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        result = detector.predict_threat(data)
        
        if result.get('status') == 'error':
            return jsonify({
                'is_malicious': False,
                'error': result.get('error', 'Unknown error')
            }), 500
        
        consensus = result.get('consensus', {})
        
        # Prepare response for ESP32
        esp32_response = {
            'is_malicious': consensus.get('is_malicious', False),
            'threat_level': consensus.get('threat_level', 'MINIMAL'),
            'confidence': consensus.get('consensus_score', 0.0),
            'recommendation': consensus.get('recommendation', 'ALLOW_NORMAL_OPERATION'),
            'timestamp': result.get('timestamp')
        }
        
        # Forward data to dashboard
        try:
            import requests
            
            # Determine specific malware traffic type based on ESP32 patterns
            orig_port = data.get('id_orig_p', 0)
            resp_port = data.get('id_resp_p', 0)
            duration = data.get('duration', 0.0)
            orig_bytes = data.get('orig_bytes', 0)
            resp_bytes = data.get('resp_bytes', 0)
            
            # Detailed malware type classification based on ESP32 traffic patterns
            if orig_port == 443 and resp_port == 80:
                traffic_type = '✅ Normal HTTPS Web Traffic'
            elif 15000 <= orig_port <= 25000 and 20 <= resp_port <= 1024:
                traffic_type = '🚨 Port Scanning Attack'
            elif resp_port == 80 and duration < 0.01 and orig_bytes < 100:
                traffic_type = '⚡ DDoS Flood Attack'
            elif 40000 <= orig_port <= 50000 and 6660 <= resp_port <= 6669:
                traffic_type = '🤖 Botnet C&C Communication'
            elif 30000 <= orig_port <= 40000 and 4444 <= resp_port <= 8888:
                traffic_type = '⛏️ Cryptocurrency Mining Malware'
            elif 35000 <= orig_port <= 45000 and 21 <= resp_port <= 25:
                traffic_type = '📤 Data Exfiltration Attempt'
            elif 50000 <= orig_port <= 60000 and 443 <= resp_port <= 8443:
                traffic_type = '🔒 Ransomware C&C Traffic'
            elif 20000 <= orig_port <= 30000 and 23 <= resp_port <= 2323:
                traffic_type = '🌐 IoT Malware (Mirai-style)'
            elif 45000 <= orig_port <= 55000 and 1337 <= resp_port <= 31337:
                traffic_type = '🚪 Backdoor/RAT Communication'
            elif 32000 <= orig_port <= 42000 and resp_port == 53:
                traffic_type = '🕳️ DNS Tunneling Attack'
            elif 38000 <= orig_port <= 48000 and 8080 <= resp_port <= 9090:
                traffic_type = '⌨️ Keylogger Data Transmission'
            elif 1024 <= orig_port <= 5000 and 80 <= resp_port <= 443:
                traffic_type = '🏠 Normal IoT Communication'
            else:
                # Fallback to generic classification
                if resp_port == 80 or resp_port == 443:
                    traffic_type = 'HTTP/HTTPS Web Traffic'
                elif resp_port > 8000:
                    traffic_type = 'Suspicious High Port Access'
                elif duration < 0.01 and orig_bytes == 0:
                    traffic_type = 'Potential Port Scan'
                elif orig_port > 1024 and resp_port < 1024:
                    traffic_type = 'IoT Device Communication'
                else:
                    traffic_type = 'Unknown Network Traffic'
            
            dashboard_data = {
                'timestamp': esp32_response['timestamp'],
                'traffic_type': traffic_type,
                'ports': f"{orig_port} → {resp_port}",
                'is_malicious': esp32_response['is_malicious'],
                'confidence': esp32_response['confidence'],
                'threat_level': esp32_response['threat_level'],
                'recommendation': esp32_response['recommendation'],
                'id_orig_p': orig_port,
                'id_resp_p': resp_port,
                'duration': data.get('duration', 0.0),
                'orig_bytes': data.get('orig_bytes', 0),
                'resp_bytes': data.get('resp_bytes', 0)
            }
            
            # Send to dashboard
            requests.post(
                "http://10.128.138.251:5002/api/esp32_data",
                json=dashboard_data,
                headers={'Content-Type': 'application/json'},
                timeout=3
            )
            logger.info(f"📊 Dashboard updated with ESP32 data")
            
        except Exception as e:
            logger.warning(f"⚠️ Dashboard update failed: {e}")
        
        return jsonify(esp32_response), 200
        
    except Exception as e:
        logger.error(f"Simple API error: {e}")
        return jsonify({
            'is_malicious': False,
            'error': 'Server error',
            'confidence': 0.0
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint not found',
        'available_endpoints': ['/predict', '/predict/simple', '/health', '/models'],
        'status': 'error'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Internal server error',
        'status': 'error',
        'timestamp': datetime.now().isoformat()
    }), 500

if __name__ == '__main__':
    if not detector.model_loaded:
        print("⚠️  WARNING: No models loaded! Please ensure model files are present.")
        print("   Expected files: advanced_iot23_*.pkl or iot23_*.pkl")
    else:
        print(f"🚀 IoT-23 Malware Detection API Server Starting...")
        print(f"📊 Loaded {len(detector.models)} models")
        print(f"🔗 API Endpoints:")
        print(f"   • POST /predict - Full prediction with detailed results")
        print(f"   • POST /predict/simple - Simplified prediction for ESP32")
        print(f"   • GET /health - Health check")
        print(f"   • GET /models - Model information")
    
    app.run(
        host='0.0.0.0',
        port=8080,
        debug=False
    )