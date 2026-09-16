import os
import json
import pickle
import logging
from typing import Dict, Any, Tuple, Optional
import numpy as np
from config import settings

logger = logging.getLogger("jalrakshak.flood_prediction")

class FloodPredictionService:
    def __init__(self):
        self.model = None
        self.config: Dict[str, Any] = {}
        self.is_loaded = False
        self.is_placeholder = True # Explicitly flag that this is a placeholder/baseline integration interface
        self.load_model()

    def load_model(self):
        """Loads model configuration and placeholder weights."""
        config_path = settings.FLOOD_CONFIG_PATH
        model_path = settings.FLOOD_MODEL_PATH

        if os.path.exists(config_path):
            with open(config_path, "r") as f:
                self.config = json.load(f)
        else:
            self.config = {
                "feature_order": ["rainfall", "soil_moisture", "slope", "elevation", "drainage_condition", "historical_events", "sensor_water_level", "impervious_surface_pct"],
                "risk_thresholds": {
                    "low": {"min": 0, "max": 30, "label": "LOW", "color": "#16a34a"},
                    "moderate": {"min": 31, "max": 60, "label": "MODERATE", "color": "#eab308"},
                    "high": {"min": 61, "max": 80, "label": "HIGH", "color": "#f97316"},
                    "critical": {"min": 81, "max": 100, "label": "CRITICAL", "color": "#dc2626"}
                }
            }

        if os.path.exists(model_path):
            try:
                with open(model_path, "rb") as f:
                    self.model = pickle.load(f)
                self.is_loaded = True
                logger.info(f"Flood prediction interface loaded from {model_path} (Placeholder / Ready for trained replacement)")
            except Exception as e:
                logger.error(f"Failed to load model file from {model_path}: {e}")
                self.model = None
                self.is_loaded = False
        else:
            self.model = None
            self.is_loaded = False

    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes inputs conforming to model_config.json.
        Transparently communicates placeholder interface status.
        """
        feature_order = self.config.get("feature_order", [
            "rainfall", "soil_moisture", "slope", "elevation",
            "drainage_condition", "historical_events", "sensor_water_level", "impervious_surface_pct"
        ])
        imputations = self.config.get("preprocessing", {}).get("imputation", {})

        feature_vector = []
        parsed_features = {}
        for feat in feature_order:
            val = input_data.get(feat)
            if val is None:
                val = imputations.get(feat, 0.0)
            try:
                val = float(val)
            except (ValueError, TypeError):
                val = float(imputations.get(feat, 0.0))
            feature_vector.append(val)
            parsed_features[feat] = val

        if not self.is_loaded or self.model is None:
            # Fallback hydrological formula calculation when no model file exists
            rf = parsed_features.get("rainfall", 0.0)
            sm = parsed_features.get("soil_moisture", 50.0)
            dr = parsed_features.get("drainage_condition", 75.0)
            prob = round(min(100.0, max(0.0, (rf * 0.45 * (sm/100.0)) + ((100-dr)/100.0 * (rf/50.0) * 35.0))), 1)
            risk_level, color = self._classify_risk(prob)
            return {
                "success": True,
                "model_available": False,
                "is_placeholder": True,
                "status_message": "Placeholder Hydrological Interface (Awaiting user-trained model.pkl drop-in)",
                "probability": prob,
                "risk_level": risk_level,
                "risk_color": color,
                "input_features": parsed_features,
                "feature_vector": feature_vector,
                "feature_order": feature_order
            }

        try:
            X = np.array([feature_vector], dtype=np.float32)
            raw_pred = float(self.model.predict(X)[0])
            probability = max(0.0, min(100.0, round(raw_pred, 1)))
            risk_level, color = self._classify_risk(probability)

            return {
                "success": True,
                "model_available": True,
                "is_placeholder": True,
                "status_message": "Integration Interface Active: Baseline placeholder model loaded. Ready for user trained model.pkl drop-in.",
                "probability": probability,
                "risk_level": risk_level,
                "risk_color": color,
                "input_features": parsed_features,
                "feature_vector": feature_vector,
                "feature_order": feature_order,
                "model_version": self.config.get("model_version", "1.0.0-interface")
            }
        except Exception as e:
            logger.error(f"Inference error: {e}")
            return {
                "success": False,
                "model_available": False,
                "is_placeholder": True,
                "status_message": f"Interface execution error: {str(e)}",
                "probability": None,
                "risk_level": None
            }

    def _classify_risk(self, probability: float) -> Tuple[str, str]:
        thresholds = self.config.get("risk_thresholds", {})
        for key, conf in thresholds.items():
            if conf.get("min", 0) <= probability <= conf.get("max", 100):
                return conf.get("label", key.upper()), conf.get("color", "#64748b")
        if probability > 80:
            return "CRITICAL", "#dc2626"
        elif probability > 60:
            return "HIGH", "#f97316"
        elif probability > 30:
            return "MODERATE", "#eab308"
        return "LOW", "#16a34a"

flood_prediction_service = FloodPredictionService()
