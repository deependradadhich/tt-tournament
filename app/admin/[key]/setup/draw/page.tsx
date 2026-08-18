import { notFound, redirect } from "next/navigation";
import { getTournamentByAdminKey } from "@/lib/tournament-data";
import { getEntrants } from "@/lib/entrants";
import { ScreenHeader } from "@/components/ui/screen-header";
import { DrawPreview } from "@/components/draw-preview";

export default async function SetupDrawPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const tournament = await getTournamentByAdminKey(key);
  if (!tournament) notFound();
  if (tournament.status !== "DRAFT") redirect(`/admin/${key}/results`);

  const isDoubles = tournament.format === "DOUBLES";
  if (isDoubles) {
    const unpaired = tournament.players.filter((p) => !p.teamId).length;
    const teamsReady = tournament.teams.length >= 2 && unpaired <= 1;
    if (!teamsReady) redirect(`/admin/${key}/setup/teams`);
  } else if (tournament.players.length < 2) {
    redirect(`/admin/${key}/setup/players`);
  }

  const entrants = getEntrants(tournament);

  return (
    <div className="flex flex-1 flex-col">
      <ScreenHeader
        title="Draw Preview"
        backHref={`/admin/${tournament.adminKey}/setup/${isDoubles ? "teams" : "players"}`}
        subtitle="Round 1 matchups — reshuffle until it looks right, then lock it in."
      />
      <DrawPreview
        adminKey={tournament.adminKey}
        entrants={entrants}
        matchType={tournament.matchType}
      />
    </div>
  );
}
