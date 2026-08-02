## Level parser — ports `src/levels/tileSchema.js` parseLevel() to GDScript.
##
## Loads ASCII level maps from shared .txt files and produces a structured
## dictionary identical to the JS parseLevel() output.
##
## Usage:
##   var parsed = LevelParser.parse(FileAccess.get_file_as_string("res://shared/levels/level1.txt"))
##   print(parsed.bunny_spawn)  # => Vector2(24, 552) in display pixels

class_name LevelParser
extends RefCounted

const TILE_SIZE   := 48   # display pixels (16 src × 3 scale)
const TILE_SCALE  := 3
const TILE_SRC    := 16

enum Tile {
	EMPTY        = 0x20,  # ' '
	GROUND       = 0x47,  # 'G'
	GRASS        = 0x54,  # 'T'
	PLATFORM     = 0x50,  # 'P'
	SPIKE        = 0x53,  # 'S'
	CARROT       = 0x43,  # 'C'  (big exit carrot)
	SMALL_CARROT = 0x63,  # 'c'
	CHECKPOINT   = 0x4b,  # 'K'
	DOOR         = 0x44,  # 'D'
	PUZZLE       = 0x51,  # 'Q'
	BUNNY        = 0x42,  # 'B'
	ENEMY_FOX    = 0x46,  # 'F'
	ENEMY_BEETLE = 0x45,  # 'E'
	DIGGABLE     = 0x58,  # 'X'
	BROCCOLI     = 0x62,  # 'b'
}

const SOLID_TILES := [Tile.GROUND, Tile.GRASS, Tile.DOOR, Tile.DIGGABLE]
const DEADLY_TILES := [Tile.SPIKE]
const BURROW_DIGITS := [0x31, 0x32, 0x33, 0x34]  # '1'..'4'


static func parse(raw_text: String) -> Dictionary:
	var rows := raw_text.strip_edges().split("\n")
	var height_tiles := rows.size()
	var width_tiles := rows[0].length()
	var tiles: Array[Array] = []
	var specials: Array[Dictionary] = []
	var bunny_spawn := Vector2(TILE_SIZE * 1.5, TILE_SIZE * 1.5)

	# Door grouping: vertically adjacent D tiles share a group id.
	var door_group_grid: Array[Array] = []
	var door_groups: Array[Array] = []  # group_id -> [{row, col, x, y}, ...]
	for r in height_tiles:
		door_group_grid.append([])
		door_group_grid[r].resize(width_tiles)
		for c in width_tiles:
			door_group_grid[r][c] = -1

	var puzzles: Array[Dictionary] = []
	var burrows_by_digit: Dictionary = {}

	# First pass: build tile grid
	for r in height_tiles:
		var row_arr: Array[String] = []
		for c in width_tiles:
			row_arr.append(rows[r][c])
		tiles.append(row_arr)

	# Second pass: collect specials
	for r in height_tiles:
		for c in width_tiles:
			var ch := rows[r].unicode_at(c)
			var x := c * TILE_SIZE + TILE_SIZE / 2
			var y := r * TILE_SIZE + TILE_SIZE / 2

			match ch:
				Tile.BUNNY:
					bunny_spawn = Vector2(x, y)
				Tile.CARROT:
					specials.append({type = "carrot", row = r, col = c, x = x, y = y})
				Tile.SMALL_CARROT:
					specials.append({type = "small_carrot", row = r, col = c, x = x, y = y})
				Tile.CHECKPOINT:
					specials.append({type = "checkpoint", row = r, col = c, x = x, y = y})
				Tile.SPIKE:
					specials.append({type = "spike", row = r, col = c, x = x, y = y})
				Tile.PUZZLE:
					puzzles.append({type = "puzzle", row = r, col = c, x = x, y})
				Tile.DOOR:
					var above_id := -1
					if r > 0:
						above_id = door_group_grid[r - 1][c]
					var gid := above_id if above_id >= 0 else door_groups.size()
					if gid >= door_groups.size():
						door_groups.append([])
					door_group_grid[r][c] = gid
					door_groups[gid].append({row = r, col = c, x = x, y = y})
				Tile.ENEMY_FOX:
					specials.append({type = "enemy_fox", row = r, col = c, x = x, y = y})
				Tile.ENEMY_BEETLE:
					specials.append({type = "enemy_beetle", row = r, col = c, x = x, y = y})
				Tile.BROCCOLI:
					specials.append({type = "broccoli", row = r, col = c, x = x, y = y})
				Tile.DIGGABLE:
					specials.append({type = "diggable", row = r, col = c, x = x, y = y})
				_:
					if ch in BURROW_DIGITS:
						var digit := char(ch)
						if not burrows_by_digit.has(digit):
							burrows_by_digit[digit] = []
						burrows_by_digit[digit].append({row = r, col = c, x = x, y = y})

	# Pair puzzles with door groups by index
	for i in puzzles.size():
		puzzles[i].id = i
		specials.append(puzzles[i])

	for gid in door_groups.size():
		for t in door_groups[gid]:
			specials.append({type = "door", row = t.row, col = t.col, x = t.x, y = t.y, id = gid})

	# Burrow teleporter pairs
	for digit in burrows_by_digit:
		var arr: Array = burrows_by_digit[digit]
		if arr.size() < 2:
			for t in arr:
				specials.append({type = "burrow", row = t.row, col = t.col, x = t.x, y = t.y,
					pair_id = digit, target = {x = t.x, y = t.y}})
		else:
			for i in arr.size():
				var t = arr[i]
				var next_t = arr[(i + 1) % arr.size()]
				specials.append({type = "burrow", row = t.row, col = t.col, x = t.x, y = t.y,
					pair_id = digit, target = {x = next_t.x, y = next_t.y}})

	return {
		tiles         = tiles,
		width_tiles   = width_tiles,
		height_tiles  = height_tiles,
		pixel_width   = width_tiles * TILE_SIZE,
		pixel_height  = height_tiles * TILE_SIZE,
		bunny_spawn   = bunny_spawn,
		specials      = specials,
	}


static func is_solid(ch: String) -> bool:
	return ch.unicode_at(0) in SOLID_TILES


static func get_tile_at(parsed: Dictionary, world_x: float, world_y: float) -> String:
	var col := int(world_x / TILE_SIZE)
	var row := int(world_y / TILE_SIZE)
	var tiles: Array[Array] = parsed.tiles
	if row < 0 or row >= tiles.size(): return " "
	if col < 0 or col >= tiles[row].size(): return " "
	return tiles[row][col]
