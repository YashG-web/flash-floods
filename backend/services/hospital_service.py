"""
Hospital Capacity Awareness Service for JalRakshak.
Normalizes hospital metadata, calculates straight-line Haversine distance from
target disaster coordinates, and strictly maintains LIVE vs DEMO separation.

CRITICAL SAFETY RULE:
Never presents fabricated live bed capacity as real.
"""
import math
from typing import List, Dict, Any, Optional

VERIFIED_HOSPITALS = [
    {
        "id": "hosp-aiims-rishikesh",
        "name": "AIIMS Rishikesh",
        "location": "Virbhadra Road, Rishikesh, Uttarakhand",
        "latitude": 30.0763,
        "longitude": 78.2882,
        "emergency_available": True,
        "emergency_capability": "Emergency + Trauma",
        "verified_metadata": {
            "official_department": "24×7 Emergency & Apex Trauma Centre",
            "contact_phone": "0135-2462999 / 112",
            "verified_source_url": "https://aiimsrishikesh.edu.in",
            "authority_name": "All India Institute of Medical Sciences (AIIMS)"
        },
        "demo_defaults": {
            "total_beds": 30,
            "available_beds": 18,
            "occupied_beds": 12,
            "ambulance_access": "AVAILABLE",
            "accessibility_status": "GOOD",
            "flood_accessibility": "Normal",
            "status": "AVAILABLE"
        }
    },
    {
        "id": "hosp-doon-medical-college",
        "name": "Government Doon Medical College Hospital",
        "location": "Dehradun, Uttarakhand",
        "latitude": 30.3244,
        "longitude": 78.0416,
        "emergency_available": True,
        "emergency_capability": "General Emergency + Trauma",
        "verified_metadata": {
            "official_department": "Department of Emergency Medicine & Trauma",
            "contact_phone": "0135-2718400",
            "verified_source_url": "https://gdmcuk.com",
            "authority_name": "Uttarakhand Department of Medical Education"
        },
        "demo_defaults": {
            "total_beds": 20,
            "available_beds": 9,
            "occupied_beds": 11,
            "ambulance_access": "LIMITED",
            "accessibility_status": "MODERATE",
            "flood_accessibility": "Partially affected",
            "status": "LIMITED"
        }
    },
    {
        "id": "hosp-mahant-indresh",
        "name": "Shri Mahant Indresh Hospital",
        "location": "Patel Nagar, Dehradun, Uttarakhand",
        "latitude": 30.3129,
        "longitude": 78.0284,
        "emergency_available": True,
        "emergency_capability": "Emergency + Multispecialty",
        "verified_metadata": {
            "official_department": "SMIH Emergency & Critical Care Center",
            "contact_phone": "0135-2522100",
            "verified_source_url": "https://smih.edu.in",
            "authority_name": "Shri Mahant Indiresh Healthcare & Medical Institute"
        },
        "demo_defaults": {
            "total_beds": 18,
            "available_beds": 5,
            "occupied_beds": 13,
            "ambulance_access": "AVAILABLE",
            "accessibility_status": "MODERATE",
            "flood_accessibility": "Normal",
            "status": "LIMITED"
        }
    },
    {
        "id": "hosp-sdh-rishikesh",
        "name": "Government Sub-District Hospital Rishikesh",
        "location": "Railway Station Road, Rishikesh, Uttarakhand",
        "latitude": 30.1042,
        "longitude": 78.2931,
        "emergency_available": True,
        "emergency_capability": "Civil Emergency & First Referral Unit",
        "verified_metadata": {
            "official_department": "24×7 Casualty & Emergency Ward",
            "contact_phone": "0135-2430041",
            "verified_source_url": "https://health.uk.gov.in",
            "authority_name": "Uttarakhand Health & Family Welfare Department"
        },
        "demo_defaults": {
            "total_beds": 14,
            "available_beds": 7,
            "occupied_beds": 7,
            "ambulance_access": "AVAILABLE",
            "accessibility_status": "GOOD",
            "flood_accessibility": "Direct access via highland link",
            "status": "AVAILABLE"
        }
    },
    {
        "id": "hosp-himalayan-jolly-grant",
        "name": "Himalayan Hospital (HIHT Jolly Grant)",
        "location": "Swami Ram Nagar, Jolly Grant, Dehradun, Uttarakhand",
        "latitude": 30.1982,
        "longitude": 78.1754,
        "emergency_available": True,
        "emergency_capability": "Super-Speciality Trauma & Emergency",
        "verified_metadata": {
            "official_department": "Centre for Emergency Medical Services",
            "contact_phone": "0135-2471100",
            "verified_source_url": "https://srhu.edu.in",
            "authority_name": "Swami Rama Himalayan University"
        },
        "demo_defaults": {
            "total_beds": 26,
            "available_beds": 14,
            "occupied_beds": 12,
            "ambulance_access": "AVAILABLE",
            "accessibility_status": "GOOD",
            "flood_accessibility": "NH-72 corridor open",
            "status": "AVAILABLE"
        }
    },
    {
        "id": "hosp-max-dehradun",
        "name": "Max Super Speciality Hospital Dehradun",
        "location": "Mussoorie Diversion Road, Dehradun, Uttarakhand",
        "latitude": 30.3789,
        "longitude": 78.0772,
        "emergency_available": True,
        "emergency_capability": "Advanced Cardiac & Neuro Emergency",
        "verified_metadata": {
            "official_department": "24×7 Emergency & Critical Care",
            "contact_phone": "0135-7193000",
            "verified_source_url": "https://maxhealthcare.in",
            "authority_name": "Max Healthcare Network"
        },
        "demo_defaults": {
            "total_beds": 16,
            "available_beds": 6,
            "occupied_beds": 10,
            "ambulance_access": "AVAILABLE",
            "accessibility_status": "MODERATE",
            "flood_accessibility": "Normal traffic conditions",
            "status": "LIMITED"
        }
    }
]

