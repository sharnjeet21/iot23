#!/usr/bin/env python3
"""Populate dashboard database with random sample data"""

import sqlite3
from datetime import datetime, timedelta
import random
import json

# Database connection
conn = sqlite3.connect('dashboard.db')
cursor = conn.cursor()

# Sample data
traffic_types = [
    "🌐 IoT Malware (Mirai-style)",
    "📤 Data Exfiltration Attempt",
    "🔓 Brute Force Attack",
    "🎯 DDoS Attack",
    "🔐 Credential Stuffing",
    "📡 DNS Tunneling",
    "🕵️ Reconnaissance Scan",
    "💉 Injection Attack",
    "🔄 Command & Control",
    "📊 Botnet Activity",
    "🌍 Geo-Spoofing",
    "🔗 Man-in-the-Middle"
]

threat_levels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
source_ips = [
    "192.168.1.100", "192.168.1.101", "192.168.1.102",
    "10.0.0.50", "10.0.0.51", "172.16.0.10"
]

# Generate random data for the last 24 hours
now = datetime.now()
base_time = now - timedelta(hours=24)

print("🔄 Populating database with random sample data...")
print("=" * 50)

# Clear existing data
cursor.execute("DELETE FROM dashboard_logs")
conn.commit()

# Insert 50 random records
for i in range(50):
    # Random timestamp within last 24 hours
    random_seconds = random.randint(0, 86400)
    timestamp = (base_time + timedelta(seconds=random_seconds)).isoformat()
    
    # Random values
    source_ip = random.choice(source_ips)
    traffic_type = random.choice(traffic_types)
    is_malicious = random.choice([True, False])
    threat_level = random.choice(threat_levels) if is_malicious else "LOW"
    confidence = round(random.uniform(0.65, 0.99), 2) if is_malicious else round(random.uniform(0.01, 0.35), 2)
    
    # Random ports
    src_port = random.randint(1024, 65535)
    dst_port = random.randint(1, 1023)
    ports = f"{src_port} → {dst_port}"
    
    # Insert record
    cursor.execute('''
        INSERT INTO dashboard_logs 
        (timestamp, source_ip, ports, is_malicious, confidence, threat_level, traffic_type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (timestamp, source_ip, ports, is_malicious, confidence, threat_level, traffic_type))
    
    status = "🚨 THREAT" if is_malicious else "✅ SAFE"
    print(f"{i+1:2d}. {status} | {traffic_type:30s} | {threat_level:8s} | {confidence:.0%}")

conn.commit()

# Show summary statistics
cursor.execute("SELECT COUNT(*) FROM dashboard_logs")
total = cursor.fetchone()[0]

cursor.execute("SELECT COUNT(*) FROM dashboard_logs WHERE is_malicious = 1")
threats = cursor.fetchone()[0]

cursor.execute("SELECT AVG(confidence) FROM dashboard_logs WHERE is_malicious = 1")
avg_threat_conf = cursor.fetchone()[0] or 0

cursor.execute("SELECT AVG(confidence) FROM dashboard_logs WHERE is_malicious = 0")
avg_safe_conf = cursor.fetchone()[0] or 0

print("\n" + "=" * 50)
print("📊 Database Summary:")
print(f"   Total Records: {total}")
print(f"   Threats Detected: {threats} ({threats/total*100:.1f}%)")
print(f"   Safe Traffic: {total-threats} ({(total-threats)/total*100:.1f}%)")
print(f"   Avg Threat Confidence: {avg_threat_conf:.1%}")
print(f"   Avg Safe Confidence: {avg_safe_conf:.1%}")
print("=" * 50)
print("✅ Database populated successfully!")
print("\n🌐 Open dashboard: http://192.168.1.38:5002")

conn.close()
