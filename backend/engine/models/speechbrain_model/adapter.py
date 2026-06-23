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

# SepFormer on CPU runs OOM on long audio — chunk into 4-second windows.
# 50% overlap + Hann window satisfies COLA (Constant Overlap-Add): windowed
# chunks sum to 1 everywhere, so simple summation gives perfect reconstruction.
CHUNK_SAMPLES = 64_000   # 4 seconds at 16 kHz
HOP_SAMPLES   = 32_000   # 2 seconds (50% overlap)


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
                from speechbrain.utils.fetching import LocalStrategy
            except ImportError:
                from speechbrain.pretrained import SepformerSeparation  # <1.0 fallback
                LocalStrategy = None

            logger.info(f"Loading SpeechBrain model from '{self.SOURCE}'...")
            os.makedirs(PRETRAINED_DIR, exist_ok=True)

            hparams_kwargs = {
                "source": self.SOURCE,
                "savedir": PRETRAINED_DIR,
                "run_opts": {"device": "cpu"},
            }
            # Use COPY on Windows to avoid symlink privilege errors (WinError 1314)
            if LocalStrategy is not None:
                hparams_kwargs["local_strategy"] = LocalStrategy.COPY

            self._model = SepformerSeparation.from_hparams(**hparams_kwargs)
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
            if len(waveform) <= CHUNK_SAMPLES:
                enhanced = self._enhance_chunk(waveform)
            else:
                enhanced = self._enhance_chunked(waveform)
            logger.info(f"Enhancement complete: output shape={enhanced.shape}")
            return enhanced
        except ModelError:
            raise
        except Exception as e:
            raise ModelError(f"Inference failed: {e}") from e

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _enhance_chunk(self, chunk: np.ndarray) -> np.ndarray:
        """Run SepFormer on a single chunk (must be <= CHUNK_SAMPLES)."""
        tensor = torch.from_numpy(chunk.astype(np.float32)).unsqueeze(0)  # (1, T)
        with torch.no_grad():
            # separate_batch returns (batch, time, sources)
            est = self._model.separate_batch(tensor)
            out = est[0, :, 0].cpu().numpy()   # (time,)
        return out.astype(np.float32)

    def _enhance_chunked(self, waveform: np.ndarray) -> np.ndarray:
        """Overlap-add chunked inference for audio longer than CHUNK_SAMPLES.

        Uses a Hann window with 50% overlap — satisfies COLA so windowed chunks
        sum to exactly 1.0 everywhere, giving perfect reconstruction.
        """
        n = len(waveform)
        output = np.zeros(n, dtype=np.float64)
        weight = np.zeros(n, dtype=np.float64)
        window = np.hanning(CHUNK_SAMPLES).astype(np.float64)

        pos = 0
        chunk_idx = 0
        while pos < n:
            end = min(pos + CHUNK_SAMPLES, n)
            chunk = waveform[pos:end]
            chunk_len = len(chunk)

            # Pad the last chunk to CHUNK_SAMPLES so the model sees a full frame
            if chunk_len < CHUNK_SAMPLES:
                chunk = np.pad(chunk, (0, CHUNK_SAMPLES - chunk_len))

            enhanced_chunk = self._enhance_chunk(chunk)

            # Taper with the window and accumulate
            w = window[:chunk_len]
            output[pos:end] += enhanced_chunk[:chunk_len] * w
            weight[pos:end] += w

            chunk_idx += 1
            logger.info(f"Chunk {chunk_idx}: samples {pos}–{end} of {n}")

            pos += HOP_SAMPLES
            # Stop if the next hop would start past the signal
            if pos >= n:
                break

        # Normalise by accumulated window weights (safe divide)
        mask = weight > 1e-8
        output[mask] /= weight[mask]
        return output.astype(np.float32)
