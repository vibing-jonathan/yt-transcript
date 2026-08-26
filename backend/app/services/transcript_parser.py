"""Parses the MOSS-Transcribe-Diarize model's bracketed output format:

    [0.48][S01]Welcome everyone[1.66][12.26][S02]The pipeline is ready[13.81]

Delegates to the model authors' own moss_transcribe_diarize.transcript_parser
(a character-by-character state machine, not regex) rather than reimplementing
parsing for this nonstandard format ourselves.
"""

from dataclasses import dataclass

from moss_transcribe_diarize.transcript_parser import parse_transcript


class TranscriptParsingError(ValueError):
    pass


@dataclass
class TranscriptSegmentData:
    index: int
    speaker_label: str
    start_seconds: float
    end_seconds: float
    text: str


def parse(raw: str) -> list[TranscriptSegmentData]:
    segments = parse_transcript(raw)
    if not segments:
        raise TranscriptParsingError(f"No segments could be parsed from model output: {raw[:200]!r}")

    return [
        TranscriptSegmentData(
            index=i,
            speaker_label=seg.speaker,
            start_seconds=seg.start,
            end_seconds=seg.end,
            text=seg.text.strip(),
        )
        for i, seg in enumerate(segments)
    ]


def _format_timestamp(seconds: float) -> str:
    total = int(seconds)
    return f"{total // 60:02d}:{total % 60:02d}"


def flatten(segments: list[TranscriptSegmentData]) -> str:
    lines = []
    for seg in segments:
        speaker_num = seg.speaker_label.lstrip("S").lstrip("0") or "0"
        lines.append(f"Speaker {speaker_num} ({_format_timestamp(seg.start_seconds)}): {seg.text}")
    return "\n".join(lines)
