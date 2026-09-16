"""
Trains a baseline XGBoost hydrological model that embodies:
1. Rainfall Overload: high rainfall (>60 mm/hr) + high soil moisture -> severe flood risk.
2. Drainage Blockage: moderate rainfall (30-50 mm/hr) + poor drainage condition (<30) -> high localized waterlogging.
3. Landslide Trigger: high slope (>25°) + high soil moisture (>75%) + rainfall (>40 mm/hr) -> landslide hazard.
Outputs models/flood_model/model.pkl
"""
import os
import json
import pickle
import numpy as np
import xgboost as xgb

def train_baseline():
    config_path = os.path.join(os.path.dirname(__file__), "..", "models", "flood_model", "model_config.json")
    with open(config_path, "r") as f:
        config = json.load(f)

    feature_order = config["feature_order"]
    np.random.seed(42)
    n_samples = 4000

    # Synthetic hydrological features
    # rainfall (0 to 150 mm/h)
    rainfall = np.random.exponential(scale=25, size=n_samples)
    rainfall = np.clip(rainfall, 0, 150)

    # soil_moisture (10 to 95%)
    soil_moisture = np.random.uniform(20, 95, size=n_samples)

    # slope (0 to 45 degrees)
    slope = np.random.uniform(1, 45, size=n_samples)

    # elevation (50 to 1800 m)
    elevation = np.random.uniform(50, 1800, size=n_samples)

    # drainage_condition (0=choked, 100=clean)
    drainage_condition = np.random.uniform(5, 100, size=n_samples)

    # historical_events (0 to 10)
    historical_events = np.random.poisson(lam=2, size=n_samples)

    # sensor_water_level (0.2m to 5.5m)
    sensor_water_level = 0.3 + (rainfall / 40.0) + (100 - drainage_condition) / 80.0 + np.random.normal(0, 0.1, n_samples)
    sensor_water_level = np.clip(sensor_water_level, 0.1, 6.0)

    # impervious_surface_pct (10 to 90%)
    impervious_surface_pct = np.random.uniform(15, 90, size=n_samples)

    # Hydrological risk formulation (ground truth physics)
    # Rainfall overload component
    rf_risk = (rainfall / 100.0) * 0.45 * (soil_moisture / 100.0)
    # Drainage blockage component: even if rainfall is moderate (e.g. 35mm), poor drainage (<30) causes heavy localized backup!
    drain_risk = ((100 - drainage_condition) / 100.0) * (rainfall / 50.0) * 0.40 * (impervious_surface_pct / 100.0)
    # Slope / landslide component
    slope_risk = (slope / 45.0) * (soil_moisture / 100.0) * (rainfall / 80.0) * 0.35
    # Historical vulnerability prior
    hist_risk = (historical_events / 10.0) * 0.10

    total_score = (rf_risk + drain_risk + slope_risk + hist_risk) * 100.0
    total_score += np.random.normal(0, 2.5, n_samples)
    total_score = np.clip(total_score, 0.0, 100.0)

    X = np.column_stack([
        rainfall,
        soil_moisture,
        slope,
        elevation,
        drainage_condition,
        historical_events,
        sensor_water_level,
        impervious_surface_pct
    ])
    y = total_score

    # Train XGBoost regressor predicting probability/score (0-100)
    model = xgb.XGBRegressor(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.08,
        objective='reg:squarederror',
        random_state=42
    )
    model.fit(X, y)

    out_path = os.path.join(os.path.dirname(__file__), "..", "models", "flood_model", "model.pkl")
    with open(out_path, "wb") as f:
        pickle.dump(model, f)

    print(f"Model successfully saved to {out_path}")
    print(f"Trained with {n_samples} samples across features: {feature_order}")

if __name__ == "__main__":
    train_baseline()
