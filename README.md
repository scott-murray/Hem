# Bunny's Carrot Quest

A cute side-scrolling pixel-art platformer built with Phaser 3 and Vite.

## Running the Game

```bash
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## Building for Production

```bash
npm run build
```

Output goes to `dist/`.

## Controls

| Input | Action |
|-------|--------|
| ← / A | Move left |
| → / D | Move right |
| Space / W / ↑ | Jump |
| On-screen buttons | Touch / mobile controls |

## Levels

| Level | Name | Features |
|-------|------|---------|
| 1 | Carrot Valley | Tutorial: platforms + 1 spelling puzzle |
| 2 | Fox Forest | 1 fox enemy + 1 math puzzle |
| 3 | Crystal Caves | 2 enemies + spelling & math puzzles + 2 checkpoints |

## Puzzles

### Spelling Puzzle
A word is shown with one letter hidden (replaced by `_`). Tap the correct letter from 4 choices.

**Word bank**: CAT, DOG, SUN, BUG, HOP, RUN, BEE, PIG, COW, FOX, JUMP, FROG, BIRD, FISH, STAR, MOON, TREE, CAKE

**Example**: `_UN` → choices: R, T, B, W → correct: R (RUN)

### Math Puzzle
A single-digit addition problem is shown (e.g. `3 + 4 = ?`). Tap the correct answer from 4 choices.

**Example**: `5 + 7 = ?` → choices: 12, 9, 11, 14 → correct: 12

## Progression

Progress is saved to `localStorage` (key: `bunny.progress.v1`):
```json
{ "unlockedLevel": 1, "completedLevels": [], "muted": false }
```

Use the **Reset** button on the start screen to clear all progress.

## Technical Notes

- **No binary assets**: All sprites are drawn procedurally using Canvas API → Phaser textures
- **No audio files**: All SFX synthesized via Web Audio API oscillators
- **Base resolution**: 480×270, scaled with Phaser Scale.FIT + CENTER_BOTH
- **Physics**: Phaser Arcade Physics with per-body gravity
- **Coyote time**: 80ms grace period for jumping after walking off an edge
- **Jump buffer**: 80ms window for pre-pressing jump before landing
