import { notFound, redirect } from "next/navigation";
import { getTournamentByAdminKey } from "@/lib/tournament-data";
import { ScreenHeader } from "@/components/ui/screen-header";
import { TeamFormation } from "@/components/team-formation";

export default async function SetupTeamsPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const tournament = await getTournamentByAdminKey(key);
  if (!tournament) notFound();
  if (tournament.status !== "DRAFT") redirect(`/admin/${key}/results`);
  if (tournament.format !== "DOUBLES") redirect(`/admin/${key}/setup/draw`);
  if (tournament.players.length < 4) redirect(`/admin/${key}/setup/players`);

  return (
    <div className="flex flex-1 flex-col">
      <ScreenHeader
        title="Form Teams"
        backHref={`/admin/${tournament.adminKey}/setup/players`}
        subtitle="Tap two players to pair them, or shuffle everyone at once."
      />
      <TeamFormation
        adminKey={tournament.adminKey}
        players={tournament.players.map((p) => ({ id: p.id, name: p.name, teamId: p.teamId }))}
        teams={tournament.teams.map((t) => ({ id: t.id, name: t.name }))}
      />
    </div>
  );
}
