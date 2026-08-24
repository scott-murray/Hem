## Puzzle overlay — ports PuzzleScene.js.
## Modal panel with dimmed background. Supports spelling, math, and dig-teach.

extends Control

const GAME_W := 480.0
const GAME_H := 270.0
const PANEL_W := 320.0
const PANEL_H := 190.0
const PANEL_X := (GAME_W - PANEL_W) / 2.0
const PANEL_Y := (GAME_H - PANEL_H) / 2.0

const WORD_BANK := ["CAT","DOG","SUN","BUG","HOP","RUN","BEE","PIG","COW","FOX","JUMP","FROG","BIRD","FISH","STAR","MOON","TREE","CAKE"]

var _puzzle_type: String
var _puzzle_id:   int
var _correct_letter: String
var _correct_answer: int


func show_puzzle(ptype: String, pid: int) -> void:
	print("[PuzzleOverlay] setup called type=", ptype)
	_puzzle_type = ptype
	_puzzle_id   = pid
	_clear_children()
	_build()
	print("[PuzzleOverlay] build done, children=", get_child_count())


func _clear_children() -> void:
	for child in get_children():
		child.queue_free()


func _build() -> void:
	# Dim overlay
	var dim := ColorRect.new()
	dim.color = Color(0, 0, 0, 0.7)
	dim.set_anchors_and_offsets_preset(PRESET_FULL_RECT)
	add_child(dim)

	# Panel background
	var panel := ColorRect.new()
	panel.color = Color("1a1a2e")
	panel.position = Vector2(PANEL_X, PANEL_Y)
	panel.size     = Vector2(PANEL_W, PANEL_H)
	add_child(panel)

	# Panel border
	var border := ColorRect.new()
	border.color = Color(0, 0, 0, 0)
	var style := StyleBoxFlat.new()
	style.border_width_left = 3; style.border_width_right = 3
	style.border_width_top = 3; style.border_width_bottom = 3
	style.border_color = Color("7b1fa2")

	match _puzzle_type:
		"spelling":  _build_spelling(panel)
		"math":      _build_math(panel)
		"dig-teach": _build_dig_teach(panel)


func _build_spelling(panel: Control) -> void:
	print("[PuzzleOverlay] _build_spelling called")
	var word: String = WORD_BANK[randi() % WORD_BANK.size()]
	var hidden: int = randi() % word.length()
	_correct_letter = word[hidden]

	# Title
	_add_label(panel, "SPELL IT!", GAME_W / 2, PANEL_Y + 20, 14, Color("ce93d8"))

	# Word display
	var display := ""
	for i in word.length():
		display += ("_ " if i == hidden else word[i] + " ") if i < word.length() - 1 else ("_" if i == hidden else word[i])
	_add_label(panel, display, GAME_W / 2, PANEL_Y + 55, 22, Color.WHITE)

	# Instruction
	_add_label(panel, "Which letter fills the blank?", GAME_W / 2, PANEL_Y + 82, 9, Color("b0bec5"))

	# Generate 3 distractors
	var distractors: Array[String] = []
	var alphabet := "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	while distractors.size() < 3:
		var d: String = alphabet[randi() % 26]
		if d != _correct_letter and d not in distractors:
			distractors.append(d)

	var choices: Array[String] = []
	choices.append(_correct_letter)
	choices.append_array(distractors)
	choices.shuffle()

	# 2x2 button grid
	var btn_w := 56.0; var btn_h := 40.0; var gap := 12.0
	var total_w := 2 * btn_w + gap
	var start_x := GAME_W / 2 - total_w / 2
	for i in 4:
		var col := i % 2; var row := i / 2
		var bx := start_x + col * (btn_w + gap)
		var by := PANEL_Y + 100 + row * 48
		_add_answer_button(bx, by, btn_w, btn_h, choices[i],
			_on_answer.bind(choices[i] == _correct_letter))


func _build_math(panel: Control) -> void:
	var a := randi() % 9 + 1
	var b := randi() % 9 + 1
	_correct_answer = a + b

	_add_label(panel, "MATH MAGIC!", GAME_W / 2, PANEL_Y + 20, 14, Color("80cbc4"))
	_add_label(panel, "%d + %d = ?" % [a, b], GAME_W / 2, PANEL_Y + 55, 26, Color.WHITE)
	_add_label(panel, "Pick the right answer!", GAME_W / 2, PANEL_Y + 82, 9, Color("b0bec5"))

	var distractors: Array[int] = []
	var offsets := [3, 2, 1, -1, -2, -3, 4, -4]
	for off in offsets:
		if distractors.size() >= 3: break
		var v: int = _correct_answer - off
		if v > 0 and v <= 18 and v != _correct_answer and v not in distractors:
			distractors.append(v)
	while distractors.size() < 3:
		var fb := randi() % 18 + 1
		if fb != _correct_answer and fb not in distractors:
			distractors.append(fb)

	var choices: Array[int] = []
	choices.append(_correct_answer)
	choices.append_array(distractors)
	choices.shuffle()

	var btn_w := 60.0; var btn_h := 40.0; var gap := 12.0
	var total_w := 2 * btn_w + gap
	var start_x := GAME_W / 2 - total_w / 2
	for i in 4:
		var col := i % 2; var row := i / 2
		var bx := start_x + col * (btn_w + gap)
		var by := PANEL_Y + 100 + row * 48
		_add_answer_button(bx, by, btn_w, btn_h, str(choices[i]),
			_on_answer.bind(choices[i] == _correct_answer))


func _build_dig_teach(panel: Control) -> void:
	_add_label(panel, "NEW ABILITY!", GAME_W / 2, PANEL_Y + 20, 14, Color("ffcc80"))
	_add_label(panel, "DIG", GAME_W / 2, PANEL_Y + 55, 24, Color.WHITE)
	_add_label(panel, "Press DOWN or swipe down on soft earth\nto burrow through crumbly ground!", GAME_W / 2, PANEL_Y + 82, 9, Color("b0bec5"))

	var btn := Button.new()
	btn.text = "GOT IT!"
	btn.add_theme_font_size_override("font_size", 10)
	btn.position = Vector2(GAME_W / 2 - 70, PANEL_Y + 130)
	btn.size = Vector2(140, 40)
	btn.pressed.connect(func(): _on_answer(true))
	add_child(btn)


func _on_answer(correct: bool) -> void:
	if correct:
		AudioManager.play_sfx("puzzle_ok")
		SignalBus.puzzle_result.emit(true, _puzzle_id)
	else:
		AudioManager.play_sfx("puzzle_no")
		SignalBus.puzzle_result.emit(false, _puzzle_id)
	queue_free()


## Helper to add a centred label to the panel.
func _add_label(parent: Control, text: String, x: float, y: float, size: int, color: Color) -> void:
	var lbl := Label.new()
	lbl.text = text
	lbl.add_theme_font_size_override("font_size", size)
	lbl.add_theme_color_override("font_color", color)
	lbl.position = Vector2(x - 150, y)
	lbl.size = Vector2(300, size + 8)
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	parent.add_child(lbl)


## Helper to add a clickable answer button.
func _add_answer_button(x: float, y: float, w: float, h: float, label: String, callback: Callable) -> void:
	print("[PuzzleOverlay] adding button ", label, " at ", x, ",", y)
	var btn := Button.new()
	btn.text = label
	btn.add_theme_font_size_override("font_size", 18)
	btn.position = Vector2(x, y)
	btn.size = Vector2(w, h)
	btn.pressed.connect(callback)
	add_child(btn)
