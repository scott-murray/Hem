## Global signal bus — decouples scenes without direct references.
## Add as an autoload in project.godot under the name "SignalBus".

extends Node

signal jumped()
signal landed()
signal hurt(lives_left: int)
signal died()
signal collected_carrot(count: int, total: int)
signal collected_broccoli(count: int)
signal checkpoint_reached()
signal puzzle_triggered(type: String, id: int)
signal puzzle_result(success: bool, id: int)
signal dig_unlocked()
signal level_complete(level: int)
signal music_change(track_name: String)
