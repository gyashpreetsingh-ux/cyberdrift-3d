/**
 * CyberDrift 3D - Procedural Web Audio Engine & Synthwave Generator
 * Lead Developer: Yashpreet Singh
 */

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.musicVolume = 0.65;
    this.sfxVolume = 0.8;

    // Engine sound nodes
    this.engineOsc1 = null;
    this.engineOsc2 = null;
    this.engineGain = null;
    this.engineFilter = null;
    this.isEngineRunning = false;

    // Nitro sound nodes
    this.nitroGain = null;
    this.nitroNoiseNode = null;

    // Music Sequencer state
    this.isMusicPlaying = false;
    this.musicInterval = null;
    this.currentStep = 0;
    this.tempo = 124; // 124 BPM Synthwave
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // ==========================================
  // SFX: Real-Time Procedural Engine Sound
  // ==========================================
  startEngine() {
    this.init();
    if (!this.ctx || this.isEngineRunning) return;

    try {
      // Main Sawtooth Oscillator
      this.engineOsc1 = this.ctx.createOscillator();
      this.engineOsc1.type = 'sawtooth';
      this.engineOsc1.frequency.setValueAtTime(45, this.ctx.currentTime);

      // Sub-Oscillator for rumble
      this.engineOsc2 = this.ctx.createOscillator();
      this.engineOsc2.type = 'triangle';
      this.engineOsc2.frequency.setValueAtTime(22.5, this.ctx.currentTime);

      // Lowpass Filter for exhaust tone
      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(300, this.ctx.currentTime);
      this.engineFilter.Q.setValueAtTime(4, this.ctx.currentTime);

      // Engine Master Gain
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.12 * this.sfxVolume, this.ctx.currentTime);

      // Nitro Noise Source
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      this.nitroNoiseNode = this.ctx.createBufferSource();
      this.nitroNoiseNode.buffer = noiseBuffer;
      this.nitroNoiseNode.loop = true;

      const nitroFilter = this.ctx.createBiquadFilter();
      nitroFilter.type = 'bandpass';
      nitroFilter.frequency.value = 1200;
      nitroFilter.Q.value = 3;

      this.nitroGain = this.ctx.createGain();
      this.nitroGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

      this.nitroNoiseNode.connect(nitroFilter);
      nitroFilter.connect(this.nitroGain);
      this.nitroGain.connect(this.ctx.destination);
      this.nitroNoiseNode.start();

      // Connect engine oscillators
      this.engineOsc1.connect(this.engineFilter);
      this.engineOsc2.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc1.start();
      this.engineOsc2.start();
      this.isEngineRunning = true;
    } catch (e) {
      console.warn('AudioEngine: Unable to start engine audio', e);
    }
  }

  updateEngine(speedKmh, maxSpeedKmh, isNitro) {
    if (!this.ctx || !this.isEngineRunning || this.isMuted) return;

    const speedRatio = Math.min(speedKmh / maxSpeedKmh, 1.2);
    const rpm = 800 + speedRatio * 6500;
    const baseFreq = 40 + (rpm / 6000) * 160;

    const now = this.ctx.currentTime;
    this.engineOsc1.frequency.setTargetAtTime(baseFreq, now, 0.05);
    this.engineOsc2.frequency.setTargetAtTime(baseFreq * 0.5, now, 0.05);
    this.engineFilter.frequency.setTargetAtTime(250 + speedRatio * 1800, now, 0.05);

    // Nitro sound transition
    if (this.nitroGain) {
      const targetNitroGain = isNitro ? 0.35 * this.sfxVolume : 0.0001;
      this.nitroGain.gain.setTargetAtTime(targetNitroGain, now, 0.08);
    }
  }

  stopEngine() {
    if (this.engineGain && this.ctx) {
      this.engineGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.05);
    }
    if (this.nitroGain && this.ctx) {
      this.nitroGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.05);
    }
    setTimeout(() => {
      try {
        if (this.engineOsc1) this.engineOsc1.stop();
        if (this.engineOsc2) this.engineOsc2.stop();
        if (this.nitroNoiseNode) this.nitroNoiseNode.stop();
      } catch (e) {}
      this.isEngineRunning = false;
    }, 100);
  }

  // ==========================================
  // SFX: Dynamic In-Game Events
  // ==========================================
  playNearMiss() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const now = this.ctx.currentTime;

    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1600, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.25);

    gain.gain.setValueAtTime(0.3 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playPickup() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.2 * this.sfxVolume, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.15);
    });
  }

  playCrash() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);

    gain.gain.setValueAtTime(0.6 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  playThunder() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 1.2);

    gain.gain.setValueAtTime(0.4 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 1.2);
  }

  playClick() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);

    gain.gain.setValueAtTime(0.15 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // ==========================================
  // Procedural 80s Synthwave Music Generator
  // ==========================================
  startMusic() {
    this.init();
    if (!this.ctx || this.isMusicPlaying) return;

    this.isMusicPlaying = true;
    const stepDuration = (60 / this.tempo) / 4; // 16th notes
    this.currentStep = 0;

    // Bassline Progression (Fm - Db - Eb - Cm)
    const basslineProgression = [
      [87.31, 87.31, 87.31, 116.54, 87.31, 87.31, 87.31, 130.81, 87.31, 87.31, 87.31, 116.54, 87.31, 87.31, 146.83, 130.81], // F
      [69.30, 69.30, 69.30, 92.50, 69.30, 69.30, 69.30, 103.83, 69.30, 69.30, 69.30, 92.50, 69.30, 69.30, 116.54, 103.83],   // Db
      [77.78, 77.78, 77.78, 103.83, 77.78, 77.78, 77.78, 116.54, 77.78, 77.78, 77.78, 103.83, 77.78, 77.78, 130.81, 116.54], // Eb
      [65.41, 65.41, 65.41, 87.31, 65.41, 65.41, 65.41, 98.00, 65.41, 65.41, 65.41, 87.31, 65.41, 65.41, 110.00, 98.00]     // C
    ];

    // Synth Arp Melodies
    const arpNotes = [349.23, 415.30, 523.25, 698.46, 783.99, 1046.5];

    this.musicInterval = setInterval(() => {
      if (!this.isMusicPlaying || this.isMuted || !this.ctx) return;

      const now = this.ctx.currentTime;
      const bar = Math.floor((this.currentStep / 16) % 4);
      const stepInBar = this.currentStep % 16;

      // 1. Synth Bass Note
      const bassFreq = basslineProgression[bar][stepInBar];
      this._playSynthBass(bassFreq, now, stepDuration * 0.9);

      // 2. Electronic Drums (Kick on 1, 5, 9, 13; Snare on 5, 13; Hi-hat on every odd step)
      if (stepInBar % 4 === 0) {
        this._playKick(now);
      }
      if (stepInBar === 4 || stepInBar === 12) {
        this._playSnare(now);
      }
      if (stepInBar % 2 === 1) {
        this._playHihat(now);
      }

      // 3. Arpeggiator Lead
      if (stepInBar % 2 === 0) {
        const arpNote = arpNotes[(this.currentStep / 2) % arpNotes.length];
        this._playArpNote(arpNote, now, stepDuration * 1.5);
      }

      this.currentStep++;
    }, stepDuration * 1000);
  }

  _playSynthBass(freq, time, duration) {
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, time);
    filter.frequency.exponentialRampToValueAtTime(150, time + duration);

    gain.gain.setValueAtTime(0.22 * this.musicVolume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  _playArpNote(freq, time, duration) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.12 * this.musicVolume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  _playKick(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, time);
    osc.frequency.exponentialRampToValueAtTime(35, time + 0.12);

    gain.gain.setValueAtTime(0.45 * this.musicVolume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.12);
  }

  _playSnare(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.1);

    gain.gain.setValueAtTime(0.25 * this.musicVolume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  _playHihat(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(8000, time);

    gain.gain.setValueAtTime(0.04 * this.musicVolume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.03);
  }

  stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  setVolumes(musicVol, sfxVol) {
    this.musicVolume = musicVol;
    this.sfxVolume = sfxVol;
    if (this.engineGain && this.ctx) {
      this.engineGain.gain.setTargetAtTime(0.12 * this.sfxVolume, this.ctx.currentTime, 0.05);
    }
  }
}
