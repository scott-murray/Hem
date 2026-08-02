/**
 * Chiptune music: simple multi-channel scheduler over the shared Web Audio
 * context. Each track is a 16-step pattern (1 bar of 16ths) that loops.
 *
 * Channels:
 *   - lead: square / triangle melody
 *   - bass: triangle / sine bass note
 *   - drum: 'k' kick, 's' snare, 'h' hat (or '-')
 *
 * Notes are MIDI numbers; -1 (or null) is a rest.
 */
import { getCtx, onUnlock, isUnlocked } from './audioCtx.js';

const LOOKAHEAD_S = 0.12;     // schedule notes this far in advance
const TICK_MS = 25;           // scheduler tick

const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);

const TRACKS = {
  // Title — bright C major, bouncy
  title: {
    bpm: 112,
    leadType: 'square',
    leadGain: 0.10,
    bassGain: 0.14,
    lead:  [72, -1, 76, -1, 79, -1, 84, -1, 83, -1, 79, -1, 76, -1, 74, -1],
    bass:  [36, -1, -1, -1, 43, -1, -1, -1, 41, -1, -1, -1, 43, -1, -1, -1],
    drums: ['k', '-', 'h', '-', 's', '-', 'h', '-', 'k', '-', 'h', '-', 's', '-', 'h', 'h'],
  },

  // Carrot Valley — pastoral G major, mellow
  level1: {
    bpm: 100,
    leadType: 'triangle',
    leadGain: 0.10,
    bassGain: 0.13,
    lead:  [67, -1, 71, -1, 74, -1, 71, -1, 69, -1, 67, -1, 64, -1, 67, -1],
    bass:  [43, -1, -1, -1, 50, -1, -1, -1, 45, -1, -1, -1, 47, -1, -1, -1],
    drums: ['k', '-', '-', '-', 's', '-', '-', '-', 'k', '-', '-', '-', 's', '-', 'h', '-'],
  },

  // Fox Forest — nervous A minor, syncopated
  level2: {
    bpm: 124,
    leadType: 'square',
    leadGain: 0.09,
    bassGain: 0.13,
    lead:  [69, -1, 72, 76, -1, 72, 71, -1, 69, -1, 67, -1, 65, -1, 67, -1],
    bass:  [33, -1, 33, -1, 40, -1, 40, -1, 36, -1, 36, -1, 31, -1, 31, -1],
    drums: ['k', '-', 'h', '-', 's', '-', 'h', 'h', 'k', 'k', 'h', '-', 's', '-', 'h', '-'],
  },

  // Crystal Caves — mysterious D minor pentatonic, faster
  level3: {
    bpm: 138,
    leadType: 'square',
    leadGain: 0.09,
    bassGain: 0.13,
    lead:  [74, -1, 77, -1, 81, -1, 84, -1, 81, -1, 77, -1, 74, -1, 72, -1],
    bass:  [38, -1, 45, -1, 38, -1, 45, -1, 41, -1, 48, -1, 36, -1, 43, -1],
    drums: ['k', '-', 'h', 'h', 's', '-', 'h', '-', 'k', 'h', 'h', '-', 's', 'h', 'h', 'h'],
  },

  // Burrow Depths — deep D minor, echoing triangle, slow and cavernous
  level4: {
    bpm: 100,
    leadType: 'triangle',
    leadGain: 0.11,
    bassGain: 0.15,
    lead:  [62, -1, 65, -1, 69, -1, 65, -1, 62, -1, -1, -1, 60, -1, 62, -1],
    bass:  [38, -1, -1, -1, 38, -1, -1, -1, 41, -1, -1, -1, 41, -1, -1, -1],
    drums: ['k', '-', '-', '-', 's', '-', 'h', '-', 'k', '-', 'h', '-', 's', '-', '-', '-'],
  },

  // Sky Gardens — bright G major, airy square lead, upbeat
  level5: {
    bpm: 130,
    leadType: 'square',
    leadGain: 0.10,
    bassGain: 0.12,
    lead:  [79, -1, 83, -1, 86, 83, 79, -1, 76, -1, 79, -1, 83, -1, 86, -1],
    bass:  [43, -1, 43, -1, 50, -1, 50, -1, 47, -1, 47, -1, 43, -1, 43, -1],
    drums: ['k', '-', 'h', '-', 's', '-', 'h', 'h', 'k', '-', 'h', '-', 's', 'h', 'h', '-'],
  },
};

let muted = false;
let currentTrackName = null;
let pendingTrackName = null;
let scheduler = null;
let stepIdx = 0;
let nextStepTime = 0;
let masterGain = null;
let _startRetries = 0;
const MAX_START_RETRIES = 20;  // retry for up to ~2 seconds

function makeMaster(ac) {
  const g = ac.createGain();
  g.gain.value = 0.0;
  g.connect(ac.destination);
  // Fade in to avoid click
  const t = ac.currentTime;
  g.gain.linearRampToValueAtTime(0.32, t + 0.1);
  return g;
}

