"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { generateDraw, completeMatchTx } from "@/lib/bracket";
import { applyPoint, computeMatchState, parseGames, serializeGames } from "@/lib/scoring";
import { shuffle } from "@/lib/pairing";

async function requireTournamentByAdminKey(adminKey: string) {
  const tournament = await prisma.tournament.findUnique({ where: { adminKey } });
  if (!tournament) throw new Error("Tournament not found.");
  return tournament;
}

function revalidateTournamentPaths(adminKey: string, tournamentId: string) {
  revalidatePath(`/admin/${adminKey}`, "layout");
  revalidatePath(`/t/${tournamentId}`, "layout");
}

const createTournamentSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  venue: z.string().trim().max(120).optional(),
  format: z.enum(["SINGLES", "DOUBLES"]),
  matchType: z.enum(["KNOCKOUT", "ROUND_ROBIN"]),
  pointsPerGame: z.coerce.number().int().min(3).max(99),
  bestOf: z.coerce.number().int().refine((v) => [1, 3, 5].includes(v), "Best of must be 1, 3, or 5"),
  winBy2: z.coerce.boolean(),
});

export async function createTournament(formData: FormData) {
  const raw = {
    name: formData.get("name"),
    venue: formData.get("venue") || undefined,
    format: formData.get("format"),
    matchType: formData.get("matchType"),
    pointsPerGame: formData.get("pointsPerGame"),
    bestOf: formData.get("bestOf"),
    winBy2: formData.get("winBy2") === "on",
  };
  const data = createTournamentSchema.parse(raw);

  const adminKey = nanoid(10);
  const tournament = await prisma.tournament.create({
    data: {
      name: data.name,
      venue: data.venue || null,
      format: data.format,
      matchType: data.matchType,
      pointsPerGame: data.pointsPerGame,
      bestOf: data.bestOf,
      winBy2: data.winBy2,
      adminKey,
    },
  });

  revalidatePath("/");
  redirect(`/admin/${tournament.adminKey}/setup/players`);
}

const addPlayerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  contact: z.string().trim().max(200).optional(),
});

export async function addPlayer(adminKey: string, formData: FormData) {
  const tournament = await requireTournamentByAdminKey(adminKey);
  if (tournament.status !== "DRAFT") {
    throw new Error("Players can no longer be added — the draw is already locked.");
  }

  const data = addPlayerSchema.parse({
    name: formData.get("name"),
    contact: formData.get("contact") || undefined,
  });

  if (tournament.maxPlayers) {
    const count = await prisma.player.count({ where: { tournamentId: tournament.id } });
    if (count >= tournament.maxPlayers) {
      throw new Error("This tournament is already full.");
    }
  }

  await prisma.player.create({
    data: { tournamentId: tournament.id, name: data.name, contact: data.contact || null },
  });

  revalidateTournamentPaths(adminKey, tournament.id);
}

export async function removePlayer(adminKey: string, playerId: string) {
  const tournament = await requireTournamentByAdminKey(adminKey);
  if (tournament.status !== "DRAFT") {
    throw new Error("Players can no longer be removed — the draw is already locked.");
  }
  await prisma.$transaction(async (tx) => {
    const player = await tx.player.findUniqueOrThrow({ where: { id: playerId } });
    if (player.teamId) {
      await tx.player.updateMany({ where: { teamId: player.teamId }, data: { teamId: null } });
      await tx.team.delete({ where: { id: player.teamId } });
    }
    await tx.player.delete({ where: { id: playerId } });
  });
  revalidateTournamentPaths(adminKey, tournament.id);
}

function teamName(a: { name: string }, b: { name: string }) {
  return `${a.name} / ${b.name}`;
}

export async function pairPlayers(adminKey: string, playerIdA: string, playerIdB: string) {
  const tournament = await requireTournamentByAdminKey(adminKey);
  if (tournament.status !== "DRAFT") throw new Error("Teams can no longer be changed — the draw is already locked.");
  if (playerIdA === playerIdB) throw new Error("Pick two different players.");

  await prisma.$transaction(async (tx) => {
    const [a, b] = await Promise.all([
      tx.player.findUniqueOrThrow({ where: { id: playerIdA } }),
      tx.player.findUniqueOrThrow({ where: { id: playerIdB } }),
    ]);
    if (a.teamId || b.teamId) throw new Error("One of these players is already on a team.");

    const team = await tx.team.create({ data: { tournamentId: tournament.id, name: teamName(a, b) } });
    await tx.player.updateMany({ where: { id: { in: [playerIdA, playerIdB] } }, data: { teamId: team.id } });
  });

  revalidateTournamentPaths(adminKey, tournament.id);
}

