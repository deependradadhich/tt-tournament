import { notFound, redirect } from "next/navigation";
import { getTournamentByAdminKey } from "@/lib/tournament-data";
import { nextSetupPath } from "@/lib/setup-flow";

export default async function AdminEntryPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const tournament = await getTournamentByAdminKey(key);
  if (!tournament) notFound();
  redirect(nextSetupPath(key, tournament));
}
