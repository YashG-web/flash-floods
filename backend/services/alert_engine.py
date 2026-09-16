import logging
from typing import Dict, Any, List
from datetime import datetime, timezone

logger = logging.getLogger("jalrakshak.alert_engine")

class AlertEngine:
    """
    Automated Early Warning and Standard Operating Procedure (SOP) Response Dispatcher.
    Generates tailored actionable response directives categorized by risk severity and root cause.
    """

    @staticmethod
    def generate_alert(
        location_id: str,
        location_name: str,
        risk_probability: float,
        cause_data: Dict[str, Any],
        impact_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        cause_code = cause_data.get("cause_code", "UNCERTAIN")
        probable_cause = cause_data.get("probable_cause", "Unspecified Hazard")

        # Determine Alert Severity Tier
        if risk_probability >= 80:
            severity = "CRITICAL"
            color = "#dc2626"
            expected_window = "Next 1–3 Hours"
            headline = f"FLASH FLOOD CRITICAL EVACUATION DIRECTIVE"
        elif risk_probability >= 60:
            severity = "WARNING"
            color = "#f97316"
            expected_window = "Next 3–6 Hours"
            headline = f"FLASH FLOOD THREAT WARNING"
        elif risk_probability >= 30:
            severity = "WATCH"
            color = "#eab308"
            expected_window = "Next 6–12 Hours"
            headline = f"HYDROLOGICAL SURCHARGE WATCH"
        else:
            severity = "INFORMATION"
            color = "#16a34a"
            expected_window = "Routine Monitoring (Next 24h)"
            headline = f"ROUTINE BASIN STATUS"

        # Generate Cause-Specific SOP Directives
        actions = []
        if cause_code == "DRAINAGE_BLOCKAGE":
            actions = [
                {
                    "action_id": "ACT-DRAIN-01",
                    "title": "Dispatch Drainage Silt & Obstruction Clearing QRT",
                    "department": "Municipal Engineering & Stormwater Division",
                    "urgency": "HIGH",
                    "description": "Mobilize suction-cum-jetting machines and manual excavator crew to Station Nullah choke inlet.",
                    "status": "DISPATCHED"
                },
                {
                    "action_id": "ACT-DRAIN-02",
                    "title": "Establish Traffic Diversion around Station Road Waterlogged Chokepoint",
                    "department": "Traffic Police & Ward Marshal Team",
                    "urgency": "IMMEDIATE",
                    "description": "Deploy barricades at Station Chowk and divert heavy vehicles via Bypass Canal Link.",
                    "status": "ACTIVE"
                },
                {
                    "action_id": "ACT-DRAIN-03",
                    "title": "Deploy Dewatering High-Capacity Diesel Pumps (100 HP)",
                    "department": "Disaster Response Equipment Depot",
                    "urgency": "HIGH",
                    "description": "Position 2 high-head dewatering trailer pumps at Market Lowland Depression.",
                    "status": "IN_PROGRESS"
                }
            ]
        elif cause_code == "LANDSLIDE_TRIGGER":
            actions = [
                {
                    "action_id": "ACT-SLOPE-01",
                    "title": "Pre-emptive Traffic Halt on Hill Road Corridor NH-58",
                    "department": "Border Roads & Highway Patrol",
                    "urgency": "CRITICAL",
                    "description": "Halt uphill transport at Checkpost KM 38 due to slope slippage risk.",
                    "status": "ORDERED"
                },
                {
                    "action_id": "ACT-SLOPE-02",
                    "title": "Evacuate Hillside Settlements along Scarp Slope Zone 2",
                    "department": "Tehsildar & District Civil Defense",
                    "urgency": "CRITICAL",
                    "description": "Relocate 32 downhill dwelling units to Sector 4 Community Hall.",
                    "status": "IN_PROGRESS"
                }
            ]
        elif cause_code in ["RAINFALL_OVERLOAD", "COMBINED_RISK"]:
            actions = [
                {
                    "action_id": "ACT-EVAC-01",
                    "title": "Initiate Staged Evacuation in Lowland Riparian Zone",
                    "department": "State Disaster Response Force (SDRF) & Revenue Dept",
                    "urgency": "CRITICAL",
                    "description": f"Move vulnerable residents ({impact_data.get('metrics', {}).get('residents', 120)} people) to designated Relief Shelter A.",
                    "status": "ORDERED"
                },
                {
                    "action_id": "ACT-ROAD-02",
                    "title": "Complete Road Closures on River Road & Causeways",
                    "department": "Traffic Enforcement & PWD",
                    "urgency": "CRITICAL",
                    "description": "Barricade submerged river bridge approaches and post warning lights.",
                    "status": "ACTIVE"
                },
                {
                    "action_id": "ACT-SHELTER-03",
                    "title": "Activate Relief Shelter A (Capacity: 400 persons)",
                    "department": "District Magistrate & Food & Civil Supplies",
                    "urgency": "HIGH",
                    "description": "Provision potable water tankers, medical first-aid kits, and dry rations.",
                    "status": "STANDBY"
                },
                {
                    "action_id": "ACT-BROADCAST-04",
                    "title": "Broadcast Multi-channel Cell Broadcast Early Warning SMS",
                    "department": "State Emergency Operations Center (SEOC)",
                    "urgency": "IMMEDIATE",
                    "description": f"Geo-targeted SMS alert to mobile towers in {location_name} radius.",
                    "status": "TRANSMITTED"
                }
            ]
        else:
            actions = [
                {
                    "action_id": "ACT-NORM-01",
                    "title": "Maintain Continuous Real-Time Hydrometric Telemetry",
                    "department": "Irrigation & Water Resources Dept",
                    "urgency": "ROUTINE",
                    "description": "Keep automatic rain gauges and ultrasonic water level sensors on 15-minute polling cycle.",
                    "status": "ACTIVE"
                }
            ]

        alert_payload = {
            "alert_id": f"ALT-{location_id}-{datetime.now(timezone.utc).strftime('%H%M%S')}",
            "headline": headline,
            "severity": severity,
            "severity_color": color,
            "location_id": location_id,
            "location_name": location_name,
            "risk_probability": risk_probability,
            "expected_window": expected_window,
            "probable_cause": probable_cause,
            "cause_code": cause_code,
            "cause_explanation": cause_data.get("explanation", ""),
            "potential_impact": impact_data.get("metrics", {}),
            "critical_facilities": impact_data.get("critical_facilities", []),
            "recommended_actions": actions,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "ACTIVE" if risk_probability >= 30 else "MONITORING"
        }

        return alert_payload

alert_engine = AlertEngine()
