import os
import soundfile as sf
from engine.config import SUPPORTED_FORMATS, MAX_FILE_SIZE_MB
from engine.utils.exceptions import ValidationError
from engine.utils.logger import get_logger

logger = get_logger(__name__)


def validate_audio_file(file_path: str) -> None:
    """Validate that the audio file exists, has a supported format, acceptable size, and is not corrupted."""
    if not os.path.exists(file_path):
        raise ValidationError(f"File not found: {file_path}")

    _, ext = os.path.splitext(file_path)
    ext = ext.lower()
    if ext not in SUPPORTED_FORMATS:
        raise ValidationError(
            f"Unsupported audio format '{ext}'. Supported formats: {', '.join(SUPPORTED_FORMATS)}"
        )

    file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
    if file_size_mb > MAX_FILE_SIZE_MB:
        raise ValidationError(
            f"File size {file_size_mb:.1f} MB exceeds the maximum allowed size of {MAX_FILE_SIZE_MB} MB."
        )

    # Attempt to open and read metadata to detect corruption
    try:
        if ext in [".wav", ".mp3"]:
            with sf.SoundFile(file_path) as f:
                if f.frames == 0:
                    raise ValidationError("Audio file appears to be empty (zero frames).")
    except ValidationError:
        raise
    except Exception:
        # For .opus and files soundfile cannot open, we defer to the decoder
        pass

    logger.info(f"Validation passed for: {os.path.basename(file_path)} ({file_size_mb:.2f} MB)")
