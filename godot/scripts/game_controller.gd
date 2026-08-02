## Main game scene controller — ports GameScene.js.
##
## Attach to the root node of game.tscn. Manages:
##   - Level loading from shared .txt files
##   - Tilemap construction from parsed level data
##   - Player spawning and physics
##   - Enemy spawning and patrol AI
##   - Carrot / broccoli / checkpoint / door overlays
##   - Puzzle trigger zones and puzzle scene launching
##   - Dig mechanic (column dig through X tiles)
##   - Win condition and level transition

class_name GameController
extends Node2D

const PlayerClass      = preload("res://scripts/player.gd")
const LevelParser      = preload("res://scripts/level_parser.gd")
const SpriteGenerator  = preload("res://textures/sprite_generator.gd")

const TILE_SIZE   := 48
const ENEMY_SPEED := 35.0
const LEVEL_COUNT := 5

@onready var player:        Node2D            = $Player
@onready var ground_parent: Node2D            = $GroundLayer
@onready var entity_parent: Node2D            = $Entities
@onready var camera:        Camera2D          = $Camera2D
@onready var ui:            Control           = $UI

var parsed:        Dictionary = {}
var level_config:  Dictionary = {}
var level_number:  int        = 1
var collected_carrots: int    = 0
var small_carrots:     Array  = []
var broccolis:         Array  = []
var collected_broccolis: int  = 0
var enemies:           Array  = []
var solved_puzzles:    Array  = []
var diggable_tiles:    Dictionary = {}  # "r,c" -> StaticBody2D
var has_dig_ability:   bool   = false


func _ready() -> void:
	has_dig_ability = Progress.has_dig()
	level_number = _requested_level
	_load_level(level_number)

	SignalBus.try_dig.connect(_on_try_dig)
	SignalBus.puzzle_result.connect(_on_puzzle_result)


var _requested_level := 1
func set_level(n: int) -> void:
	_requested_level = n


func _load_level(n: int) -> void:
	var path := "res://shared/levels/level%d.txt" % n
	if not FileAccess.file_exists(path):
		push_error("Level file not found: " + path)
		return

	parsed = LevelParser.parse(FileAccess.get_file_as_string(path))
	level_config = _config_for(n)

	SignalBus.music_change.emit("level%d" % n)
	_build_ground()
	_spawn_entities()
	_setup_camera()


func _config_for(n: int) -> Dictionary:
	var configs := [
		{number = 1, name = "Carrot Valley",  puzzle_types = ["spelling"], bg_top = Color("4fc3f7"), bg_bot = Color("81d4fa")},
		{number = 2, name = "Fox Forest",     puzzle_types = ["math", "dig-teach"], bg_top = Color("ff8a65"), bg_bot = Color("ffcc80")},
		{number = 3, name = "Crystal Caves",  puzzle_types = ["spelling", "math"], bg_top = Color("311b92"), bg_bot = Color("4527a0")},
		{number = 4, name = "Burrow Depths",  puzzle_types = ["spelling", "math"], bg_top = Color("1a237e"), bg_bot = Color("004d40")},
		{number = 5, name = "Sky Gardens",    puzzle_types = ["math", "dig-teach"], bg_top = Color("81c784"), bg_bot = Color("fff176")},
	]
	return configs[n - 1]


func _build_ground() -> void:
	for r in parsed.height_tiles:
		for c in parsed.width_tiles:
			var ch: String = parsed.tiles[r][c]
			var tex_key := ""
			var is_solid := false

			match ch:
				"T": tex_key = "tile_grass";    is_solid = true
				"G": tex_key = "tile_ground";   is_solid = true
				"P": tex_key = "tile_platform"; is_solid = true
				"X": tex_key = "tile_diggable"; is_solid = true
				_:   continue

			var tex: ImageTexture = SpriteGenerator.get_texture(tex_key)
			if not tex:
				continue

			var px: float = c * TILE_SIZE + TILE_SIZE / 2
			var py: float = r * TILE_SIZE + TILE_SIZE / 2

			if is_solid:
				var body := StaticBody2D.new()
				body.position = Vector2(px, py)
				var shape := CollisionShape2D.new()
				shape.shape = RectangleShape2D.new()
				shape.shape.size = Vector2(TILE_SIZE, TILE_SIZE)
				body.add_child(shape)

				var sprite := Sprite2D.new()
				sprite.texture = tex
				sprite.scale = Vector2(3, 3)
				sprite.centered = true
				body.add_child(sprite)

				# Platform is one-way
				if ch == "P":
					body.collision_layer = 2
					body.set_meta("one_way", true)

				ground_parent.add_child(body)

				if ch == "X":
					diggable_tiles["%d,%d" % [r, c]] = body
			else:
				var sprite := Sprite2D.new()
				sprite.texture = tex
				sprite.scale = Vector2(3, 3)
				sprite.position = Vector2(px, py)
				sprite.centered = true
				ground_parent.add_child(sprite)


func _spawn_entities() -> void:
	player.position = parsed.bunny_spawn
	player.lives = 3

	for spec in parsed.specials:
		match spec.type:
			"small_carrot": _spawn_collectible(spec, "carrot", "_on_carrot_collected")
			"broccoli":     _spawn_collectible(spec, "broccoli", "_on_broccoli_collected")
			"enemy_fox":    _spawn_enemy(spec, "fox")
			"enemy_beetle": _spawn_enemy(spec, "beetle")
			"puzzle":       _spawn_puzzle_zone(spec)
			"door":         _spawn_door(spec)
			"checkpoint":   _spawn_checkpoint(spec)
			"carrot":       _spawn_exit_carrot(spec)
			_:              pass  # burrows, spikes — TODO


