import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { nextPowerOfTwo, shuffle, buildRound1Pairs, roundRobinRounds } from "@/lib/pairing";

type Tx = Prisma.TransactionClient;

function entrantData(
  doubles: boolean,
  aId: string | null,
  bId: string | null,
  winnerId: string | null
) {
  return doubles
    ? { teamAId: aId, teamBId: bId, winnerTeamId: winnerId }
    : { playerAId: aId, playerBId: bId, winnerId };
}

/** Writes a winner into the next match's slot and flips it to READY once both slots are filled. */
async function advanceWinner(
  tx: Tx,
  nextMatchId: string,
  nextMatchSlot: number,
  winnerId: string,
  doubles: boolean
) {
  const field = doubles
    ? nextMatchSlot === 0
      ? "teamAId"
      : "teamBId"
    : nextMatchSlot === 0
      ? "playerAId"
      : "playerBId";
  const updated = await tx.match.update({ where: { id: nextMatchId }, data: { [field]: winnerId } });
  const aFilled = doubles ? updated.teamAId : updated.playerAId;
  const bFilled = doubles ? updated.teamBId : updated.playerBId;
  if (aFilled && bFilled && updated.status === "PENDING") {
    await tx.match.update({ where: { id: nextMatchId }, data: { status: "READY" } });
  }
}

async function loadTournamentForDraw(tx: Tx, tournamentId: string) {
  const tournament = await tx.tournament.findUniqueOrThrow({
    where: { id: tournamentId },
    include: { players: true, teams: true },
  });
  if (tournament.status !== "DRAFT") {
    throw new Error("This tournament's draw has already been generated.");
  }
  const doubles = tournament.format === "DOUBLES";
  const entrantIds = doubles ? tournament.teams.map((t) => t.id) : tournament.players.map((p) => p.id);
  if (entrantIds.length < 2) {
    throw new Error(
      doubles ? "Form at least 2 teams before generating the draw." : "Add at least 2 players before generating the draw."
    );
  }
  return { tournament, doubles, entrantIds };
}

function resolveOrder(entrantIds: string[], orderedEntrantIds: string[] | undefined) {
  if (!orderedEntrantIds) return shuffle(entrantIds);
  const same =
    orderedEntrantIds.length === entrantIds.length &&
    new Set(orderedEntrantIds).size === entrantIds.length &&
    orderedEntrantIds.every((id) => entrantIds.includes(id));
  if (!same) throw new Error("The draw order doesn't match this tournament's current entrants.");
  return orderedEntrantIds;
}

/**
 * Generates the tournament's matches (knockout bracket or round-robin schedule,
 * for players or teams depending on format) and locks the tournament.
 * Pass `orderedEntrantIds` to lock in an exact draw previewed client-side;
 * omit it to let the server pick a random order itself.
 */
export async function generateDraw(tournamentId: string, orderedEntrantIds?: string[]) {
  await prisma.$transaction(async (tx) => {
    const { tournament, doubles, entrantIds } = await loadTournamentForDraw(tx, tournamentId);
    const orderedIds = resolveOrder(entrantIds, orderedEntrantIds);

    if (tournament.matchType === "KNOCKOUT") {
      await generateKnockoutTx(tx, tournamentId, orderedIds, doubles);
    } else {
      await generateRoundRobinTx(tx, tournamentId, orderedIds, doubles);
    }

    await tx.tournament.update({ where: { id: tournamentId }, data: { status: "LOCKED" } });
  });
}

async function generateKnockoutTx(tx: Tx, tournamentId: string, orderedIds: string[], doubles: boolean) {
  const bracketSize = nextPowerOfTwo(orderedIds.length);
  const totalRounds = Math.log2(bracketSize);
  const round1Pairs = buildRound1Pairs(orderedIds, bracketSize);

  // matchIdsByRoundDesc[0] = final round's match ids, last entry = round 1's match ids
  const matchIdsByRoundDesc: string[][] = [];

  for (let round = totalRounds; round >= 1; round--) {
    const countInRound = bracketSize / 2 ** round;
    const roundIds: string[] = [];
    for (let position = 0; position < countInRound; position++) {
      let nextMatchId: string | null = null;
      let nextMatchSlot: number | null = null;
      if (round < totalRounds) {
        nextMatchId = matchIdsByRoundDesc[totalRounds - round - 1][Math.floor(position / 2)];
        nextMatchSlot = position % 2;
      }

      let aId: string | null = null;
      let bId: string | null = null;
      let status: "PENDING" | "READY" | "BYE" = "PENDING";
      let winnerId: string | null = null;

      if (round === 1) {
        const [a, b] = round1Pairs[position];
        aId = a;
        bId = b;
        if (aId && bId) status = "READY";
        else {
          status = "BYE";
          winnerId = aId ?? bId;
        }
      }

      const match = await tx.match.create({
        data: {
          tournamentId,
          round,
          position,
          status,
          nextMatchId,
          nextMatchSlot,
          ...entrantData(doubles, aId, bId, winnerId),
        },
      });
      roundIds.push(match.id);
    }
    matchIdsByRoundDesc.push(roundIds);
  }

  const round1Ids = matchIdsByRoundDesc[totalRounds - 1];
  for (const matchId of round1Ids) {
    const match = await tx.match.findUniqueOrThrow({ where: { id: matchId } });
    const winnerId = doubles ? match.winnerTeamId : match.winnerId;
    if (match.status === "BYE" && match.nextMatchId && match.nextMatchSlot !== null && winnerId) {
      await advanceWinner(tx, match.nextMatchId, match.nextMatchSlot, winnerId, doubles);
    }
  }
}

async function generateRoundRobinTx(tx: Tx, tournamentId: string, orderedIds: string[], doubles: boolean) {
  const rounds = roundRobinRounds(orderedIds);
  for (let i = 0; i < rounds.length; i++) {
    const round = rounds[i];
    for (let position = 0; position < round.length; position++) {
      const [a, b] = round[position];
      await tx.match.create({
        data: {
          tournamentId,
          round: i + 1,
          position,
          status: "READY",
          ...entrantData(doubles, a, b, null),
        },
      });
    }
  }
}

/** Marks a match complete, records the winner, and advances them into the next round (knockout) or completes the tournament. */
export async function completeMatchTx(tx: Tx, matchId: string, winnerId: string, doubles: boolean) {
  const match = await tx.match.update({
    where: { id: matchId },
    data: doubles ? { status: "COMPLETED", winnerTeamId: winnerId } : { status: "COMPLETED", winnerId },
  });

  if (match.nextMatchId && match.nextMatchSlot !== null) {
    await advanceWinner(tx, match.nextMatchId, match.nextMatchSlot, winnerId, doubles);
    return;
  }

  // Round robin has no propagation chain; completion of the tournament is decided
  // once every scheduled match has a result, which the caller checks separately
  // for knockout (final match has no nextMatchId) vs round robin (all matches done).
  const remaining = await tx.match.count({
    where: { tournamentId: match.tournamentId, status: { in: ["PENDING", "READY", "LIVE"] } },
  });
  if (remaining === 0) {
    await tx.tournament.update({ where: { id: match.tournamentId }, data: { status: "COMPLETED" } });
  }
}

export async function completeMatch(matchId: string, winnerId: string, doubles: boolean) {
  await prisma.$transaction((tx) => completeMatchTx(tx, matchId, winnerId, doubles));
}
