import os
import json
import logging
from typing import Dict, Any
from PIL import Image
import io
from config import settings

logger = logging.getLogger("jalrakshak.image_analysis")

class ImageAnalysisService:
    def __init__(self):
        self.model = None
        self.config: Dict[str, Any] = {}
        self.is_loaded = False
        self.load_model()

    def load_model(self):
        """Checks for user-supplied YOLO weights."""
        config_path = settings.YOLO_CONFIG_PATH
        model_path = settings.YOLO_MODEL_PATH

        if os.path.exists(config_path):
            with open(config_path, "r") as f:
                self.config = json.load(f)
        else:
            self.config = {
                "classes": ["waterlogged_road", "blocked_drain_culvert", "submerged_vehicle", "flood_debris", "damaged_embankment"],
                "confidence_threshold": 0.25,
                "class_severity_mapping": {
                    "waterlogged_road": "MODERATE",
                    "blocked_drain_culvert": "HIGH",
                    "submerged_vehicle": "CRITICAL",
                    "flood_debris": "MODERATE",
                    "damaged_embankment": "CRITICAL"
                }
            }

        # Check if actual weights file is present and not an empty file
        if os.path.exists(model_path) and os.path.getsize(model_path) > 1000:
            try:
                from ultralytics import YOLO
                self.model = YOLO(model_path)
                self.is_loaded = True
                logger.info(f"Production YOLO model loaded successfully from {model_path}")
            except Exception as e:
                logger.warning(f"Failed to load YOLO model from {model_path}: {e}")
                self.model = None
                self.is_loaded = False
        else:
            logger.info("YOLO best.pt weights not yet provided. Interface is ready for user drop-in.")
            self.model = None
            self.is_loaded = False

    def analyze_image(self, image_bytes: bytes, filename: str = "", allow_demo: bool = True) -> Dict[str, Any]:
        """
        Runs real YOLO inference if user-supplied model is connected.
        Otherwise honestly reports that model is awaiting user weights.
        """
        try:
            image = Image.open(io.BytesIO(image_bytes))
            width, height = image.size
        except Exception as e:
            return {
                "success": False,
                "error": f"Invalid image format: {str(e)}",
                "model_connected": self.is_loaded
            }

        # If user has connected real trained model weights
        if self.is_loaded and self.model is not None:
            try:
                results = self.model.predict(
                    source=image,
                    conf=self.config.get("confidence_threshold", 0.25),
                    iou=self.config.get("iou_threshold", 0.45)
                )
                detections = []
                severity_hierarchy = {"LOW": 1, "MODERATE": 2, "HIGH": 3, "CRITICAL": 4}
                max_severity = "LOW"

                for r in results:
                    boxes = r.boxes
                    for box in boxes:
                        cls_id = int(box.cls[0].item())
                        cls_name = r.names.get(cls_id, str(cls_id)) if hasattr(r, "names") else str(cls_id)
                        conf = float(box.conf[0].item())
                        xyxy = box.xyxy[0].tolist()

                        norm_box = {
                            "xmin_pct": round((xyxy[0] / width) * 100, 2),
                            "ymin_pct": round((xyxy[1] / height) * 100, 2),
                            "xmax_pct": round((xyxy[2] / width) * 100, 2),
                            "ymax_pct": round((xyxy[3] / height) * 100, 2),
                            "width_pct": round(((xyxy[2] - xyxy[0]) / width) * 100, 2),
                            "height_pct": round(((xyxy[3] - xyxy[1]) / height) * 100, 2)
                        }

                        severity = self.config.get("class_severity_mapping", {}).get(cls_name, "MODERATE")
                        if severity_hierarchy.get(severity, 1) > severity_hierarchy.get(max_severity, 1):
                            max_severity = severity

                        detections.append({
                            "class_name": cls_name,
                            "confidence": round(conf * 100, 1),
                            "severity": severity,
                            "box": norm_box
                        })

                return {
                    "success": True,
                    "model_connected": True,
                    "is_placeholder": False,
                    "status_message": f"Real trained YOLO inference executed ({len(detections)} hazards detected)",
                    "detections_count": len(detections),
                    "detections": detections,
                    "overall_severity": max_severity,
                    "image_dimensions": {"width": width, "height": height}
                }
            except Exception as e:
                logger.error(f"YOLO inference failed: {e}")
                return {
                    "success": False,
                    "model_connected": True,
                    "is_placeholder": False,
                    "status_message": f"YOLO inference runtime error: {str(e)}",
                    "detections": []
                }

        # User model weights not yet connected
        if not allow_demo:
            return {
                "success": False,
                "model_connected": False,
                "is_placeholder": True,
                "status_message": "Model not connected — awaiting user-supplied YOLO model (models/yolo_model/best.pt)",
                "detections": [],
                "overall_severity": "AWAITING_MODEL"
            }

        # Honest UI Integration Preview
        demo_detections = [
            {
                "class_name": "blocked_drain_culvert",
                "confidence": 94.2,
                "severity": "HIGH",
                "box": {
                    "xmin_pct": 14.2,
                    "ymin_pct": 46.5,
                    "xmax_pct": 42.0,
                    "ymax_pct": 74.8,
                    "width_pct": 27.8,
                    "height_pct": 28.3
                },
                "notes": "Solid waste & debris blocking storm drain inlet grate [UI Interface Preview]"
            },
            {
                "class_name": "waterlogged_road",
                "confidence": 98.7,
                "severity": "CRITICAL",
                "box": {
                    "xmin_pct": 2.0,
                    "ymin_pct": 48.0,
                    "xmax_pct": 98.0,
                    "ymax_pct": 98.5,
                    "width_pct": 96.0,
                    "height_pct": 50.5
                },
                "notes": "Water sheet depth ~30 cm across carriageway [UI Interface Preview]"
            }
        ]

        return {
            "success": True,
            "model_connected": False,
            "is_placeholder": True,
            "status_message": "INTERFACE PREVIEW: YOLO best.pt weights not yet connected. Replace models/yolo_model/best.pt to enable live model vision.",
            "detections_count": len(demo_detections),
            "detections": demo_detections,
            "overall_severity": "HIGH",
            "image_dimensions": {"width": width, "height": height}
        }

image_analysis_service = ImageAnalysisService()
