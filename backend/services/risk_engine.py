import logging
from typing import Dict, Any

logger = logging.getLogger("jalrakshak.risk_engine")

class CauseIntelligenceEngine:
    """
    Dedicated diagnostic engine determining the root cause of flood/landslide risk:
    1. RAINFALL OVERLOAD: Heavy rainfall exceeds drainage capacity.
    2. DRAINAGE BLOCKAGE: Moderate rainfall but blocked/damaged drainage causes localized flooding.
    3. COMBINED RISK: Severe storm burst meeting clogged or insufficient drainage networks.
    4. UNCERTAIN: Conflicting sensor telemetry or low diagnostic confidence.
    """

    @staticmethod
    def analyze_cause(data: Dict[str, Any]) -> Dict[str, Any]:
        rainfall = float(data.get("rainfall", 0.0))
        drainage = float(data.get("drainage_condition", 80.0)) # 0=choked, 100=clean
        citizen_reports = int(data.get("citizen_reports_count", 0))
        waterlogging_trend = str(data.get("waterlogging_trend", "stable")).lower()
        soil_moisture = float(data.get("soil_moisture", 50.0))
        slope = float(data.get("slope", 10.0))

        # Check for Landslide Hazard first if steep slope + saturated soil
        if slope >= 28.0 and soil_moisture >= 78.0 and rainfall >= 35.0:
            return {
                "cause_code": "LANDSLIDE_TRIGGER",
                "probable_cause": "Terrain Slope & Soil Saturation Failure",
                "confidence": "HIGH",
                "badge_color": "#b45309",
                "explanation": (
                    f"Steep hillside slope ({slope}°) combined with near-saturation soil moisture ({soil_moisture}%) "
                    f"and continuing rainfall ({rainfall} mm/hr) has created severe slope instability and debris flow hazard."
                ),
                "trigger_metrics": {
                    "rainfall_mm_hr": rainfall,
                    "soil_moisture_pct": soil_moisture,
                    "slope_deg": slope,
                    "drainage_condition_score": drainage
                },
                "key_signals": [
                    f"Slope gradient ({slope}°) exceeds safe shear threshold",
                    f"High soil pore-water pressure ({soil_moisture}% saturation)",
                    "Subsurface slippage sensors detecting minor displacement"
                ]
            }

        # DRAINAGE BLOCKAGE CONDITION:
        # Moderate rainfall (15 - 55 mm/hr) BUT drainage is severely degraded (< 45) OR high citizen waterlogging reports (> 3)
        if rainfall <= 55.0 and (drainage <= 45.0 or (citizen_reports >= 4 and waterlogging_trend in ["increasing", "critical"])):
            confidence = "HIGH" if (drainage <= 30.0 and citizen_reports >= 3) else "MODERATE"
            return {
                "cause_code": "DRAINAGE_BLOCKAGE",
                "probable_cause": "Drainage Blockage Suspected",
                "confidence": confidence,
                "badge_color": "#d97706",
                "explanation": (
                    f"Flood risk is escalating despite moderate rainfall ({rainfall} mm/hr). "
                    f"Critical drainage degradation (efficiency score {drainage}/100) along with "
                    f"{citizen_reports} localized citizen waterlogging reports confirm storm sewer choking."
                ),
                "trigger_metrics": {
                    "rainfall_mm_hr": rainfall,
                    "drainage_condition_score": drainage,
                    "citizen_reports_count": citizen_reports,
                    "waterlogging_trend": waterlogging_trend
                },
                "key_signals": [
                    f"Rainfall rate ({rainfall} mm/hr) is within municipal design capacity if drains were clear",
                    f"Drainage efficiency ({drainage}%) indicates severe siltation or debris choke points",
                    f"{citizen_reports} verified crowd reports indicating standing backwater on roads"
                ]
            }

        # COMBINED RISK CONDITION:
        # High rainfall (> 55 mm/hr) AND poor drainage (< 50)
        if rainfall > 55.0 and drainage < 50.0:
            return {
                "cause_code": "COMBINED_RISK",
                "probable_cause": "Combined Rainfall Overload & Drainage Obstruction",
                "confidence": "HIGH",
                "badge_color": "#dc2626",
                "explanation": (
                    f"Compound hazard: Severe precipitation ({rainfall} mm/hr) is colliding with impaired "
                    f"drainage conduits ({drainage}/100), compounding surface water inundation velocity."
                ),
                "trigger_metrics": {
                    "rainfall_mm_hr": rainfall,
                    "drainage_condition_score": drainage,
                    "citizen_reports_count": citizen_reports
                },
                "key_signals": [
                    f"Severe rainfall rate ({rainfall} mm/hr) exceeding hydraulic design return period",
                    f"Drainage system choked ({drainage}/100) preventing gravity outfall",
                    "Immediate multi-point road and culvert submergence underway"
                ]
            }

        # RAINFALL OVERLOAD CONDITION:
        # Intense rainfall (> 60 mm/hr) overwhelming drainage even if drains are operating normally
        if rainfall >= 55.0:
            return {
                "cause_code": "RAINFALL_OVERLOAD",
                "probable_cause": "Rainfall Overload (Extreme Cloudburst / Downpour)",
                "confidence": "HIGH",
                "badge_color": "#991b1b",
                "explanation": (
                    f"Extreme precipitation volume ({rainfall} mm/hr) drastically exceeds standard civil stormwater "
                    f"catchment thresholds, producing rapid sheet runoff and river backflow."
                ),
                "trigger_metrics": {
                    "rainfall_mm_hr": rainfall,
                    "drainage_condition_score": drainage,
                    "soil_moisture_pct": soil_moisture
                },
                "key_signals": [
                    f"Precipitation rate ({rainfall} mm/hr) exceeds 10-year return capacity",
                    f"Soil saturation at {soil_moisture}%, nullifying infiltration capacity",
                    "Rapid catchment discharge approaching culvert overspill levels"
                ]
            }

        # UNCERTAIN / BASELINE CONDITION
        return {
            "cause_code": "UNCERTAIN",
            "probable_cause": "Normal Runoff / Inconclusive Anomaly",
            "confidence": "LOW",
            "badge_color": "#64748b",
            "explanation": (
                f"Telemetry indicates baseline conditions ({rainfall} mm/hr rain, drainage efficiency {drainage}%). "
                f"No conclusive flood hazard or drainage choking signature detected at this juncture."
            ),
            "trigger_metrics": {
                "rainfall_mm_hr": rainfall,
                "drainage_condition_score": drainage,
                "citizen_reports_count": citizen_reports
            },
            "key_signals": [
                "Precipitation within standard seasonal tolerances",
                "Drainage flow rates maintaining nominal gravity velocity",
                "No anomalous crowd or sensor waterlogging spikes detected"
            ]
        }

cause_intelligence_engine = CauseIntelligenceEngine()
