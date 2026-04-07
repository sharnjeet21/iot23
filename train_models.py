#!/usr/bin/env python3
"""
IoT-23 Model Trainer — engraqeel/iot23preprocesseddata
6M rows, full port features, trains 3 models targeting >90% accuracy.
"""

import os, sys, joblib, warnings
import numpy as np
import pandas as pd
from datetime import datetime

warnings.filterwarnings('ignore')

# ── Config ────────────────────────────────────────────────────────────────────
DATA_FILE  = 'iot23_data2/iot23_combined_new.csv'
FEATURES   = ['id_orig_p', 'id_resp_p', 'duration', 'orig_bytes', 'resp_bytes',
              'missed_bytes', 'orig_pkts', 'orig_ip_bytes', 'resp_pkts', 'resp_ip_bytes']
SAMPLE_SIZE = 600_000   # 600k rows — fast but representative
TARGET_ACC  = 0.90

# ── Label mapping ─────────────────────────────────────────────────────────────
LABEL_MAP = {
    'Benign':                        'Benign',
    'PartOfAHorizontalPortScan':     'PortScan',
    'DDoS':                          'DDoS',
    'C&C':                           'Botnet-C&C',
    'C&C-HeartBeat':                 'Botnet-C&C',
    'C&C-HeartBeat-FileDownload':    'DataExfiltration',
    'C&C-FileDownload':              'DataExfiltration',
    'FileDownload':                  'DataExfiltration',
    'Attack':                        'IoT-Malware',
    'Okiru':                         'IoT-Malware',
    'Okiru-Attack':                  'IoT-Malware',
    'C&C-Torii':                     'IoT-Malware',
    'C&C-Mirai':                     'IoT-Malware',
}

# ── Step 1: Load ──────────────────────────────────────────────────────────────
def load_data():
    print(f"📂 Loading {DATA_FILE} ...")

    # Column rename map (Zeek dot-notation → underscore)
    rename = {'id.orig_p': 'id_orig_p', 'id.resp_p': 'id_resp_p'}

    needed_raw = ['id.orig_p', 'id.resp_p', 'duration', 'orig_bytes', 'resp_bytes',
                  'missed_bytes', 'orig_pkts', 'orig_ip_bytes', 'resp_pkts',
                  'resp_ip_bytes', 'label']

    df = pd.read_csv(DATA_FILE, usecols=lambda c: c in needed_raw, low_memory=False)
    df = df.rename(columns=rename)

    print(f"   Loaded {len(df):,} rows")
    print(f"   Columns: {list(df.columns)}")
    return df

# ── Step 2: Clean & label ─────────────────────────────────────────────────────
def prepare(df):
    # Numeric coerce
    for col in FEATURES:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        else:
            df[col] = 0.0

    # Map labels
    df['attack_type'] = df['label'].map(LABEL_MAP).fillna('Malware-Other')
    df['is_malicious'] = (df['attack_type'] != 'Benign').astype(int)

    print(f"\n📊 Label distribution:")
    print(df['attack_type'].value_counts().to_string())
    print(f"\n   Benign: {(df['is_malicious']==0).sum():,}  |  Malicious: {(df['is_malicious']==1).sum():,}")

    return df

# ── Step 3: Sample — stratified, keep rare classes ────────────────────────────
def sample(df):
    print(f"\n⚡ Stratified sampling from {len(df):,} rows...")

    # Cap large classes at 100k, keep ALL rows for rare classes (<5k)
    parts = []
    for cls, grp in df.groupby('attack_type'):
        cap = 100_000 if len(grp) > 5_000 else len(grp)
        parts.append(grp.sample(min(len(grp), cap), random_state=42))

    sampled = pd.concat(parts).sample(frac=1, random_state=42).reset_index(drop=True)
    print(f"   Sampled {len(sampled):,} rows")
    print(sampled['attack_type'].value_counts().to_string())
    return sampled

