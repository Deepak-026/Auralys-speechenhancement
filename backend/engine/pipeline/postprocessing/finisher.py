import numpy as np
from engine.utils.audio_utils import apply_fade, clamp
from engine.utils.exceptions import PostprocessingError
from engine.utils.logger import get_logger

logger = get_logger(__name__)

TARGET_LUFS = -23.0
PEAK_LIMIT = 0.98


def apply_finishing(
    waveform: np.ndarray,
    sample_rate: int,
    apply_loudness_norm: bool = True,
    apply_fade_io: bool = True,
    apply_peak_limit: bool = True,
) -> np.ndarray:
    """Apply finishing operations: fade in/out, loudness normalization, peak limiting."""
    try:
        if apply_fade_io:
            waveform = apply_fade(waveform, sample_rate, fade_ms=10)
            logger.info("Applied 10ms fade-in and fade-out.")

        if apply_loudness_norm:
            waveform = _loudness_normalize(waveform, sample_rate)

        if apply_peak_limit:
            waveform = clamp(waveform, -PEAK_LIMIT, PEAK_LIMIT)
            logger.info(f"Applied peak limiting at ±{PEAK_LIMIT}.")

        return waveform

    except Exception as e:
        raise PostprocessingError(f"Finishing operations failed: {e}") from e


def _loudness_normalize(waveform: np.ndarray, sample_rate: int) -> np.ndarray:
    """Normalize loudness to TARGET_LUFS using pyloudnorm."""
    try:
        import pyloudnorm as pyln

        meter = pyln.Meter(sample_rate)
        audio_for_meter = waveform

        # pyloudnorm expects (samples, channels) or (samples,)
        if audio_for_meter.ndim == 1:
            audio_for_meter_2d = audio_for_meter[:, np.newaxis]
        else:
            audio_for_meter_2d = audio_for_meter.T

        loudness = meter.integrated_loudness(audio_for_meter_2d.astype(np.float64))

        if np.isfinite(loudness) and loudness > -70.0:
            normalized = pyln.normalize.loudness(
                audio_for_meter_2d.astype(np.float64),
                loudness,
                TARGET_LUFS,
            )
            result = normalized.squeeze() if normalized.ndim == 2 else normalized
            result = result.astype(np.float32)
            result = clamp(result)
            logger.info(f"Loudness normalized: {loudness:.1f} LUFS → {TARGET_LUFS} LUFS")
            return result
        else:
            logger.warning(f"Skipping loudness norm — measured loudness {loudness:.1f} LUFS is unreliable.")
            return waveform

    except ImportError:
        logger.warning("pyloudnorm not available — skipping loudness normalization.")
        return waveform
    except Exception as e:
        logger.warning(f"Loudness normalization failed, continuing without it: {e}")
        return waveform
