import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getTournamentByAdminKey } from "@/lib/tournament-data";
import { addPlayer } from "@/lib/actions";
import { ScreenHeader } from "@/components/ui/screen-header";
import { TextField } from "@/components/ui/text-field";
import { Button } from "@/components/ui/buttons";
import { AvatarCircle } from "@/components/ui/avatar";
import { RemovePlayerButton } from "@/components/admin-controls";

export default async function SetupPlayersPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const tournament = await getTournamentByAdminKey(key);
  if (!tournament) notFound();
  if (tournament.status !== "DRAFT") redirect(`/admin/${key}/results`);

  const addPlayerWithKey = addPlayer.bind(null, tournament.adminKey);
  const isDoubles = tournament.format === "DOUBLES";
  const isOdd = !isDoubles && tournament.players.length % 2 === 1;
  const minRequired = isDoubles ? 4 : 2;
  const proceedHref = isDoubles ? `/admin/${tournament.adminKey}/setup/teams` : `/admin/${tournament.adminKey}/setup/draw`;
  const proceedLabel = isDoubles ? "Form Teams" : "Generate Draw";

  return (
    <div className="flex flex-1 flex-col">
      <ScreenHeader title="Players" backHref="/" />

      <div className="flex flex-1 flex-col gap-4 px-5 py-2">
        <form action={addPlayerWithKey} className="flex items-end gap-2">
          <div className="flex-1">
            <TextField label="" name="name" placeholder="Player name" required className="py-3" />
          </div>
          <Button type="submit" variant="black" className="w-auto px-6 py-3">
            Add
          </Button>
        </form>

        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted">{tournament.players.length} added</p>
          {isOdd && tournament.players.length > 0 && (
            <p className="text-sm font-medium text-accent">
              Odd number — one player gets a first-round bye.
            </p>
          )}
        </div>

        {tournament.players.length > 0 && (
          <ul className="flex flex-col gap-2">
            {tournament.players.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-card-border bg-card px-4 py-3"
              >
                <AvatarCircle name={p.name} />
                <span className="flex-1 font-medium">{p.name}</span>
                <RemovePlayerButton adminKey={tournament.adminKey} playerId={p.id} />
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pb-4 pt-4">
          {tournament.players.length >= minRequired ? (
            <Link href={proceedHref}>
              <Button variant="black">{proceedLabel}</Button>
            </Link>
          ) : (
            <Button variant="black" disabled>
              {proceedLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
