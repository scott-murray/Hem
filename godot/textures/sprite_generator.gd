## Procedural sprite texture generator — ports drawBunny.js, drawTiles.js, etc.
##
## At boot time, generates every sprite texture pixel-by-pixel into Godot
## ImageTexture resources. Same approach as the Canvas `fillRect()` in JS:
## draw a 16×16 source image, then render it at 3× scale (48 px display).
##
## Usage (in boot scene):
##   SpriteGenerator.generate_all()
##   # Textures are now available via load("user://gen/bunny_idle_0.png") etc.

class_name SpriteGenerator
extends RefCounted

const SRC  := 16
const SCALE := 3
const PX   := SCALE  # display pixel size per source pixel


static func generate_all() -> void:
	_generate_bunny()
	_generate_tiles()
	_generate_enemies()
	_generate_carrots()
	_generate_particles()
	_generate_ui()


## Create a texture from a pixel-drawing function.
static func make_texture(key: String, w: int, h: int, draw_fn: Callable) -> ImageTexture:
	var img := Image.create(w, h, false, Image.FORMAT_RGBA8)
	draw_fn.call(img)
	var tex := ImageTexture.create_from_image(img)
	# Store in a global texture registry so scenes can look it up by key.
	TextureRegistry.register(key, tex)
	return tex


## --- Bunny sprites (≈ drawBunny.js) ---

static func _generate_bunny() -> void:
	const FW := SRC; const FH := SRC

	# Idle frames
	make_texture("bunny_idle_0", FW, FH, func(img):
		_draw_bunny_base(img, false)
		# Ear twitch variation for frame 1
	)
	make_texture("bunny_idle_1", FW, FH, func(img):
		_draw_bunny_base(img, false)
		_set_px(img, 4, 2, _pal("BUNNY_EAR_IN"))
		_set_px(img, 4, 3, _pal("BUNNY_EAR_IN"))
		_set_px(img, 4, 4, _pal("BUNNY_EAR_IN"))
	)

	make_texture("bunny_jump_0", FW, FH, func(img):
		# Ears up, legs tucked
		var B := _pal("BUNNY_BODY")
		_fill(img, 2, 0, 2, 7, B); _fill(img, 9, 0, 2, 5, B)
		_fill(img, 2, 6, 12, 6, B)  # head
		_fill(img, 3, 11, 9, 4, B)   # body tucked
		_fill(img, 2, 13, 3, 2, B); _fill(img, 11, 13, 3, 2, B)  # legs
		# Eyes
		_fill(img, 5, 8, 2, 2, _pal("BUNNY_EYE"))
		_fill(img, 10, 8, 2, 2, _pal("BUNNY_EYE"))
		_fill(img, 6, 9, 1, 1, _pal("BUNNY_PUPIL"))
		_fill(img, 11, 9, 1, 1, _pal("BUNNY_PUPIL"))
		# Tail
		_fill(img, 12, 11, 2, 2, _pal("BUNNY_TAIL"))
	)


static func _draw_bunny_base(img: Image, _flip: bool) -> void:
	var B  := _pal("BUNNY_BODY")
	var Be := _pal("BUNNY_BELLY")
	var Ei := _pal("BUNNY_EAR_IN")
	var Ey := _pal("BUNNY_EYE")
	var P  := _pal("BUNNY_PUPIL")
	var T  := _pal("BUNNY_TAIL")

	_fill(img, 3, 0, 2, 6, B);   _fill(img, 9, 0, 2, 6, B)    # ears
	_fill(img, 4, 1, 1, 4, Ei);  _fill(img, 10, 1, 1, 4, Ei)   # ear inner
	_fill(img, 2, 5, 12, 7, B)                                   # head
	_fill(img, 5, 7, 2, 2, Ey);  _fill(img, 10, 7, 2, 2, Ey)    # eyes
	_fill(img, 6, 8, 1, 1, P);   _fill(img, 11, 8, 1, 1, P)     # pupils
	_fill(img, 3, 11, 10, 4, B)                                  # body
	_fill(img, 5, 12, 6, 3, Be)                                  # belly
	_fill(img, 3, 14, 4, 2, B);  _fill(img, 9, 14, 4, 2, B)     # feet
	_fill(img, 12, 11, 3, 3, T)                                  # tail


