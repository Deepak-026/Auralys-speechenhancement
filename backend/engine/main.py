#!/usr/bin/env python3
"""AURALYS Speech Enhancement Engine — CLI entrypoint.

Called by the Node.js backend via child_process.spawn.
Outputs a single JSON object to stdout on completion (success or error).
All logs go to stderr to keep stdout clean for JSON parsing.
"""

import sys
import os
import json
import time
import argparse
import traceback

# Suppress HuggingFace Hub symlink warning on Windows (we use COPY strategy instead)
os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")

# Add engine parent dir to path so 'engine' package resolves correctly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from engine.config import MODEL_REGISTRY, DEFAULT_MODEL, OUTPUTS_DIR
from engine.models.model_manager import get_model
from engine.pipeline.preprocessing.pipeline import run_preprocessing
from engine.pipeline.postprocessing.pipeline import run_postprocessing
from engine.utils.logger import get_logger
from engine.utils.exceptions import AuralysError
from engine.utils.audio_utils import estimate_snr_improvement

logger = get_logger("auralys.main")


def parse_args():
    parser = argparse.ArgumentParser(description="AURALYS Speech Enhancement Engine")
    parser.add_argument("--input", required=True, help="Path to input audio file")
    parser.add_argument("--output-dir", default=OUTPUTS_DIR, help="Directory to save enhanced audio")
    parser.add_argument("--model", default=DEFAULT_MODEL, help="Model key from MODEL_REGISTRY")
    parser.add_argument("--job-id", required=True, help="Unique job identifier")
    parser.add_argument(
        "--noise-reduction",
        choices=["auto", "low", "medium", "high"],
        default="auto",
        help="Noise reduction intensity hint",
    )
    parser.add_argument("--output-format", default="wav", choices=["wav"], help="Output audio format")
    parser.add_argument("--no-loudness-norm", action="store_true", help="Skip loudness normalization")
    return parser.parse_args()


def _to_serializable(obj):
    """Recursively convert numpy scalars/arrays to JSON-serializable Python types."""
    import numpy as np
    if isinstance(obj, dict):
        return {k: _to_serializable(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_to_serializable(v) for v in obj]
    if isinstance(obj, np.integer):
        return int(obj)
    if isinstance(obj, np.floating):
        return float(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    return obj


def output_result(result: dict):
    """Write JSON result to stdout and flush."""
    print(json.dumps(_to_serializable(result)), flush=True)


def main():
    args = parse_args()
    start_time = time.time()

    logger.info(f"Job {args.job_id} | Input: {args.input} | Model: {args.model}")

    try:
        # 1. Load model
        model = get_model(args.model)
        input_spec = model.get_input_spec()

        # 2. Preprocessing
        pre_result = run_preprocessing(args.input, input_spec)
        waveform = pre_result["waveform"]
        sample_rate = pre_result["sample_rate"]
        input_metadata = pre_result["metadata"]

        # Track original peak for amplitude restoration
        import numpy as np
        original_peak = float(np.max(np.abs(waveform)))

        # 3. Model inference
        logger.info(f"Running enhancement with model: {model.model_name}")
        enhanced_waveform = model.enhance(waveform, sample_rate)

        # Estimate SNR improvement
        snr_improvement = estimate_snr_improvement(waveform, enhanced_waveform)

        # 4. Postprocessing
        post_result = run_postprocessing(
            enhanced_waveform=enhanced_waveform,
            sample_rate=sample_rate,
            job_id=args.job_id,
            original_peak=original_peak,
            output_format=args.output_format,
            output_dir=args.output_dir,
            apply_loudness_norm=not args.no_loudness_norm,
        )

        processing_time = round(time.time() - start_time, 2)

        result = {
            "success": True,
            "job_id": args.job_id,
            "output_path": post_result["output_path"],
            "input_metadata": input_metadata,
            "output_metadata": post_result["output_metadata"],
            "processing_time_seconds": processing_time,
            "model_used": model.model_name,
            "model_key": args.model,
            "noise_reduction": args.noise_reduction,
            "snr_improvement_db": snr_improvement,
        }

        logger.info(f"Job {args.job_id} completed in {processing_time}s")
        output_result(result)
        sys.exit(0)

    except AuralysError as e:
        error_type = type(e).__name__
        logger.error(f"Job {args.job_id} failed [{error_type}]: {e}")
        output_result({
            "success": False,
            "job_id": args.job_id,
            "error": str(e),
            "error_type": error_type,
        })
        sys.exit(1)

    except Exception as e:
        logger.error(f"Job {args.job_id} unexpected error: {e}")
        logger.error(traceback.format_exc())
        output_result({
            "success": False,
            "job_id": args.job_id,
            "error": f"Unexpected error: {e}",
            "error_type": "InternalError",
        })
        sys.exit(1)


if __name__ == "__main__":
    main()
