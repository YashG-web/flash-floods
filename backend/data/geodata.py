"""
Geographical, Sensor, Infrastructure, and Historical Data Layer for JALRAKSHAK.
Coordinates centered around the high-risk Himalayan foothills / river basin corridor (Lat: 30.0869, Lon: 78.2676).
"""

WARDS_AND_VILLAGES = [
    {
        "id": "ward-12",
        "name": "Ward 12 (Station Road & Central Bazaar)",
        "type": "WARD",
        "coordinates": [30.0920, 78.2690],
        "polygon": [
            [30.0880, 78.2640],
            [30.0960, 78.2650],
            [30.0970, 78.2740],
            [30.0890, 78.2730]
        ],
        "elevation": 348.0,
        "slope": 4.5,
        "soil_moisture": 81.5,
        "rainfall": 42.0,
        "drainage_condition": 22.0, # CRITICALLY CHOKED
        "historical_events": 4,
        "sensor_water_level": 2.1,
        "impervious_surface_pct": 82.0,
        "citizen_reports_count": 14,
        "waterlogging_trend": "increasing",
        "expected_window": "Next 1–3 Hours",
        "risk_trend": "Increasing ↑",
        "primary_drain_id": "DRN-CENTRAL-01"
    },
    {
        "id": "ward-04",
        "name": "Ward 04 (Riverfront Embankment & Lowlands)",
        "type": "WARD",
        "coordinates": [30.0840, 78.2610],
        "polygon": [
            [30.0810, 78.2570],
            [30.0870, 78.2580],
            [30.0860, 78.2660],
            [30.0800, 78.2640]
        ],
        "elevation": 332.0,
        "slope": 2.1,
        "soil_moisture": 92.0,
        "rainfall": 94.0, # EXTREME RAIN
        "drainage_condition": 68.0,
        "historical_events": 6,
        "sensor_water_level": 4.6, # DANGER LEVEL
        "impervious_surface_pct": 58.0,
        "citizen_reports_count": 8,
        "waterlogging_trend": "critical",
        "expected_window": "Next 1–2 Hours",
        "risk_trend": "Surging ↑↑",
        "primary_drain_id": "DRN-RIVER-04"
    },
    {
        "id": "village-sangam",
        "name": "Village Sangam (Tributary Confluence)",
        "type": "VILLAGE",
        "coordinates": [30.1040, 78.2830],
        "polygon": [
            [30.0980, 78.2760],
            [30.1030, 78.2740],
            [30.1080, 78.2770],
            [30.1110, 78.2830],
            [30.1100, 78.2900],
            [30.1050, 78.2930],
            [30.0990, 78.2910],
            [30.0965, 78.2830]
        ],
        "elevation": 385.0,
        "slope": 9.2,
        "soil_moisture": 74.0,
        "rainfall": 68.0,
        "drainage_condition": 78.0,
        "historical_events": 3,
        "sensor_water_level": 3.2,
        "impervious_surface_pct": 28.0,
        "citizen_reports_count": 3,
        "waterlogging_trend": "moderate",
        "expected_window": "Next 3–6 Hours",
        "risk_trend": "Increasing ↑",
        "primary_drain_id": "DRN-SANGAM-NATURAL"
    },
    {
        "id": "village-shivpuri",
        "name": "Village Shivpuri (Upper Valley Riparian)",
        "type": "VILLAGE",
        "coordinates": [30.1350, 78.3150],
        "polygon": [
            [30.1280, 78.3070],
            [30.1340, 78.3050],
            [30.1410, 78.3090],
            [30.1430, 78.3170],
            [30.1400, 78.3240],
            [30.1330, 78.3250],
            [30.1270, 78.3200],
            [30.1260, 78.3120]
        ],
        "elevation": 440.0,
        "slope": 14.5,
        "soil_moisture": 84.0,
        "rainfall": 78.0,
        "drainage_condition": 82.0,
        "historical_events": 4,
        "sensor_water_level": 3.8,
        "impervious_surface_pct": 22.0,
        "citizen_reports_count": 2,
        "waterlogging_trend": "increasing",
        "expected_window": "Next 2–4 Hours",
        "risk_trend": "Surging ↑↑",
        "primary_drain_id": "DRN-SHIVPURI-01"
    },
    {
        "id": "village-tapovan",
        "name": "Village Tapovan (Foothill Terraces)",
        "type": "VILLAGE",
        "coordinates": [30.1220, 78.3280],
        "polygon": [
            [30.1160, 78.3210],
            [30.1210, 78.3190],
            [30.1270, 78.3230],
            [30.1290, 78.3310],
            [30.1260, 78.3370],
            [30.1190, 78.3360],
            [30.1150, 78.3300],
            [30.1140, 78.3240]
        ],
        "elevation": 410.0,
        "slope": 11.0,
        "soil_moisture": 68.0,
        "rainfall": 52.0,
        "drainage_condition": 88.0,
        "historical_events": 2,
        "sensor_water_level": 2.4,
        "impervious_surface_pct": 32.0,
        "citizen_reports_count": 1,
        "waterlogging_trend": "stable",
        "expected_window": "Next 4–8 Hours",
        "risk_trend": "Moderate →",
        "primary_drain_id": "DRN-TAPOVAN-01"
    },
    {
        "id": "village-kaudiyala",
        "name": "Village Kaudiyala (River Gorge)",
        "type": "VILLAGE",
        "coordinates": [30.0680, 78.2520],
        "polygon": [
            [30.0610, 78.2450],
            [30.0670, 78.2430],
            [30.0730, 78.2470],
            [30.0750, 78.2550],
            [30.0720, 78.2610],
            [30.0650, 78.2600],
            [30.0600, 78.2540],
            [30.0590, 78.2480]
        ],
        "elevation": 360.0,
        "slope": 16.8,
        "soil_moisture": 79.0,
        "rainfall": 64.0,
        "drainage_condition": 75.0,
        "historical_events": 5,
        "sensor_water_level": 3.6,
        "impervious_surface_pct": 18.0,
        "citizen_reports_count": 2,
        "waterlogging_trend": "moderate",
        "expected_window": "Next 2–5 Hours",
        "risk_trend": "Increasing ↑",
        "primary_drain_id": "DRN-KAUDIYALA-01"
    },
    {
        "id": "hill-corridor-8",
        "name": "Hill Road Corridor 8 (Steep Escarpment)",
        "type": "LANDSLIDE_ZONE",
        "coordinates": [30.1150, 78.2540],
        "polygon": [
            [30.1100, 78.2480],
            [30.1220, 78.2510],
            [30.1200, 78.2610],
            [30.1080, 78.2590]
        ],
        "elevation": 680.0,
        "slope": 34.5, # VERY STEEP
        "soil_moisture": 86.0,
        "rainfall": 52.0,
        "drainage_condition": 65.0,
        "historical_events": 5,
        "sensor_water_level": 1.1,
        "impervious_surface_pct": 14.0,
        "citizen_reports_count": 2,
        "waterlogging_trend": "stable",
        "expected_window": "Next 2–4 Hours",
        "risk_trend": "Increasing ↑",
        "primary_drain_id": "DRN-CULVERT-NH58"
    },
    {
        "id": "ward-01",
        "name": "Ward 01 (Upper Cantonment Ridge)",
        "type": "WARD",
        "coordinates": [30.0760, 78.2720],
        "polygon": [
            [30.0720, 78.2670],
            [30.0800, 78.2690],
            [30.0790, 78.2780],
            [30.0710, 78.2750]
        ],
        "elevation": 420.0,
        "slope": 8.0,
        "soil_moisture": 42.0,
        "rainfall": 18.0,
        "drainage_condition": 92.0, # Pristine drainage
        "historical_events": 0,
        "sensor_water_level": 0.4,
        "impervious_surface_pct": 35.0,
        "citizen_reports_count": 0,
        "waterlogging_trend": "none",
        "expected_window": "Safe (No threat)",
        "risk_trend": "Stable →",
        "primary_drain_id": "DRN-CANTON-01"
    }
]

