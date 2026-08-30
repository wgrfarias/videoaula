/**
 * Icon-only mark: a computer monitor (tech/IT) displaying an upward
 * circuit-arrow tipped with a star, echoing the "Rumo à TI" brand mark.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="rti-monitor" x1="4" y1="4" x2="44" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3f93dc" />
          <stop offset="100%" stopColor="#0b3269" />
        </linearGradient>
        <linearGradient id="rti-arrow" x1="9" y1="27" x2="35" y2="11" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#eafff2" />
          <stop offset="100%" stopColor="#34c777" />
        </linearGradient>
      </defs>

      {/* Star above the screen */}
      <path
        d="M38.5 2 L39.6 4.6 L42.2 4.9 L40.3 6.7 L40.8 9.3 L38.5 8 L36.2 9.3 L36.7 6.7 L34.8 4.9 L37.4 4.6 Z"
        fill="#ffd54a"
      />

      {/* Monitor bezel */}
      <rect x="4" y="6" width="40" height="27" rx="4" fill="url(#rti-monitor)" />
      {/* Screen */}
      <rect x="8" y="10" width="32" height="19" rx="1.5" fill="#0a1020" />
      {/* Stand */}
      <rect x="20" y="33" width="8" height="5" fill="url(#rti-monitor)" />
      <rect x="13" y="38" width="22" height="4" rx="2" fill="url(#rti-monitor)" />

      {/* Upward circuit-arrow on screen */}
      <path
        d="M11 26 L17 20 L21 24 L30 14"
        stroke="url(#rti-arrow)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M30 14 L36 13" stroke="url(#rti-arrow)" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="17" cy="20" r="1.4" fill="#eafff2" />
      <circle cx="21" cy="24" r="1.4" fill="#eafff2" />
    </svg>
  );
}

export function LogoLockup({
  className,
  name = "Rumo à TI",
  tagline = "com Wagner Farias",
}: {
  className?: string;
  name?: string;
  tagline?: string | null;
}) {
  return (
    <span className={className}>
      <span className="font-display font-extrabold uppercase tracking-tight">{name}</span>
      {tagline && <span className="block text-xs font-medium opacity-75">{tagline}</span>}
    </span>
  );
}
