## Global texture registry — stores generated sprites by key so any
## scene can look them up without hard references.

extends Node

static var _textures: Dictionary = {}

static func register(key: String, tex: ImageTexture) -> void:
	_textures[key] = tex

static func get_tex(key: String) -> ImageTexture:
	return _textures.get(key, null)