RIVER_NETWORKS = [
    {
        "id": "RIV-MAIN-01",
        "name": "Main River Trunk (Bhagirathi River)",
        "type": "RIVER",
        "coordinates": [
            [30.1250, 78.2420],
            [30.1110, 78.2550],
            [30.0970, 78.2610],
            [30.0840, 78.2630],
            [30.0700, 78.2660]
        ],
        "flow_rate_cumecs": 412.0,
        "danger_mark_m": 4.5,
        "current_level_m": 4.1,
        "status": "WARNING"
    },
    {
        "id": "RIV-TRIB-02",
        "name": "Chandrabhaga Torrent Nullah",
        "type": "TRIBUTARY",
        "coordinates": [
            [30.1080, 78.2950],
            [30.1020, 78.2820],
            [30.0930, 78.2720],
            [30.0880, 78.2640]
        ],
        "flow_rate_cumecs": 88.0,
        "danger_mark_m": 2.8,
        "current_level_m": 2.7,
        "status": "HIGH"
    }
]

DRAINAGE_LINES = [
    {
        "id": "DRN-01",
        "name": "Station Road Covered Box Culvert",
        "status": "CHOKED", # DRAINAGE BLOCKAGE ISSUE!
        "efficiency_pct": 18,
        "coordinates": [
            [30.0945, 78.2665],
            [30.0920, 78.2690],
            [30.0895, 78.2715]
        ],
        "cause_factor": "Silt sedimentation and plastic bag choking at inlet grating"
    },
    {
        "id": "DRN-02",
        "name": "Bazaar Stormwater Arterial Drain",
        "status": "RESTRICTED",
        "efficiency_pct": 45,
        "coordinates": [
            [30.0960, 78.2710],
            [30.0910, 78.2725],
            [30.0865, 78.2650]
        ],
        "cause_factor": "Encroachment over outfall collar"
    },
    {
        "id": "DRN-03",
        "name": "Upper Ridge Open Concrete Outfall",
        "status": "FUNCTIONAL",
        "efficiency_pct": 94,
        "coordinates": [
            [30.0790, 78.2720],
            [30.0750, 78.2690]
        ],
        "cause_factor": "Free gravitational outfall clear"
    }
]

