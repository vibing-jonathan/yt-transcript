"""Worker-only: loads MOSS-Transcribe-Diarize once per process and runs inference.

Loaded via Celery's worker_process_init signal (see app/worker/celery_app.py),
not lazily, so model load cost is paid once at worker startup rather than on
the first job.

Uses the model authors' own moss_transcribe_diarize.inference_utils helpers
(build_transcription_messages / generate_transcription) rather than calling
the processor/model directly — this is a custom multimodal chat-templating
flow specific to this model, and the upstream package is the vetted reference
implementation for it.
"""

import torch
from moss_transcribe_diarize.inference_utils import (
    build_transcription_messages,
    generate_transcription,
    resolve_device,
)
from transformers import AutoModelForCausalLM, AutoProcessor

from app.config import settings

_model = None
_processor = None
_device: torch.device | None = None
_dtype: torch.dtype | None = None


def _load() -> tuple:
    global _model, _processor, _device, _dtype
    if _model is None:
        # "auto" resolves to CUDA when available, otherwise CPU (see
        # resolve_device in moss_transcribe_diarize.inference_utils); passing
        # "cpu" always forces CPU regardless of what hardware is present.
        _device = resolve_device("auto" if settings.use_gpu else "cpu")
        if settings.use_gpu and _device.type != "cuda":
            print("USE_GPU=true but no CUDA device was found; falling back to CPU.")
        _dtype = torch.bfloat16 if _device.type == "cuda" else torch.float32
        _processor = AutoProcessor.from_pretrained(settings.hf_model_id, trust_remote_code=True)
        _model = (
            AutoModelForCausalLM.from_pretrained(settings.hf_model_id, trust_remote_code=True, dtype="auto")
            .to(dtype=_dtype)
            .to(_device)
            .eval()
        )
    return _model, _processor, _device, _dtype


def transcribe(audio_path: str) -> str:
    """Returns the model's raw bracketed transcript string for one audio file."""
    model, processor, device, dtype = _load()

    messages = build_transcription_messages(audio_path)
    result = generate_transcription(
        model,
        processor,
        messages,
        max_new_tokens=8192,
        do_sample=False,
        device=device,
        dtype=dtype,
    )
    return result["text"]
