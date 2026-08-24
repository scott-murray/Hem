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
var checkpoints:       Array = []       # [{x, y, flag, activated}]
var checkpoint_pos:    Vector2 = Vector2.ZERO  # current respawn point
var has_dig_ability:   bool   = false
static var requested_level := 1  # set by start screen before scene change


func _ready() -> void:
	print("[GameController] _ready() start")
	# Generate textures if not done yet (in case boot.tscn was skipped)
	if SpriteGenerator.get_texture("tile_grass") == null:
		SpriteGenerator.generate_all()
		print("[GameController] textures generated")

	Progress.load_progress()
	has_dig_ability = Progress.has_dig()
	level_number = requested_level
	print("[GameController] loading level ", level_number)
	_load_level(level_number)
	print("[GameController] level loaded, tiles=", ground_parent.get_child_count())

	SignalBus.try_dig.connect(_on_try_dig)
	SignalBus.puzzle_result.connect(_on_puzzle_result)
	SignalBus.puzzle_triggered.connect(_launch_puzzle)
	SignalBus.hurt.connect(_on_player_hurt)


func set_level(n: int) -> void:
	requested_level = n


func _build_sky() -> void:
	# Load pre-rendered sky gradient PNG for this level
	var sky_path: String = "res://textures/gen/sky_l%d.png" % level_number
	print("[GameController] sky path: ", sky_path, " exists: ", ResourceLoader.exists(sky_path))
	if ResourceLoader.exists(sky_path):
		var tex: Texture2D = load(sky_path)
		print("[GameController] sky tex size: ", tex.get_width(), "x", tex.get_height())
		$SkySprite.texture = tex
		$SkySprite.scale = Vector2(parsed.pixel_width / tex.get_width(), parsed.pixel_height / tex.get_height())
		$SkySprite.position = Vector2.ZERO
		print("[GameController] sky scale: ", $SkySprite.scale)
	else:
		print("[GameController] sky NOT FOUND, using solid color")
		RenderingServer.set_default_clear_color(Color("4fc3f7"))

func _load_level(n: int) -> void:
	var map: Array = LevelData.get_map(n)
	var raw_text := "\n".join(map)
	parsed = LevelParser.parse(raw_text)
	_build_sky()  # must be after parsed is set
	level_config = _config_for(n)

	SignalBus.music_change.emit("level%d" % n)
	_build_ground()
	_spawn_entities()
	_setup_camera()
	_setup_hud()
	checkpoint_pos = parsed.bunny_spawn  # initial respawn point


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

			var tex: Texture2D = SpriteGenerator.get_texture(tex_key)
			if not tex:
				continue

			var px: float = c * TILE_SIZE + TILE_SIZE / 2
			var py: float = r * TILE_SIZE + TILE_SIZE / 2

			if is_solid:
				var body := StaticBody2D.new()
				body.position = Vector2(px, py)
				body.collision_layer = 1
				body.collision_mask = 1
				var shape := CollisionShape2D.new()
				shape.shape = RectangleShape2D.new()
				shape.shape.size = Vector2(TILE_SIZE, TILE_SIZE)
				body.add_child(shape)

				var sprite := Sprite2D.new()
				sprite.texture = tex
				sprite.scale = Vector2(3, 3)
				sprite.centered = true
				body.add_child(sprite)

				# Platform is one-way (pass through from below, land on top)
				if ch == "P":
					shape.one_way_collision = true

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
	area.z_index = 50
	var shape := CollisionShape2D.new()
	shape.shape = CircleShape2D.new()
	shape.shape.radius = 14.0
	area.add_child(shape)
	# Visible sprite — integer 2x scale for crisp pixels (web uses 0.55/0.5
	# non-integer scales, which smudge with nearest filtering)
	var tex: Texture2D = SpriteGenerator.get_texture(texture_key)
	if tex:
		var sprite := Sprite2D.new()
		sprite.texture = tex
		sprite.scale = Vector2(2, 2)
		sprite.centered = true
		area.add_child(sprite)
		# Bob animation
		var tween := area.create_tween().set_loops()
		tween.tween_property(area, "position:y", area.position.y - 4, 0.6) \
			.set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
		tween.tween_property(area, "position:y", area.position.y, 0.6) \
			.set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	area.body_entered.connect(_on_collectible_entered.bind(callback, area))
	entity_parent.add_child(area)
	if texture_key == "carrot":
		small_carrots.append(area)


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
	enemy.z_index = 20
	enemy.set_meta("type", enemy_type)
	enemy.set_meta("dir", -1)
	enemy.set_meta("speed", ENEMY_SPEED)
	enemy.set_meta("start_x", spec.x)
	enemy.set_meta("patrol_range", TILE_SIZE * 4)

	# Collision body (hurts bunny on overlap)
	var shape := CollisionShape2D.new()
	shape.shape = RectangleShape2D.new()
	shape.shape.size = Vector2(TILE_SIZE * 0.7, TILE_SIZE * 0.7)
	enemy.add_child(shape)

	# Visible sprite — integer 3x scale (matches web TILE_SCALE)
	var tex_key := "enemy_fox" if enemy_type == "fox" else "enemy_beetle"
	var tex: Texture2D = SpriteGenerator.get_texture(tex_key)
	if tex:
		var sprite := Sprite2D.new()
		sprite.texture = tex
		sprite.scale = Vector2(3, 3)
		sprite.centered = true
		sprite.name = "Sprite"
		enemy.add_child(sprite)

	entity_parent.add_child(enemy)
	enemies.append(enemy)


