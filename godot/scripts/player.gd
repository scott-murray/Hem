## Bunny player controller — ports the physics from GameScene._updateBunny().
##
## Attached to a CharacterBody2D in the game scene. Uses the same constants
## and the same coyote-time + jump-buffer + variable-height jump feel.

class_name Player
extends CharacterBody2D

const SpriteGenerator = preload("res://textures/sprite_generator.gd")

const GRAVITY          := 1100.0
const JUMP_VELOCITY    := -580.0
const JUMP_CUT         := -220.0   # upward cap when jump released early
const RUN_SPEED        := 150.0
const RUN_ACCEL_GROUND := 1500.0
const RUN_ACCEL_AIR    := 600.0
const FRICTION_GROUND  := 1400.0
const FRICTION_AIR     := 100.0
const COYOTE_TIME      := 0.08    # seconds
const JUMP_BUFFER      := 0.08
const INVULN_TIME      := 1.5

var coyote_timer   := 0.0
var jump_buffer    := 0.0
var was_on_ground  := false
var jump_held      := false
var is_invuln      := false
var invuln_timer   := 0.0
var facing_right   := true
var lives          := 3


func _ready() -> void:
	# Set bunny sprite texture — use pre-rendered PNG, make it very visible
	var tex := SpriteGenerator.get_texture("bunny_idle")
	if tex and has_node("Sprite2D"):
		$Sprite2D.texture = tex
		$Sprite2D.scale = Vector2(5, 5)
		$Sprite2D.centered = true
		$Sprite2D.visible = true
		$Sprite2D.z_index = 100
		$Sprite2D.modulate = Color(1, 1, 0.5)  # yellowish tint for visibility


func _physics_process(delta: float) -> void:
	_frame_count += 1
	if _frame_count % 60 == 1:
		print("[Player] frame ", _frame_count, " pos=", position, " vel=", velocity, " floor=", is_on_floor())

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

	# Jump buffer
	if Input.is_action_just_pressed("jump"):
		jump_buffer = JUMP_BUFFER
	else:
		jump_buffer = maxf(0.0, jump_buffer - delta)

	# Horizontal input (keyboard, gamepad, or touch)
	var input_dir := Input.get_axis("move_left", "move_right")

	# Touch state (set externally by touch_handler)
	if _touch_left:  input_dir = -1.0
	if _touch_right: input_dir = 1.0

	var target_vx := input_dir * RUN_SPEED
	var pressing  := absf(input_dir) > 0.01
	var accel     := RUN_ACCEL_GROUND if is_on_floor() else RUN_ACCEL_AIR
	var friction  := FRICTION_GROUND if is_on_floor() else FRICTION_AIR

	if pressing:
		velocity.x = approach(velocity.x, target_vx, accel * delta)
	else:
		velocity.x = approach(velocity.x, 0.0, friction * delta)

	# Sprite flip
	if input_dir < -0.01:
		facing_right = false
	elif input_dir > 0.01:
		facing_right = true

	# Jump
	var can_jump   := coyote_timer > 0.0
	var wants_jump := jump_buffer > 0.0

	if can_jump and wants_jump:
		velocity.y = JUMP_VELOCITY
		coyote_timer = 0.0
		jump_buffer = 0.0
		SignalBus.jumped.emit()

	# Variable jump height
	var jump_pressed_now := Input.is_action_pressed("jump")
	if jump_held and not jump_pressed_now and velocity.y < JUMP_CUT:
		velocity.y = JUMP_CUT
	jump_held = jump_pressed_now

	# Land detection
	if not was_on_ground and is_on_floor():
		SignalBus.landed.emit()
	was_on_ground = is_on_floor()

	move_and_slide()

	# Invulnerability
	if is_invuln:
		invuln_timer -= delta
		if invuln_timer <= 0.0:
			is_invuln = false
			modulate = Color.WHITE


## Called by game controller when the player takes damage.
func hurt(knockback_dir: float = 0.0) -> void:
	if is_invuln:
		return

	lives -= 1
	is_invuln = true
	invuln_timer = INVULN_TIME
	modulate = Color(1, 0.3, 0.3, 0.6)

	velocity.x = knockback_dir * 150.0
	velocity.y = -200.0

	SignalBus.hurt.emit(lives)

	if lives <= 0:
		SignalBus.died.emit()


## Apply external jump (from touch swipe). Consumed once per frame.
func apply_touch_jump() -> void:
	jump_buffer = JUMP_BUFFER


var _frame_count := 0

## Simple direct movement in _process (bypasses physics for HTML5 compat)
func _process(_delta: float) -> void:
	var speed := 200.0
	if Input.is_key_pressed(KEY_LEFT) or Input.is_key_pressed(KEY_A):
		position.x -= speed * _delta
	if Input.is_key_pressed(KEY_RIGHT) or Input.is_key_pressed(KEY_D):
		position.x += speed * _delta
	if Input.is_key_pressed(KEY_UP) or Input.is_key_pressed(KEY_W) or Input.is_key_pressed(KEY_SPACE):
		position.y -= speed * _delta
	if Input.is_key_pressed(KEY_DOWN) or Input.is_key_pressed(KEY_S):
		position.y += speed * _delta
var _touch_left  := false
var _touch_right := false

func set_touch_walk(left: bool, right: bool) -> void:
	_touch_left  = left
	_touch_right = right


## Move `current` toward `target` by at most `max_delta`.
static func approach(current: float, target: float, max_delta: float) -> float:
	if current < target:
		return minf(current + max_delta, target)
	if current > target:
		return maxf(current - max_delta, target)
	return current
