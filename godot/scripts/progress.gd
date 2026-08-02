## Progress persistence — ports `src/progress/storage.js`.
## Autoload singleton. Uses ConfigFile (native) which maps to
## localStorage on HTML5 export and filesystem on Linux ARM.
##
## Save data:
##   unlocked_level: int  (1–5)
##   completed_levels: Array[int]
##   muted: bool
##   has_dig_ability: bool
##   broccolis: int

extends Node

const SAVE_PATH := "user://progress.cfg"

var data: Dictionary = {
	unlocked_level   = 1,
	completed_levels = [],
	muted            = false,
	has_dig_ability  = false,
	broccolis        = 0,
}


func _ready() -> void:
	load_progress()


func load_progress() -> void:
	var config := ConfigFile.new()
	if config.load(SAVE_PATH) == OK:
		for key in data.keys():
			data[key] = config.get_value("progress", key, data[key])


func save_progress() -> void:
	var config := ConfigFile.new()
	for key in data.keys():
		config.set_value("progress", key, data[key])
	config.save(SAVE_PATH)


func reset() -> void:
	DirAccess.remove_absolute(ProjectSettings.globalize_path(SAVE_PATH))
	data = {
		unlocked_level   = 1,
		completed_levels = [],
		muted            = false,
		has_dig_ability  = false,
		broccolis        = 0,
	}


func complete_level(level: int) -> void:
	if level not in data.completed_levels:
		data.completed_levels.append(level)
	var next_level := level + 1
	if next_level <= 5 and next_level > data.unlocked_level:
		data.unlocked_level = next_level
	save_progress()


func set_muted(val: bool) -> void:
	data.muted = val
	save_progress()


func set_dig_ability(val: bool) -> void:
	data.has_dig_ability = val
	save_progress()


func has_dig() -> bool:
	return data.has_dig_ability


func add_broccoli() -> void:
	data.broccolis += 1
	save_progress()


func get_broccolis() -> int:
	return data.broccolis
