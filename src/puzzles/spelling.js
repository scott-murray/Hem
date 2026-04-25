const WORD_BANK = [
  'CAT', 'DOG', 'SUN', 'BUG', 'HOP', 'RUN', 'BEE', 'PIG',
  'COW', 'FOX', 'JUMP', 'FROG', 'BIRD', 'FISH', 'STAR',
  'MOON', 'TREE', 'CAKE',
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Generate a spelling puzzle.
 * Returns: { word, hiddenIndex, display, correct, choices }
 * display: array of characters, with one replaced by '_'
 * correct: the correct letter
 * choices: array of 4 letters (shuffled), one correct
 */
export function generateSpellingPuzzle() {
  const word = randomFrom(WORD_BANK);
  const hiddenIndex = Math.floor(Math.random() * word.length);
  const correct = word[hiddenIndex];

  const display = word.split('').map((ch, i) => i === hiddenIndex ? '_' : ch);

  // Generate 3 distractor letters (different from correct, no duplicates)
  const distractors = [];
  const available = ALPHABET.split('').filter(l => l !== correct);
  while (distractors.length < 3) {
    const pick = randomFrom(available);
    if (!distractors.includes(pick)) {
      distractors.push(pick);
    }
  }

  const choices = shuffleArray([correct, ...distractors]);

  return { word, hiddenIndex, display, correct, choices };
}
