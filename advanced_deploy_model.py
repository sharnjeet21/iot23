#!/usr/bin/env python3

import numpy as np
import pandas as pd
import joblib
from sklearn.preprocessing import StandardScaler

class AdvancedIoT23Detector:
    def __init__(self):
        self.models = {}
        self.scaler = None
        
        # Feature sets
        self.feature_names_full = [
            'id.orig_p', 'id.resp_p',
            'duration', 'orig_bytes', 'resp_bytes',
            'missed_bytes',
            'orig_pkts', 'orig_ip_bytes',
            'resp_pkts', 'resp_ip_bytes'
        ]
        
        self.feature_names_no_ports = [
            'duration', 'orig_bytes', 'resp_bytes',
            'missed_bytes',
            'orig_pkts', 'orig_ip_bytes',
            'resp_pkts', 'resp_ip_bytes'
        ]
        
    def load_models(self):
        model_files = {
            'binary_rf': 'advanced_iot23_binary_rf.pkl',
            'isolation_forest': 'advanced_iot23_isolation_forest.pkl',
            'one_class_svm': 'advanced_iot23_one_class_svm.pkl',
            'multiclass_imbalanced': 'advanced_iot23_multiclass_imbalanced.pkl',
            'multiclass_smote': 'advanced_iot23_multiclass_smote.pkl',
            'no_ports': 'advanced_iot23_no_ports.pkl'
        }
        
        try:
            for model_name, filename in model_files.items():
                try:
                    self.models[model_name] = joblib.load(filename)
                    print(f"✅ Loaded {model_name}")
                except FileNotFoundError:
                    print(f"⚠️  {filename} not found, skipping {model_name}")
            
            self.scaler = joblib.load('advanced_iot23_scaler.pkl')
            print("✅ Loaded scaler")
            
            return True
            
        except Exception as e:
            print(f"❌ Error loading models: {e}")
            return False
    
    def predict_binary_supervised(self, **kwargs):
        if 'binary_rf' not in self.models:
            return None
        
        features = self._prepare_features_full(**kwargs)
        prediction = self.models['binary_rf'].predict(features)[0]
        probability = self.models['binary_rf'].predict_proba(features)[0]
        
        return {
            'method': 'Supervised Binary RF',
            'is_attack': bool(prediction),
            'confidence': max(probability),
            'attack_probability': probability[1] if len(probability) > 1 else probability[0]
        }
    
    def predict_anomaly_detection(self, **kwargs):
        results = {}
        
        features = self._prepare_features_full(**kwargs)
        features_scaled = self.scaler.transform(features)
        
        if 'isolation_forest' in self.models:
            iso_pred = self.models['isolation_forest'].predict(features_scaled)[0]
            iso_score = self.models['isolation_forest'].decision_function(features_scaled)[0]
            
            results['isolation_forest'] = {
                'method': 'Isolation Forest',
                'is_attack': iso_pred == -1,
                'anomaly_score': -iso_score,  # Higher = more anomalous
                'confidence': abs(iso_score)
            }
        
        if 'one_class_svm' in self.models:
            oc_pred = self.models['one_class_svm'].predict(features_scaled)[0]
            oc_score = self.models['one_class_svm'].decision_function(features_scaled)[0]
            
            results['one_class_svm'] = {
                'method': 'One-Class SVM',
                'is_attack': oc_pred == -1,
                'anomaly_score': -oc_score,
                'confidence': abs(oc_score)
            }
        
        return results
    
    def predict_multiclass(self, **kwargs):
        if 'multiclass_smote' not in self.models:
            return None
        
        features = self._prepare_features_full(**kwargs)
        prediction = self.models['multiclass_smote'].predict(features)[0]
        probabilities = self.models['multiclass_smote'].predict_proba(features)[0]
        
        classes = self.models['multiclass_smote'].classes_
        
        top_indices = np.argsort(probabilities)[-3:][::-1]
        top_predictions = [
            {
                'attack_type': classes[i],
                'probability': probabilities[i]
            }
            for i in top_indices
        ]
        
        return {
            'method': 'Multi-class SMOTE RF',
            'predicted_attack': prediction,
            'confidence': max(probabilities),
            'top_predictions': top_predictions,
            'is_benign': prediction == 'Benign'
        }
    
    def predict_two_tier(self, **kwargs):
        if 'binary_rf' not in self.models or 'multiclass_imbalanced' not in self.models:
            return None
        
        features = self._prepare_features_full(**kwargs)
        
        binary_pred = self.models['binary_rf'].predict(features)[0]
        binary_prob = self.models['binary_rf'].predict_proba(features)[0]
        
        if binary_pred == 0:
            return {
                'method': 'Two-tier Hybrid',
                'tier1_result': 'Benign',
                'tier2_result': None,
                'final_prediction': 'Benign',
                'is_attack': False,
                'confidence': binary_prob[0]
            }
        else:
            multiclass_pred = self.models['multiclass_imbalanced'].predict(features)[0]
            multiclass_prob = self.models['multiclass_imbalanced'].predict_proba(features)[0]
            
            return {
                'method': 'Two-tier Hybrid',
                'tier1_result': 'Attack',
                'tier2_result': multiclass_pred,
                'final_prediction': multiclass_pred,
                'is_attack': True,
                'confidence': max(multiclass_prob)
            }
    
    def predict_no_ports(self, **kwargs):
        if 'no_ports' not in self.models:
            return None
        
        features = self._prepare_features_no_ports(**kwargs)
        prediction = self.models['no_ports'].predict(features)[0]
        probability = self.models['no_ports'].predict_proba(features)[0]
        
        return {
            'method': 'Binary RF (no ports)',
            'is_attack': bool(prediction),
            'confidence': max(probability),
            'attack_probability': probability[1] if len(probability) > 1 else probability[0]
        }
    
    def comprehensive_analysis(self, **kwargs):
        print(f"\n🔍 COMPREHENSIVE IoT TRAFFIC ANALYSIS")
        print("=" * 50)
        
        print("Input Features:")
        for key, value in kwargs.items():
            print(f"  {key}: {value}")
        
        results = {}
        
        binary_result = self.predict_binary_supervised(**kwargs)
        if binary_result:
            results['supervised'] = binary_result
            print(f"\n📊 {binary_result['method']}:")
            print(f"  Attack: {'Yes' if binary_result['is_attack'] else 'No'}")
            print(f"  Confidence: {binary_result['confidence']:.3f}")
        
        anomaly_results = self.predict_anomaly_detection(**kwargs)
        if anomaly_results:
            results['anomaly'] = anomaly_results
            for method, result in anomaly_results.items():
                print(f"\n🚨 {result['method']}:")
                print(f"  Anomaly: {'Yes' if result['is_attack'] else 'No'}")
                print(f"  Anomaly Score: {result['anomaly_score']:.3f}")
        
        multiclass_result = self.predict_multiclass(**kwargs)
        if multiclass_result:
            results['multiclass'] = multiclass_result
            print(f"\n🎯 {multiclass_result['method']}:")
            print(f"  Attack Type: {multiclass_result['predicted_attack']}")
            print(f"  Confidence: {multiclass_result['confidence']:.3f}")
            print("  Top 3 Predictions:")
            for pred in multiclass_result['top_predictions']:
                print(f"    {pred['attack_type']}: {pred['probability']:.3f}")
        
        two_tier_result = self.predict_two_tier(**kwargs)
        if two_tier_result:
            results['two_tier'] = two_tier_result
            print(f"\n🏗️  {two_tier_result['method']}:")
            print(f"  Tier 1: {two_tier_result['tier1_result']}")
            if two_tier_result['tier2_result']:
                print(f"  Tier 2: {two_tier_result['tier2_result']}")
            print(f"  Final: {two_tier_result['final_prediction']}")
            print(f"  Confidence: {two_tier_result['confidence']:.3f}")
        
        no_ports_result = self.predict_no_ports(**kwargs)
        if no_ports_result:
            results['no_ports'] = no_ports_result
            print(f"\n🚫 {no_ports_result['method']}:")
            print(f"  Attack: {'Yes' if no_ports_result['is_attack'] else 'No'}")
            print(f"  Confidence: {no_ports_result['confidence']:.3f}")
        
        print(f"\n📋 CONSENSUS ANALYSIS:")
        attack_votes = 0
        total_votes = 0
        
        if binary_result and binary_result['is_attack']:
            attack_votes += 1
        if binary_result:
            total_votes += 1
            
        for result in anomaly_results.values():
            if result['is_attack']:
                attack_votes += 1
            total_votes += 1
        
        if two_tier_result and two_tier_result['is_attack']:
            attack_votes += 1
        if two_tier_result:
            total_votes += 1
        
        if no_ports_result and no_ports_result['is_attack']:
            attack_votes += 1
        if no_ports_result:
            total_votes += 1
        
        consensus = attack_votes / total_votes if total_votes > 0 else 0
        
        print(f"  Attack Consensus: {attack_votes}/{total_votes} models ({consensus:.1%})")
        
        if consensus >= 0.5:
            print(f"  🚨 THREAT DETECTED - Multiple models agree this is malicious")
        else:
            print(f"  ✅ LIKELY BENIGN - Majority of models indicate normal traffic")
        
        return results
    
    def _prepare_features_full(self, id_orig_p=17576, id_resp_p=8081, duration=0.000002,
                              orig_bytes=0, resp_bytes=0, missed_bytes=0,
                              orig_pkts=2, orig_ip_bytes=80, resp_pkts=0, resp_ip_bytes=0):
        features = np.array([[
            id_orig_p, id_resp_p, duration, orig_bytes, resp_bytes,
            missed_bytes, orig_pkts, orig_ip_bytes, resp_pkts, resp_ip_bytes
        ]])
        return features
    
    def _prepare_features_no_ports(self, duration=0.000002, orig_bytes=0, resp_bytes=0,
                                  missed_bytes=0, orig_pkts=2, orig_ip_bytes=80,
                                  resp_pkts=0, resp_ip_bytes=0, **kwargs):
        features = np.array([[
            duration, orig_bytes, resp_bytes, missed_bytes,
            orig_pkts, orig_ip_bytes, resp_pkts, resp_ip_bytes
        ]])
        return features

def demo_advanced_detection():
    print("🔒 Advanced IoT-23 Detection System Demo 🔒")
    
    detector = AdvancedIoT23Detector()
    
    if not detector.load_models():
        print("Please train models first by running:")
        print("python3 advanced_iot23_model.py")
        return
    
    test_cases = [
        {
            'name': 'Suspicious Port Scan',
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
        },
        {
            'name': 'Normal Web Traffic',
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
        },
        {
            'name': 'Potential DDoS Attack',
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
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        name = test_case.pop('name')
        print(f"\n{'='*60}")
        print(f"TEST CASE {i}: {name}")
        print(f"{'='*60}")
        
        detector.comprehensive_analysis(**test_case)
    
    print(f"\n{'='*60}")
    print("🎉 Advanced Detection Demo Complete! 🎉")
    print(f"{'='*60}")

if __name__ == "__main__":
    demo_advanced_detection()