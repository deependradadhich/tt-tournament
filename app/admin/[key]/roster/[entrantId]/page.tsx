import { notFound } from "next/navigation";
import { getTournamentByAdminKey } from "@/lib/tournament-data";
import { getEntrants } from "@/lib/entrants";
import { computeEntrantStats } from "@/lib/stats";
import { totalRoundsFor } from "@/lib/format";
import { ScreenHeader } from "@/components/ui/screen-header";
import { AvatarCircle } from "@/components/ui/avatar";

export default async function AdminProfilePage({
  params,
}: {
  params: Promise<{ key: string; entrantId: string }>;
}) {
  const { key, entrantId } = await params;
  const tournament = await getTournamentByAdminKey(key);
  if (!tournament) notFound();

  const isDoubles = tournament.format === "DOUBLES";
  const entrant = getEntrants(tournament).find((e) => e.id === entrantId);
  if (!entrant) notFound();

  const team = isDoubles ? tournament.teams.find((t) => t.id === entrantId) : undefined;
  const subtitle = team ? team.players.map((p) => p.name).join(" & ") : undefined;

  const totalRounds = totalRoundsFor(tournament.matches);
  const stats = computeEntrantStats(entrantId, tournament, totalRounds);

  return (
    <div className="flex flex-1 flex-col">
      <ScreenHeader title="Profile" backHref={`/admin/${tournament.adminKey}/roster`} />

      <div className="flex flex-col items-center gap-2 px-5 pt-2 text-center">
        <AvatarCircle name={entrant.name} className="h-16 w-16 text-xl" />
        <p className="text-lg font-bold">{entrant.name}</p>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>

      <div className="grid grid-cols-2 gap-2.5 px-5 pt-5">
        <StatTile value={stats.played} label="Played" />
        <StatTile value={`${stats.winPct}%`} label="Win rate" />
        <StatTile value={`${stats.won}–${stats.lost}`} label="W – L" />
        <StatTile value={stats.pointsScored} label="Points scored" />
      </div>

      <p className="px-5 pb-1 pt-5 text-xs font-semibold uppercase tracking-wide text-muted">Matches</p>
      {stats.matches.length === 0 ? (
        <p className="px-5 pb-6 text-sm text-muted">No matches played yet.</p>
      ) : (
        <ul className="flex flex-col gap-2 px-5 pb-6">
          {stats.matches.map((m) => (
            <li
              key={m.matchId}
              className="flex items-center justify-between gap-3 rounded-xl border border-card-border bg-card px-4 py-3"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-accent">{m.roundLabel}</p>
                <p className="mt-0.5 font-semibold">vs {m.opponentName}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-extrabold">{m.result}</p>
                <p className="text-xs text-muted">{m.score}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatTile({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-3.5 text-center">
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}
