import { notFound, redirect } from "next/navigation";
import { getTournamentByAdminKey } from "@/lib/tournament-data";
import { nextSetupPath } from "@/lib/setup-flow";
import { TabBar } from "@/components/ui/tab-bar";
import { HomeLink } from "@/components/ui/home-link";

export default async function AdminTabsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const tournament = await getTournamentByAdminKey(key);
  if (!tournament) notFound();
  if (tournament.status === "DRAFT") redirect(nextSetupPath(key, tournament));

  return (
    <div className="flex flex-1 flex-col">
      <HomeLink />
      <div className="flex flex-1 flex-col">{children}</div>
      <TabBar base={`/admin/${key}`} rosterLabel={tournament.format === "DOUBLES" ? "Teams" : "Players"} />
    </div>
  );
}
