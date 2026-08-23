## HUD overlay — ports UIScene.js (the HUD parts).
## Hearts, carrot counter, broccoli counter, level name, fullscreen toggle.

extends CanvasLayer

const SpriteGenerator = preload("res://textures/sprite_generator.gd")

const GAME_W := 480.0
const GAME_H := 270.0

var _hearts: Array = []
var _stage: Control
var _hearts_node: Control
var _level_label: Label
var _carrot_icon: TextureRect
var _carrot_label: Label
var _broccoli_icon: TextureRect
var _broccoli_label: Label


func _ready() -> void:
	# With viewport stretch the CanvasLayer layout space IS 480x270.
	_stage = Control.new()
	_stage.size = Vector2(480, 270)
	add_child(_stage)
	_build_hud()
	SignalBus.collected_carrot.connect(_on_carrot)
	SignalBus.collected_broccoli.connect(_on_broccoli)
	SignalBus.hurt.connect(_on_hurt)


func _build_hud() -> void:
	# Top bar
	var bar := ColorRect.new()
	bar.color = Color(0, 0, 0, 0.4)
	bar.set_anchors_and_offsets_preset(Control.PRESET_TOP_WIDE)
	bar.offset_bottom = 18
	_stage.add_child(bar)

	# Level name
	_level_label = Label.new()
	_level_label.add_theme_font_size_override("font_size", 9)
	_level_label.add_theme_color_override("font_color", Color.WHITE)
	_level_label.position = Vector2(GAME_W / 2 - 60, 2)
	_level_label.size = Vector2(120, 14)
	_level_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_stage.add_child(_level_label)

	# Hearts
	_hearts_node = Control.new()
	_hearts_node.position = Vector2(8, 2)
	_stage.add_child(_hearts_node)
	for i in 3:
		var tex := SpriteGenerator.get_texture("heart_full")
		if tex:
			var heart := TextureRect.new()
			heart.texture = tex
			heart.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
			heart.stretch_mode = TextureRect.STRETCH_KEEP
			heart.position = Vector2(i * 14, 0)
			heart.size = Vector2(12, 12)
			_hearts_node.add_child(heart)
			_hearts.append(heart)

	# Carrot counter
	_carrot_icon = TextureRect.new()
	var ct := SpriteGenerator.get_texture("carrot")
	if ct:
		_carrot_icon.texture = ct
		_carrot_icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		_carrot_icon.stretch_mode = TextureRect.STRETCH_KEEP
	_carrot_icon.position = Vector2(56, 2)
	_carrot_icon.size = Vector2(12, 12)
	_carrot_icon.visible = false
	_stage.add_child(_carrot_icon)

	_carrot_label = Label.new()
	_carrot_label.add_theme_font_size_override("font_size", 9)
	_carrot_label.add_theme_color_override("font_color", Color.WHITE)
	_carrot_label.position = Vector2(70, 2)
	_carrot_label.size = Vector2(40, 14)
	_carrot_label.visible = false
	_stage.add_child(_carrot_label)

	# Broccoli counter
	_broccoli_icon = TextureRect.new()
	var bt := SpriteGenerator.get_texture("broccoli")
	if bt:
		_broccoli_icon.texture = bt
		_broccoli_icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		_broccoli_icon.stretch_mode = TextureRect.STRETCH_KEEP
	_broccoli_icon.position = Vector2(104, 2)
	_broccoli_icon.size = Vector2(12, 12)
	_broccoli_icon.visible = false
	_stage.add_child(_broccoli_icon)

	_broccoli_label = Label.new()
	_broccoli_label.add_theme_font_size_override("font_size", 9)
	_broccoli_label.add_theme_color_override("font_color", Color("ffd54f"))
	_broccoli_label.position = Vector2(118, 2)
	_broccoli_label.size = Vector2(40, 14)
	_broccoli_label.visible = false
	_stage.add_child(_broccoli_label)

	# Fullscreen toggle
	var fs := Button.new()
	fs.text = "FS"
	fs.add_theme_font_size_override("font_size", 7)
	fs.position = Vector2(GAME_W - 34, 2)
	fs.size = Vector2(30, 14)
	fs.pressed.connect(func():
		if DisplayServer.window_get_mode() == DisplayServer.WINDOW_MODE_FULLSCREEN:
			DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
		else:
			DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_FULLSCREEN)
	)
	_stage.add_child(fs)


func set_level_name(name: String) -> void:
	_level_label.text = name


func set_carrot_count(got: int, total: int) -> void:
	if total == 0:
		_carrot_icon.visible = false
		_carrot_label.visible = false
		return
	_carrot_icon.visible = true
	_carrot_label.visible = true
	_carrot_label.text = "%d/%d" % [got, total]
	if got >= total:
		_carrot_label.add_theme_color_override("font_color", Color("ffd54f"))


func set_broccoli_count(got: int) -> void:
	if got == 0:
		_broccoli_icon.visible = false
		_broccoli_label.visible = false
		return
	_broccoli_icon.visible = true
	_broccoli_label.visible = true
	_broccoli_label.text = str(got)


func _on_carrot(got: int, total: int) -> void:
	if total == 0:
		_carrot_icon.visible = false
		_carrot_label.visible = false
		return
	_carrot_icon.visible = true
	_carrot_label.visible = true
	_carrot_label.text = "%d/%d" % [got, total]
	if got >= total:
		_carrot_label.add_theme_color_override("font_color", Color("ffd54f"))


func _on_broccoli(got: int) -> void:
	if got == 0:
		_broccoli_icon.visible = false
		_broccoli_label.visible = false
		return
	_broccoli_icon.visible = true
	_broccoli_label.visible = true
	_broccoli_label.text = str(got)


func _on_hurt(lives: int) -> void:
	for i in _hearts.size():
		var tex_key := "heart_full" if i < lives else "heart_empty"
		var tex := SpriteGenerator.get_texture(tex_key)
		if tex and i < _hearts.size():
			_hearts[i].texture = tex
