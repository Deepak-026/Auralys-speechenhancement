import numpy as np
from typing import Dict, Any
from engine.pipeline.postprocessing.validator import validate_model_output
from engine.pipeline.postprocessing.restorer import restore_waveform
from engine.pipeline.postprocessing.finisher import apply_finishing
from engine.pipeline.postprocessing.encoder import encode_and_save
from engine.utils.logger import get_logger

logger = get_logger(__name__)


def run_postprocessing(
    enhanced_waveform: np.ndarray,
    sample_rate: int,
    job_id: str,
    original_peak: float = None,
    output_format: str = "wav",
    output_dir: str = None,
    apply_loudness_norm: bool = True,
) -> Dict[str, Any]:
    """Run the full postprocessing pipeline.

    Returns:
        {
            "output_path": str,
            "output_metadata": dict,
        }
    """
    logger.info(f"Starting postprocessing pipeline for job: {job_id}")

    # Step 1: Validate model output
    validate_model_output(enhanced_waveform)

    # Step 2: Restore amplitude, clamp, ensure float32
    waveform = restore_waveform(enhanced_waveform, original_peak=original_peak)

    # Step 3: Finishing — fade in/out, loudness norm, peak limit
    waveform = apply_finishing(
        waveform,
        sample_rate,
        apply_loudness_norm=apply_loudness_norm,
        apply_fade_io=True,
        apply_peak_limit=True,
    )

    # Step 4: Encode and save
    result = encode_and_save(
        waveform,
        sample_rate,
        job_id=job_id,
        output_format=output_format,
        output_dir=output_dir,
    )

    logger.info(f"Postprocessing complete: {result['output_metadata']['filename']}")
    return result
