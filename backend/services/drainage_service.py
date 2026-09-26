"""
Drainage Manhole & Sewer Asset Intelligence Service for JalRakshak.
Loads and indexes jalrakshak_mumbai_drainage_manhole_450.json at startup.
Provides sub-millisecond search across Road, Area, and Ward, and dynamic
hydraulic diagnosis combining physical drainage properties with rainfall,
accumulation, and citizen report inputs.
"""
import os
import json
from typing import List, Dict, Any, Optional

DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "jalrakshak_mumbai_drainage_manhole_450.json")

class DrainageService:
    def __init__(self, data_path: str = DATA_FILE):
        self.data_path = data_path
        self.records: List[Dict[str, Any]] = []
        self.records_by_sr: Dict[int, Dict[str, Any]] = {}
        self.loaded: bool = False
        self._load_data()

    def _load_data(self):
        if not os.path.exists(self.data_path):
            print(f"[DrainageService] Warning: Data file {self.data_path} not found.")
            return

        try:
            with open(self.data_path, "r", encoding="utf-8") as f:
                self.records = json.load(f)
            
            for item in self.records:
                sr = item.get("sr_no")
                if sr is not None:
                    self.records_by_sr[int(sr)] = item
            
            self.loaded = True
            print(f"[DrainageService] Successfully indexed {len(self.records)} drainage records from {self.data_path}.")
        except Exception as e:
            print(f"[DrainageService] Error loading data: {e}")

    def get_all_records(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        return self.records[offset:offset + limit]

    def get_record(self, sr_no: int) -> Optional[Dict[str, Any]]:
        return self.records_by_sr.get(sr_no)

    def search(self, query: str, limit: int = 15) -> List[Dict[str, Any]]:
        """
        Fast tokenized / substring search across road location, area, and ward.
        """
        if not query or not query.strip():
            return self.records[:limit]

        q = query.strip().lower()
        terms = q.split()

        matches = []
        for r in self.records:
            loc = r.get("sewer_stretch_location", "").lower()
            area = r.get("area", "").lower()
            ward = r.get("ward_or_zone", "").lower()
            combined = f"{loc} {area} {ward}"

            # Check if all terms match
            if all(term in combined for term in terms):
                matches.append(r)
                if len(matches) >= limit:
                    break

        return matches

    def diagnose(
        self,
        sr_no: int,
        mode: str = "DEMO",
        rainfall_override: Optional[float] = None,
        accumulation_override: Optional[str] = None,
        reports_override: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Dynamic diagnostic engine based on physical sewer asset metrics and environmental inputs:
        - moderate rain + unusually high accumulation + stressed/choked drainage -> PROBABLE DRAINAGE BLOCKAGE
        - heavy rain + high accumulation + normal drainage -> RAINFALL-DRIVEN WATERLOGGING
        - low/moderate rain + normal drainage + low accumulation -> NORMAL DRAINAGE
        - high rain + poor drainage + high accumulation -> COMBINED WATERLOGGING RISK
        """
        rec = self.get_record(sr_no)
        if not rec and self.records:
            rec = self.records[0]

        if not rec:
            raise ValueError(f"No drainage record found for sr_no={sr_no}")

        road_segment = rec.get("sewer_stretch_location", "Main Corridor")
        area = rec.get("area", "Urban Catchment")
        ward = rec.get("ward_or_zone", "Zone 1")
        drainage_cond = (rec.get("drainage_condition") or "NORMAL").upper()
        drainage_risk = (rec.get("drainage_risk") or "MODERATE").upper()
        sewer_dia = rec.get("sewer_diameter_mm", 600)
        sewer_len = rec.get("sewer_length_m", 1000)
        manhole_count = rec.get("estimated_manhole_count", 30)
        manhole_spacing = rec.get("typical_manhole_spacing_m", 35)
        min_depth = rec.get("manhole_depth_min_m", 4.0)
        max_depth = rec.get("manhole_depth_max_m", 8.0)
        data_status = rec.get("data_status", "SYNTHETIC_PROTOTYPE_ESTIMATE")
        source_note = rec.get("source_note", "Prototype drainage model dataset")

        # In LIVE mode, values can be derived from live telemetry or query overrides.
        # In DEMO mode, values calibrate deterministically to the record's condition and risk.
        if mode.upper() == "LIVE":
            rainfall = rainfall_override if rainfall_override is not None else 32.0
            water_depth_text = accumulation_override or "Moderate (0.6 to 1.0 feet)"
            citizen_reports = reports_override if reports_override is not None else 6
        else:
            # Deterministic DEMO calibration
            if drainage_cond in ["CHOKED", "STRESSED"] and drainage_risk in ["HIGH", "CRITICAL", "MODERATE"]:
                # Classic blockage scenario: moderate rain (18-24 mm/h) with disproportionately high knee/waist depth
                rainfall = rainfall_override if rainfall_override is not None else 18.0
                water_depth_text = accumulation_override or "High (1.2 to 1.8 feet (Knee depth))"
                citizen_reports = reports_override if reports_override is not None else 14
            elif drainage_risk in ["CRITICAL", "HIGH"]:
                # High rain driven
                rainfall = rainfall_override if rainfall_override is not None else 78.0
                water_depth_text = accumulation_override or "High (1.5 to 2.2 feet)"
                citizen_reports = reports_override if reports_override is not None else 18
            else:
                # Nominal
                rainfall = rainfall_override if rainfall_override is not None else 8.0
                water_depth_text = accumulation_override or "Low (Normal road surface / Puddles)"
                citizen_reports = reports_override if reports_override is not None else 1

        is_stressed_or_choked = drainage_cond in ["STRESSED", "CHOKED"]
        is_high_accumulation = any(w in water_depth_text.lower() for w in ["high", "knee", "waist", "deep", "1.", "2."])
        is_moderate_rain = 12.0 <= rainfall < 45.0
        is_heavy_rain = rainfall >= 45.0
        is_low_rain = rainfall < 12.0

        # Classification matrix
        if is_moderate_rain and is_high_accumulation and is_stressed_or_choked:
            diag_state = "PROBABLE_BLOCKAGE"
            state_title = "PREDICTED DRAINAGE BLOCKAGE"
            status_label = "🟠 PREDICTED OBSTRUCTION"
            symbol = "🟠"
            bg_color = "bg-amber-500/15"
            border_color = "border-amber-400"
            text_color = "text-amber-900"
            headline = "Water is predicted to accumulate rapidly due to drainage obstruction."
            main_reason = "Probable Drainage Blockage — Field Verification Required"
            conclusion = "Water is predicted to accumulate unusually high for current rainfall."
            onset_time = "Starts in 20–35 minutes"
            peak_time = "Full backpressure in ~45 mins"
        elif is_heavy_rain and is_high_accumulation and not is_stressed_or_choked:
            diag_state = "RAINFALL_DRIVEN"
            state_title = "RAINFALL-DRIVEN WATERLOGGING"
            status_label = "🔴 EXTREME INTENSITY"
            symbol = "🔴"
            bg_color = "bg-red-500/15"
            border_color = "border-red-400"
            text_color = "text-red-900"
            headline = "High intensity precipitation exceeding gravity hydraulic design capacity."
            main_reason = "Precipitation Rate Exceeds Pipe Flow Capacity (No Blockage Detected)"
            conclusion = "Severe rainfall inundation occurs even while internal conduit flow remains clear."
            onset_time = "Starts in 10–20 minutes"
            peak_time = "Peak street surcharge in ~30 mins"
        elif (is_heavy_rain or is_moderate_rain) and is_stressed_or_choked and is_high_accumulation:
            diag_state = "COMBINED_RISK"
            state_title = "COMBINED WATERLOGGING RISK"
            status_label = "🔴 SEVERE DRAINAGE RESTRICTION"
            symbol = "🔴"
            bg_color = "bg-rose-500/15"
            border_color = "border-rose-400"
            text_color = "text-rose-900"
            headline = "Severe water accumulation driven by both intense rain and poor drainage condition."
            main_reason = "Probable Drainage Blockage & Hydraulic Overload — Field Verification Required"
            conclusion = "High rainfall combined with choked underground culvert leads to extensive street inundation."
            onset_time = "Immediate / Ongoing"
            peak_time = "Severe surcharge reaching crest in ~25 mins"
        else:
            diag_state = "NORMAL_DRAINAGE"
            state_title = "NORMAL DRAINAGE PREDICTED"
            status_label = "🟢 NORMAL DRAINAGE"
            symbol = "🟢"
            bg_color = "bg-emerald-500/10"
            border_color = "border-emerald-300"
            text_color = "text-emerald-900"
            headline = "Surface runoff is predicted to drain smoothly with no waterlogging expected."
            main_reason = "Nominal Gravity Flow — Clear Subsurface Conduits"
            conclusion = "Water accumulation is consistent with current rainfall."
            onset_time = "No waterlogging predicted"
            peak_time = "Clear flow maintained"

        # Probable Location identifier: Never invent manhole IDs
        probable_location = f"Drainage Point — {road_segment}"

        # Refined Actions including proper road details to avoid
        citizen_action = (
            f"Avoid {road_segment} in {area} (Ward {ward}) if possible. "
            f"Predicted runoff surcharge will pool in low-lying curb lanes. "
            f"Use alternate arterial corridors."
            if diag_state != "NORMAL_DRAINAGE"
            else f"{road_segment} in {area} is clear for normal transit."
        )

        authority_action = (
            f"Inspect nearby drainage nodes along {road_segment} ({probable_location}). "
            f"Check silt traps across {manhole_count} manholes and verify {sewer_dia}mm conduit clearance."
            if diag_state != "NORMAL_DRAINAGE"
            else f"Routine maintenance patrol along {road_segment}. {manhole_count} manholes at ~{manhole_spacing}m spacing nominal."
        )

        return {
            "record": {
                "sr_no": rec.get("sr_no"),
                "sewer_stretch_location": road_segment,
                "area": area,
                "ward_or_zone": ward,
                "sewer_diameter_mm": sewer_dia,
                "sewer_length_m": sewer_len,
                "manhole_depth_min_m": min_depth,
                "manhole_depth_max_m": max_depth,
                "estimated_manhole_count": manhole_count,
                "typical_manhole_spacing_m": manhole_spacing,
                "drainage_condition": drainage_cond,
                "drainage_risk": drainage_risk,
                "data_status": data_status,
                "source_note": source_note
            },
            "diagnosis": {
                "state": diag_state,
                "state_badge": {
                    "symbol": symbol,
                    "title": state_title,
                    "bg_class": bg_color,
                    "border_class": border_color,
                    "text_class": text_color
                },
                "status_label": status_label,
                "headline": headline,
                "main_reason": main_reason,
                "predicted_start_time": onset_time,
                "predicted_peak_time": peak_time,
                "probable_location": probable_location,
                "verification_notice": "Field verification required",
                "why": {
                    "rainfall_text": f"{'Light / Moderate' if rainfall < 30 else 'Heavy'} ({rainfall:.0f} mm/hr)",
                    "accumulation_text": water_depth_text,
                    "reports_text": f"Multiple ({citizen_reports} reports)" if citizen_reports > 1 else f"{citizen_reports} report",
                    "drainage_condition_text": f"{drainage_cond} ({sewer_dia}mm Ø)",
                    "summary": conclusion
                },
                "actions": {
                    "citizen": citizen_action,
                    "authority": authority_action
                }
            },
            "operating_mode": mode.upper()
        }

    def get_mumbai_geocoded_roads(self, rainfall_mm: float = 24.0) -> Dict[str, Any]:
        """
        Returns all 101 geocoded Mumbai roads with infrastructure data from JSON
        and dynamically calculated waterlogging risk based on rainfall intensity.
        """
        geo_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "mumbai_geocoded_roads.json")
        if not os.path.exists(geo_file):
            return {"success": False, "count": 0, "roads": {}}

        try:
            with open(geo_file, "r", encoding="utf-8") as f:
                roads_data = json.load(f)

            # Augment each road with dynamic risk calculation
            for road_name, road_info in roads_data.items():
                segments = road_info.get("segments", [])
                seg0 = segments[0] if segments else {}
                condition = seg0.get("drainage_condition", "NORMAL").upper()
                dia = seg0.get("sewer_diameter_mm", 600)

                # Dynamic risk formula:
                # Rainfall capacity threshold is proportional to sewer diameter
                # 450mm capacity ~ 25mm/hr; 800mm capacity ~ 45mm/hr; 1200mm+ ~ 70mm/hr
                capacity_mm_hr = (dia / 1000.0) * 55.0
                if condition in ["CHOKED", "COLLAPSED", "DAMAGED"]:
                    capacity_mm_hr *= 0.35
                elif condition in ["STRESSED", "POOR"]:
                    capacity_mm_hr *= 0.65
                elif condition == "GOOD":
                    capacity_mm_hr *= 1.25

                load_ratio = rainfall_mm / max(capacity_mm_hr, 10.0)

                if load_ratio > 1.6:
                    risk_level = "SEVERE"
                    cause = f"Precipitation ({rainfall_mm:.0f} mm/hr) vastly exceeds discharge capacity of {dia}mm conduit ({condition})"
                    verification = "Urgent Municipal Clearance Required"
                elif load_ratio > 1.1:
                    risk_level = "HIGH"
                    cause = f"Surcharge risk: {rainfall_mm:.0f} mm/hr near maximum hydraulic head of {dia}mm pipe ({condition})"
                    verification = "Field Patrol Recommended"
                elif load_ratio > 0.65:
                    risk_level = "MODERATE"
                    cause = f"Partial surface puddling. Stormwater drain operating under nominal strain"
                    verification = "Routine Monitoring"
                else:
                    risk_level = "LOW"
                    cause = f"Runoff within hydraulic envelope of {dia}mm sewer conduit"
                    verification = "Normal Status"

                road_info["dynamic_risk"] = {
                    "level": risk_level,
                    "rainfall_mm": rainfall_mm,
                    "drainage_condition": condition,
                    "sewer_diameter_mm": dia,
                    "primary_cause": cause,
                    "field_verification_required": verification,
                    "is_estimate": True
                }

            return {
                "success": True,
                "count": len(roads_data),
                "rainfall_evaluated_mm": rainfall_mm,
                "roads": roads_data
            }
        except Exception as e:
            return {"success": False, "error": str(e), "roads": {}}

drainage_service = DrainageService()

