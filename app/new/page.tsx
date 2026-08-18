import { ScreenHeader } from "@/components/ui/screen-header";
import { TournamentForm } from "@/components/tournament-form";

export default function NewTournamentPage() {
  return (
    <div className="flex flex-1 flex-col">
      <ScreenHeader title="New Tournament" backHref="/" />
      <TournamentForm />
    </div>
  );
}
