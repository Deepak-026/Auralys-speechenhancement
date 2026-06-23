import numpy as np
from typing import Dict, Any
from engine.pipeline.preprocessing.validator import validate_audio_file
from engine.pipeline.preprocessing.decoder import decode_audio
from engine.pipeline.preprocessing.metadata_extractor import extract_metadata
from engine.pipeline.preprocessing.transformer import transform_audio
from engine.utils.logger import get_logger

logger = get_logger(__name__)


def run_preprocessing(file_path: str, model_input_spec: dict) -> Dict[str, Any]:
    """Run the full preprocessing pipeline.

    Returns:
        {
            "waveform": np.ndarray (float32, mono, resampled),
            "sample_rate": int,
            "metadata": dict,
        }
    """
    logger.info(f"Starting preprocessing pipeline for: {file_path}")

    # Step 1: Validate
    validate_audio_file(file_path)

    # Step 2: Decode to PCM
    raw_waveform, raw_sr = decode_audio(file_path)

    # Step 3: Extract metadata from raw decoded audio
    metadata = extract_metadata(file_path, raw_waveform, raw_sr)

    # Step 4: Transform to match model requirements
    processed_waveform = transform_audio(raw_waveform, raw_sr, model_input_spec)

    target_sr = model_input_spec.get("sample_rate", raw_sr)

    logger.info(
        f"Preprocessing complete: {metadata['filename']} → "
        f"shape={processed_waveform.shape}, sr={target_sr}"
    )

    return {
        "waveform": processed_waveform,
        "sample_rate": target_sr,
        "metadata": metadata,
    }
