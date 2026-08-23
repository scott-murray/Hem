## Audio manager — ports sfx.js and music.js chiptune sequencer.
## Autoload singleton. Uses AudioStreamGenerator for real-time synthesis.

extends Node

const SAMPLE_RATE := 44100.0
const BPM := 112.0
const STEP_DUR := 60.0 / BPM / 4.0  # 16th note seconds

# Simple looping melody (MIDI notes, -1 = rest)
const MELODY := [72, -1, 76, -1, 79, -1, 84, -1, 83, -1, 79, -1, 76, -1, 74, -1]
const BASS   := [36, -1, -1, -1, 43, -1, -1, -1, 41, -1, -1, -1, 43, -1, -1, -1]

var _muted := false
var _sfx_player: AudioStreamPlayer
var _music_player: AudioStreamPlayer
var _sfx_playback: AudioStreamGeneratorPlayback
var _music_playback: AudioStreamGeneratorPlayback
var _step_idx := 0
var _step_time := 0.0
var _sample_time := 0.0


func _ready() -> void:
	_muted = Progress.data.muted
	_setup_sfx()
	_setup_music()
	# Start music once audio is unlocked (first user gesture)
	SignalBus.music_change.connect(func(_t: String): _start_music())


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


## Continuous music synthesis — called from _process.
func _process(delta: float) -> void:
	if _muted or not _music_playback:
		return
	# Advance the 16-step sequencer
	_step_time += delta
	while _step_time >= STEP_DUR:
		_step_time -= STEP_DUR
		_step_idx = (_step_idx + 1) % MELODY.size()
	# Push synthesized samples
	_sample_time += delta
	var to_push := _music_playback.get_frames_available()
	if to_push <= 0:
		return
	var batch := mini(to_push, 2048)
	for i in batch:
		var t := _sample_time - delta + float(i) / SAMPLE_RATE
		var sample := _music_sample(t)
		_music_playback.push_frame(Vector2(sample, sample))


func _music_sample(t: float) -> float:
	var s := 0.0
	var lead: int = MELODY[_step_idx]
	var bass: int = BASS[_step_idx]
	if lead >= 0:
		s += _square(midi_to_freq(lead), t) * 0.08
	if bass >= 0:
		s += _square(midi_to_freq(bass), t) * 0.10
	return clampf(s, -0.5, 0.5)


func _start_music() -> void:
	_step_idx = 0
	_step_time = 0.0


func midi_to_freq(m: int) -> float:
	return 440.0 * pow(2.0, (m - 69) / 12.0)


func _square(freq: float, t: float) -> float:
	var step_dur := 60.0 / BPM / 4.0
	var step_t := fmod(t, step_dur) / step_dur
	var env := 1.0 - step_t
	if env <= 0.0:
		return 0.0
	var ph := fmod(freq * t, 1.0)
	var wave := 1.0 if ph < 0.5 else -1.0
	return wave * env * 0.6


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
