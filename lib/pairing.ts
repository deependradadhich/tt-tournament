// Pure bracket-pairing math shared between the server (lib/bracket.ts) and the
// client-side Draw Preview screen, so the previewed matchups are exactly what
// gets persisted when the draw is locked.

export function nextPowerOfTwo(n: number) {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Pairs an ordered list of ids into round-1 matchups, giving each bye its own match (never two byes together). */
export function buildRound1Pairs<T>(orderedIds: T[], bracketSize: number): [T, T | null][] {
  const numByes = bracketSize - orderedIds.length;
  const pairs: [T, T | null][] = [];
  let idx = 0;
  for (let i = 0; i < numByes; i++) {
    pairs.push([orderedIds[idx], null]);
    idx++;
  }
  while (idx < orderedIds.length) {
    pairs.push([orderedIds[idx], orderedIds[idx + 1]]);
    idx += 2;
  }
  return pairs;
}

/**
 * Round-robin schedule via the circle method: fix the first entrant, rotate the
 * rest each round. Odd counts get a phantom bye slot that's simply dropped from
 * that round's fixtures (no match row is ever created for it).
 */
export function roundRobinRounds<T>(entrants: T[]): [T, T][][] {
  let arr: (T | null)[] = [...entrants];
  if (arr.length % 2 === 1) arr.push(null);
  const n = arr.length;
  const rounds: [T, T][][] = [];

  for (let r = 0; r < n - 1; r++) {
    const roundPairs: [T, T][] = [];
    for (let i = 0; i < n / 2; i++) {
      const home = arr[i];
      const away = arr[n - 1 - i];
      if (home !== null && away !== null) roundPairs.push([home, away]);
    }
    rounds.push(roundPairs);

    const fixed = arr[0];
    const rest = arr.slice(1);
    const last = rest.pop() as T | null;
    rest.unshift(last);
    arr = [fixed, ...rest];
  }

  return rounds;
}
