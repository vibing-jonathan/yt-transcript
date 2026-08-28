type IconProps = { size?: number; className?: string };

function base(size: number) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

export function SearchIcon({ size = 17, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </svg>
  );
}

export function LinkIcon({ size = 17, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
      <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
    </svg>
  );
}

export function ChevronLeftIcon({ size = 15, className }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={2} className={className}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export function CheckIcon({ size = 12, className }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={3} className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function SpinnerIcon({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={2.2} className={className}>
      <path d="M21 12a9 9 0 1 1-6.2-8.6" />
    </svg>
  );
}

export function DocIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </svg>
  );
}
