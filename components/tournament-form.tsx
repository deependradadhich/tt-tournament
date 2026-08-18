"use client";

import { useState } from "react";
import { createTournament } from "@/lib/actions";
import { TextField } from "@/components/ui/text-field";
import { PillToggle } from "@/components/ui/pill-toggle";
import { Button } from "@/components/ui/buttons";

export function TournamentForm() {
  const [name, setName] = useState("");

  return (
    <form action={createTournament} className="flex flex-1 flex-col gap-6 px-5 py-4">
      <TextField
        label="Tournament Name"
        name="name"
        placeholder="e.g. Q3 Office Smash"
        required
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField label="Venue (optional)" name="venue" placeholder="Break Room · Table 1" />

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Format</span>
        <PillToggle
          name="format"
          defaultValue="SINGLES"
          options={[
            { value: "SINGLES", label: "Singles" },
            { value: "DOUBLES", label: "Doubles" },
          ]}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Match Type</span>
        <PillToggle
          name="matchType"
          defaultValue="KNOCKOUT"
          options={[
            { value: "KNOCKOUT", label: "Knockout" },
            { value: "ROUND_ROBIN", label: "Round Robin" },
          ]}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Points per Game</span>
        <PillToggle
          name="pointsPerGame"
          defaultValue="11"
          options={[
            { value: "11", label: "11" },
            { value: "21", label: "21" },
          ]}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Best of</span>
        <PillToggle
          name="bestOf"
          defaultValue="3"
          options={[
            { value: "3", label: "3 games" },
            { value: "5", label: "5 games" },
          ]}
        />
        <input type="hidden" name="winBy2" value="on" />
      </div>

      <div className="mt-auto pt-4">
        <Button type="submit" variant="black" disabled={name.trim() === ""}>
          Continue
        </Button>
      </div>
    </form>
  );
}
