/**
 * AudioService - Handles game sound effects with volume control
 * Uses Web Audio API for synthesized sounds (no external files needed)
 */

// Detect if we're in a test environment
const isTestEnvironment = () => {
  return typeof process !== 'undefined' && process.env && process.env.JEST_WORKER_ID !== undefined;
};

// Sound theme definitions
const SOUND_THEMES = {
  modern: {
    name: 'Modern',
    description: 'Clean, smooth synthesizer sounds',
    spin: () => [300, 400, 500, 600, 700].map((f, i) => ({ freq: f, delay: i * 80, duration: 0.1, type: 'triangle' })),
    correct: () => [
      { freq: 523.25, delay: 0, duration: 0.3, type: 'sine' },
      { freq: 659.25, delay: 50, duration: 0.3, type: 'sine' },
      { freq: 783.99, delay: 100, duration: 0.3, type: 'sine' },
    ],
    incorrect: () => [
      { freq: 200, delay: 0, duration: 0.3, type: 'sawtooth' },
      { freq: 150, delay: 150, duration: 0.3, type: 'sawtooth' },
    ],
    token: () => [800, 1000, 1200].map((f, i) => ({ freq: f, delay: i * 50, duration: 0.15, type: 'sine' })),
    click: () => [{ freq: 400, delay: 0, duration: 0.05, type: 'sine' }],
  },
  retro: {
    name: 'Retro',
    description: '8-bit chiptune style sounds',
    spin: () => [200, 250, 300, 350, 400, 450].map((f, i) => ({ freq: f, delay: i * 60, duration: 0.08, type: 'square' })),
    correct: () => [
      { freq: 440, delay: 0, duration: 0.15, type: 'square' },
      { freq: 554, delay: 60, duration: 0.15, type: 'square' },
      { freq: 659, delay: 120, duration: 0.2, type: 'square' },
    ],
    incorrect: () => [
      { freq: 150, delay: 0, duration: 0.2, type: 'square' },
      { freq: 100, delay: 100, duration: 0.2, type: 'square' },
    ],
    token: () => [
      { freq: 880, delay: 0, duration: 0.1, type: 'square' },
      { freq: 1100, delay: 40, duration: 0.1, type: 'square' },
      { freq: 1320, delay: 80, duration: 0.1, type: 'square' },
    ],
    click: () => [{ freq: 300, delay: 0, duration: 0.03, type: 'square' }],
  },
  fun: {
    name: 'Fun',
    description: 'Playful cartoon-style sounds',
    spin: () => [
      { freq: 400, delay: 0, duration: 0.12, type: 'sine' },
      { freq: 500, delay: 70, duration: 0.12, type: 'sine' },
      { freq: 600, delay: 140, duration: 0.12, type: 'sine' },
      { freq: 800, delay: 210, duration: 0.15, type: 'triangle' },
    ],
    correct: () => [
      { freq: 600, delay: 0, duration: 0.15, type: 'triangle' },
      { freq: 800, delay: 70, duration: 0.15, type: 'triangle' },
      { freq: 1000, delay: 140, duration: 0.25, type: 'sine' },
    ],
    incorrect: () => [
      { freq: 300, delay: 0, duration: 0.2, type: 'triangle' },
      { freq: 250, delay: 120, duration: 0.25, type: 'sine' },
      { freq: 200, delay: 240, duration: 0.3, type: 'triangle' },
    ],
    token: () => [
      { freq: 1000, delay: 0, duration: 0.1, type: 'sine' },
      { freq: 1200, delay: 50, duration: 0.1, type: 'triangle' },
      { freq: 1500, delay: 100, duration: 0.15, type: 'sine' },
    ],
    click: () => [{ freq: 600, delay: 0, duration: 0.06, type: 'triangle' }],
  },
  orchestral: {
    name: 'Orchestral',
    description: 'Elegant classical instrument sounds',
    spin: () => [
      { freq: 261.63, delay: 0, duration: 0.15, type: 'sine' },
      { freq: 293.66, delay: 60, duration: 0.15, type: 'sine' },
      { freq: 329.63, delay: 120, duration: 0.15, type: 'sine' },
      { freq: 349.23, delay: 180, duration: 0.2, type: 'triangle' },
      { freq: 392.00, delay: 240, duration: 0.2, type: 'sine' },
    ],
    correct: () => [
      { freq: 523.25, delay: 0, duration: 0.2, type: 'triangle' },
      { freq: 659.25, delay: 80, duration: 0.2, type: 'triangle' },
      { freq: 783.99, delay: 160, duration: 0.35, type: 'sine' },
      { freq: 1046.50, delay: 240, duration: 0.4, type: 'triangle' },
    ],
    incorrect: () => [
      { freq: 246.94, delay: 0, duration: 0.25, type: 'triangle' },
      { freq: 220.00, delay: 150, duration: 0.3, type: 'sine' },
      { freq: 196.00, delay: 300, duration: 0.35, type: 'triangle' },
    ],
    token: () => [
      { freq: 1046.50, delay: 0, duration: 0.12, type: 'triangle' },
      { freq: 1318.51, delay: 60, duration: 0.12, type: 'triangle' },
      { freq: 1567.98, delay: 120, duration: 0.18, type: 'sine' },
      { freq: 2093.00, delay: 180, duration: 0.2, type: 'triangle' },
    ],
    click: () => [{ freq: 659.25, delay: 0, duration: 0.08, type: 'triangle' }],
  },
  nature: {
    name: 'Nature',
    description: 'Calming natural and ambient sounds',
    spin: () => [
      { freq: 350, delay: 0, duration: 0.1, type: 'sine' },
      { freq: 420, delay: 70, duration: 0.1, type: 'sine' },
      { freq: 490, delay: 140, duration: 0.12, type: 'triangle' },
      { freq: 560, delay: 210, duration: 0.12, type: 'sine' },
    ],
    correct: () => [
      { freq: 523.25, delay: 0, duration: 0.25, type: 'sine' },
      { freq: 659.25, delay: 100, duration: 0.25, type: 'sine' },
      { freq: 783.99, delay: 200, duration: 0.4, type: 'triangle' },
    ],
    incorrect: () => [
      { freq: 330, delay: 0, duration: 0.2, type: 'triangle' },
      { freq: 294, delay: 120, duration: 0.25, type: 'sine' },
      { freq: 262, delay: 240, duration: 0.3, type: 'triangle' },
    ],
    token: () => [
      { freq: 880, delay: 0, duration: 0.1, type: 'sine' },
      { freq: 1100, delay: 60, duration: 0.12, type: 'triangle' },
      { freq: 1320, delay: 120, duration: 0.15, type: 'sine' },
    ],
    click: () => [{ freq: 440, delay: 0, duration: 0.05, type: 'sine' }],
  },
};

