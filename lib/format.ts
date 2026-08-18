export function roundName(round: number, totalRounds: number, matchType: "KNOCKOUT" | "ROUND_ROBIN" = "KNOCKOUT") {
  if (matchType === "ROUND_ROBIN") return `Round ${round}`;
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return "Final";
  if (fromEnd === 1) return "Semifinal";
  if (fromEnd === 2) return "Quarterfinal";
  return `Round of ${2 ** (fromEnd + 1)}`;
}

export function totalRoundsFor(matchCount: { round: number }[]) {
  return matchCount.reduce((max, m) => Math.max(max, m.round), 0);
}