export async function randomPairTeams(adminKey: string) {
  const tournament = await requireTournamentByAdminKey(adminKey);
  if (tournament.status !== "DRAFT") throw new Error("Teams can no longer be changed — the draw is already locked.");

  await prisma.$transaction(async (tx) => {
    const unpaired = await tx.player.findMany({
      where: { tournamentId: tournament.id, teamId: null },
      orderBy: { createdAt: "asc" },
    });
    const shuffled = shuffle(unpaired);
    for (let i = 0; i + 1 < shuffled.length; i += 2) {
      const a = shuffled[i];
      const b = shuffled[i + 1];
      const team = await tx.team.create({ data: { tournamentId: tournament.id, name: teamName(a, b) } });
      await tx.player.updateMany({ where: { id: { in: [a.id, b.id] } }, data: { teamId: team.id } });
    }
  });

  revalidateTournamentPaths(adminKey, tournament.id);
}

export async function removeTeam(adminKey: string, teamId: string) {
  const tournament = await requireTournamentByAdminKey(adminKey);
  if (tournament.status !== "DRAFT") throw new Error("Teams can no longer be changed — the draw is already locked.");
  await prisma.$transaction(async (tx) => {
    await tx.player.updateMany({ where: { teamId }, data: { teamId: null } });
    await tx.team.delete({ where: { id: teamId } });
  });
  revalidateTournamentPaths(adminKey, tournament.id);
}

export async function lockDraw(adminKey: string, orderedEntrantIds: string[]) {
  const tournament = await requireTournamentByAdminKey(adminKey);
  await generateDraw(tournament.id, orderedEntrantIds);
  revalidateTournamentPaths(adminKey, tournament.id);
  redirect(`/admin/${adminKey}/results`);
}

export async function recordToss(
  adminKey: string,
  matchId: string,
  tossWinnerId: string,
  tossChoice: "SERVE" | "SIDE"
) {
  const tournament = await requireTournamentByAdminKey(adminKey);
  const match = await prisma.match.findUniqueOrThrow({ where: { id: matchId } });
  if (match.tournamentId !== tournament.id) throw new Error("Match does not belong to this tournament.");
  if (match.status !== "READY") throw new Error("Toss can only be recorded once both entrants are set.");

  await prisma.match.update({
    where: { id: matchId },
    data: { tossWinnerId, tossChoice, status: "LIVE" },
  });

  revalidateTournamentPaths(adminKey, tournament.id);
  revalidatePath(`/admin/${adminKey}/match/${matchId}`);
  revalidatePath(`/t/${tournament.id}/match/${matchId}`);
}

export async function adjustScore(adminKey: string, matchId: string, side: "A" | "B", delta: 1 | -1) {
  const tournament = await requireTournamentByAdminKey(adminKey);
  const doubles = tournament.format === "DOUBLES";
  const rules = {
    pointsPerGame: tournament.pointsPerGame,
    winBy2: tournament.winBy2,
    bestOf: tournament.bestOf,
  };

  // Read-modify-write inside a transaction so rapid taps can't race and lose points.
  await prisma.$transaction(async (tx) => {
    const match = await tx.match.findUniqueOrThrow({ where: { id: matchId } });
    if (match.tournamentId !== tournament.id) throw new Error("Match does not belong to this tournament.");
    if (match.status !== "LIVE") throw new Error("Score can only be entered once the match is live.");
    const aId = doubles ? match.teamAId : match.playerAId;
    const bId = doubles ? match.teamBId : match.playerBId;
    if (!aId || !bId) throw new Error("Both entrants must be set.");

    const games = applyPoint(parseGames(match.games), side, delta, rules);
    await tx.match.update({ where: { id: matchId }, data: { games: serializeGames(games) } });

    const state = computeMatchState(games, rules);
    if (state.matchWinner) {
      const winnerId = state.matchWinner === "A" ? aId : bId;
      await completeMatchTx(tx, matchId, winnerId, doubles);
    }
  });

  revalidateTournamentPaths(adminKey, tournament.id);
  revalidatePath(`/admin/${adminKey}/match/${matchId}`);
  revalidatePath(`/t/${tournament.id}/match/${matchId}`);
}

export async function resetTournament(adminKey: string) {
  const tournament = await requireTournamentByAdminKey(adminKey);
  await prisma.tournament.delete({ where: { id: tournament.id } });
  revalidatePath("/");
  redirect("/");
}

/** Deletes a tournament straight from the home list (no admin key needed) so stray/test tournaments can be cleaned up. */
export async function deleteTournament(tournamentId: string) {
  await prisma.tournament.delete({ where: { id: tournamentId } });
  revalidatePath("/");
}
