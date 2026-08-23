## Bunny player — CharacterBody2D physics matching the Phaser version.
## Uses move_and_slide() for real collision with ground tiles.
## Input via Input.is_key_pressed() (reliable in HTML5 export) plus
## Input actions for gamepad support.

class_name Player
extends CharacterBody2D

const SpriteGenerator = preload("res://textures/sprite_generator.gd")

const GRAVITY      := 1100.0
const JUMP_VELOCITY := -620.0  # extra margin vs Phaser (-580) for frame-based physics
const JUMP_CUT     := -220.0
const RUN_SPEED    := 150.0
const ACCEL        := 1500.0
const FRICTION     := 1400.0
const COYOTE_TIME  := 0.08
const JUMP_BUFFER  := 0.08

var coyote_timer  := 0.0
var jump_buffer   := 0.0
var jump_held     := false
var was_on_ground := false
var facing_right  := true
var lives         := 3
var is_invuln     := false
var invuln_timer  := 0.0

# Touch state (set by TouchHandler)
var _touch_left  := false
var _touch_right := false
var _touch_jump  := false


func _ready() -> void:
	z_index = 100
	var tex := SpriteGenerator.get_texture("bunny_idle")
	if tex and has_node("Sprite2D"):
		$Sprite2D.texture = tex
		$Sprite2D.scale = Vector2(3, 3)
		$Sprite2D.centered = true
		# Align sprite feet with collision circle bottom:
		# collision radius 7 vs sprite half-height 24 -> offset up 17px
		$Sprite2D.position = Vector2(0, -17)


func _physics_process(delta: float) -> void:
	# Gravity
	if not is_on_floor():
		velocity.y += GRAVITY * delta
	else:
		velocity.y = 0.0

	# Coyote time
	if is_on_floor():
		coyote_timer = COYOTE_TIME
	else:
		coyote_timer = maxf(0.0, coyote_timer - delta)

	# Input: keyboard (raw keys), gamepad (actions), touch (state)
	var left  := Input.is_key_pressed(KEY_LEFT) or Input.is_key_pressed(KEY_A) \
		or Input.is_action_pressed("move_left") or _touch_left
	var right := Input.is_key_pressed(KEY_RIGHT) or Input.is_key_pressed(KEY_D) \
		or Input.is_action_pressed("move_right") or _touch_right

	var jump_pressed := Input.is_key_pressed(KEY_SPACE) or Input.is_key_pressed(KEY_W) \
		or Input.is_key_pressed(KEY_UP) or Input.is_action_just_pressed("jump") or _touch_jump
	_touch_jump = false

	# Jump buffer
	if jump_pressed:
		jump_buffer = JUMP_BUFFER
	else:
		jump_buffer = maxf(0.0, jump_buffer - delta)

	# Horizontal movement with momentum
	var target_vx := 0.0
	if left:  target_vx -= RUN_SPEED
	if right: target_vx += RUN_SPEED
	var accel := ACCEL if is_on_floor() else ACCEL * 0.4
	var friction := FRICTION if is_on_floor() else FRICTION * 0.07
	if left or right:
		velocity.x = move_toward(velocity.x, target_vx, accel * delta)
	else:
		velocity.x = move_toward(velocity.x, 0.0, friction * delta)

	# Facing
	if left:  facing_right = false
	if right: facing_right = true
	if has_node("Sprite2D"):
		$Sprite2D.flip_h = not facing_right

	# Jump (coyote + buffer)
	if coyote_timer > 0.0 and jump_buffer > 0.0:
		velocity.y = JUMP_VELOCITY
		coyote_timer = 0.0
		jump_buffer = 0.0
		AudioManager.play_sfx("jump")

	# Variable jump height
	var jump_now := Input.is_key_pressed(KEY_SPACE) or Input.is_key_pressed(KEY_W) \
		or Input.is_key_pressed(KEY_UP) or Input.is_action_pressed("jump")
	if jump_held and not jump_now and velocity.y < JUMP_CUT:
		velocity.y = JUMP_CUT
	jump_held = jump_now

	# Land SFX
	if not was_on_ground and is_on_floor():
		AudioManager.play_sfx("land")
	was_on_ground = is_on_floor()

	move_and_slide()

	# Invulnerability blink
	if is_invuln:
		invuln_timer -= delta
		modulate = Color(1, 0.5, 0.5, 0.7) if int(invuln_timer * 10) % 2 == 0 else Color.WHITE
		if invuln_timer <= 0.0:
			is_invuln = false
			modulate = Color.WHITE


func set_touch_walk(left: bool, right: bool) -> void:
	_touch_left  = left
	_touch_right = right


func apply_touch_jump() -> void:
	_touch_jump = true
	jump_buffer = JUMP_BUFFER


func hurt(knockback_dir: float = 0.0) -> void:
	if is_invuln:
		return
	lives -= 1
	is_invuln = true
	invuln_timer = 1.5
	velocity.x = knockback_dir * 150.0
	velocity.y = -200.0
	AudioManager.play_sfx("hurt")
	SignalBus.hurt.emit(lives)
	if lives <= 0:
		SignalBus.died.emit()
