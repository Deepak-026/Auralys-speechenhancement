import os
import numpy as np
import torch
from engine.models.base_model import BaseEnhancementModel
from engine.utils.exceptions import ModelError
from engine.utils.logger import get_logger

logger = get_logger(__name__)

PRETRAINED_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "pretrained_models",
    "sepformer-wham16k",
)


class SpeechBrainSepFormerAdapter(BaseEnhancementModel):
    """Adapter for SpeechBrain's SepFormer WHAM 16kHz enhancement model."""

    SOURCE = "speechbrain/sepformer-wham16k-enhancement"
    SAMPLE_RATE = 16000

    def __init__(self):
        self._model = None

    @property
    def model_name(self) -> str:
        return "SepFormer WHAM 16kHz"

    def get_input_spec(self) -> dict:
        return {
            "sample_rate": self.SAMPLE_RATE,
            "channels": 1,
            "dtype": "float32",
        }

    def load(self) -> None:
        if self._model is not None:
            return
        try:
            # SpeechBrain 1.0+ moved pretrained classes to speechbrain.inference.*
            try:
                from speechbrain.inference.separation import SepformerSeparation
            except ImportError:
                from speechbrain.pretrained import SepformerSeparation  # <1.0 fallback

            logger.info(f"Loading SpeechBrain model from '{self.SOURCE}'...")
            os.makedirs(PRETRAINED_DIR, exist_ok=True)

            self._model = SepformerSeparation.from_hparams(
                source=self.SOURCE,
                savedir=PRETRAINED_DIR,
                run_opts={"device": "cpu"},
            )
            self._model.eval()
            logger.info("SpeechBrain SepFormer model loaded successfully.")

        except ImportError as e:
            raise ModelError(
                f"Could not import SepformerSeparation from SpeechBrain: {e}. "
                "Ensure SpeechBrain >=1.0 is installed: pip install speechbrain"
            ) from e
        except Exception as e:
            raise ModelError(f"Failed to load SpeechBrain model: {e}") from e

    def enhance(self, waveform: np.ndarray, sample_rate: int) -> np.ndarray:
        if self._model is None:
            raise ModelError("Model is not loaded. Call load() first.")

        if sample_rate != self.SAMPLE_RATE:
            raise ModelError(
                f"Expected sample rate {self.SAMPLE_RATE} Hz, got {sample_rate} Hz. "
                "Run preprocessing first."
            )

        try:
            # Convert to torch tensor: model expects (batch, time) or (time,)
            waveform_f32 = waveform.astype(np.float32)
            tensor = torch.from_numpy(waveform_f32)

            # SepformerSeparation.separate_batch expects (batch, time)
            if tensor.ndim == 1:
                tensor = tensor.unsqueeze(0)  # (1, time)

            with torch.no_grad():
                # separate_batch returns (batch, time, sources)
                est_sources = self._model.separate_batch(tensor)
                # Take the first (and only) source: shape (batch, time, 1) → (time,)
                enhanced = est_sources[0, :, 0].cpu().numpy()

            enhanced = enhanced.astype(np.float32)
            logger.info(f"Enhancement complete: output shape={enhanced.shape}")
            return enhanced

        except ModelError:
            raise
        except Exception as e:
            raise ModelError(f"Inference failed: {e}") from e