function fadeOutAndDisconnect(g) {
  if (!g) return;
  try {
    const ac = getCtx();
    const t = ac.currentTime;
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(g.gain.value, t);
    g.gain.linearRampToValueAtTime(0, t + 0.08);
    setTimeout(() => {
      try { g.disconnect(); } catch (e) { /* ignore */ }
    }, 200);
  } catch (e) { /* ignore */ }
}

function noteEnvelope(ac, freq, type, dur, gainVal, when, dest) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, when);
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(gainVal, when + 0.005);
  g.gain.exponentialRampToValueAtTime(0.001, when + dur);
  osc.connect(g);
  g.connect(dest);
  osc.start(when);
  osc.stop(when + dur + 0.02);
}

function kick(ac, when, dest) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(120, when);
  osc.frequency.exponentialRampToValueAtTime(40, when + 0.08);
  g.gain.setValueAtTime(0.5, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + 0.1);
  osc.connect(g);
  g.connect(dest);
  osc.start(when);
  osc.stop(when + 0.12);
}

function snare(ac, when, dest) {
  const bufSize = ac.sampleRate * 0.08;
  const buffer = ac.createBuffer(1, bufSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1200;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.22, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + 0.08);
  src.connect(filter);
  filter.connect(g);
  g.connect(dest);
  src.start(when);
  src.stop(when + 0.1);
}

function hat(ac, when, dest) {
  const bufSize = ac.sampleRate * 0.03;
  const buffer = ac.createBuffer(1, bufSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 6000;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.08, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + 0.03);
  src.connect(filter);
  filter.connect(g);
  g.connect(dest);
  src.start(when);
  src.stop(when + 0.04);
}

function scheduleStep(ac, track, step, when, dest) {
  const lead = track.lead[step];
  const bass = track.bass[step];
  const drum = track.drums[step];
  const stepDur = 60 / track.bpm / 4; // 16th note

  if (lead != null && lead >= 0) {
    noteEnvelope(ac, midiToFreq(lead), track.leadType, stepDur * 0.9, track.leadGain, when, dest);
  }
  if (bass != null && bass >= 0) {
    noteEnvelope(ac, midiToFreq(bass), 'triangle', stepDur * 1.1, track.bassGain, when, dest);
  }
  if (drum === 'k') kick(ac, when, dest);
  else if (drum === 's') snare(ac, when, dest);
  else if (drum === 'h') hat(ac, when, dest);
}

function startScheduler() {
  if (scheduler) return;
  const ac = getCtx();
  if (ac.state !== 'running') {
    // Context still suspended — retry shortly (e.g. unlock hasn't completed yet)
    if (_startRetries < MAX_START_RETRIES) {
      _startRetries++;
      setTimeout(() => startScheduler(), 100);
    }
    return;
  }
  _startRetries = 0;
  if (!masterGain) masterGain = makeMaster(ac);
  stepIdx = 0;
  nextStepTime = ac.currentTime + 0.05;

  const tick = () => {
    if (!currentTrackName) return;
    const track = TRACKS[currentTrackName];
    const stepDur = 60 / track.bpm / 4;
    while (nextStepTime < ac.currentTime + LOOKAHEAD_S) {
      scheduleStep(ac, track, stepIdx, nextStepTime, masterGain);
      nextStepTime += stepDur;
      stepIdx = (stepIdx + 1) % track.lead.length;
    }
  };
  tick();
  scheduler = setInterval(tick, TICK_MS);
}

function stopScheduler() {
  if (scheduler) {
    clearInterval(scheduler);
    scheduler = null;
  }
  fadeOutAndDisconnect(masterGain);
  masterGain = null;
}

let unlockCbRegistered = false;

function ensureSchedulerStarts() {
  if (muted || !currentTrackName) return;
  if (isUnlocked()) {
    startScheduler();
  } else if (!unlockCbRegistered) {
    unlockCbRegistered = true;
    onUnlock(() => {
      unlockCbRegistered = false;
      if (!muted && currentTrackName) startScheduler();
    });
  }
}

export const music = {
  /**
   * Play (or switch to) a named track. Idempotent if already playing.
   * If audio isn't unlocked yet, the track is queued and starts on unlock.
   */
  play(name) {
    if (!TRACKS[name]) return;
    if (currentTrackName === name && (scheduler || muted || !isUnlocked())) return;
    if (scheduler) stopScheduler();
    currentTrackName = name;
    pendingTrackName = name;
    ensureSchedulerStarts();
  },

  stop() {
    pendingTrackName = null;
    currentTrackName = null;
    stopScheduler();
  },

  setMuted(val) {
    muted = val;
    if (val) {
      stopScheduler();
    } else {
      ensureSchedulerStarts();
    }
  },
};
