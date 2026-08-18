import { notFound } from "next/navigation";
import { getTournamentBySlugId } from "@/lib/tournament-data";
import { TabBar } from "@/components/ui/tab-bar";

export default async function PublicTabsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tournament = await getTournamentBySlugId(id);
  if (!tournament) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col">{children}</div>
      <TabBar base={`/t/${id}`} rosterLabel={tournament.format === "DOUBLES" ? "Teams" : "Players"} />
    </div>
  );
}
