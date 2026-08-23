## Touch/swipe input handler — hold sides to walk, swipe up to jump,
## swipe down to dig. Attached to the full-screen TouchOverlay Control.

class_name TouchHandler
extends Control

const SWIPE_THRESHOLD := 30.0
const TAP_THRESHOLD    := 0.12  # seconds

var _pointer_start: Dictionary = {}   # int -> {x, y, time}
var _active_side:   Dictionary = {}   # int -> "left" | "right"
var _player:         CharacterBody2D


func _ready() -> void:
	# Find the player automatically
	_player = get_tree().root.get_node_or_null("Game/Player") as CharacterBody2D


func _gui_input(event: InputEvent) -> void:
	if event is InputEventScreenTouch:
		if event.pressed:
			_on_touch_down(event.position, event.index)
		else:
			_on_touch_up(event.position, event.index)
	elif event is InputEventMouseButton and event.pressed:
		# Mouse fallback (desktop testing)
		_on_touch_down(event.position, 999)
		# Simulate quick release after tap — swipe handled by motion below
	elif event is InputEventMouseButton and not event.pressed:
		_on_touch_up(event.position, 999)


func _on_touch_down(pos: Vector2, id: int) -> void:
	if not _player:
		return
	var side := "left" if pos.x < size.x / 2.0 else "right"
	_pointer_start[id] = {
		x = pos.x,
		y = pos.y,
		time = Time.get_ticks_msec() / 1000.0,
	}
	_active_side[id] = side

	# Start walking immediately
	if side == "left":
		_player.set_touch_walk(true, false)
	else:
		_player.set_touch_walk(false, true)


func _on_touch_up(pos: Vector2, id: int) -> void:
	if not _player or not _pointer_start.has(id):
		return

	var start: Dictionary = _pointer_start[id]
	_pointer_start.erase(id)
	var side: String = _active_side.get(id, "")
	_active_side.erase(id)

	# Release walk (other fingers may still be down)
	var still_left:  bool = _active_side.values().has("left")
	var still_right: bool = _active_side.values().has("right")
	_player.set_touch_walk(still_left, still_right)

	var dy: float = pos.y - start.y
	var dx: float = pos.x - start.x
	var abs_dy: float = absf(dy)
	var abs_dx: float = absf(dx)
	var duration: float = Time.get_ticks_msec() / 1000.0 - start.time

	if abs_dy > SWIPE_THRESHOLD and abs_dy > abs_dx:
		# Vertical swipe
		if dy < 0:
			_player.apply_touch_jump()
		else:
			SignalBus.try_dig.emit()
	elif duration < TAP_THRESHOLD and abs_dx < SWIPE_THRESHOLD and abs_dy < SWIPE_THRESHOLD:
		# Quick tap -> jump in place
		_player.apply_touch_jump()
