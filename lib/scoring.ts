export type Game = { a: number; b: number };

export type ScoringRules = {
  pointsPerGame: number;
  winBy2: boolean;
  bestOf: number;
};

export function gamesToWin(bestOf: number) {
  return Math.floor(bestOf / 2) + 1;
}

export function isGameWon(game: Game, rules: ScoringRules): "A" | "B" | null {
  const { a, b } = game;
  const target = rules.pointsPerGame;
  const leader = a > b ? "A" : b > a ? "B" : null;
  if (!leader) return null;
  const leadScore = Math.max(a, b);
  const margin = Math.abs(a - b);
  if (leadScore < target) return null;
  if (rules.winBy2 && margin < 2) return null;
  if (!rules.winBy2 && margin < 1) return null;
  return leader;
}

export function parseGames(json: string): Game[] {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((g) => typeof g?.a === "number" && typeof g?.b === "number")
      .map((g) => ({ a: g.a, b: g.b }));
  } catch {
    return [];
  }
}

export function serializeGames(games: Game[]): string {
  return JSON.stringify(games);
}

export type MatchState = {
  games: Game[];
  gamesWonA: number;
  gamesWonB: number;
  currentGameIndex: number;
  matchWinner: "A" | "B" | null;
};

/** Derives games-won counts and whether the match is decided from a raw games array. */
export function computeMatchState(games: Game[], rules: ScoringRules): MatchState {
  const needed = gamesToWin(rules.bestOf);
  let gamesWonA = 0;
  let gamesWonB = 0;

  for (const game of games) {
    const result = isGameWon(game, rules);
    if (result === "A") gamesWonA++;
    else if (result === "B") gamesWonB++;
  }

  const matchWinner: "A" | "B" | null =
    gamesWonA >= needed ? "A" : gamesWonB >= needed ? "B" : null;

  return {
    games,
    gamesWonA,
    gamesWonB,
    currentGameIndex: games.length - 1,
    matchWinner,
  };
}

/**
 * Applies a +1/-1 point delta to the active side of the current (or a new) game
 * and returns the updated games array. Does nothing once the match is already decided.
 */
export function applyPoint(
  games: Game[],
  side: "A" | "B",
  delta: 1 | -1,
  rules: ScoringRules
): Game[] {
  const state = computeMatchState(games, rules);
  if (state.matchWinner) return games;

  const next = games.map((g) => ({ ...g }));
  const last = next[next.length - 1];

  const needsNewGame = !last || isGameWon(last, rules) !== null;
  const target = needsNewGame ? { a: 0, b: 0 } : last;
  if (needsNewGame) next.push(target);

  if (side === "A") target.a = Math.max(0, target.a + delta);
  else target.b = Math.max(0, target.b + delta);

  return next;
}
