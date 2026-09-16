# Flood Risk Model (XGBoost) Integration

## How to replace with your trained model:
1. Place your trained model file as `model.pkl` in this folder: `models/flood_model/model.pkl`.
   (Or configure the path via `FLOOD_MODEL_PATH` environment variable).
2. If your model features or order differ, simply update `model_config.json`:
   - `feature_order`: List of feature column names in the exact sequence expected by your model.
   - `risk_thresholds`: Threshold bounds (Low, Moderate, High, Critical).
3. The FastAPI backend automatically loads your model and updates SHAP TreeExplainer and Risk Engine without changing any frontend code!
