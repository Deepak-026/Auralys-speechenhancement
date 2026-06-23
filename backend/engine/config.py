import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "..", "uploads")
OUTPUTS_DIR = os.path.join(BASE_DIR, "..", "outputs")
TEMP_DIR = os.path.join(BASE_DIR, "..", "temp")

MAX_FILE_SIZE_MB = 100
SUPPORTED_FORMATS = [".wav", ".mp3", ".opus"]

MODEL_REGISTRY = {
    "sepformer-wham16k": {
        "name": "SepFormer WHAM 16kHz",
        "description": "SpeechBrain SepFormer trained on WHAM! dataset — excellent for real-world noise",
        "adapter": "speechbrain_model",
        "source": "speechbrain/sepformer-wham16k-enhancement",
        "input_sample_rate": 16000,
        "input_channels": 1,
        "input_dtype": "float32",
    }
}
DEFAULT_MODEL = "sepformer-wham16k"

PRETRAINED_MODELS_DIR = os.path.join(BASE_DIR, "pretrained_models")
os.makedirs(PRETRAINED_MODELS_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(OUTPUTS_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)