## Enemy patrol — move side to side within range, flip at edges.
func _process_enemies(delta: float) -> void:
	for enemy in enemies:
		if not is_instance_valid(enemy):
			continue
		var dir: int = enemy.get_meta("dir")
		var speed: float = enemy.get_meta("speed")
		var start_x: float = enemy.get_meta("start_x")
		var patrol_range: float = enemy.get_meta("patrol_range")

		enemy.position.x += dir * speed * delta

		# Flip at patrol bounds
		var dist: float = absf(enemy.position.x - start_x)
		if dist > patrol_range:
			enemy.set_meta("dir", -dir)
			enemy.position.x = clampf(enemy.position.x, start_x - patrol_range, start_x + patrol_range)

		# Flip sprite
		if enemy.has_node("Sprite"):
			enemy.get_node("Sprite2D" if enemy.has_node("Sprite2D") else "Sprite").flip_h = dir > 0

		# Contact damage — distance check vs player
		if player and player.is_invuln == false:
			var d: Vector2 = enemy.position - player.position
			if d.length() < TILE_SIZE * 0.6:
				player.hurt(-1.0 if player.facing_right else 1.0)


func _spawn_puzzle_zone(spec: Dictionary) -> void:
	var area := Area2D.new()
	area.position = Vector2(spec.x, spec.y)
	area.z_index = 40
	var shape := CollisionShape2D.new()
	shape.shape = RectangleShape2D.new()
	shape.shape.size = Vector2(TILE_SIZE * 0.8, TILE_SIZE * 0.8)
	area.add_child(shape)
	# Visible question-mark tile
	var tex: Texture2D = SpriteGenerator.get_texture("tile_puzzle")
	if tex:
		var sprite := Sprite2D.new()
		sprite.texture = tex
		sprite.scale = Vector2(3, 3)
		sprite.centered = true
		area.add_child(sprite)
	area.set_meta("puzzle_id", spec.id)
	area.body_entered.connect(_on_puzzle_entered.bind(spec.id))
	entity_parent.add_child(area)


func _on_puzzle_entered(body: Node2D, puzzle_id: int) -> void:
	print("[GameController] puzzle entered! body=", body.name, " id=", puzzle_id)
	if not body is PlayerClass: return
	if puzzle_id in solved_puzzles: return
	var types: Array = level_config.puzzle_types
	var ptype: String = types[puzzle_id % types.size()]
	print("[GameController] launching puzzle type ", ptype)
	SignalBus.puzzle_triggered.emit(ptype, puzzle_id)


## Launch the puzzle overlay when the bunny steps on a puzzle tile.
const PuzzleOverlayScript := preload("res://scripts/puzzle_overlay.gd")


