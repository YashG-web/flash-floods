import logging
from typing import Dict, Any

logger = logging.getLogger("jalrakshak.impact_engine")

class ImpactAssessmentEngine:
    """
    Computes exposure and vulnerability overlays for municipal wards and rural villages
    under active flood and landslide threats.
    """

    # Baseline geographic exposure metrics by location ID
    LOCATION_BASELINE_ASSETS = {
        "ward-12": {
            "name": "Ward 12 (Station Road & Bazaar)",
            "total_population": 4200,
            "total_properties": 480,
            "critical_assets": [
                {"type": "school", "name": "Govt Girls Senior Secondary School", "capacity": 350},
                {"type": "hospital", "name": "Civil Dispensary & Clinic", "beds": 20},
                {"type": "substation", "name": "Station Feeder 11kV Substation", "status": "At Risk"},
                {"type": "bridge", "name": "Station Nullah Culvert Bridge", "type_detail": "Masonry Arch"}
            ]
        },
        "ward-04": {
            "name": "Ward 04 (Riverfront Embankment)",
            "total_population": 3100,
            "total_properties": 320,
            "critical_assets": [
                {"type": "hospital", "name": "District Sub-Hospital", "beds": 65},
                {"type": "school", "name": "DAV Public School", "capacity": 420},
                {"type": "water_treatment", "name": "WTP Intake Well No. 2", "status": "Vulnerable"}
            ]
        },
        "village-sangam": {
            "name": "Sangam Valley & Confluence",
            "total_population": 1450,
            "total_properties": 140,
            "critical_assets": [
                {"type": "bridge", "name": "Sangam Suspension Footbridge", "type_detail": "Steel Cable"},
                {"type": "school", "name": "Sangam Primary Gramin Shala", "capacity": 95},
                {"type": "shelter", "name": "Panchayat Community Hall (Designated Shelter)", "capacity": 250}
            ]
        },
        "hill-corridor-8": {
            "name": "Hill Road Corridor 8 (Slope Zone)",
            "total_population": 820,
            "total_properties": 65,
            "critical_assets": [
                {"type": "highway", "name": "National Highway NH-58 Ch 42+200", "length_km": 3.4},
                {"type": "telecom", "name": "BSNL Repeater Tower #4", "status": "Slope Edge"}
            ]
        }
    }

    @classmethod
    def assess_impact(cls, location_id: str, risk_probability: float, cause_code: str) -> Dict[str, Any]:
        """
        Calculates affected properties, roads, schools, hospitals, population
        scaled by current risk probability and cause dynamics.
        """
        baseline = cls.LOCATION_BASELINE_ASSETS.get(location_id, cls.LOCATION_BASELINE_ASSETS["ward-12"])
        
        # Scaling factor based on risk probability (0.0 to 1.0)
        p_factor = max(0.05, risk_probability / 100.0)
        
        # If cause is Drainage Blockage, water accumulates predominantly on low-lying commercial streets
        is_drainage_block = cause_code == "DRAINAGE_BLOCKAGE"
        
        prop_ratio = 0.35 if is_drainage_block else 0.55
        pop_ratio = 0.25 if is_drainage_block else 0.45

        affected_properties = max(3, int(round(baseline["total_properties"] * p_factor * prop_ratio)))
        affected_residents = max(12, int(round(baseline["total_population"] * p_factor * pop_ratio)))
        
        if risk_probability > 75:
            affected_roads = 3 if is_drainage_block else 5
            affected_schools = 2
            affected_hospitals = 1
            affected_bridges = 1
        elif risk_probability > 50:
            affected_roads = 2
            affected_schools = 1
            affected_hospitals = 0
            affected_bridges = 0
        elif risk_probability > 25:
            affected_roads = 1
            affected_schools = 0
            affected_hospitals = 0
            affected_bridges = 0
        else:
            affected_roads = 0
            affected_schools = 0
            affected_hospitals = 0
            affected_bridges = 0

        # Detailed road segments affected
        road_names = [
            "Station Road (Ch 1+100 to 2+400)",
            "Bazaar Main Arterial Link",
            "Old River Bund Bypass",
            "Link Road to NH-58"
        ][:affected_roads]

        return {
            "location_id": location_id,
            "location_name": baseline["name"],
            "data_source": "GIS_TOPOLOGICAL_OVERLAY (SIMULATED)",
            "is_simulated_data": True,
            "metrics": {
                "properties": affected_properties,
                "residents": affected_residents,
                "roads": affected_roads,
                "schools": affected_schools,
                "hospitals": affected_hospitals,
                "bridges": affected_bridges
            },
            "affected_roads_list": road_names,
            "critical_facilities": [
                asset for asset in baseline["critical_assets"]
                if risk_probability >= 50 or asset["type"] in ["substation", "school"]
            ],
            "evacuation_priority": "IMMEDIATE" if risk_probability >= 80 else ("ELEVATED" if risk_probability >= 60 else "STANDBY")
        }

impact_assessment_engine = ImpactAssessmentEngine()
