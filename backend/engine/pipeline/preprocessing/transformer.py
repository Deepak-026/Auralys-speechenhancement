import numpy as np
import librosa
from engine.utils.audio_utils import stereo_to_mono, to_float32, clamp, normalize_amplitude
from engine.utils.exceptions import PreprocessingError
from engine.utils.logger import get_logger

logger = get_logger(__name__)


def transform_audio(
    waveform: np.ndarray,
    src_sample_rate: int,
    model_input_spec: dict,
) -> np.ndarray:
    """Transform waveform to match model input requirements.

    model_input_spec keys:
        sample_rate (int): Target sample rate
        channels (int): Required number of channels (usually 1 for mono)
        dtype (str): Required dtype (usually 'float32')
        fixed_length (int, optional): If set, pad/trim waveform to this many samples
    """
    target_sr = model_input_spec.get("sample_rate", 16000)
    target_channels = model_input_spec.get("channels", 1)
    target_dtype = model_input_spec.get("dtype", "float32")
    fixed_length = model_input_spec.get("fixed_length", None)

    try:
        waveform = to_float32(waveform)

        # Ensure 1D for mono or 2D (channels, samples) for multi-channel
        if waveform.ndim == 2 and waveform.shape[0] > 8:
            # (samples, channels) → (channels, samples)
            waveform = waveform.T

        # Convert to mono if required
        if target_channels == 1:
            waveform = stereo_to_mono(waveform)
        elif waveform.ndim == 1 and target_channels > 1:
            waveform = np.stack([waveform] * target_channels, axis=0)

        # Resample if needed
        if src_sample_rate != target_sr:
            logger.info(f"Resampling {src_sample_rate} Hz → {target_sr} Hz")
            waveform = librosa.resample(
                waveform,
                orig_sr=src_sample_rate,
                target_sr=target_sr,
                res_type="soxr_hq",
            )

        # Normalize amplitude to [-1, 1]
        waveform = normalize_amplitude(waveform, target_peak=0.95)

        # Clamp to [-1, 1]
        waveform = clamp(waveform)

        # Handle fixed-length requirement (pad or trim)
        if fixed_length is not None:
            current_len = waveform.shape[-1]
            if current_len > fixed_length:
                waveform = waveform[..., :fixed_length]
                logger.info(f"Trimmed waveform to {fixed_length} samples")
            elif current_len < fixed_length:
                pad_amount = fixed_length - current_len
                if waveform.ndim == 1:
                    waveform = np.pad(waveform, (0, pad_amount))
                else:
                    waveform = np.pad(waveform, ((0, 0), (0, pad_amount)))
                logger.info(f"Padded waveform from {current_len} to {fixed_length} samples")

        # Final dtype conversion
        waveform = waveform.astype(np.float32)

        logger.info(
            f"Transform complete: shape={waveform.shape}, sr={target_sr}, dtype={waveform.dtype}"
        )
        return waveform

    except PreprocessingError:
        raise
    except Exception as e:
        raise PreprocessingError(f"Audio transformation failed: {e}") from e
