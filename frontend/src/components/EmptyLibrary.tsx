import { SearchBar } from "./SearchBar";
import { DocIcon } from "./icons";

const STEPS = [
  { n: "01", title: "Paste a link", note: "Any youtube.com or youtu.be URL." },
  { n: "02", title: "We transcribe it", note: "Timestamped, with each speaker labeled." },
  { n: "03", title: "Read or search it", note: "Summary up top, full transcript below." },
];

export function EmptyLibrary({ onSearch }: { onSearch: (query: string) => void }) {
  return (
    <div className="empty">
      <div className="empty__icon">
        <DocIcon size={24} />
      </div>
      <h1 className="empty__title">Turn any YouTube video into a transcript you can search.</h1>
      <p className="empty__sub">
        Paste a link. We pull the audio, transcribe it with speakers labeled, and write a short
        summary — then it's in your library, searchable by every word.
      </p>

      <SearchBar onSearch={onSearch} variant="hero" autoFocus />

      <div className="empty__steps">
        {STEPS.map((s) => (
          <div className="empty__step" key={s.n}>
            <div className="empty__step-num">{s.n}</div>
            <div className="empty__step-title">{s.title}</div>
            <div className="empty__step-note">{s.note}</div>
          </div>
        ))}
      </div>

      <p className="empty__foot">
        First transcript takes a little longer — the model downloads once, then it's cached.
      </p>
    </div>
  );
}
