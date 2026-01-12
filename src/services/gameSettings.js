/**
 * GameSettings - Manages game settings and preferences
 */

const SETTINGS_KEY = 'cvc-spin-game-settings-v1';

const DEFAULT_SETTINGS = {
  difficulty: 'medium',
  soundEnabled: true,
  soundVolume: 0.5,
  soundTheme: 'modern', // modern, retro, fun
  gameSpeed: 'normal', // slow, normal, fast
  highContrastMode: false,
  wordFamilyProgress: {
    '-at': { correct: 0, total: 3 },
    '-og': { correct: 0, total: 3 },
    '-ip': { correct: 0, total: 3 },
    '-et': { correct: 0, total: 3 },
    '-ub': { correct: 0, total: 3 },
    '-an': { correct: 0, total: 3 },
    '-ig': { correct: 0, total: 3 },
    '-op': { correct: 0, total: 3 },
    '-en': { correct: 0, total: 3 },
    '-ug': { correct: 0, total: 3 },
    '-ut': { correct: 0, total: 3 },
    '-ot': { correct: 0, total: 3 },
    '-un': { correct: 0, total: 3 },
    '-am': { correct: 0, total: 3 },
    '-ed': { correct: 0, total: 3 },
  },
};

export class GameSettings {
  constructor() {
    this.settings = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load settings:', error.message);
    }
    return { ...DEFAULT_SETTINGS };
  }

  save() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Failed to save settings:', error.message);
    }
  }

  get difficulty() {
    return this.settings.difficulty;
  }

  set difficulty(level) {
    const validLevels = ['easy', 'medium', 'hard'];
    if (validLevels.includes(level)) {
      this.settings.difficulty = level;
      this.save();
    }
  }

  get soundEnabled() {
    return this.settings.soundEnabled;
  }

  set soundEnabled(value) {
    this.settings.soundEnabled = Boolean(value);
    this.save();
  }

  get soundVolume() {
    return this.settings.soundVolume;
  }

  set soundVolume(value) {
    this.settings.soundVolume = Math.max(0, Math.min(1, Number(value)));
    this.save();
  }

  get soundTheme() {
    return this.settings.soundTheme;
  }

  set soundTheme(value) {
    const validThemes = ['modern', 'retro', 'fun'];
    if (validThemes.includes(value)) {
      this.settings.soundTheme = value;
      this.save();
    }
  }

  get gameSpeed() {
    return this.settings.gameSpeed;
  }

  set gameSpeed(speed) {
    const validSpeeds = ['slow', 'normal', 'fast'];
    if (validSpeeds.includes(speed)) {
      this.settings.gameSpeed = speed;
      this.save();
    }
  }

  getSpeedMultiplier() {
    const multipliers = { slow: 1.5, normal: 1, fast: 0.7 };
    return multipliers[this.settings.gameSpeed] || 1;
  }

  get highContrastMode() {
    return this.settings.highContrastMode;
  }

  set highContrastMode(value) {
    this.settings.highContrastMode = Boolean(value);
    this.save();
    // Apply high contrast mode to body
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('high-contrast', this.settings.highContrastMode);
    }
  }

  updateWordFamilyProgress(rime, isCorrect) {
    if (!this.settings.wordFamilyProgress[rime]) {
      this.settings.wordFamilyProgress[rime] = { correct: 0, total: 0 };
    }
    this.settings.wordFamilyProgress[rime].total += 1;
    if (isCorrect) {
      this.settings.wordFamilyProgress[rime].correct += 1;
    }
    this.save();
  }

  getWordFamilyProgress(rime) {
    return this.settings.wordFamilyProgress[rime] || { correct: 0, total: 0 };
  }

  getAllProgress() {
    return this.settings.wordFamilyProgress;
  }

  reset() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.save();
  }
}

export const defaultGameSettings = new GameSettings();