# ── Step 4: Train ─────────────────────────────────────────────────────────────
def train(df):
    from sklearn.ensemble import RandomForestClassifier, IsolationForest
    from sklearn.preprocessing import StandardScaler
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score, classification_report
    from imblearn.over_sampling import SMOTE

    X = df[FEATURES].values.astype(np.float32)
    y_bin   = df['is_malicious'].values
    y_multi = df['attack_type'].values

    X_tr, X_te, yb_tr, yb_te, ym_tr, ym_te = train_test_split(
        X, y_bin, y_multi, test_size=0.2, random_state=42, stratify=y_bin
    )
    print(f"\n🔢 Train: {len(X_tr):,}  |  Test: {len(X_te):,}")

    # ── Binary RF ─────────────────────────────────────────────────────────────
    print("\n🌲 Training Binary Random Forest...")
    try:
        min_cls = np.bincount(yb_tr).min()
        sm = SMOTE(random_state=42, k_neighbors=min(5, min_cls - 1))
        X_res, y_res = sm.fit_resample(X_tr, yb_tr)
        print(f"   SMOTE: {len(X_tr):,} → {len(X_res):,}")
    except Exception as e:
        print(f"   SMOTE skipped ({e})")
        X_res, y_res = X_tr, yb_tr

    rf = RandomForestClassifier(
        n_estimators=300, max_depth=25, min_samples_leaf=2,
        class_weight='balanced', n_jobs=-1, random_state=42
    )
    rf.fit(X_res, y_res)
    acc_bin = accuracy_score(yb_te, rf.predict(X_te))
    print(f"   ✅ Binary RF Accuracy: {acc_bin*100:.2f}%")
    print(classification_report(yb_te, rf.predict(X_te), target_names=['Benign','Malicious'], digits=3))

    # ── Isolation Forest ──────────────────────────────────────────────────────
    print("\n🔍 Training Isolation Forest (anomaly)...")
    scaler = StandardScaler()
    X_tr_sc = scaler.fit_transform(X_tr)
    X_te_sc = scaler.transform(X_te)

    X_benign = X_tr_sc[yb_tr == 0]
    print(f"   Training on {len(X_benign):,} benign samples")

    iso = IsolationForest(
        n_estimators=300, contamination=0.08,
        max_samples=min(len(X_benign), 80_000),
        random_state=42, n_jobs=-1
    )
    iso.fit(X_benign)
    iso_pred = (iso.predict(X_te_sc) == -1).astype(int)
    acc_iso = accuracy_score(yb_te, iso_pred)
    print(f"   ✅ Isolation Forest Accuracy: {acc_iso*100:.2f}%")

    # ── Multiclass RF ─────────────────────────────────────────────────────────
    print("\n🎯 Training Multiclass Random Forest...")
    from sklearn.preprocessing import LabelEncoder
    le = LabelEncoder()
    ym_tr_enc = le.fit_transform(ym_tr)
    ym_te_enc = le.transform(ym_te)

    print(f"   Classes: {list(le.classes_)}")

    try:
        min_cls_m = np.bincount(ym_tr_enc).min()
        sm_m = SMOTE(random_state=42, k_neighbors=min(5, min_cls_m - 1))
        X_res_m, y_res_m = sm_m.fit_resample(X_tr, ym_tr_enc)
        print(f"   SMOTE: {len(X_tr):,} → {len(X_res_m):,}")
    except Exception as e:
        print(f"   SMOTE skipped ({e})")
        X_res_m, y_res_m = X_tr, ym_tr_enc

    rf_m = RandomForestClassifier(
        n_estimators=300, max_depth=25, min_samples_leaf=2,
        class_weight='balanced', n_jobs=-1, random_state=42
    )
    rf_m.fit(X_res_m, y_res_m)

    # Predict encoded ints, inverse transform to string labels
    preds_enc = rf_m.predict(X_te)
    preds_m   = le.inverse_transform(preds_enc)
    acc_multi = accuracy_score(ym_te, preds_m)
    print(f"   ✅ Multiclass RF Accuracy: {acc_multi*100:.2f}%")
    print(classification_report(ym_te, preds_m, digits=3))

    # Store label encoder alongside model so cloud_api_server can decode predictions
    rf_m._label_encoder = le
    # Also set classes_ to string names for direct use in cloud_api_server
    rf_m.classes_ = le.classes_

    return rf, iso, rf_m, scaler, acc_bin, acc_iso, acc_multi

# ── Step 5: Save ──────────────────────────────────────────────────────────────
def save(rf, iso, rf_m, scaler, acc_bin, acc_iso, acc_multi):
    print("\n💾 Saving models...")
    joblib.dump(rf,     'advanced_iot23_binary_rf.pkl')
    joblib.dump(iso,    'advanced_iot23_isolation_forest.pkl')
    joblib.dump(rf_m,   'advanced_iot23_multiclass_smote.pkl')
    joblib.dump(scaler, 'advanced_iot23_scaler.pkl')

    print(f"\n{'='*52}")
    print(f"  TRAINING COMPLETE — {datetime.now().strftime('%H:%M:%S')}")
    print(f"{'='*52}")
    print(f"  Binary RF Accuracy     : {acc_bin*100:.2f}%  {'✅' if acc_bin  >= TARGET_ACC else '⚠️ below 90%'}")
    print(f"  Isolation Forest Acc   : {acc_iso*100:.2f}%  {'✅' if acc_iso  >= TARGET_ACC else '⚠️ below 90%'}")
    print(f"  Multiclass RF Accuracy : {acc_multi*100:.2f}%  {'✅' if acc_multi >= TARGET_ACC else '⚠️ below 90%'}")
    print(f"{'='*52}")
    print("  Restart cloud_api_server.py to load new models.")
    print(f"{'='*52}\n")

# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print("="*52)
    print("  IoT-23 Model Trainer")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*52)

    df = load_data()
    df = prepare(df)
    df = sample(df)
    rf, iso, rf_m, scaler, acc_bin, acc_iso, acc_multi = train(df)
    save(rf, iso, rf_m, scaler, acc_bin, acc_iso, acc_multi)
