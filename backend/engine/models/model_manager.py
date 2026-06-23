from typing import Dict
from engine.models.base_model import BaseEnhancementModel
from engine.config import MODEL_REGISTRY, DEFAULT_MODEL
from engine.utils.exceptions import ModelError
from engine.utils.logger import get_logger

logger = get_logger(__name__)

_model_cache: Dict[str, BaseEnhancementModel] = {}


def get_model(model_key: str = None) -> BaseEnhancementModel:
    """Return a loaded model instance for the given model key.

    Lazily loads and caches adapters. Raises ModelError if key is unknown.
    """
    key = model_key or DEFAULT_MODEL

    if key in _model_cache:
        logger.info(f"Using cached model: {key}")
        return _model_cache[key]

    if key not in MODEL_REGISTRY:
        available = ", ".join(MODEL_REGISTRY.keys())
        raise ModelError(
            f"Unknown model '{key}'. Available models: {available}"
        )

    config = MODEL_REGISTRY[key]
    adapter_name = config["adapter"]

    adapter = _load_adapter(adapter_name)
    adapter.load()

    _model_cache[key] = adapter
    logger.info(f"Model '{key}' loaded and cached.")
    return adapter


def _load_adapter(adapter_name: str) -> BaseEnhancementModel:
    """Dynamically import and instantiate the adapter class."""
    if adapter_name == "speechbrain_model":
        from engine.models.speechbrain_model.adapter import SpeechBrainSepFormerAdapter
        return SpeechBrainSepFormerAdapter()

    raise ModelError(
        f"Unknown adapter '{adapter_name}'. "
        "Register new adapters in models/model_manager.py."
    )


def list_models() -> list:
    """Return list of available model configs."""
    return [
        {
            "id": key,
            "name": cfg["name"],
            "description": cfg["description"],
            "input_sample_rate": cfg["input_sample_rate"],
            "input_channels": cfg["input_channels"],
        }
        for key, cfg in MODEL_REGISTRY.items()
    ]
