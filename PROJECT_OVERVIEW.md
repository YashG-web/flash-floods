# JalRakshak (जल रक्षक) 🌊🛡️
### Hyperlocal Flood & Landslide Intelligence and Early Warning Decision-Support System

**JalRakshak** is an AI-powered early warning and decision-support platform designed for urban and rural flood prediction, landslide risk assessment, and disaster management. It combines real-time IoT sensor telemetry, geospatial mapping (Leaflet/OSM), cause intelligence (SHAP explainability), automated scenario simulations, impact assessments, and crowdsourced citizen reporting.

---

## 🌟 Key Features

1. **Hyperlocal Flood & Landslide Prediction Engine**
   - AI/ML risk scoring model (0-100%) incorporating rainfall, soil moisture, river level, slope, drainage choke factors, and elevation.
   - Real-time updates and interactive risk distribution across wards/villages.

2. **Interactive Geospatial Map (Leaflet / OpenStreetMap)**
   - Custom map interface displaying ward boundaries, river networks, drainage lines, IoT sensor nodes, critical infrastructure (hospitals, schools, shelters), and citizen incident reports.
   - Interactive popups and heatmaps for quick spatial context.

3. **SHAP Cause Intelligence & Explainability**
   - Feature attribution breakdown showing *why* a specific location is at risk (e.g., +42% high rainfall overload, +28% blocked drainage, +15% steep slope).

4. **Scenario Simulator**
   - Pre-configured emergency stress-test scenarios:
     - **Cloudburst Burst / Severe Rainfall Overload**
     - **Localized Choked Drain & Trash Accumulation**
     - **River Siltation / Backwater Surge**
     - **Nominal Baseline Operating State**

5. **Live IoT Sensor Telemetry & Citizen Crowdsourced Reporting**
   - Real-time stream monitoring for water level, rainfall intensity, and soil moisture sensors.
   - Interactive citizen report modal for submitting geolocated photo evidence, severity levels, and obstruction alerts.

6. **Impact & Action Decision-Support Matrix**
   - Actionable recommendations for disaster response teams (NDRF/SDRF, municipal authority, evacuation teams, drainage repair crews).
   - Infrastructure risk monitoring and emergency shelter capacity planning.

---

## 🏗️ Architecture & Technology Stack

```
JalRakshak System Architecture
├── Frontend (React 19 + TypeScript + Vite + Tailwind CSS)
│   ├── Interactive Map: Leaflet & React-Leaflet
│   ├── Charts & Visualization: Recharts & Lucide Icons
│   └── State & API Layer: Custom hooks & REST client proxy
│
└── Backend (FastAPI + Python 3.14)
    ├── Services:
    │   ├── Flood Prediction Engine (`services/flood_prediction.py`)
    │   ├── SHAP Explainability Engine (`services/explainability.py`)
    │   ├── Cause & Risk Intelligence (`services/risk_engine.py`)
    │   ├── Image & Visual Analysis (`services/image_analysis.py`)
    │   ├── Impact Assessment Engine (`services/impact_engine.py`)
    │   └── Early Warning Alert Engine (`services/alert_engine.py`)
    └── Data & Geodata: Ward boundaries, IoT sensor nodes, river baselines (`data/geodata.py`)
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ & `npm`
- **Python**: v3.10+ (Python 3.14 tested with virtual environment)

### 1. Run the Backend API Server
```bash
cd backend
# Activate virtual environment
source venv/bin/activate

# Run FastAPI server
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
- **API URL**: `http://127.0.0.1:8000`
- **Interactive OpenAPI Documentation**: `http://127.0.0.1:8000/docs`

### 2. Run the Frontend Application
```bash
cd frontend

# Install dependencies (if not already installed)
npm install

# Start Vite Development Server
npm run dev
```
- **Local Application URL**: `http://localhost:5173/`

---

## 📁 Repository Structure

```
JalRakshak/
├── PROJECT_OVERVIEW.md         # Project overview documentation
├── models/                     # Trained ML model weights and baseline scripts
├── backend/
│   ├── main.py                 # FastAPI entry point & API routes
│   ├── config.py               # System configurations & parameters
│   ├── train_baseline_model.py # ML Model training pipeline
│   ├── services/               # Core intelligence and analytical engines
│   └── data/                   # Geospatial datasets & sensor fixtures
└── frontend/
    ├── package.json            # Node dependencies and scripts
    ├── vite.config.ts          # Vite configuration with proxy to backend
    └── src/
        ├── App.tsx             # Main App layout & tab routing
        ├── components/         # Dashboard, Map, Simulator, & Report components
        └── types/              # TypeScript interfaces for data models
```

---

## 🛡️ License & Mission
**JalRakshak** is built to safeguard lives, infrastructure, and communities through predictive intelligence, transparent explainable AI, and rapid disaster response coordination.
