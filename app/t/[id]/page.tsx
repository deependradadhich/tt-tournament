import { notFound, redirect } from "next/navigation";
import { getTournamentBySlugId } from "@/lib/tournament-data";
import { EmptyState } from "@/components/ui/empty-state";
import { HomeLink } from "@/components/ui/home-link";

export default async function PublicTournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tournament = await getTournamentBySlugId(id);
  if (!tournament) notFound();

  if (tournament.status !== "DRAFT") redirect(`/t/${id}/results`);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <HomeLink />
      <div className="px-5 pt-4">
        <p className="text-xs font-bold uppercase tracking-wide text-accent">Office League</p>
        <h1 className="text-2xl font-extrabold">{tournament.name}</h1>
        <p className="text-sm text-muted">
          Singles · Knockout · Best of {tournament.bestOf}, first to {tournament.pointsPerGame}
          {tournament.winBy2 ? " (win by 2)" : ""}
          {tournament.venue ? ` · ${tournament.venue}` : ""}
        </p>
      </div>

      {tournament.players.length === 0 ? (
        <EmptyState
          title="Nothing on the schedule yet"
          description="The organizer is still setting up the draw."
        />
      ) : (
        <div className="px-5">
          <p className="mb-2 text-sm font-semibold text-muted">
            Registered players ({tournament.players.length}
            {tournament.maxPlayers ? `/${tournament.maxPlayers}` : ""})
          </p>
          <ul className="flex flex-wrap gap-2 text-sm">
            {tournament.players.map((p) => (
              <li key={p.id} className="rounded-full border border-card-border bg-card px-3 py-1.5">
                {p.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
