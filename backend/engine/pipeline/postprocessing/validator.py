import numpy as np
from engine.utils.exceptions import PostprocessingError
from engine.utils.logger import get_logger

logger = get_logger(__name__)


def validate_model_output(waveform: np.ndarray) -> None:
    """Validate the waveform produced by the enhancement model."""
    if waveform is None:
        raise PostprocessingError("Model returned None waveform.")

    if not isinstance(waveform, np.ndarray):
        raise PostprocessingError(
            f"Expected numpy.ndarray, got {type(waveform).__name__}."
        )

    if waveform.size == 0:
        raise PostprocessingError("Model output waveform is empty (zero length).")

    if np.any(np.isnan(waveform)):
        raise PostprocessingError("Model output contains NaN values.")

    if np.any(np.isinf(waveform)):
        raise PostprocessingError("Model output contains infinite values.")

    if np.all(waveform == 0):
        logger.warning("Model output is all zeros — possible silent output.")

    logger.info(
        f"Model output validation passed: shape={waveform.shape}, "
        f"min={waveform.min():.4f}, max={waveform.max():.4f}"
    )
