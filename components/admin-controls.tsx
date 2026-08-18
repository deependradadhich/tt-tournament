"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { removePlayer } from "@/lib/actions";
import { CloseIcon } from "@/components/ui/icons";

export function RemovePlayerButton({ adminKey, playerId }: { adminKey: string; playerId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={isPending}
      aria-label="Remove player"
      onClick={() =>
        startTransition(async () => {
          await removePlayer(adminKey, playerId);
          router.refresh();
        })
      }
      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-faint-bg text-muted disabled:opacity-50"
    >
      <CloseIcon className="h-3.5 w-3.5" />
    </button>
  );
}
