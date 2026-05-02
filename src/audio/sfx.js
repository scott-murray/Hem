/**
 * Web Audio synthesis for all SFX.
 * AudioContext is created on first user gesture (browser autoplay policy).
 */

let ctx = null;
let muted = false;
let unlocked = false;

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

function playOscillator(type, freqStart, freqEnd, duration, gainVal = 0.3, startTime = 0) {
  const ac = getCtx();
  const t = ac.currentTime + startTime;

  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.connect(gain);
  gain.connect(ac.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(freqStart, t);
  if (freqEnd !== freqStart) {
    osc.frequency.linearRampToValueAtTime(freqEnd, t + duration);
  }

  gain.gain.setValueAtTime(gainVal, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

  osc.start(t);
  osc.stop(t + duration + 0.01);
}

function playNoiseBurst(duration, cutoffFreq = 800, gainVal = 0.2) {
  const ac = getCtx();
  const t = ac.currentTime;
  const bufSize = ac.sampleRate * duration;
  const buffer = ac.createBuffer(1, bufSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ac.createBufferSource();
  source.buffer = buffer;

  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = cutoffFreq;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(gainVal, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);

  source.start(t);
  source.stop(t + duration + 0.01);
}

const sounds = {
  jump() {
    // Square wave 440->700 Hz over 80ms
    playOscillator('square', 440, 700, 0.08, 0.2);
  },

  land() {
    // Noise burst, 50ms, low-pass ~300Hz
    playNoiseBurst(0.05, 300, 0.3);
  },

  collect() {
    // Triangle arpeggio C5-E5-G5, 60ms each
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      playOscillator('triangle', freq, freq, 0.06, 0.3, i * 0.065);
    });
  },

  hurt() {
    // Sawtooth 300->100 Hz, 200ms
    playOscillator('sawtooth', 300, 100, 0.2, 0.25);
  },

  puzzleOk() {
    // Triangle C5-E5-G5-C6
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      playOscillator('triangle', freq, freq, 0.08, 0.3, i * 0.085);
    });
  },

  puzzleNo() {
    // Square 200->150 Hz, 250ms
    playOscillator('square', 200, 150, 0.25, 0.2);
  },

  win() {
    // Triangle C5-E5-G5-C6-G5-C6, ~500ms total
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      playOscillator('triangle', freq, freq, 0.08, 0.3, i * 0.085);
    });
  },

  checkpoint() {
    playOscillator('triangle', 523.25, 659.25, 0.1, 0.25);
    playOscillator('triangle', 783.99, 783.99, 0.08, 0.25, 0.12);
  },
};

export const sfx = {
  play(name) {
    if (muted) return;
    if (sounds[name]) {
      try {
        sounds[name]();
      } catch (e) {
        console.warn('SFX error:', e);
      }
    }
  },

  setMuted(val) {
    muted = val;
  },

  isMuted() {
    return muted;
  },

  // Call from inside a real user-gesture handler (pointerdown / keydown) to
  // unlock AudioContext on strict autoplay browsers. Plays a silent buffer
  // so the context is fully started, not just resumed-but-unused.
  unlock() {
    const ac = getCtx();
    if (unlocked) return;
    try {
      const buffer = ac.createBuffer(1, 1, 22050);
      const src = ac.createBufferSource();
      src.buffer = buffer;
      src.connect(ac.destination);
      src.start(0);
      unlocked = true;
    } catch (e) {
      // ignore — will retry on next gesture
    }
  },
};
