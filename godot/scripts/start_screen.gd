## Title screen — ports StartScene.js.
## Builds gradient background, title text, animated bunny, level-select
## buttons (2 rows for 5 levels), PLAY button, mute/fullscreen/reset.

extends Control

const SpriteGenerator = preload("res://textures/sprite_generator.gd")

const GAME_W := 480.0
const GAME_H := 270.0
const LEVEL_NAMES := ["Carrot Valley", "Fox Forest", "Crystal Caves", "Burrow Depths", "Sky Gardens"]

var _confirm_reset := false


func _ready() -> void:
	AudioManager.set_muted(Progress.data.muted)
	SignalBus.music_change.emit("title")
	_build_background()
	_build_title()
	_build_bunny()
	_build_level_buttons()
	_build_play_button()
	_build_bottom_buttons()


func _build_background() -> void:
	var bg := ColorRect.new()
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	# Gradient sky (approximate with stacked ColorRects)
	var steps := 20
	var top := Color("1a237e")
	var bot := Color("283593")
	for i in steps:
		var t := float(i) / steps
		var strip := ColorRect.new()
		strip.color = top.lerp(bot, t)
		strip.set_anchors_and_offsets_preset(Control.PRESET_TOP_WIDE)
		strip.offset_top = i * (GAME_H / steps)
		strip.offset_bottom = (i + 1) * (GAME_H / steps) + 1
		bg.add_child(strip)
	add_child(bg)

	# Stars (small white rects)
	for star in [[30,20],[80,45],[150,15],[200,60],[280,25],[340,50],[400,20],[450,40],[120,80],[320,75]]:
		var s := ColorRect.new()
		s.color = Color.WHITE
		s.size = Vector2(2, 2)
		s.position = Vector2(star[0], star[1])
		bg.add_child(s)

	# Ground strip
	var ground := ColorRect.new()
	ground.color = Color("1b5e20")
	ground.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_WIDE)
	ground.offset_top = -40
	add_child(ground)
	var grass := ColorRect.new()
	grass.color = Color("4caf50")
	grass.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_WIDE)
	grass.offset_top = -40
	grass.offset_bottom = -32
	add_child(grass)


func _build_title() -> void:
	var title1 := Label.new()
	title1.text = "BUNNY'S"
	title1.add_theme_font_size_override("font_size", 24)
	title1.add_theme_color_override("font_color", Color("ffee58"))
	title1.position = Vector2(GAME_W / 2 - 60, 28)
	title1.size = Vector2(120, 30)
	title1.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	add_child(title1)

	var title2 := Label.new()
	title2.text = "CARROT QUEST"
	title2.add_theme_font_size_override("font_size", 28)
	title2.add_theme_color_override("font_color", Color("ff7043"))
	title2.position = Vector2(GAME_W / 2 - 110, 56)
	title2.size = Vector2(220, 34)
	title2.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	add_child(title2)


func _build_bunny() -> void:
	var tex: Texture2D = SpriteGenerator.get_texture("bunny_idle")
	if tex:
		var bunny := TextureRect.new()
		bunny.texture = tex
		bunny.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		bunny.stretch_mode = TextureRect.STRETCH_KEEP
		bunny.position = Vector2(GAME_W / 2 - 24, GAME_H - 84)
		bunny.size = Vector2(48, 48)
		add_child(bunny)


