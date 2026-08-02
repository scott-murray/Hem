## Level map data — inlined from shared .txt files so the web export
## can load them without depending on external file resources.

extends Node

static var LEVEL1_MAP := [
	"                              ",
	"                              ",
	"     c           c            ",
	"     PPP         PPP          ",
	"              D               ",
	"   PPP        D     PPP       ",
	"              D               ",
	"B   c     Q   D       K     C ",
	"TTTTTTTXXTTTTTTTTTTTTTTTXXTTTT",
	"GGGGGGG   GGGGGGGGGGGGGG  GGGG",
	"GGGGGGG b GGGGGGGGGGGGGG  GGGG",
	"GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
	"GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
	"GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
	"GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
	"GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
]

static var LEVEL2_MAP := [
	"                                    ",
	"                                    ",
	"                         c          ",
	"                                    ",
	"                        PPP         ",
	"      c                             ",
	"                                    ",
	"     PPP        c           PPP     ",
	"                                    ",
	"   PPP      D  PPP      D PPP  XX   ",
	"            D           D      X    ",
	"B   c F Q   D   Q K     D  F   Xb C ",
	"TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
	"GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
	"GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
	"GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
	"GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
	"GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
]

static var LEVEL3_MAP := [
	"                                          ",
	"                                          ",
	"                              c           ",
	"    c                                     ",
	"                             PPP          ",
	"   PPP         XX                         ",
	"       c       XX                     X X ",
	"      PPP              c       PPP    XbX ",
	"                                      XXX ",
	"   PPP           D    PPPXXXD  PPP        ",
	"                 D          D             ",
	"B F c       Q    D  K E   Q D   K  F    C ",
	"TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
	"GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
	"GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
	"GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
	"GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
	"GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
]

static var LEVEL4_MAP := [
	"                                          ",
	"                                          ",
	"                                          ",
	"                                          ",
	"                                          ",
	"           XXXX        XXXX   XXXX        ",
	"    c      DXXX        XXDX   XXXX        ",
	"       PPP DXXX        XXDX   XXXX        ",
	"           XXXX        XXXX   XXXX        ",
	"   PPP          PcP        PPP     PPP    ",
	"                                          ",
	"B1 c   Q        c  EE   Q  1c  K  b  c  C ",
	"TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
	"GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
	"GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
	"GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
	"GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
	"GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
]

static var LEVEL5_MAP := [
	"                                                ",
	"                                        c       ",
	"                                                ",
	"                             c         PPP      ",
	"                 c                              ",
	"                            PPPP        PPPP    ",
	"    c            PPP                            ",
	"                c                               ",
	"   PPPP                   PPPP        PPPP      ",
	"               PPP                              ",
	"                                                ",
	"     PPPP        PPPP        PPPP        PPPP   ",
	"            D                       D           ",
	"            D XXX                   D           ",
	"   PPPP     D  PPPP        PPPP     D  PPPP     ",
	" B 1 c    Q       c XXX  Q   K   c  b   F 1 K  C",
	"TTTTTTTTTTTT    TTTTTTTTTTTT    TTTTTTTTTTTTTTTT",
	"GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
	"GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
	"GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
	"GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
	"GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
]


static func get_map(level: int) -> Array:
	match level:
		1: return LEVEL1_MAP
		2: return LEVEL2_MAP
		3: return LEVEL3_MAP
		4: return LEVEL4_MAP
		5: return LEVEL5_MAP
	return LEVEL1_MAP
