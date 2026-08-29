const GEAR_TEETH_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

/**
 * Icon-only mark: gear (career/engineering) + an upward circuit-arrow
 * (growth in tech) tipped with a star, echoing the "Rumo à TI" brand mark.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="rti-gear" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3f93dc" />
          <stop offset="100%" stopColor="#0b3269" />
        </linearGradient>
        <linearGradient id="rti-arrow" x1="10" y1="34" x2="34" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#eafff2" />
          <stop offset="100%" stopColor="#34c777" />
        </linearGradient>
      </defs>

      {GEAR_TEETH_ANGLES.map((angle) => (
        <rect
          key={angle}
          x="21"
          y="2.5"
          width="6"
          height="8"
          rx="1.5"
          fill="url(#rti-gear)"
          transform={`rotate(${angle} 24 24)`}
        />
      ))}
      <circle cx="24" cy="24" r="16" fill="url(#rti-gear)" />

      <path
        d="M11 30 L17 24 L21 28 L30 17"
        stroke="url(#rti-arrow)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M30 17 L37 10" stroke="url(#rti-arrow)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="17" cy="24" r="1.6" fill="#eafff2" />
      <circle cx="21" cy="28" r="1.6" fill="#eafff2" />
      <path
        d="M39.5 5.5 L40.6 8 L43.2 8.3 L41.3 10 L41.8 12.6 L39.5 11.3 L37.2 12.6 L37.7 10 L35.8 8.3 L38.4 8 Z"
        fill="#ffd54a"
      />
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