## --- Tile sprites (≈ drawTiles.js) ---

static func _generate_tiles() -> void:
	# Grass
	make_texture("tile_grass", SRC, SRC, func(img):
		_fill(img, 0, 0, SRC, 4, _pal("GRASS_MID"))
		_fill(img, 0, 0, SRC, 2, _pal("GRASS_TOP"))
		_fill(img, 0, 4, SRC, SRC - 4, _pal("GROUND"))
	)

	# Ground
	make_texture("tile_ground", SRC, SRC, func(img):
		_fill(img, 0, 0, SRC, SRC, _pal("GROUND"))
	)

	# Platform
	make_texture("tile_platform", SRC, SRC, func(img):
		_fill(img, 0, 0, SRC, 4, _pal("PLATFORM_TOP"))
		_fill(img, 0, 4, SRC, SRC - 4, _pal("PLATFORM"))
	)

	# Diggable (crumbly brown with cracks)
	make_texture("tile_diggable", SRC, SRC, func(img):
		_fill(img, 0, 0, SRC, SRC, Color("6d4c41"))
		_fill(img, 4, 0, 1, 3, Color("3e2723"))   # crack
		_fill(img, 11, 6, 1, 4, Color("3e2723"))   # crack
	)

	# Door
	make_texture("tile_door", SRC, SRC, func(img):
		_fill(img, 2, 0, 12, SRC, Color("6d4c41"))
		_fill(img, 2, 5, 12, 2, Color("37474f"))
		_fill(img, 2, 10, 12, 2, Color("37474f"))
		_fill(img, 6, 7, 4, 3, Color("ffd54f"))  # lock
	)

	# Puzzle trigger
	make_texture("tile_puzzle", SRC, SRC, func(img):
		_fill(img, 0, 0, SRC, SRC, Color("7b1fa2"))
		_fill(img, 6, 2, 4, 2, Color("e1bee7"))   # ? top
		_fill(img, 9, 4, 2, 2, Color("e1bee7"))
		_fill(img, 7, 6, 2, 2, Color("e1bee7"))
		_fill(img, 7, 10, 2, 2, Color("e1bee7"))
	)

	# Spike
	make_texture("tile_spike", SRC, SRC, func(img):
		_fill(img, 0, 12, SRC, 4, Color("607d8b"))
		for cx in [1, 6, 11]:
			_fill(img, cx, 4, 4, 8, Color("b0bec5"))
	)


## --- Enemy sprites (≈ drawEnemy.js) ---

static func _generate_enemies() -> void:
	make_texture("enemy_fox", SRC, SRC, func(img):
		var F := _pal("FOX_BODY"); var B := _pal("FOX_BELLY")
		_fill(img, 2, 8, 10, 6, F); _fill(img, 4, 9, 6, 5, B)  # body
		_fill(img, 8, 4, 8, 8, F); _fill(img, 12, 7, 4, 3, B)  # head
		_fill(img, 0, 8, 3, 3, _pal("FOX_TAIL"))               # tail
		_fill(img, 3, 13, 3, 3, F); _fill(img, 9, 13, 3, 3, F)  # legs
	)

	make_texture("enemy_beetle", SRC, SRC, func(img):
		var S := _pal("BEETLE_SHELL"); var L := _pal("BEETLE_LEGS")
		_fill(img, 2, 3, 12, 10, S); _fill(img, 1, 5, 14, 6, S)  # shell
		_fill(img, 7, 2, 2, 12, L)                                # line
		_fill(img, 0, 7, 2, 1, L); _fill(img, 14, 7, 2, 1, L)    # legs
	)


