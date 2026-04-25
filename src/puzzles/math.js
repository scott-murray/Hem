/**
 * Generate a math puzzle: a + b = ? with multiple choice answers.
 * a, b in [1..9], 4 answers (1 correct + 3 near-distractors).
 */
export function generateMathPuzzle() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const correct = a + b;

  // Generate distractors: within ±3 of correct, all positive, no duplicates
  const distractors = [];
  const tried = new Set([correct]);

  // Try offsets first
  const offsets = [-3, -2, -1, 1, 2, 3, -4, 4, -5, 5];
  for (const offset of offsets) {
    if (distractors.length >= 3) break;
    const val = correct + offset;
    if (val > 0 && val <= 18 && !tried.has(val)) {
      distractors.push(val);
      tried.add(val);
    }
  }

  // Fill remaining if needed
  let fallback = 1;
  while (distractors.length < 3) {
    if (!tried.has(fallback)) {
      distractors.push(fallback);
      tried.add(fallback);
    }
    fallback++;
  }

  const choices = shuffleArray([correct, ...distractors]);

  return { a, b, correct, choices };
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