func _build_level_buttons() -> void:
	var label := Label.new()
	label.text = "SELECT LEVEL"
	label.add_theme_font_size_override("font_size", 11)
	label.add_theme_color_override("font_color", Color("c5cae9"))
	label.position = Vector2(GAME_W / 2 - 50, 105)
	label.size = Vector2(100, 16)
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	add_child(label)

	var btn_w := 84.0
	var btn_h := 34.0
	var gap   := 8.0
	var row1_count := 3
	var row1_w := row1_count * btn_w + (row1_count - 1) * gap
	var row1_x := (GAME_W - row1_w) / 2.0
	var row2_count := 2
	var row2_w := row2_count * btn_w + (row2_count - 1) * gap
	var row2_x := (GAME_W - row2_w) / 2.0
	var btn_y1 := 125.0
	var btn_y2 := 168.0

	for i in 5:
		var level := i + 1
		var unlocked: bool = level <= Progress.data.unlocked_level
		var completed: bool = level in Progress.data.completed_levels
		var row := 0 if i < 3 else 1
		var col := i if i < 3 else i - 3
		var row_x := row1_x if row == 0 else row2_x
		var row_y := btn_y1 if row == 0 else btn_y2
		var bx := row_x + col * (btn_w + gap)

		var btn := Button.new()
		btn.position = Vector2(bx, row_y)
		btn.size = Vector2(btn_w, btn_h)
		btn.text = "L%d\n%s" % [level, LEVEL_NAMES[i]]
		btn.add_theme_font_size_override("font_size", 8)
		btn.disabled = not unlocked

		if unlocked:
			if completed:
				btn.add_theme_color_override("font_color", Color("a5d6a7"))
			btn.pressed.connect(_on_level_pressed.bind(level))
		else:
			btn.text = "🔒 L%d" % level

		add_child(btn)


func _on_level_pressed(level: int) -> void:
	_get_fullscreen()
	get_tree().change_scene_to_file("res://scenes/game.tscn")
	# TODO: pass level number to game scene (set on an autoload or global)


func _build_play_button() -> void:
	var btn := Button.new()
	btn.text = "▶  PLAY"
	btn.add_theme_font_size_override("font_size", 14)
	btn.position = Vector2((GAME_W - 140) / 2, 212)
	btn.size = Vector2(140, 40)
	btn.pressed.connect(_on_play_pressed)
	add_child(btn)


func _on_play_pressed() -> void:
	_get_fullscreen()
	get_tree().change_scene_to_file("res://scenes/game.tscn")


func _build_bottom_buttons() -> void:
	# Mute
	var mute := Button.new()
	mute.text = "🔇 MUTED" if Progress.data.muted else "🔊 SOUND"
	mute.add_theme_font_size_override("font_size", 8)
	mute.position = Vector2(20, GAME_H - 35)
	mute.size = Vector2(80, 26)
	mute.pressed.connect(func():
		var m: bool = not Progress.data.muted
		Progress.set_muted(m)
		AudioManager.set_muted(m)
		mute.text = "🔇 MUTED" if m else "🔊 SOUND"
	)
	add_child(mute)

	# Fullscreen
	var fs := Button.new()
	fs.text = "⛶ FULLSCR"
	fs.add_theme_font_size_override("font_size", 8)
	fs.position = Vector2((GAME_W - 70) / 2, GAME_H - 35)
	fs.size = Vector2(70, 26)
	fs.pressed.connect(func():
		if DisplayServer.window_get_mode() == DisplayServer.WINDOW_MODE_FULLSCREEN:
			DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
		else:
			DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_FULLSCREEN)
	)
	add_child(fs)

	# Reset
	var reset := Button.new()
	reset.text = "↺ RESET"
	reset.add_theme_font_size_override("font_size", 8)
	reset.position = Vector2(GAME_W - 100, GAME_H - 35)
	reset.size = Vector2(80, 26)
	reset.pressed.connect(func():
		if not _confirm_reset:
			_confirm_reset = true
			reset.text = "CONFIRM?"
			get_tree().create_timer(2.0).timeout.connect(func():
				_confirm_reset = false
				reset.text = "↺ RESET"
			)
		else:
			Progress.reset()
			get_tree().reload_current_scene()
	)
	add_child(reset)


func _get_fullscreen() -> void:
	var touch := DisplayServer.is_touchscreen_available()
	if touch and DisplayServer.window_get_mode() != DisplayServer.WINDOW_MODE_FULLSCREEN:
		DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_FULLSCREEN)
