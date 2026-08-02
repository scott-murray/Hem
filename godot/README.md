# Hem — Godot 4.x Port

Bunny's Carrot Quest native port. Dual-target: **Linux ARM (Raspberry Pi)** and **HTML5 (browser)**.

## Project structure

```
godot/
├── project.godot              # Godot 4.4 config, input maps, autoloads
├── scenes/                    # .tscn scene files (create in Godot editor)
│   ├── boot.tscn              #   Boot → generates textures, loads progress
│   ├── start_screen.tscn      #   Title + level select
│   ├── game.tscn              #   Main gameplay (GameController root)
│   └── puzzle_overlay.tscn    #   Modal puzzle (spelling / math / dig-teach)
├── scripts/
│   ├── signal_bus.gd          #   Global signals (autoload as "SignalBus")
│   ├── progress.gd            #   Save data (autoload as "Progress")
│   ├── audio_manager.gd       #   SFX + music synthesis (autoload)
│   ├── level_parser.gd        #   ASCII map parser (static class)
│   ├── player.gd              #   Bunny CharacterBody2D
│   ├── game_controller.gd     #   Main game loop (≈ GameScene.js)
│   └── touch_handler.gd       #   Swipe/tap input (≈ UIScene.js)
├── textures/
│   └── sprite_generator.gd    #   Procedural pixel-art texture generator
└── shared/
    └── levels/                #   ASCII level maps (shared with web version)
        ├── level1.txt
        ├── level2.txt
        ├── level3.txt
        ├── level4.txt
        └── level5.txt
```

## Getting started

1. Install [Godot 4.4+](https://godotengine.org/download/)
2. Open `godot/project.godot` in the Godot editor
3. Create the `.tscn` scenes (or use the editor to build them from the scripts):
   - **boot.tscn**: Root `Node2D`, attach a boot script that calls `Progress.load_progress()`, generates textures via `SpriteGenerator`, then switches to `start_screen.tscn`
   - **start_screen.tscn**: `Control` with level buttons (1–5), PLAY button, mute/reset. Reads `Progress.data.unlocked_level` to enable/disable.
   - **game.tscn**: Root `Node2D` with `GameController` attached. Children:
     - `Player` (CharacterBody2D with `player.gd`)
     - `GroundLayer` (TileMapLayer)
     - `Entities` (Node2D)
     - `Camera2D` (current-camera, limit-smoothed, drag-margin 80×40)
     - `UI` (CanvasLayer with HUD)
   - **puzzle_overlay.tscn**: `Control` overlay with panel, question text, answer buttons
4. Run — `F5` in the editor or `F6` for the current scene

## Input

| Action       | Keyboard         | Switch Pro Controller | Touch       |
|-------------|------------------|-----------------------|-------------|
| Move left   | ← / A            | D-pad left / L-stick  | Hold left   |
| Move right  | → / D            | D-pad right / L-stick | Hold right  |
| Jump        | Space / W / ↑    | A (cross)             | Swipe up    |
| Dig         | ↓ / S            | B (circle)            | Swipe down  |
| Confirm     | Space / Enter    | A (cross)             | Tap         |
| Fullscreen  | F / F11          | —                     | —           |

## Export

```bash
# Raspberry Pi (Linux ARM 64-bit)
godot --headless --export-release "Linux" godot/build/hem.arm64

# HTML5 / Web
godot --headless --export-release "Web" godot/build/web/

# The web export produces index.html + index.pck + index.wasm + index.js
# Host the godot/build/web/ directory on any static server.
```

Copy `godot/build/hem.arm64` to the Pi, make executable, run:

```bash
chmod +x hem.arm64
./hem.arm64 --fullscreen
```

## Differences from the Phaser version

| Feature | Phaser | Godot |
|---------|--------|-------|
| Rendering | Canvas 2D `fillRect()` | `Image.set_pixel()` at boot → `ImageTexture` |
| Physics | Arcade Physics JS API | `CharacterBody2D` + `move_and_slide()` |
| Input | `scene.input.keyboard` | `Input.is_action_pressed()` |
| Audio | Web Audio `OscillatorNode` | `AudioStreamGenerator` PCM |
| UI | Phaser `Graphics` / `Text` | `Control` + `Label` + `ColorRect` |
| Save | `localStorage` | `ConfigFile` → `user://` (IndexedDB on web) |
| Build size | 1.4 MB (Phaser + game) | ~25 MB (Godot runtime + game) |

## TODO

- [ ] Enemy patrol AI with ground/edge detection
- [ ] Spikes with overlap death zones
- [ ] Checkpoint flag activation + respawn
- [ ] Big exit carrot gating (require all small carrots)
- [ ] Burrow teleporter pairs
- [ ] Puzzle scene (spelling / math / dig-teach modal)
- [ ] Chiptune music sequencer (16-step pattern scheduler)
- [ ] Procedural spritesheet generator (bunny, tiles, enemies, carrot, particles)
- [ ] Camera deadzone and smooth follow
- [ ] Parallax sky gradient background
- [ ] Dust / sparkle / confetti particle emitters
- [ ] HUD (hearts, carrot count, broccoli count, level name, fullscreen toggle)