func _launch_puzzle(ptype: String, puzzle_id: int) -> void:
	# Build the overlay programmatically (avoids .tscn script-attach issues)
	var overlay := Control.new()
	overlay.set_script(PuzzleOverlayScript)
	overlay.size = Vector2(480, 270)
	overlay.position = Vector2.ZERO  # viewport-stretch layout space is 480x270
	overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	$UI.add_child(overlay)
	print("[GameController] overlay script: ", overlay.get_script())
	overlay.show_puzzle(ptype, puzzle_id)
	print("[GameController] overlay children=", overlay.get_child_count())


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
	body.z_index = 30
	body.collision_layer = 1
	body.collision_mask = 1
	var shape := CollisionShape2D.new()
	shape.shape = RectangleShape2D.new()
	shape.shape.size = Vector2(TILE_SIZE * 0.8, TILE_SIZE * 0.9)
	body.add_child(shape)
	# Visible door sprite (was invisible before!)
	var tex: Texture2D = SpriteGenerator.get_texture("tile_door")
	if tex:
		var sprite := Sprite2D.new()
		sprite.texture = tex
		sprite.scale = Vector2(3, 3)
		sprite.centered = true
		body.add_child(sprite)
	body.set_meta("door_id", spec.id)
	entity_parent.add_child(body)


func _spawn_checkpoint(spec: Dictionary) -> void:
	# Checkpoint flag — 2x-tall sprite planted in the ground like the JS version.
	var flag := Sprite2D.new()
	flag.position = Vector2(spec.x, spec.y)  # tile center; pole sinks into ground below
	flag.z_index = 30
	var tex: Texture2D = SpriteGenerator.get_texture("tile_checkpoint_off")
	if tex:
		flag.texture = tex
		flag.scale = Vector2(3, 3)  # 16x32 src -> 48x96 display
		flag.centered = true
	entity_parent.add_child(flag)
	checkpoints.append({
		x = spec.x, y = spec.y,
		flag = flag, activated = false,
	})


## Check checkpoint activation — called from _process.
func _check_checkpoints() -> void:
	if not player:
		return
	for cp in checkpoints:
		if cp.activated:
			continue
		var d: Vector2 = Vector2(cp.x, cp.y) - player.position
		if d.length() < TILE_SIZE * 1.2:
			cp.activated = true
			var flag: Sprite2D = cp.flag
			var on_tex: Texture2D = SpriteGenerator.get_texture("tile_checkpoint_on")
			if on_tex:
				flag.texture = on_tex
			checkpoint_pos = Vector2(cp.x, cp.y)
			AudioManager.play_sfx("checkpoint")
			print("[GameController] checkpoint activated at ", checkpoint_pos)


func _spawn_exit_carrot(spec: Dictionary) -> void:
	var area := Area2D.new()
	area.position = Vector2(spec.x, spec.y)
	area.z_index = 50
	var shape := CollisionShape2D.new()
	shape.shape = CircleShape2D.new()
	shape.shape.radius = 16.0
	area.add_child(shape)
	var tex: Texture2D = SpriteGenerator.get_texture("carrot")
	if tex:
		var sprite := Sprite2D.new()
		sprite.texture = tex
		sprite.scale = Vector2(3, 3)
		sprite.centered = true
		area.add_child(sprite)
	area.body_entered.connect(func(_b: Node2D):
		AudioManager.play_sfx("win")
		Progress.complete_level(level_number)
		get_tree().change_scene_to_file.call_deferred("res://scenes/start_screen.tscn")
	)
	entity_parent.add_child(area)


func _setup_hud() -> void:
	var ui_node: CanvasLayer = $UI
	if not ui_node:
		return
	ui_node.set_level_name(str(level_config.name))
	ui_node.set_carrot_count(0, small_carrots.size())
	ui_node.set_broccoli_count(0)
	print("[GameController] HUD: ", level_config.name, " carrots=", small_carrots.size())


func _setup_camera() -> void:
	var map_width:  float = parsed.pixel_width
	var map_height: float = parsed.pixel_height
	camera.limit_left   = 0
	camera.limit_right  = map_width
	camera.limit_top    = 0
	camera.limit_bottom = map_height
	# Follow the player like Phaser's startFollow()
	camera.position_smoothing_enabled = true
	camera.position_smoothing_speed = 5.0
	camera.position = player.position


## Called when the bunny takes damage — respawn at last checkpoint.
func _on_player_hurt(lives_left: int) -> void:
	player.position = checkpoint_pos
	player.velocity = Vector2.ZERO


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


func _process(delta: float) -> void:
	# Camera follows the player every frame
	if camera and player:
		camera.position = player.position
	_process_enemies(delta)
	_check_checkpoints()
	if Input.is_action_just_pressed("dig"):
		_on_try_dig()
	if Input.is_action_just_pressed("fullscreen"):
		if DisplayServer.window_get_mode() == DisplayServer.WINDOW_MODE_FULLSCREEN:
			DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
		else:
			DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_FULLSCREEN)
