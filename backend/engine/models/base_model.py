from abc import ABC, abstractmethod
import numpy as np


class BaseEnhancementModel(ABC):
    """Abstract base class for all speech enhancement model adapters."""

    @abstractmethod
    def load(self) -> None:
        """Load model weights and prepare for inference."""
        ...

    @abstractmethod
    def get_input_spec(self) -> dict:
        """Return model input requirements.

        Returns dict with keys:
            sample_rate (int): Required input sample rate.
            channels (int): Required number of channels (1 = mono).
            dtype (str): Required data type ('float32').
        """
        ...

    @abstractmethod
    def enhance(self, waveform: np.ndarray, sample_rate: int) -> np.ndarray:
        """Run speech enhancement on the preprocessed waveform.

        Args:
            waveform: Float32 numpy array, mono, at the sample rate from get_input_spec().
            sample_rate: The sample rate of the input waveform.

        Returns:
            Enhanced float32 numpy array with the same shape as input.
        """
        ...

    @property
    @abstractmethod
    def model_name(self) -> str:
        """Human-readable model name."""
        ...
