import shutil
import tempfile
from contextlib import contextmanager


@contextmanager
def job_temp_dir(job_id: str):
    """Per-job scratch directory, guaranteed to be removed on exit (success or failure)."""
    path = tempfile.mkdtemp(prefix=f"yt-transcribe-{job_id}-")
    try:
        yield path
    finally:
        shutil.rmtree(path, ignore_errors=True)
