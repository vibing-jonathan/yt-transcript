import { Fragment, type ReactNode } from "react";

/** Renders a "·"-separated meta line, skipping empty parts so no orphan separators appear. */
export function MetaRow({ className, items }: { className: string; items: ReactNode[] }) {
  const parts = items.filter((x) => x !== null && x !== undefined && x !== false && x !== "");
  return (
    <div className={className}>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="sep">·</span>}
          {part}
        </Fragment>
      ))}
    </div>
  );
}
