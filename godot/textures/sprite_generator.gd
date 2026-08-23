## Sprite texture registry — loads pre-rendered PNGs instead of generating
## procedurally at runtime (which doesn't work in Godot's HTML5 export).
##
## PNGs live in res://textures/gen/ and were rendered from the original
## pixel-art draw functions using Pillow.

class_name SpriteGenerator
extends RefCounted

static var _textures: Dictionary = {}
static var _loaded := false

static func generate_all() -> void:
	if _loaded:
		return
	var dir := "res://textures/gen"
	var files := [
		"bunny_idle", "bunny_jump",
		"tile_grass", "tile_ground", "tile_platform", "tile_diggable",
		"tile_door", "tile_spike", "tile_puzzle",
		"enemy_fox", "enemy_beetle",
		"carrot", "broccoli",
		"particle_dust", "particle_sparkle",
		"heart_full", "heart_empty",
		"tile_checkpoint_off", "tile_checkpoint_on",
	]
	for name in files:
		var path: String = dir + "/" + name + ".png"
		if ResourceLoader.exists(path):
			var tex: Texture2D = load(path)
			_textures[name] = tex
		else:
			print("[SpriteGenerator] WARNING: not found: ", path)
	_loaded = true
	print("[SpriteGenerator] Loaded ", _textures.size(), " / ", files.size(), " textures")


static func get_texture(key: String) -> Texture2D:
	if not _loaded:
		generate_all()
	return _textures.get(key, null)
