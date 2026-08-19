import Link from "next/link";
import type { StandingRow } from "@/lib/stats";

const MEDALS = ["🥇", "🥈", "🥉"];

type Row = { id: string; name: string; value: number };

/**
 * Two ranked, single-hue bar charts (nominal categorical: bar length carries
 * the ranking, all bars share the same accent hue, medals carry rank identity
 * so nothing rides on color alone). Rows link to the player/team's profile.
 */
export function TopPerformersCharts({
  standings,
  profileHrefBase,
}: {
  standings: StandingRow[];
  profileHrefBase: string;
}) {
  const played = standings.filter((r) => r.played > 0);
  if (played.length < 2) return null;

  const topWinners = [...played]
    .filter((r) => r.won > 0)
    .sort((a, b) => b.won - a.won)
    .slice(0, 3)
    .map((r) => ({ id: r.id, name: r.name, value: r.won }));

  const topScorers = [...played]
    .filter((r) => r.pointsScored > 0)
    .sort((a, b) => b.pointsScored - a.pointsScored)
    .slice(0, 3)
    .map((r) => ({ id: r.id, name: r.name, value: r.pointsScored }));

  if (topWinners.length === 0 && topScorers.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 px-5">
      <p className="text-xs font-bold uppercase tracking-wide text-muted">Top Performers</p>
      {topWinners.length > 0 && (
        <BarChart
          title="🏆 Most Wins"
          rows={topWinners}
          valueLabel={(v) => `${v}W`}
          profileHrefBase={profileHrefBase}
        />
      )}
      {topScorers.length > 0 && (
        <BarChart
          title="🎯 Top Scorers"
          rows={topScorers}
          valueLabel={(v) => `${v} pts`}
          profileHrefBase={profileHrefBase}
        />
      )}
    </div>
  );
}

function BarChart({
  title,
  rows,
  valueLabel,
  profileHrefBase,
}: {
  title: string;
  rows: Row[];
  valueLabel: (value: number) => string;
  profileHrefBase: string;
}) {
  const max = Math.max(...rows.map((r) => r.value));

  return (
    <div className="rounded-xl border border-card-border bg-card p-4">
      <p className="text-sm font-bold">{title}</p>
      <div className="mt-3 flex flex-col gap-3">
        {rows.map((row, i) => (
          <Link key={row.id} href={`${profileHrefBase}/${row.id}`} className="flex items-center gap-2.5">
            <span className="w-5 flex-shrink-0 text-center text-base leading-none">{MEDALS[i]}</span>
            <span className="w-20 flex-shrink-0 truncate text-sm font-semibold">{row.name}</span>
            <div className="h-4 min-w-0 flex-1 overflow-hidden rounded-full bg-faint-bg">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${Math.max((row.value / max) * 100, 10)}%` }}
              />
            </div>
            <span className="w-12 flex-shrink-0 text-right text-xs font-bold tabular-nums">
              {valueLabel(row.value)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
