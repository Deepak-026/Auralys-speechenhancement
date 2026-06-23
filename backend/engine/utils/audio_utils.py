import numpy as np
from typing import Tuple


def to_float32(waveform: np.ndarray) -> np.ndarray:
    """Convert waveform to float32, handling int16/int32 PCM inputs."""
    if waveform.dtype == np.float32:
        return waveform
    if waveform.dtype == np.float64:
        return waveform.astype(np.float32)
    if waveform.dtype == np.int16:
        return (waveform / 32768.0).astype(np.float32)
    if waveform.dtype == np.int32:
        return (waveform / 2147483648.0).astype(np.float32)
    return waveform.astype(np.float32)


def stereo_to_mono(waveform: np.ndarray) -> np.ndarray:
    """Mix stereo (or multi-channel) waveform down to mono.

    Expects shape (samples,) for mono or (channels, samples) for multi-channel.
    """
    if waveform.ndim == 1:
        return waveform
    if waveform.ndim == 2:
        if waveform.shape[0] <= 8:
            # (channels, samples) — mean across channels
            return np.mean(waveform, axis=0)
        else:
            # (samples, channels) — mean across channels
            return np.mean(waveform, axis=1)
    raise ValueError(f"Unsupported waveform shape: {waveform.shape}")


def normalize_amplitude(waveform: np.ndarray, target_peak: float = 0.95) -> np.ndarray:
    """Normalize waveform so peak amplitude equals target_peak."""
    peak = np.max(np.abs(waveform))
    if peak > 1e-8:
        return waveform * (target_peak / peak)
    return waveform


def clamp(waveform: np.ndarray, min_val: float = -1.0, max_val: float = 1.0) -> np.ndarray:
    """Clamp waveform values to [min_val, max_val]."""
    return np.clip(waveform, min_val, max_val)


def apply_fade(waveform: np.ndarray, sample_rate: int, fade_ms: int = 10) -> np.ndarray:
    """Apply fade-in and fade-out to eliminate clicks at boundaries."""
    fade_samples = int(sample_rate * fade_ms / 1000)
    fade_samples = min(fade_samples, len(waveform) // 4)
    if fade_samples < 2:
        return waveform
    result = waveform.copy()
    fade_in = np.linspace(0.0, 1.0, fade_samples)
    fade_out = np.linspace(1.0, 0.0, fade_samples)
    result[:fade_samples] *= fade_in
    result[-fade_samples:] *= fade_out
    return result


def estimate_snr_improvement(original: np.ndarray, enhanced: np.ndarray) -> float:
    """Rough SNR improvement estimate in dB (signal power ratio)."""
    original_power = np.mean(original ** 2)
    enhanced_power = np.mean(enhanced ** 2)
    if original_power < 1e-12:
        return 0.0
    ratio = float(enhanced_power) / (float(original_power) + 1e-12)
    return round(float(10.0 * np.log10(max(ratio, 1e-12))), 2)
