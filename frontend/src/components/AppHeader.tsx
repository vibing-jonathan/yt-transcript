import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function AppHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link to="/" className="wordmark" aria-label="yt·transcribe home">
          <b>yt</b>
          <i>·</i>
          <span>transcribe</span>
        </Link>
        {children}
      </div>
    </header>
  );
}
