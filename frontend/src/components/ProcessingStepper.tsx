import type { VideoStatus } from "../types/video";
import { CheckIcon } from "./icons";

const STEPS: { status: VideoStatus; label: string; note: string }[] = [
  { status: "queued", label: "Queued", note: "waiting for a worker" },
  { status: "downloading", label: "Downloading audio", note: "lowest-quality audio track" },
  { status: "transcribing", label: "Transcribing & diarizing", note: "speaker-labeled, timestamped — runs about real-time" },
  { status: "summarizing", label: "Summarizing", note: "overview + key takeaways" },
];

const ORDER: VideoStatus[] = ["queued", "downloading", "transcribing", "summarizing", "completed"];

export function ProcessingStepper({ status }: { status: VideoStatus }) {
  const current = ORDER.indexOf(status);
  const activeStep = STEPS.findIndex((s) => s.status === status);

  return (
    <div className="stepper">
      <div className="stepper__head">
        <h2>{activeStep >= 0 ? STEPS[activeStep].label : "Processing"}</h2>
        <span className="stepper__count">
          step {Math.min(Math.max(current + 1, 1), STEPS.length)} of {STEPS.length}
        </span>
      </div>

      {STEPS.map((step, i) => {
        const stepIndex = ORDER.indexOf(step.status);
        const state = stepIndex < current ? "done" : stepIndex === current ? "active" : "pending";
        return (
          <div className="step" key={step.status}>
            <div className="step__rail">
              <div className={`step__marker step__marker--${state}${state === "active" ? " pulse" : ""}`}>
                {state === "done" && <CheckIcon size={13} />}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`step__line${stepIndex < current ? " step__line--done" : ""}`} />
              )}
            </div>
            <div className="step__body">
              <div className={`step__label step__label--${state}`}>{step.label}</div>
              <div className="step__note">{step.note}</div>
            </div>
          </div>
        );
      })}

      <p className="stepper__foot">
        You can close this tab — processing continues in the background, and the transcript shows up in
        your library when it's done. The first run also downloads the transcription model, which takes a
        few extra minutes.
      </p>
    </div>
  );
}
