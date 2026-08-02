## Touch/swipe input handler — ports the UIScene three-zone logic.
##
## Attach to a Control node covering the full viewport.
## Tracks pointer start/end to distinguish:
##   hold left/right  -> walk
##   swipe up         -> jump
##   swipe down       -> dig
##   quick tap        -> jump in place

class_name TouchHandler
extends Control

const SWIPE_THRESHOLD := 30.0
const TAP_THRESHOLD    := 0.12  # seconds

var _pointer_start: Dictionary = {}   # int -> {x, y, time}
var _active_side:   Dictionary = {}   # int -> "left" | "right"
var _player:         Player


func setup(player_node: Player) -> void:
	_player = player_node


func _gui_input(event: InputEvent) -> void:
	if event is InputEventScreenTouch:
		if event.pressed:
			_on_touch_down(event)
		else:
			_on_touch_up(event)


func _on_touch_down(event: InputEventScreenTouch) -> void:
	var mid := size.x / 2.0
	var side := "left" if event.position.x < mid else "right"
	_pointer_start[event.index] = {
		x = event.position.x,
		y = event.position.y,
		time = Time.get_ticks_msec() / 1000.0,
	}
	_active_side[event.index] = side

	# Start walking immediately
	if side == "left":
		_player.set_touch_walk(true, false)
	else:
		_player.set_touch_walk(false, true)


func _on_touch_up(event: InputEventScreenTouch) -> void:
	if not _pointer_start.has(event.index):
		return

	var start: Dictionary = _pointer_start[event.index]
	_pointer_start.erase(event.index)
	var side: String = _active_side.get(event.index, "")
	_active_side.erase(event.index)

	# Release walk (other fingers may still be down)
	var still_left  := _active_side.values().has("left")
	var still_right := _active_side.values().has("right")
	_player.set_touch_walk(still_left, still_right)

	var dy := event.position.y - start.y
	var dx := event.position.x - start.x
	var abs_dy := absf(dy)
	var abs_dx := absf(dx)
	var duration := Time.get_ticks_msec() / 1000.0 - start.time

	if abs_dy > SWIPE_THRESHOLD:
		# Vertical swipe
		if dy < 0:
			_player.apply_touch_jump()
		else:
			SignalBus.try_dig.emit()
	elif duration < TAP_THRESHOLD and abs_dx < SWIPE_THRESHOLD:
		# Quick stationary tap -> jump
		_player.apply_touch_jump()
	# else: hold-to-walk is already active from _on_touch_down