IOT_SENSORS = [
    {
        "id": "SEN-RG-01",
        "name": "Tipping Bucket Rain Gauge (Ward 12)",
        "type": "Rain Gauge",
        "coordinates": [30.0930, 78.2705],
        "current_value": "42.0 mm/h",
        "raw_value": 42.0,
        "unit": "mm/h",
        "normal_range": "0 - 30 mm/h",
        "status": "MODERATE",
        "status_color": "#eab308",
        "trend": "STABLE",
        "last_update": "3 mins ago",
        "is_simulated": True
    },
    {
        "id": "SEN-RG-02",
        "name": "Riverfront Optical Rain Gauge (Ward 04)",
        "type": "Rain Gauge",
        "coordinates": [30.0835, 78.2605],
        "current_value": "94.0 mm/h",
        "raw_value": 94.0,
        "unit": "mm/h",
        "normal_range": "0 - 30 mm/h",
        "status": "CRITICAL",
        "status_color": "#dc2626",
        "trend": "RISING ↑",
        "last_update": "1 min ago",
        "is_simulated": True
    },
    {
        "id": "SEN-SM-01",
        "name": "Soil Moisture TDR Sensor (Hill Corridor 8)",
        "type": "Soil Moisture",
        "coordinates": [30.1160, 78.2530],
        "current_value": "86.0%",
        "raw_value": 86.0,
        "unit": "%",
        "normal_range": "20 - 65%",
        "status": "CRITICAL",
        "status_color": "#dc2626",
        "trend": "RISING ↑",
        "last_update": "2 mins ago",
        "is_simulated": True
    },
    {
        "id": "SEN-WL-01",
        "name": "Ultrasonic River Water Level Gauge (Ganga Bridge)",
        "type": "Water Level",
        "coordinates": [30.0850, 78.2635],
        "current_value": "4.6 m",
        "raw_value": 4.6,
        "unit": "m",
        "normal_range": "0.5 - 3.2 m",
        "status": "CRITICAL",
        "status_color": "#dc2626",
        "trend": "SURGING ↑↑",
        "last_update": "Just now",
        "is_simulated": True
    },
    {
        "id": "SEN-DR-01",
        "name": "Doppler Ultrasonic Drainage Flow Gauge (Station Road Nullah)",
        "type": "Drainage Sensor",
        "coordinates": [30.0915, 78.2685],
        "current_value": "0.18 m/s (Surcharged / Choked)",
        "raw_value": 0.18,
        "unit": "m/s",
        "normal_range": "1.2 - 2.8 m/s",
        "status": "CRITICAL",
        "status_color": "#dc2626",
        "trend": "FALLING ↓ (BACKWATER CHOKE)",
        "last_update": "2 mins ago",
        "is_simulated": True
    },
    {
        "id": "SEN-SL-01",
        "name": "MEMS Inclinometer & Piezometer (Scarp Cut)",
        "type": "Slope Sensor",
        "coordinates": [30.1180, 78.2560],
        "current_value": "0.14° displacement",
        "raw_value": 0.14,
        "unit": "deg",
        "normal_range": "0 - 0.05°",
        "status": "HIGH",
        "status_color": "#f97316",
        "trend": "DISPLACING ↑",
        "last_update": "4 mins ago",
        "is_simulated": True
    }
]

