# YOLO Vision Model Integration

## How to replace with your trained YOLO weights:
1. Place your trained YOLO weights file as `best.pt` in this directory: `models/yolo_model/best.pt`.
   (Or set `YOLO_MODEL_PATH` in environment variables).
2. Edit `model_config.json` if your classes differ:
   - `classes`: Array of class label strings.
   - `class_severity_mapping`: Maps each class to MODERATE, HIGH, or CRITICAL.
   - `confidence_threshold`: Minimum confidence cutoff (default 0.25).
3. The backend will automatically detect `best.pt` and switch from the placeholder interface to real production inference immediately!
