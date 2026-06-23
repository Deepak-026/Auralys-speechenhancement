import numpy as np
from engine.utils.audio_utils import to_float32, clamp
from engine.utils.exceptions import PostprocessingError
from engine.utils.logger import get_logger

logger = get_logger(__name__)


def restore_waveform(waveform: np.ndarray, original_peak: float = None) -> np.ndarray:
    """Restore waveform amplitude, clamp, and ensure float32 PCM quality.

    Args:
        waveform: Enhanced waveform from model.
        original_peak: If provided, scale output to match original peak amplitude.
    """
    try:
        waveform = to_float32(waveform)
        waveform = clamp(waveform)

        if original_peak is not None and original_peak > 1e-8:
            current_peak = np.max(np.abs(waveform))
            if current_peak > 1e-8:
                scale = min(original_peak, 0.95) / current_peak
                waveform = waveform * scale
                waveform = clamp(waveform)

        logger.info(
            f"Waveform restored: shape={waveform.shape}, "
            f"peak={np.max(np.abs(waveform)):.4f}"
        )
        return waveform

    except Exception as e:
        raise PostprocessingError(f"Waveform restoration failed: {e}") from e