CITIZEN_REPORTS = [
    {
        "id": "REP-2026-104",
        "location_id": "ward-12",
        "location_name": "Station Road near Sharda Market",
        "coordinates": [30.0925, 78.2692],
        "timestamp": "13:18 IST",
        "severity": "CRITICAL",
        "description": "Water entering shops on Station Road. Main culvert inlet clogged with plastic garbage and broken branches. Water at knee height.",
        "image_url": "/assets/sample_waterlog.jpg",
        "status": "VERIFIED_BY_VISION",
        "yolo_detections": [
            {"label": "blocked_drain_culvert", "conf": 94.2},
            {"label": "waterlogged_road", "conf": 98.7},
            {"label": "submerged_vehicle", "conf": 89.1}
        ]
    },
    {
        "id": "REP-2026-098",
        "location_id": "ward-04",
        "location_name": "River Bund Ghat Link",
        "coordinates": [30.0845, 78.2618],
        "timestamp": "13:05 IST",
        "severity": "HIGH",
        "description": "River backflow coming onto embankment steps. Current very rapid.",
        "image_url": "/assets/hero.jpg",
        "status": "DISPATCHED",
        "yolo_detections": [
            {"label": "waterlogged_road", "conf": 92.4}
        ]
    }
]

CRITICAL_INFRASTRUCTURE = [
    {"id": "INF-HOSP-01", "name": "Civil District Hospital", "type": "Hospital", "coordinates": [30.0890, 78.2625], "status": "Operational", "elevation": 352},
    {"id": "INF-SCH-01", "name": "Govt Higher Secondary School", "type": "School / Relief Shelter", "coordinates": [30.0935, 78.2710], "status": "At Risk", "elevation": 346},
    {"id": "INF-SUB-01", "name": "Station Feeder Substation 11kV", "type": "Power Substation", "coordinates": [30.0910, 78.2675], "status": "Hazard Zone", "elevation": 344},
    {"id": "INF-BRG-01", "name": "Station Nullah Arch Culvert Bridge", "type": "Bridge", "coordinates": [30.0922, 78.2688], "status": "Surcharged", "elevation": 345}
]

