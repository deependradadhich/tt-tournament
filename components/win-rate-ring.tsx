const SIZE = 132;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Radial win-rate meter: a single ratio (won vs played) reads more clearly as a ring than a 2-slice pie. */
export function WinRateRing({ winPct, won, lost }: { winPct: number; won: number; lost: number }) {
  const offset = CIRCUMFERENCE * (1 - winPct / 100);

  return (
    <div className="relative flex h-[132px] w-[132px] flex-shrink-0 items-center justify-center">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" strokeWidth={STROKE} className="stroke-faint-bg" />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="stroke-accent transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-extrabold tabular-nums">{winPct}%</span>
        <span className="text-[11px] font-semibold text-muted">
          {won}W – {lost}L
        </span>
      </div>
    </div>
  );
}
