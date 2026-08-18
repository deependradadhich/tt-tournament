import { notFound } from "next/navigation";
import Link from "next/link";
import { getTournamentBySlugId } from "@/lib/tournament-data";
import { getEntrants } from "@/lib/entrants";
import { AvatarCircle } from "@/components/ui/avatar";
import { entrantRecord } from "@/lib/stats";

export default async function PublicRosterTabPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tournament = await getTournamentBySlugId(id);
  if (!tournament) notFound();

  const isDoubles = tournament.format === "DOUBLES";
  const entrants = getEntrants(tournament);
  const teamById = new Map(tournament.teams.map((t) => [t.id, t]));

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="px-5 pt-4 text-2xl font-extrabold">{isDoubles ? "Teams" : "Players"}</h1>

      <ul className="flex flex-col gap-2 px-5">
        {entrants.map((e) => {
          const record = entrantRecord(e.id, tournament.matches, isDoubles);
          const team = isDoubles ? teamById.get(e.id) : undefined;
          const subtitle = team ? team.players.map((p) => p.name).join(" & ") : undefined;
          return (
            <li key={e.id}>
              <Link
                href={`/t/${tournament.id}/roster/${e.id}`}
                className="flex items-center gap-3 rounded-xl border border-card-border bg-card px-4 py-3"
              >
                <AvatarCircle name={e.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{e.name}</p>
                  {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
                </div>
                <span className="flex-shrink-0 text-sm text-muted">
                  {record.played === 0 ? "No matches yet" : `${record.wins}W – ${record.losses}L`}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
