import os
import numpy as np
import soundfile as sf
import librosa
from typing import Tuple
from engine.utils.exceptions import DecodingError
from engine.utils.logger import get_logger
from engine.utils.audio_utils import to_float32

logger = get_logger(__name__)


def _get_ffmpeg_path() -> str:
    """Return the imageio-ffmpeg bundled binary path, or fall back to system 'ffmpeg'."""
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return "ffmpeg"


def decode_audio(file_path: str) -> Tuple[np.ndarray, int]:
    """Decode audio file to float32 PCM waveform.

    Supports .wav, .mp3, and .opus.
    MP3/OPUS bypass librosa/audioread (Python 3.12+ UnboundLocalError bug in audioread)
    and decode via pydub + imageio-ffmpeg bundled binary.
    Returns (waveform, sample_rate) where waveform is float32, shape (samples,) or (channels, samples).
    """
    _, ext = os.path.splitext(file_path)
    ext = ext.lower()

    try:
        if ext == ".wav":
            waveform, sr = _decode_wav(file_path)
        elif ext in (".mp3", ".opus"):
            waveform, sr = _decode_compressed(file_path, ext.lstrip("."))
        else:
            waveform, sr = _decode_wav(file_path)

        waveform = to_float32(waveform)
        logger.info(
            f"Decoded '{os.path.basename(file_path)}': "
            f"sr={sr}, shape={waveform.shape}, dtype={waveform.dtype}"
        )
        return waveform, sr

    except DecodingError:
        raise
    except Exception as e:
        raise DecodingError(
            f"Failed to decode '{os.path.basename(file_path)}': {e}"
        ) from e


def _decode_wav(file_path: str) -> Tuple[np.ndarray, int]:
    try:
        with sf.SoundFile(file_path) as f:
            sr = f.samplerate
            waveform = f.read(dtype="float32", always_2d=False)
        return waveform, sr
    except Exception:
        # Fallback for non-standard WAV files
        waveform, sr = librosa.load(file_path, sr=None, mono=False)
        return waveform, sr


def _decode_compressed(file_path: str, fmt: str) -> Tuple[np.ndarray, int]:
    """Decode MP3/OPUS using pydub + imageio-ffmpeg.

    Avoids librosa/audioread which has an UnboundLocalError on Python 3.12+.
    """
    try:
        return _decode_via_pydub(file_path, fmt)
    except Exception as e:
        raise DecodingError(
            f"Failed to decode .{fmt} file '{os.path.basename(file_path)}': {e}. "
            f"imageio-ffmpeg should be installed (pip install imageio-ffmpeg)."
        ) from e


def _decode_via_pydub(file_path: str, fmt: str) -> Tuple[np.ndarray, int]:
    """Use pydub with imageio-ffmpeg to convert compressed audio → PCM waveform."""
    import tempfile
    from pydub import AudioSegment

    # Point pydub at imageio-ffmpeg's bundled binary
    ffmpeg_path = _get_ffmpeg_path()
    AudioSegment.converter = ffmpeg_path
    AudioSegment.ffmpeg = ffmpeg_path
    AudioSegment.ffprobe = ffmpeg_path.replace("ffmpeg", "ffprobe")

    audio = AudioSegment.from_file(file_path, format=fmt)

    # Export to a temp WAV, then decode with soundfile for clean float32 conversion
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp_path = tmp.name
    try:
        audio.export(tmp_path, format="wav")
        waveform, sr = _decode_wav(tmp_path)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    return waveform, sr
