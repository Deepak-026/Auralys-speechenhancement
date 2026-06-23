import os
import numpy as np
import soundfile as sf
import librosa
from typing import Tuple
from engine.utils.exceptions import DecodingError
from engine.utils.logger import get_logger
from engine.utils.audio_utils import to_float32

logger = get_logger(__name__)


def decode_audio(file_path: str) -> Tuple[np.ndarray, int]:
    """Decode audio file to float32 PCM waveform.

    Supports .wav, .mp3, and .opus via librosa (which uses ffmpeg/audioread for mp3/opus).
    Returns (waveform, sample_rate) where waveform is float32 mono or multi-channel.
    """
    _, ext = os.path.splitext(file_path)
    ext = ext.lower()

    try:
        if ext == ".wav":
            waveform, sr = _decode_wav(file_path)
        elif ext == ".mp3":
            waveform, sr = _decode_with_librosa(file_path)
        elif ext == ".opus":
            waveform, sr = _decode_opus(file_path)
        else:
            waveform, sr = _decode_with_librosa(file_path)

        waveform = to_float32(waveform)
        logger.info(f"Decoded '{os.path.basename(file_path)}': sr={sr}, shape={waveform.shape}, dtype={waveform.dtype}")
        return waveform, sr

    except DecodingError:
        raise
    except Exception as e:
        raise DecodingError(f"Failed to decode '{os.path.basename(file_path)}': {e}") from e


def _decode_wav(file_path: str) -> Tuple[np.ndarray, int]:
    try:
        with sf.SoundFile(file_path) as f:
            sr = f.samplerate
            waveform = f.read(dtype="float32", always_2d=False)
        return waveform, sr
    except Exception:
        # Fallback to librosa for non-standard WAV files
        return _decode_with_librosa(file_path)


def _decode_with_librosa(file_path: str) -> Tuple[np.ndarray, int]:
    # mono=False to preserve channel info; we handle mono conversion in transformer
    waveform, sr = librosa.load(file_path, sr=None, mono=False)
    return waveform, sr


def _decode_opus(file_path: str) -> Tuple[np.ndarray, int]:
    """Decode .opus file using pydub → convert to WAV in memory → decode with soundfile."""
    import io
    import tempfile
    from pydub import AudioSegment

    try:
        audio = AudioSegment.from_file(file_path, format="opus")
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp_path = tmp.name
        try:
            audio.export(tmp_path, format="wav")
            waveform, sr = _decode_wav(tmp_path)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
        return waveform, sr
    except Exception as e:
        # Final fallback — try librosa directly (requires ffmpeg)
        try:
            return _decode_with_librosa(file_path)
        except Exception:
            raise DecodingError(f"Cannot decode .opus file. Ensure ffmpeg is installed. Original error: {e}")