func _spawn_collectible(spec: Dictionary, texture_key: String, callback: String) -> void:
	var area := Area2D.new()
	area.position = Vector2(spec.x, spec.y)
	var shape := CollisionShape2D.new()
	shape.shape = CircleShape2D.new()
	shape.shape.radius = 12.0
	area.add_child(shape)
	area.body_entered.connect(_on_collectible_entered.bind(callback, area))
	entity_parent.add_child(area)


func _on_collectible_entered(body: Node2D, callback: String, self_area: Area2D) -> void:
	if not body is PlayerClass: return
	self_area.queue_free()
	call(callback)


func _on_carrot_collected() -> void:
	collected_carrots += 1
	SignalBus.collected_carrot.emit(collected_carrots, small_carrots.size())
	AudioManager.play_sfx("collect_small")


func _on_broccoli_collected() -> void:
	collected_broccolis += 1
	Progress.add_broccoli()
	SignalBus.collected_broccoli.emit(collected_broccolis)
	AudioManager.play_sfx("broccoli")


func _spawn_enemy(spec: Dictionary, enemy_type: String) -> void:
	var enemy := CharacterBody2D.new()
	enemy.position = Vector2(spec.x, spec.y)
	enemy.set_meta("type", enemy_type)
	enemy.set_meta("dir", -1)
	enemy.set_meta("speed", ENEMY_SPEED)
	enemy.set_meta("start_x", spec.x)
	enemy.set_meta("patrol_range", TILE_SIZE * 4)
	# TODO: add Sprite2D child, collision shape, patrol script
	entity_parent.add_child(enemy)
	enemies.append(enemy)


func _spawn_puzzle_zone(spec: Dictionary) -> void:
	var area := Area2D.new()
	area.position = Vector2(spec.x, spec.y)
	var shape := CollisionShape2D.new()
	shape.shape = RectangleShape2D.new()
	shape.shape.size = Vector2(TILE_SIZE, TILE_SIZE)
	area.add_child(shape)
	area.set_meta("puzzle_id", spec.id)
	area.body_entered.connect(_on_puzzle_entered.bind(spec.id))
	entity_parent.add_child(area)


func _on_puzzle_entered(body: Node2D, puzzle_id: int) -> void:
	if not body is PlayerClass: return
	if puzzle_id in solved_puzzles: return
	var types: Array = level_config.puzzle_types
	var ptype: String = types[puzzle_id % types.size()]
	SignalBus.puzzle_triggered.emit(ptype, puzzle_id)


func _on_puzzle_result(success: bool, puzzle_id: int) -> void:
	if success:
		solved_puzzles.append(puzzle_id)
		# Check for dig-teach unlock
		var types: Array = level_config.puzzle_types
		var ptype: String = types[puzzle_id % types.size()]
		if ptype == "dig-teach":
			has_dig_ability = true
			Progress.set_dig_ability(true)
			SignalBus.dig_unlocked.emit()
		# Remove door group
		for child in entity_parent.get_children():
			if child.has_meta("door_id") and child.get_meta("door_id") == puzzle_id:
				child.queue_free()
	else:
		player.hurt(-1.0 if player.facing_right else 1.0)
		# Allow re-trigger
		pass


func _spawn_door(spec: Dictionary) -> void:
	var body := StaticBody2D.new()
	body.position = Vector2(spec.x, spec.y)
	var shape := CollisionShape2D.new()
	shape.shape = RectangleShape2D.new()
	shape.shape.size = Vector2(TILE_SIZE * 0.8, TILE_SIZE * 0.9)
	body.add_child(shape)
	body.set_meta("door_id", spec.id)
	entity_parent.add_child(body)


func _spawn_checkpoint(spec: Dictionary) -> void:
	# TODO: checkpoint flag sprite + activation logic
	pass


func _spawn_exit_carrot(spec: Dictionary) -> void:
	# TODO: big carrot sprite + win condition
	pass


func _setup_camera() -> void:
	var map_width:  float = parsed.pixel_width
	var map_height: float = parsed.pixel_height
	camera.limit_left   = 0
	camera.limit_right  = map_width
	camera.limit_top    = 0
	camera.limit_bottom = map_height


func _on_try_dig() -> void:
	if not has_dig_ability: return
	# Find X tile beneath player and dig column
	var col := int(player.position.x / TILE_SIZE)
	var row := int((player.position.y + TILE_SIZE * 0.6) / TILE_SIZE)
	_dig_column(row, col)


func _dig_column(start_row: int, col: int) -> void:
	for r in range(start_row, parsed.height_tiles):
		var key := "%d,%d" % [r, col]
		if not diggable_tiles.has(key):
			break
		var body: StaticBody2D = diggable_tiles[key]
		body.queue_free()
		diggable_tiles.erase(key)
		parsed.tiles[r][col] = " "
	AudioManager.play_sfx("dig")


func _process(_delta: float) -> void:
	if Input.is_action_just_pressed("dig"):
		_on_try_dig()
	if Input.is_action_just_pressed("fullscreen"):
		if DisplayServer.window_get_mode() == DisplayServer.WINDOW_MODE_FULLSCREEN:
			DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
		else:
			DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_FULLSCREEN)
