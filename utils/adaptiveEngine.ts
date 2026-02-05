export type Difficulty = "easy" | "medium" | "hard";

export interface AdaptiveState {
  nextDifficulty: Difficulty;
  shouldResetStreak: boolean;
}

export function calculateNextDifficulty(
  current: Difficulty,
  streak: number,
): AdaptiveState {
  if (streak >= 3) {
    if (current === "easy")
      return { nextDifficulty: "medium", shouldResetStreak: true };
    if (current === "medium")
      return { nextDifficulty: "hard", shouldResetStreak: true };
    return { nextDifficulty: current, shouldResetStreak: true };
  }
  if (streak <= -3) {
    if (current === "hard")
      return { nextDifficulty: "medium", shouldResetStreak: true };
    if (current === "medium")
      return { nextDifficulty: "easy", shouldResetStreak: true };
    return { nextDifficulty: current, shouldResetStreak: true };
  }
  return { nextDifficulty: current, shouldResetStreak: false };
}
