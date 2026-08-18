import { prisma } from "@/lib/db";

const matchInclude = {
  playerA: true,
  playerB: true,
  winner: true,
  teamA: { include: { players: true } },
  teamB: { include: { players: true } },
  winnerTeam: true,
} as const;

export function getTournamentBySlugId(id: string) {
  return prisma.tournament.findUnique({
    where: { id },
    include: {
      players: { orderBy: { createdAt: "asc" } },
      teams: { orderBy: { createdAt: "asc" }, include: { players: true } },
      matches: {
        orderBy: [{ round: "asc" }, { position: "asc" }],
        include: matchInclude,
      },
    },
  });
}

export function getTournamentByAdminKey(adminKey: string) {
  return prisma.tournament.findUnique({
    where: { adminKey },
    include: {
      players: { orderBy: { createdAt: "asc" } },
      teams: { orderBy: { createdAt: "asc" }, include: { players: true } },
      matches: {
        orderBy: [{ round: "asc" }, { position: "asc" }],
        include: matchInclude,
      },
    },
  });
}

export type TournamentWithData = NonNullable<
  Awaited<ReturnType<typeof getTournamentBySlugId>>
>;
export type MatchWithPlayers = TournamentWithData["matches"][number];
export type TeamWithPlayers = TournamentWithData["teams"][number];
