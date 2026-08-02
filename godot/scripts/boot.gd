## Boot scene — generates all procedural textures, loads progress,
## then transitions to the start screen.

extends Node2D

# Preload cross-file dependencies so class_name resolution works at boot.
const SpriteGeneratorClass = preload("res://textures/sprite_generator.gd")
const LevelParserClass     = preload("res://scripts/level_parser.gd")
const PlayerClass          = preload("res://scripts/player.gd")
const GameControllerClass  = preload("res://scripts/game_controller.gd")
const TouchHandlerClass    = preload("res://scripts/touch_handler.gd")

func _ready() -> void:
	Progress.load_progress()
	AudioManager.set_muted(Progress.data.muted)
	SpriteGeneratorClass.generate_all()
	print("[Boot] Textures generated. Progress: unlocked=%d muted=%s dig=%s broccolis=%d" % [
		Progress.data.unlocked_level, Progress.data.muted,
		Progress.data.has_dig_ability, Progress.data.broccolis
	])
	# Self-test (remove quit for normal gameplay):
	#   print("[Boot] All systems initialised OK."); get_tree().quit(0)
	# TODO: scene transition — get_tree().change_scene_to_file("res://scenes/start_screen.tscn")
