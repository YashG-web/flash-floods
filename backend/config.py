import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "JALRAKSHAK"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Model Paths
    FLOOD_MODEL_DIR: str = os.getenv("FLOOD_MODEL_DIR", str(BASE_DIR / "models" / "flood_model"))
    FLOOD_MODEL_PATH: str = os.getenv("FLOOD_MODEL_PATH", str(BASE_DIR / "models" / "flood_model" / "model.pkl"))
    FLOOD_CONFIG_PATH: str = os.getenv("FLOOD_CONFIG_PATH", str(BASE_DIR / "models" / "flood_model" / "model_config.json"))
    
    YOLO_MODEL_DIR: str = os.getenv("YOLO_MODEL_DIR", str(BASE_DIR / "models" / "yolo_model"))
    YOLO_MODEL_PATH: str = os.getenv("YOLO_MODEL_PATH", str(BASE_DIR / "models" / "yolo_model" / "best.pt"))
    YOLO_CONFIG_PATH: str = os.getenv("YOLO_CONFIG_PATH", str(BASE_DIR / "models" / "yolo_model" / "model_config.json"))
    
    # Demo and Live mode settings
    DEMO_MODE_DEFAULT: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings()
