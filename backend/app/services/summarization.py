"""Worker-only: summarizes a transcript via the Gemini API."""

from google import genai
from google.genai.errors import ClientError, ServerError
from tenacity import retry, retry_if_exception, stop_after_attempt, wait_exponential

from app.config import settings

PROMPT_TEMPLATE = """\
You are summarizing a transcript of a YouTube video that has been transcribed
and diarized (multiple speakers labeled by turn). Produce:
1. A concise 2-4 sentence overview of what the video is about.
2. 3-8 bullet points of key takeaways.
Keep it factual and neutral; do not invent information not present in the transcript.

Transcript:
{transcript}
"""


def _is_transient(exc: BaseException) -> bool:
    if isinstance(exc, ServerError):
        return True
    if isinstance(exc, ClientError):
        return exc.code == 429
    return False


@retry(
    retry=retry_if_exception(_is_transient),
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    reraise=True,
)
def summarize(transcript_text: str) -> str:
    client = genai.Client(api_key=settings.gemini_api_key)
    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=PROMPT_TEMPLATE.format(transcript=transcript_text),
    )
    return response.text