export class AudioService {
  constructor(options = {}) {
    this.enabled = options.enabled ?? true;
    this.volume = options.volume ?? 0.5; // 0 to 1
    this.musicVolume = options.musicVolume ?? 0.3; // 0 to 1, lower for background music
    this.soundTheme = options.soundTheme ?? 'modern';
    this.audioContext = null;
    this.initialized = false;
    this.isTest = isTestEnvironment();

    // Background music
    this.musicEnabled = options.musicEnabled ?? false;
    this.musicOscillators = [];
    this.musicGainNode = null;
    this.musicInterval = null;

    // Text-to-speech for word pronunciation
    this.pronunciationEnabled = options.pronunciationEnabled ?? false;
    this.pronunciationRate = options.pronunciationRate ?? 0.8; // Slower for children
    this.pronunciationPitch = options.pronunciationPitch ?? 1.2; // Slightly higher for clarity
    this.selectedVoice = null;
    this.synth = window.speechSynthesis || null;
  }

  init() {
    if (this.initialized || !this.enabled || this.isTest) {
      return;
    }

    try {
      // Create audio context on user interaction
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
        this.initialized = true;
      }
    } catch (error) {
      console.warn('Web Audio API not available:', error.message);
      this.enabled = false;
    }
  }

  ensureInitialized() {
    if (!this.initialized) {
      this.init();
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  playTone(frequency, duration, type = 'sine') {
    if (!this.enabled || !this.audioContext || this.volume <= 0) {
      return;
    }

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      // Apply volume with envelope
      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch (error) {
      console.warn('Failed to play tone:', error.message);
    }
  }

  playSpin() {
    this.ensureInitialized();
    const theme = SOUND_THEMES[this.soundTheme] || SOUND_THEMES.modern;
    theme.spin().forEach((note) => {
      setTimeout(() => {
        this.playTone(note.freq, note.duration, note.type);
      }, note.delay);
    });
  }

  playCorrect() {
    this.ensureInitialized();
    const theme = SOUND_THEMES[this.soundTheme] || SOUND_THEMES.modern;
    theme.correct().forEach((note) => {
      setTimeout(() => {
        this.playTone(note.freq, note.duration, note.type);
      }, note.delay);
    });
  }

  playIncorrect() {
    this.ensureInitialized();
    const theme = SOUND_THEMES[this.soundTheme] || SOUND_THEMES.modern;
    theme.incorrect().forEach((note) => {
      setTimeout(() => {
        this.playTone(note.freq, note.duration, note.type);
      }, note.delay);
    });
  }

  playTokenEarned() {
    this.ensureInitialized();
    const theme = SOUND_THEMES[this.soundTheme] || SOUND_THEMES.modern;
    theme.token().forEach((note) => {
      setTimeout(() => {
        this.playTone(note.freq, note.duration, note.type);
      }, note.delay);
    });
  }

  playClick() {
    this.ensureInitialized();
    const theme = SOUND_THEMES[this.soundTheme] || SOUND_THEMES.modern;
    theme.click().forEach((note) => {
      setTimeout(() => {
        this.playTone(note.freq, note.duration, note.type);
      }, note.delay);
    });
  }

  setSoundTheme(theme) {
    if (SOUND_THEMES[theme]) {
      this.soundTheme = theme;
      return this.soundTheme;
    }
    return null;
  }

  getSoundTheme() {
    return this.soundTheme;
  }

  getAvailableThemes() {
    return Object.keys(SOUND_THEMES).map((key) => ({
      id: key,
      name: SOUND_THEMES[key].name,
      description: SOUND_THEMES[key].description,
    }));
  }

  playThemePreview(theme, callback) {
    this.ensureInitialized();
    if (!SOUND_THEMES[theme]) return;

    // Play a short preview sequence
    const previewNotes = [
      { freq: 440, duration: 0.1, type: 'sine' },
      { freq: 554, duration: 0.1, type: 'sine' },
      { freq: 659, duration: 0.15, type: 'sine' },
    ];

    // Apply theme-specific characteristics
    if (theme === 'retro') {
      previewNotes.forEach((n) => n.type = 'square');
    } else if (theme === 'fun') {
      previewNotes.forEach((n) => n.type = 'triangle');
      previewNotes[2].freq = 784;
    }

    previewNotes.forEach((note, i) => {
      setTimeout(() => {
        this.playTone(note.freq, note.duration, note.type);
      }, i * 120);
    });

    if (callback) {
      setTimeout(callback, previewNotes.length * 120 + 200);
    }
  }

  setVolume(level) {
    this.volume = Math.max(0, Math.min(1, level));
    return this.volume;
  }

  getVolume() {
    return this.volume;
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled && this.audioContext) {
      this.audioContext.suspend();
    } else if (this.enabled && this.audioContext) {
      this.audioContext.resume();
    }
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  // Background music methods
  startBackgroundMusic() {
    if (!this.enabled || !this.audioContext || this.musicEnabled) {
      return;
    }

    this.ensureInitialized();
    this.musicEnabled = true;

    // Create gain node for music volume control
    this.musicGainNode = this.audioContext.createGain();
    this.musicGainNode.gain.value = this.musicVolume * 0.3; // Start at 30% of music volume
    this.musicGainNode.connect(this.audioContext.destination);

    // Ambient music patterns based on theme
    this.playAmbientLoop();
  }

  stopBackgroundMusic() {
    if (!this.musicEnabled) {
      return;
    }

    this.musicEnabled = false;

    // Stop all oscillators
    this.musicOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Oscillator may already be stopped
      }
    });
    this.musicOscillators = [];

    // Clear interval
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }

    // Disconnect gain node
    if (this.musicGainNode) {
      this.musicGainNode.disconnect();
      this.musicGainNode = null;
    }
  }

  toggleBackgroundMusic() {
    if (this.musicEnabled) {
      this.stopBackgroundMusic();
      return false;
    } else {
      this.startBackgroundMusic();
      return true;
    }
  }

  isMusicEnabled() {
    return this.musicEnabled;
  }

  setMusicVolume(level) {
    this.musicVolume = Math.max(0, Math.min(1, level));
    if (this.musicGainNode) {
      this.musicGainNode.gain.value = this.musicVolume * 0.3;
    }
    return this.musicVolume;
  }

  getMusicVolume() {
    return this.musicVolume;
  }

  playAmbientLoop() {
    if (!this.musicEnabled || !this.audioContext) {
      return;
    }

    // Theme-based ambient patterns
    const patterns = {
      modern: {
        notes: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
        rhythm: 4000, // 4 seconds per note
        type: 'sine',
      },
      retro: {
        notes: [220, 261.63, 329.63, 440],
        rhythm: 3000,
        type: 'square',
      },
      fun: {
        notes: [330, 392, 440, 523.25, 659.25],
        rhythm: 2500,
        type: 'triangle',
      },
      orchestral: {
        notes: [196.00, 220.00, 246.94, 261.63, 293.66, 329.63],
        rhythm: 5000,
        type: 'sine',
      },
      nature: {
        notes: [262, 330, 392, 440, 523],
        rhythm: 6000,
        type: 'sine',
      },
    };

    const pattern = patterns[this.soundTheme] || patterns.modern;
    let noteIndex = 0;

    const playNextNote = () => {
      if (!this.musicEnabled || !this.audioContext) {
        return;
      }

      try {
        // Stop previous oscillator
        if (this.musicOscillators.length > 0) {
          this.musicOscillators.forEach((osc) => {
            try {
              osc.stop();
              osc.disconnect();
            } catch (e) {}
          });
          this.musicOscillators = [];
        }

        // Create new oscillator for ambient note
        const oscillator = this.audioContext.createOscillator();
        const noteGain = this.audioContext.createGain();

        oscillator.type = pattern.type;
        oscillator.frequency.value = pattern.notes[noteIndex];

        oscillator.connect(noteGain);
        noteGain.connect(this.musicGainNode);

        // Soft attack and release for ambient feel
        const now = this.audioContext.currentTime;
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(this.musicVolume * 0.15, now + 0.5);
        noteGain.gain.linearRampToValueAtTime(this.musicVolume * 0.1, now + pattern.rhythm / 1000 - 0.5);
        noteGain.gain.linearRampToValueAtTime(0, now + pattern.rhythm / 1000);

        oscillator.start(now);
        oscillator.stop(now + pattern.rhythm / 1000);

        this.musicOscillators.push(oscillator);

        // Move to next note
        noteIndex = (noteIndex + 1) % pattern.notes.length;
      } catch (e) {
        console.warn('Failed to play ambient note:', e.message);
      }
    };

    // Play first note immediately
    playNextNote();

    // Set up interval for subsequent notes
    this.musicInterval = setInterval(playNextNote, pattern.rhythm);
  }

  // Text-to-speech methods for word pronunciation
  speakWord(word, options = {}) {
    if (!this.pronunciationEnabled || !this.synth || this.isTest) {
      return;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = options.rate ?? this.pronunciationRate;
    utterance.pitch = options.pitch ?? this.pronunciationPitch;
    utterance.lang = options.lang ?? 'en-US';
    utterance.volume = options.volume ?? this.volume;

    // Use selected voice if available
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    } else {
      // Try to find a child-friendly English voice
      const voices = this.synth.getVoices();
      const preferredVoice = voices.find(v =>
        v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google'))
      ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    this.synth.speak(utterance);
  }

  speakRime(pattern) {
    if (!this.pronunciationEnabled || !this.synth || this.isTest) {
      return;
    }

    // Speak the rime pattern (e.g., "-at" becomes "at sound")
    const rimeText = pattern.startsWith('-') ? pattern.substring(1) : pattern;
    this.speakWord(rimeText, { rate: 0.7, pitch: 1.3 });
  }

  togglePronunciation() {
    this.pronunciationEnabled = !this.pronunciationEnabled;
    return this.pronunciationEnabled;
  }

  isPronunciationEnabled() {
    return this.pronunciationEnabled;
  }

  setPronunciationRate(rate) {
    this.pronunciationRate = Math.max(0.5, Math.min(2, rate));
    return this.pronunciationRate;
  }

  setPronunciationPitch(pitch) {
    this.pronunciationPitch = Math.max(0.5, Math.min(2, pitch));
    return this.pronunciationPitch;
  }

  getAvailableVoices() {
    if (!this.synth) {
      return [];
    }
    return this.synth.getVoices().filter(v => v.lang.startsWith('en'));
  }

  setVoice(voiceURI) {
    if (!this.synth) {
      return null;
    }
    const voices = this.synth.getVoices();
    const voice = voices.find(v => v.voiceURI === voiceURI);
    if (voice) {
      this.selectedVoice = voice;
      return voice;
    }
    return null;
  }
}

export const defaultAudioService = new AudioService();