HISTORICAL_EVENTS = [
    {
        "id": "HIST-2023-01",
        "title": "Station Road Severe Backflow & Drainage Failure",
        "date": "2023-07-14",
        "location": "Ward 12 (Station Road)",
        "coordinates": [30.0920, 78.2690],
        "event_type": "Drainage Blockage Flood",
        "severity": "HIGH",
        "rainfall_conditions": "48 mm/hr (Moderate Rainfall Event)",
        "affected_area": "1.2 sq km, 45 commercial establishments inundated",
        "casualties": 0,
        "cause_analysis": "Culvert choked with urban packaging waste; backwater flooded 37 basements despite rainfall not reaching extreme cloudburst thresholds."
    },
    {
        "id": "HIST-2021-02",
        "title": "Chamoli & Downstream Flash Surge",
        "date": "2021-02-07",
        "location": "River Valley Riparian Zone",
        "coordinates": [30.0840, 78.2610],
        "event_type": "Glacial Lake Outburst / Flash Flood",
        "severity": "CRITICAL",
        "rainfall_conditions": "Upstream breach with 110 mm/hr antecedent rain",
        "affected_area": "4.5 sq km along river channel",
        "casualties": 14,
        "cause_analysis": "Catastrophic river discharge surge exceeding bund crest by 1.8 meters."
    },
    {
        "id": "HIST-2013-03",
        "title": "Uttarakhand Cloudburst Basin Overload",
        "date": "2013-06-16",
        "location": "Upper Basin & Sangam Tributary",
        "coordinates": [30.1040, 78.2830],
        "event_type": "Rainfall Overload Mega-Flood",
        "severity": "CRITICAL",
        "rainfall_conditions": "142 mm/hr Extreme Cloudburst",
        "affected_area": "Regional basin devastation",
        "casualties": 52,
        "cause_analysis": "Antecedent continuous rain followed by multiple cloudburst cells; saturated soil failed entirely."
    },
    {
        "id": "HIST-2024-04",
        "title": "NH-58 Km 42 Slope Slide & Debris Barrier",
        "date": "2024-08-11",
        "location": "Hill Road Corridor 8",
        "coordinates": [30.1150, 78.2540],
        "event_type": "Rain-Induced Landslide",
        "severity": "HIGH",
        "rainfall_conditions": "58 mm/hr for 4 continuous hours",
        "affected_area": "800m highway blockage, 2 culverts crushed",
        "casualties": 0,
        "cause_analysis": "Slope cut oversteepened during widening, saturated pore pressure triggered rotational planar slip."
    }
]

RISK_TIMELINE_STAGES = [
    {
        "time": "12:00",
        "risk_level": "LOW",
        "risk_score": 24,
        "rainfall": "12 mm/h",
        "color": "#16a34a",
        "headline": "Routine Basin Monitoring",
        "description": "Precipitation commences; soil moisture nominal at 44%. Stormwater flowing freely."
    },
    {
        "time": "12:30",
        "risk_level": "MODERATE",
        "risk_score": 48,
        "rainfall": "32 mm/h",
        "color": "#eab308",
        "headline": "Rainfall Steady — Inlets Accumulating Litter",
        "description": "Rainfall rates increase to 32 mm/h. Drainage velocity reduces as debris collects on grates."
    },
    {
        "time": "13:00",
        "risk_level": "HIGH",
        "risk_score": 74,
        "rainfall": "42 mm/h",
        "color": "#f97316",
        "headline": "Station Nullah Choked — Backwater Rising",
        "description": "Drainage efficiency plunges to 25%. First citizen photo reports submitted with water on roadway."
    },
    {
        "time": "13:20",
        "risk_level": "CRITICAL",
        "risk_score": 87,
        "rainfall": "44 mm/h",
        "color": "#dc2626",
        "headline": "Localized Inundation Imminent",
        "description": "Drainage completely obstructed. Water enters 12 roadside shops. AI Risk Engine triggers critical threshold."
    },
    {
        "time": "13:30",
        "risk_level": "ALERT ISSUED",
        "risk_score": 87,
        "rainfall": "42 mm/h",
        "color": "#991b1b",
        "headline": "🚨 FLASH FLOOD & DRAINAGE ALERT DISPATCHED",
        "description": "Automated Early Warning sent to SDRF, Municipal QRT, and traffic diversion teams."
    }
]
