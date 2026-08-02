## Audio manager — ports sfx.js and music.js chiptune sequencer.
## Autoload singleton. Uses AudioStreamGenerator for real-time synthesis.

extends Node

const SAMPLE_RATE := 44100.0

var _muted := false
var _sfx_player: AudioStreamPlayer
var _music_player: AudioStreamPlayer
var _sfx_playback: AudioStreamGeneratorPlayback
var _music_playback: AudioStreamGeneratorPlayback


func _ready() -> void:
	_muted = Progress.data.muted
	_setup_sfx()
	_setup_music()


func _setup_sfx() -> void:
	_sfx_player = AudioStreamPlayer.new()
	var gen := AudioStreamGenerator.new()
	gen.mix_rate = SAMPLE_RATE
	gen.buffer_length = 0.1
	_sfx_player.stream = gen
	add_child(_sfx_player)
	_sfx_player.play()
	_sfx_playback = _sfx_player.get_stream_playback()
	# Push initial silence to avoid "cannot be sampled" warning
	for _i in 32:
		_sfx_playback.push_frame(Vector2.ZERO)


func _setup_music() -> void:
	_music_player = AudioStreamPlayer.new()
	var gen := AudioStreamGenerator.new()
	gen.mix_rate = SAMPLE_RATE
	gen.buffer_length = 1.0
	_music_player.stream = gen
	add_child(_music_player)
	_music_player.play()
	_music_playback = _music_player.get_stream_playback()
	for _i in 64:
		_music_playback.push_frame(Vector2.ZERO)


## Play a named SFX. Same sound names as the JS version.
func play_sfx(name: String) -> void:
	if _muted: return
	match name:
		"jump":        _synth_osc(_sfx_playback, "square", 440, 700, 0.08, 0.2)
		"land":        _synth_noise(_sfx_playback, 0.05, 300, 0.3)
		"collect":     _synth_arpeggio(_sfx_playback, [523.25, 659.25, 783.99], 0.06, 0.3, 0.065)
		"collect_small": _synth_arpeggio(_sfx_playback, [659.25, 783.99, 1046.5], 0.05, 0.25, 0.06)
		"broccoli":    _synth_arpeggio(_sfx_playback, [392, 523.25, 659.25, 783.99], 0.07, 0.3, 0.07)
		"hurt":        _synth_osc(_sfx_playback, "sawtooth", 300, 100, 0.2, 0.25)
		"puzzle_ok":   _synth_arpeggio(_sfx_playback, [523.25, 659.25, 783.99, 1046.5], 0.08, 0.3, 0.085)
		"puzzle_no":   _synth_osc(_sfx_playback, "square", 200, 150, 0.25, 0.2)
		"win":         _synth_arpeggio(_sfx_playback, [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5], 0.08, 0.3, 0.085)
		"checkpoint":  _synth_chord(_sfx_playback, [523.25, 783.99], 0.1, 0.25)
		"dig":         _synth_dig(_sfx_playback)


func set_muted(val: bool) -> void:
	_muted = val


## --- Synthesis helpers ---

func _synth_osc(pb: AudioStreamGeneratorPlayback, waveform: String,
		freq_start: float, freq_end: float, duration: float, gain: float) -> void:
	var frames := int(SAMPLE_RATE * duration)
	for i in frames:
		var t := float(i) / SAMPLE_RATE
		var freq := lerpf(freq_start, freq_end, t / duration)
		var env  := gain * (1.0 - t / duration)
		var sample := _wave(waveform, freq, t) * env
		pb.push_frame(Vector2(sample, sample))


func _synth_noise(pb: AudioStreamGeneratorPlayback, duration: float, _cutoff: float, gain: float) -> void:
	var frames := int(SAMPLE_RATE * duration)
	for i in frames:
		var t := float(i) / SAMPLE_RATE
		var env := gain * (1.0 - t / duration)
		var sample := (randf() * 2.0 - 1.0) * env
		pb.push_frame(Vector2(sample, sample))


func _synth_arpeggio(pb: AudioStreamGeneratorPlayback, notes: Array,
		duration: float, gain: float, gap: float) -> void:
	for j in notes.size():
		_synth_osc(pb, "triangle", notes[j], notes[j], duration, gain)
		# Pad silence between notes
		var silence := int(SAMPLE_RATE * gap)
		for _i in silence:
			pb.push_frame(Vector2.ZERO)


func _synth_chord(pb: AudioStreamGeneratorPlayback, notes: Array, duration: float, gain: float) -> void:
	var frames := int(SAMPLE_RATE * duration)
	for i in frames:
		var t := float(i) / SAMPLE_RATE
		var env := gain * (1.0 - t / duration)
		var sample := 0.0
		for note in notes:
			sample += _wave("triangle", note, t) * env / notes.size()
		pb.push_frame(Vector2(sample, sample))


func _synth_dig(pb: AudioStreamGeneratorPlayback) -> void:
	# Crumbly noise + low growl
	_synth_noise(pb, 0.12, 400, 0.25)
	_synth_osc(pb, "triangle", 90, 60, 0.15, 0.15)
	_synth_osc(pb, "sawtooth", 40, 25, 0.1, 0.1)


func _wave(waveform: String, freq: float, t: float) -> float:
	match waveform:
		"square":    return 1.0 if sin(freq * TAU * t) >= 0 else -1.0
		"sawtooth":  return fmod(freq * t, 1.0) * 2.0 - 1.0
		_:           return sin(freq * TAU * t)  # triangle / sine
