const BEST_SCORE_KEY = "whenEggsFlyBest";

export function getBestScore() {
  return Number(localStorage.getItem(BEST_SCORE_KEY) || 0);
}

export function saveBestScore(score) {
  localStorage.setItem(BEST_SCORE_KEY, String(score));
}