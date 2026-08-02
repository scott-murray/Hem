/**
 * Web Audio synthesis for all SFX.
 * AudioContext is shared with music.js via audioCtx.js.
 */
import { getCtx, unlock as audioUnlock } from './audioCtx.js';

let muted = false;

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
    // Random slight pitch variation for variety
    const base = 420 + Math.random() * 60;
    playOscillator('square', base, base + 280, 0.08, 0.2);
  },

  land() {
    playNoiseBurst(0.05, 280 + Math.random() * 60, 0.3);
  },

  collect() {
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      playOscillator('triangle', freq, freq, 0.06, 0.3, i * 0.065);
    });
  },

  collectSmall() {
    // Higher, brighter chirp for small carrots
    const notes = [659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      playOscillator('triangle', freq, freq, 0.05, 0.25, i * 0.06);
    });
  },

  hurt() {
    const base = 280 + Math.random() * 40;
    playOscillator('sawtooth', base, 100, 0.2, 0.25);
  },

  puzzleOk() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      playOscillator('triangle', freq, freq, 0.08, 0.3, i * 0.085);
    });
  },

  puzzleNo() {
    playOscillator('square', 200, 150, 0.25, 0.2);
  },

  win() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      playOscillator('triangle', freq, freq, 0.08, 0.3, i * 0.085);
    });
  },

  checkpoint() {
    playOscillator('triangle', 523.25, 659.25, 0.1, 0.25);
    playOscillator('triangle', 783.99, 783.99, 0.08, 0.25, 0.12);
  },

  broccoli() {
    // Cheerful ascending arpeggio — distinct from carrot collect
    const notes = [392, 523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      playOscillator('triangle', freq, freq, 0.07, 0.3, i * 0.07);
    });
  },

  dig() {
    // Crumbly / scratching sound
    playNoiseBurst(0.12, 400, 0.25);
    playOscillator('triangle', 90, 60, 0.15, 0.15);
    playOscillator('sawtooth', 40, 25, 0.1, 0.1, 0.04);
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

  unlock() {
    audioUnlock();
  },
};
