import Link from "next/link";
import { prisma } from "@/lib/db";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/buttons";
import { DeleteTournamentButton } from "@/components/delete-tournament-button";

const STATUS_LABEL = {
  DRAFT: "Registration open",
  LOCKED: "In progress",
  COMPLETED: "Completed",
};

export default async function Home() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { players: true } } },
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-1 px-5 pb-2 pt-6">
        <p className="text-xs font-bold uppercase tracking-wide text-accent">Office League</p>
        <h1 className="text-3xl font-extrabold">Table Tennis</h1>
      </div>

      {tournaments.length === 0 ? (
        <EmptyState
          title="Nothing on the schedule yet"
          description="Rally up the office and get a tournament going in a couple minutes."
          action={
            <Link href="/new" className="w-full">
              <Button variant="accent">Start a Tournament</Button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-1 flex-col gap-4 px-5 py-4">
          <ul className="flex flex-col gap-3">
            {tournaments.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-2 rounded-xl border border-card-border bg-card p-4"
              >
                <Link href={`/t/${t.id}`} className="flex min-w-0 flex-1 items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{t.name}</p>
                    <p className="truncate text-sm text-muted">
                      {t.format === "SINGLES" ? "Singles" : "Doubles"} ·{" "}
                      {t.matchType === "KNOCKOUT" ? "Knockout" : "Round Robin"} · {t._count.players} player
                      {t._count.players === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-xs font-semibold text-muted">
                    {STATUS_LABEL[t.status]}
                  </span>
                </Link>
                <DeleteTournamentButton tournamentId={t.id} tournamentName={t.name} />
              </li>
            ))}
          </ul>
          <Link href="/new">
            <Button variant="accent">Start a Tournament</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
