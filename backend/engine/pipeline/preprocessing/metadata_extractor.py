import os
import numpy as np
import soundfile as sf
from typing import Optional
from engine.utils.logger import get_logger

logger = get_logger(__name__)


def extract_metadata(file_path: str, waveform: np.ndarray, sample_rate: int) -> dict:
    """Extract audio metadata from file and decoded waveform."""
    filename = os.path.basename(file_path)
    _, ext = os.path.splitext(filename)
    file_size_bytes = os.path.getsize(file_path)

    # Determine channels from waveform shape
    if waveform.ndim == 1:
        channels = 1
    elif waveform.ndim == 2:
        # Could be (channels, samples) or (samples, channels)
        channels = waveform.shape[0] if waveform.shape[0] <= 8 else waveform.shape[1]
    else:
        channels = 1

    num_samples = waveform.shape[-1] if waveform.ndim == 2 else len(waveform)
    duration_seconds = num_samples / sample_rate

    bit_depth = _get_bit_depth(file_path)
    bitrate = _estimate_bitrate(file_path, duration_seconds)

    metadata = {
        "filename": filename,
        "format": ext.lstrip(".").upper(),
        "sample_rate": sample_rate,
        "duration_seconds": round(duration_seconds, 3),
        "channels": channels,
        "channel_label": "Mono" if channels == 1 else "Stereo",
        "bit_depth": bit_depth,
        "bitrate_kbps": bitrate,
        "file_size_bytes": file_size_bytes,
        "file_size_mb": round(file_size_bytes / (1024 * 1024), 3),
        "num_samples": int(num_samples),
    }

    logger.info(
        f"Metadata: {filename} | {sample_rate} Hz | {channels}ch | "
        f"{duration_seconds:.2f}s | {file_size_bytes // 1024} KB"
    )
    return metadata


def _get_bit_depth(file_path: str) -> Optional[int]:
    try:
        with sf.SoundFile(file_path) as f:
            subtype = f.subtype
            if "PCM_16" in subtype:
                return 16
            if "PCM_24" in subtype:
                return 24
            if "PCM_32" in subtype or "FLOAT" in subtype:
                return 32
            return 16
    except Exception:
        return None


def _estimate_bitrate(file_path: str, duration_seconds: float) -> Optional[int]:
    if duration_seconds <= 0:
        return None
    try:
        file_size_bits = os.path.getsize(file_path) * 8
        bitrate_kbps = int(file_size_bits / duration_seconds / 1000)
        return bitrate_kbps
    except Exception:
        return None
