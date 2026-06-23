import os
import time
import numpy as np
import soundfile as sf
from engine.config import OUTPUTS_DIR
from engine.utils.exceptions import EncodingError
from engine.utils.logger import get_logger

logger = get_logger(__name__)

SUPPORTED_OUTPUT_FORMATS = {"wav": "WAV", "flac": "FLAC"}


def encode_and_save(
    waveform: np.ndarray,
    sample_rate: int,
    job_id: str,
    output_format: str = "wav",
    output_dir: str = None,
) -> dict:
    """Encode the enhanced waveform and save to disk.

    Returns dict with output_path and output_metadata.
    """
    output_format = output_format.lower()
    if output_format not in SUPPORTED_OUTPUT_FORMATS:
        raise EncodingError(
            f"Unsupported output format '{output_format}'. "
            f"Supported: {', '.join(SUPPORTED_OUTPUT_FORMATS.keys())}"
        )

    out_dir = output_dir or OUTPUTS_DIR
    os.makedirs(out_dir, exist_ok=True)

    filename = f"enhanced_{job_id}.{output_format}"
    output_path = os.path.join(out_dir, filename)

    try:
        # Ensure waveform is float32 and in correct shape for soundfile
        waveform = waveform.astype(np.float32)
        if waveform.ndim == 2:
            # soundfile expects (samples, channels)
            if waveform.shape[0] <= 8:
                waveform = waveform.T

        sf.write(output_path, waveform, sample_rate, subtype="PCM_16" if output_format == "wav" else None)

        output_size_bytes = os.path.getsize(output_path)
        num_samples = waveform.shape[0] if waveform.ndim == 2 else len(waveform)
        duration_seconds = num_samples / sample_rate
        channels = waveform.shape[1] if waveform.ndim == 2 else 1

        output_metadata = {
            "filename": filename,
            "output_path": output_path,
            "format": output_format.upper(),
            "sample_rate": sample_rate,
            "channels": channels,
            "duration_seconds": round(duration_seconds, 3),
            "file_size_bytes": output_size_bytes,
            "file_size_mb": round(output_size_bytes / (1024 * 1024), 3),
            "bitrate_kbps": int((output_size_bytes * 8) / duration_seconds / 1000) if duration_seconds > 0 else None,
        }

        logger.info(
            f"Encoded output: {filename} | {sample_rate} Hz | {duration_seconds:.2f}s | "
            f"{output_size_bytes // 1024} KB"
        )
        return {"output_path": output_path, "output_metadata": output_metadata}

    except EncodingError:
        raise
    except Exception as e:
        raise EncodingError(f"Failed to encode and save audio to '{output_path}': {e}") from e