## --- Carrot + broccoli sprites ---

static func _generate_carrots() -> void:
	make_texture("carrot", SRC, SRC, func(img):
		_fill(img, 5, 4, 6, 8, _pal("CARROT_BODY"))
		_fill(img, 7, 13, 2, 2, _pal("CARROT_TIP"))
		_fill(img, 5, 0, 3, 4, _pal("CARROT_TOP"))
	)

	make_texture("broccoli", SRC, SRC, func(img):
		_fill(img, 7, 10, 2, 6, Color("6d8c3f"))                 # stalk
		_fill(img, 3, 2, 10, 8, Color("2e7d32"))                 # floret
		_fill(img, 1, 4, 14, 4, Color("2e7d32"))
		_fill(img, 5, 2, 3, 3, Color("4caf50")); _fill(img, 10, 3, 2, 2, Color("4caf50"))
	)


## --- Particle / UI sprites ---

static func _generate_particles() -> void:
	make_texture("particle_dust", 4, 4, func(img):
		_fill(img, 1, 1, 2, 2, Color("a1887f"))
	)
	make_texture("particle_sparkle", 4, 4, func(img):
		_fill(img, 1, 0, 2, 4, Color("ffee58"))
		_fill(img, 0, 1, 4, 2, Color("ffee58"))
	)


static func _generate_ui() -> void:
	make_texture("heart_full", 8, 8, func(img):
		var H := Color("f44336")
		_fill(img, 1, 2, 2, 1, H); _fill(img, 5, 2, 2, 1, H)
		_fill(img, 0, 3, 8, 2, H); _fill(img, 1, 5, 6, 2, H)
		_fill(img, 2, 7, 4, 1, H); _fill(img, 3, 8, 2, 1, H)
	)
	make_texture("heart_empty", 8, 8, func(img):
		var H := Color("424242")
		_fill(img, 1, 2, 2, 1, H); _fill(img, 5, 2, 2, 1, H)
		_fill(img, 0, 3, 8, 2, H); _fill(img, 1, 5, 6, 2, H)
		_fill(img, 2, 7, 4, 1, H); _fill(img, 3, 8, 2, 1, H)
	)


## --- Helpers ---

static func _set_px(img: Image, x: int, y: int, color: Color) -> void:
	img.set_pixel(x, y, color)


static func _fill(img: Image, x: int, y: int, w: int, h: int, color: Color) -> void:
	for dx in w:
		for dy in h:
			img.set_pixel(x + dx, y + dy, color)


static func _pal(key: String) -> Color:
	# Subset of the JS palette — extend as needed.
	match key:
		"BUNNY_BODY":     return Color("1a6b2f")
		"BUNNY_BELLY":    return Color("2d9e48")
		"BUNNY_EAR_IN":   return Color("ff8fa3")
		"BUNNY_EYE":      return Color("ffffff")
		"BUNNY_PUPIL":    return Color("1a1a2e")
		"BUNNY_TAIL":     return Color("e8f5e9")
		"GROUND":         return Color("5c4033")
		"GRASS_TOP":      return Color("4caf50")
		"GRASS_MID":      return Color("388e3c")
		"PLATFORM":       return Color("8d6e63")
		"PLATFORM_TOP":   return Color("a5d6a7")
		"FOX_BODY":       return Color("ef6c00")
		"FOX_BELLY":      return Color("ffe0b2")
		"FOX_TAIL":       return Color("ffffff")
		"BEETLE_SHELL":   return Color("1a237e")
		"BEETLE_LEGS":    return Color("283593")
		"CARROT_BODY":    return Color("ff7043")
		"CARROT_TIP":     return Color("e64a19")
		"CARROT_TOP":     return Color("4caf50")
		_:                return Color.MAGENTA  # missing colour
