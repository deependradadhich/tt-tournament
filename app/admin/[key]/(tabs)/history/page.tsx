import { notFound } from "next/navigation";
import { getTournamentByAdminKey } from "@/lib/tournament-data";
import { matchEntrantA, matchEntrantB, matchEntrantAId, matchWinnerEntrantId } from "@/lib/entrants";
import { parseGames, isGameWon } from "@/lib/scoring";
import { roundName, totalRoundsFor } from "@/lib/format";
import { EmptyState } from "@/components/ui/empty-state";

export default async function HistoryTabPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const tournament = await getTournamentByAdminKey(key);
  if (!tournament) notFound();

  const doubles = tournament.format === "DOUBLES";
  const totalRounds = totalRoundsFor(tournament.matches);
  const rules = {
    pointsPerGame: tournament.pointsPerGame,
    winBy2: tournament.winBy2,
    bestOf: tournament.bestOf,
  };

  const finished = tournament.matches
    .filter((m) => m.status === "COMPLETED" && matchEntrantA(m, doubles) && matchEntrantB(m, doubles))
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="px-5 pt-4 text-2xl font-extrabold">Match History</h1>

      {finished.length === 0 ? (
        <EmptyState title="No matches finished yet." />
      ) : (
        <ul className="flex flex-col gap-2 px-5">
          {finished.map((m) => {
            const a = matchEntrantA(m, doubles)!;
            const b = matchEntrantB(m, doubles)!;
            const winnerId = matchWinnerEntrantId(m, doubles);
            const gamesLine = parseGames(m.games)
              .filter((g) => isGameWon(g, rules) !== null)
              .map((g) => `${g.a}–${g.b}`)
              .join(", ");
            const tossNote = m.tossWinnerId
              ? `${m.tossWinnerId === matchEntrantAId(m, doubles) ? a.name : b.name} won the toss`
              : null;
            return (
              <li key={m.id} className="rounded-xl border border-card-border bg-card px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                  {roundName(m.round, totalRounds, tournament.matchType)}
                </p>
                <p className="mt-1.5 font-semibold">
                  <span className={winnerId === a.id ? "" : "text-muted"}>{a.name}</span> vs{" "}
                  <span className={winnerId === b.id ? "" : "text-muted"}>{b.name}</span>
                </p>
                <p className="mt-0.5 text-sm text-muted">{gamesLine}</p>
                {tossNote && <p className="mt-0.5 text-xs text-faint">{tossNote}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