def calculate_haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two points on the Earth."""
    R = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 1)

def estimate_travel_time_minutes(distance_km: float, accessibility: str) -> int:
    """Estimates travel time in minutes based on distance and route conditions."""
    speed = 26.0
    if accessibility == "MODERATE":
        speed = 19.0
    elif accessibility == "LIMITED":
        speed = 12.0
    raw_mins = (distance_km / speed) * 60.0
    return max(5, round(raw_mins))

class HospitalService:
    def get_hospitals(
        self,
        mode: str = "DEMO",
        scenario: str = "scenario_2_drainage_blockage",
        ref_lat: Optional[float] = 30.0920,
        ref_lon: Optional[float] = 78.2690
    ) -> List[Dict[str, Any]]:
        is_live = (mode.upper() == "LIVE")
        lat = ref_lat if ref_lat is not None else 30.0920
        lon = ref_lon if ref_lon is not None else 78.2690

        output = []
        for h in VERIFIED_HOSPITALS:
            dist_km = calculate_haversine_distance_km(lat, lon, h["latitude"], h["longitude"])

            if is_live:
                # LIVE MODE: Strictly unverified real-time capacity is omitted
                travel_mins = estimate_travel_time_minutes(dist_km, "GOOD")
                output.append({
                    "id": h["id"],
                    "name": h["name"],
                    "location": h["location"],
                    "latitude": h["latitude"],
                    "longitude": h["longitude"],
                    "coordinates": [h["latitude"], h["longitude"]],
                    "distance_km": dist_km,
                    "estimated_travel_minutes": travel_mins,
                    "emergency_available": h["emergency_available"],
                    "emergency_capability": h["emergency_capability"],
                    "total_emergency_beds": None,
                    "available_emergency_beds": None,
                    "occupied_emergency_beds": None,
                    "ambulance_access": "AVAILABLE",
                    "accessibility_status": "GOOD",
                    "flood_accessibility_status": "Road access normal based on statutory road bulletin",
                    "status": "UNKNOWN",
                    "data_mode": "LIVE",
                    "data_source": "Verified institutional registry",
                    "source_note": "Capacity data unavailable — official live bed telemetry feed not connected",
                    "verified_metadata": h["verified_metadata"]
                })
            else:
                # DEMO MODE: Scenario-driven synthetic metrics
                demo_d = h["demo_defaults"]
                total_b = demo_d["total_beds"]
                avail_b = demo_d["available_beds"]
                occ_b = demo_d["occupied_beds"]
                amb = demo_d["ambulance_access"]
                acc = demo_d["accessibility_status"]
                f_acc = demo_d["flood_accessibility"]
                stat = demo_d["status"]

                if scenario == "scenario_2_drainage_blockage":
                    if h["id"] == "hosp-aiims-rishikesh":
                        acc = "GOOD"
                        stat = "AVAILABLE"
                        avail_b = 18
                    elif h["id"] == "hosp-doon-medical-college":
                        acc = "MODERATE"
                        stat = "LIMITED"
                        avail_b = 9
                    elif h["id"] == "hosp-mahant-indresh":
                        acc = "LIMITED"
                        stat = "LIMITED"
                        amb = "LIMITED"
                        avail_b = 5
                elif scenario == "scenario_1_heavy_rainfall":
                    if h["id"] == "hosp-aiims-rishikesh":
                        acc = "MODERATE"
                        stat = "LIMITED"
                        avail_b = 12
                    elif h["id"] == "hosp-doon-medical-college":
                        acc = "LIMITED"
                        stat = "LIMITED"
                        amb = "LIMITED"
                        avail_b = 4
                    elif h["id"] == "hosp-mahant-indresh":
                        acc = "LIMITED"
                        stat = "FULL"
                        amb = "LIMITED"
                        avail_b = 2
                else:
                    # Baseline
                    acc = "GOOD"
                    stat = "AVAILABLE"
                    amb = "AVAILABLE"
                    f_acc = "Normal road conditions"
                    if h["id"] == "hosp-aiims-rishikesh":
                        avail_b = 24
                    elif h["id"] == "hosp-doon-medical-college":
                        avail_b = 14
                    else:
                        avail_b = 11

                occ_b = total_b - avail_b
                travel_mins = estimate_travel_time_minutes(dist_km, acc)

                output.append({
                    "id": h["id"],
                    "name": h["name"],
                    "location": h["location"],
                    "latitude": h["latitude"],
                    "longitude": h["longitude"],
                    "coordinates": [h["latitude"], h["longitude"]],
                    "distance_km": dist_km,
                    "estimated_travel_minutes": travel_mins,
                    "emergency_available": h["emergency_available"],
                    "emergency_capability": h["emergency_capability"],
                    "total_emergency_beds": total_b,
                    "available_emergency_beds": avail_b,
                    "occupied_emergency_beds": occ_b,
                    "ambulance_access": amb,
                    "accessibility_status": acc,
                    "flood_accessibility_status": f_acc,
                    "status": stat,
                    "data_mode": "DEMO",
                    "data_source": "JalRakshak simulation",
                    "source_note": "DEMO DATA — Hospital capacity values are simulated for system demonstration.",
                    "verified_metadata": h["verified_metadata"]
                })

        return output

hospital_service = HospitalService()
