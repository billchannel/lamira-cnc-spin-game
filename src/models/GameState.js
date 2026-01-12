import { CONFIG } from '../config.js';

const DEFAULT_STATE = {
  tokens: 0,
  currentRime: null,
  currentAnswer: null,
  isSpinning: false,
  spinCount: 0,
  correctAnswers: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastPlayed: null,
  experiencePoints: 0,
  level: 1,
  // Daily challenge tracking
  dailyChallenge: {
    date: null,
    target: 5,
    progress: 0,
    completed: false,
    rewardClaimed: false,
  },
  // Daily streak tracking
  dailyStreak: 0,
  lastDailyDate: null,
  consecutiveDays: 0,
  // Power-ups tracking
  powerUps: {
    hintShield: 1,      // Reveals one letter without penalty
    doubleToken: 1,     // 2x tokens for next correct answer
    streakFreeze: 0,    // Protects streak once
  },
  activePowerUp: null,  // Currently active power-up
  // Purchased cosmetics
  purchasedSkins: [],
  // Tutorial tracking
  tutorialCompleted: false,
  tutorialStep: 0,
  // Multiplayer tracking
  multiplayerMode: false,
  currentPlayer: 1,
  players: {
    1: { score: 0, correctAnswers: 0, streak: 0 },
    2: { score: 0, correctAnswers: 0, streak: 0 },
  },
  // Audio settings
  pronunciationEnabled: false,
  pronunciationRate: 0.8,
  pronunciationPitch: 1.2,
  selectedVoice: null,
};

function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

function validateStateShape(state) {
  if (!isNonNegativeInteger(state.tokens)) {
    throw new Error('Invalid tokens. Expected non-negative integer.');
  }
  if (!isNonNegativeInteger(state.spinCount)) {
    throw new Error('Invalid spinCount. Expected non-negative integer.');
  }
  if (!isNonNegativeInteger(state.correctAnswers)) {
    throw new Error('Invalid correctAnswers. Expected non-negative integer.');
  }
  if (state.correctAnswers > state.spinCount) {
    throw new Error('correctAnswers must be less than or equal to spinCount.');
  }
  if (state.currentRime !== null && typeof state.currentRime !== 'string') {
    throw new Error('currentRime must be null or string.');
  }
  if (state.currentAnswer !== null && typeof state.currentAnswer !== 'string') {
    throw new Error('currentAnswer must be null or string.');
  }
  if (typeof state.isSpinning !== 'boolean') {
    throw new Error('isSpinning must be boolean.');
  }
}

export class GameState {
  constructor(overrides = {}) {
    const nextState = { ...DEFAULT_STATE, ...overrides };
    validateStateShape(nextState);
    this.state = nextState;
  }

  static createInitial() {
    return new GameState();
  }

  static fromStorage(raw) {
    if (!raw) {
      return GameState.createInitial();
    }
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return new GameState({ ...DEFAULT_STATE, ...parsed });
    } catch (error) {
      console.warn('Failed to parse stored game state. Resetting.', error);
      return GameState.createInitial();
    }
  }

  toJSON() {
    return { ...this.state };
  }

  get tokens() {
    return this.state.tokens;
  }

  get currentRime() {
    return this.state.currentRime;
  }

  get currentAnswer() {
    return this.state.currentAnswer;
  }

  get isSpinning() {
    return this.state.isSpinning;
  }

  get spinCount() {
    return this.state.spinCount;
  }

  get correctAnswers() {
    return this.state.correctAnswers;
  }

  get currentStreak() {
    return this.state.currentStreak;
  }

  get bestStreak() {
    return this.state.bestStreak;
  }

  get lastPlayedISO() {
    return this.state.lastPlayed;
  }

  get experiencePoints() {
    return this.state.experiencePoints;
  }

  get level() {
    return this.state.level;
  }

  get successRate() {
    if (this.state.spinCount === 0) {
      return 0;
    }
    return this.state.correctAnswers / this.state.spinCount;
  }

  getLevelInfo() {
    const xpPerLevel = 100;
    const currentLevelXP = this.state.experiencePoints % xpPerLevel;
    const xpNeeded = xpPerLevel - currentLevelXP;
    const progress = currentLevelXP / xpPerLevel;

    return {
      level: this.state.level,
      currentXP: currentLevelXP,
      xpNeeded: xpNeeded,
      progress: progress,
      totalXP: this.state.experiencePoints,
    };
  }

  withSpinStart(rimePattern) {
    return new GameState({
      ...this.state,
      isSpinning: true,
      currentRime: rimePattern,
      currentAnswer: null,
    });
  }

  withSpinResult(answerWord) {
    return new GameState({
      ...this.state,
      isSpinning: false,
      currentAnswer: answerWord,
      spinCount: this.state.spinCount + 1,
      lastPlayed: new Date().toISOString(),
    });
  }

  withCorrectAnswer() {
    const newStreak = this.state.currentStreak + 1;
    const xpGained = 10 + (newStreak >= 5 ? 5 : 0) + (newStreak >= 10 ? 10 : 0); // Bonus XP for streaks
    const newTotalXP = this.state.experiencePoints + xpGained;
    const xpPerLevel = 100;
    const newLevel = Math.floor(newTotalXP / xpPerLevel) + 1;

    return new GameState({
      ...this.state,
      tokens: this.state.tokens + 1,
      correctAnswers: this.state.correctAnswers + 1,
      currentStreak: newStreak,
      bestStreak: Math.max(this.state.bestStreak, newStreak),
      experiencePoints: newTotalXP,
      level: newLevel,
      lastPlayed: new Date().toISOString(),
    });
  }

  withIncorrectAnswer() {
    return new GameState({
      ...this.state,
      currentStreak: 0,
      lastPlayed: new Date().toISOString(),
    });
  }

  shouldCelebrateSuccess() {
    return (
      this.spinCount >= CONFIG.MIN_SPINS_FOR_SUCCESS &&
      this.successRate >= CONFIG.SUCCESS_RATE_TARGET
    );
  }

  getDailyChallenge() {
    return this.state.dailyChallenge;
  }

  getDailyStreak() {
    return this.state.dailyStreak;
  }

  getConsecutiveDays() {
    return this.state.consecutiveDays;
  }

  // Get today's date string in YYYY-MM-DD format
  static getTodayString() {
    return new Date().toISOString().split('T')[0];
  }

  // Check if daily challenge needs to be reset
  needsDailyReset() {
    const today = GameState.getTodayString();
    return this.state.dailyChallenge.date !== today;
  }

  // Reset daily challenge for a new day
  withDailyReset() {
    const today = GameState.getTodayString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    // Calculate consecutive days
    let newConsecutiveDays = 1;
    if (this.state.lastDailyDate === yesterdayString) {
      newConsecutiveDays = this.state.consecutiveDays + 1;
    }

    return new GameState({
      ...this.state,
      dailyChallenge: {
        date: today,
        target: 5 + Math.floor(newConsecutiveDays / 3), // Increase target every 3 days
        progress: 0,
        completed: false,
        rewardClaimed: false,
      },
      lastDailyDate: today,
      consecutiveDays: newConsecutiveDays,
      dailyStreak: newConsecutiveDays,
    });
  }

  // Update daily challenge progress
  withDailyProgress() {
    if (this.state.dailyChallenge.completed) {
      return new GameState(this.state);
    }

    const newProgress = this.state.dailyChallenge.progress + 1;
    const isCompleted = newProgress >= this.state.dailyChallenge.target;

    return new GameState({
      ...this.state,
      dailyChallenge: {
        ...this.state.dailyChallenge,
        progress: newProgress,
        completed: isCompleted,
      },
    });
  }

  // Claim daily challenge reward
  withClaimedDailyReward() {
    return new GameState({
      ...this.state,
      dailyChallenge: {
        ...this.state.dailyChallenge,
        rewardClaimed: true,
      },
      tokens: this.state.tokens + 10, // Bonus 10 tokens
    });
  }

  // Get daily bonus based on consecutive days
  getDailyBonus() {
    const days = this.state.consecutiveDays;
    if (days === 0) return 0;
    if (days === 1) return 5;
    if (days === 2) return 10;
    if (days >= 7) return 50;
    if (days >= 5) return 30;
    return 15 + (days - 3) * 5;
  }

  getPowerUps() {
    return this.state.powerUps;
  }

  getActivePowerUp() {
    return this.state.activePowerUp;
  }

  hasPowerUp(type) {
    return this.state.powerUps[type] > 0;
  }

  usePowerUp(type) {
    if (!this.hasPowerUp(type)) {
      return null;
    }

    const newPowerUps = { ...this.state.powerUps };
    newPowerUps[type]--;

    return new GameState({
      ...this.state,
      powerUps: newPowerUps,
      activePowerUp: type,
    });
  }

  activatePowerUp(type) {
    if (!this.hasPowerUp(type)) {
      return new GameState(this.state);
    }

    const newPowerUps = { ...this.state.powerUps };
    newPowerUps[type]--;

    return new GameState({
      ...this.state,
      powerUps: newPowerUps,
      activePowerUp: type,
    });
  }

  deactivatePowerUp() {
    return new GameState({
      ...this.state,
      activePowerUp: null,
    });
  }

  // Grant power-ups (for leveling up, daily rewards, etc.)
  withPowerUpBonus(type, amount = 1) {
    const newPowerUps = { ...this.state.powerUps };
    newPowerUps[type] = (newPowerUps[type] || 0) + amount;

    return new GameState({
      ...this.state,
      powerUps: newPowerUps,
    });
  }

  // Award power-ups on level up
  withLevelUpPowerUps(newLevel) {
    const newPowerUps = { ...this.state.powerUps };

    // Grant power-ups every 5 levels
    if (newLevel % 5 === 0) {
      newPowerUps.streakFreeze = (newPowerUps.streakFreeze || 0) + 1;
    }

    // Grant hint shield every 3 levels
    if (newLevel % 3 === 0) {
      newPowerUps.hintShield = (newPowerUps.hintShield || 0) + 1;
    }

    // Grant double token every 2 levels
    if (newLevel % 2 === 0) {
      newPowerUps.doubleToken = (newPowerUps.doubleToken || 0) + 1;
    }

    return new GameState({
      ...this.state,
      powerUps: newPowerUps,
    });
  }

  getPurchasedSkins() {
    return this.state.purchasedSkins;
  }

  hasSkin(skinId) {
    return this.state.purchasedSkins.includes(skinId);
  }

  purchaseSkin(skinId, price) {
    if (this.state.tokens < price) {
      return null;
    }
    if (this.hasSkin(skinId)) {
      return null;
    }

    return new GameState({
      ...this.state,
      tokens: this.state.tokens - price,
      purchasedSkins: [...this.state.purchasedSkins, skinId],
    });
  }

  // Shop items configuration
  static getShopItems() {
    return {
      hintShield: { type: 'powerup', price: 10, name: 'Hint Shield' },
      doubleToken: { type: 'powerup', price: 15, name: '2x Token' },
      streakFreeze: { type: 'powerup', price: 25, name: 'Streak Save' },
      wheelSkinSpace: { type: 'cosmetic', price: 50, name: 'Space Wheel' },
      wheelSkinOcean: { type: 'cosmetic', price: 50, name: 'Ocean Wheel' },
      wheelSkinRainbow: { type: 'cosmetic', price: 100, name: 'Rainbow Wheel' },
    };
  }

  // Tutorial methods
  getTutorialCompleted() {
    return this.state.tutorialCompleted;
  }

  getTutorialStep() {
    return this.state.tutorialStep;
  }

  withTutorialStep(step) {
    return new GameState({
      ...this.state,
      tutorialStep: step,
    });
  }

  withTutorialCompleted() {
    return new GameState({
      ...this.state,
      tutorialCompleted: true,
      tutorialStep: 0,
    });
  }

  // Tutorial steps configuration
  static getTutorialSteps() {
    return [
      {
        id: 'welcome',
        title: 'Welcome to CVC Spin!',
        text: 'Learn to read word families by spinning the wheel and matching words!',
        icon: '🎡',
      },
      {
        id: 'spin',
        title: 'Spin the Wheel',
        text: 'Click the "SPIN" button to spin the wheel and land on a word family pattern.',
        icon: '🎯',
        target: '#spinButton',
      },
      {
        id: 'question',
        title: 'Answer the Question',
        text: 'After spinning, you\'ll see a word with missing letters. Choose the correct word from the options!',
        icon: '❓',
        target: '.app__choices',
      },
      {
        id: 'tokens',
        title: 'Earn Tokens',
        text: 'Correct answers earn tokens! Collect tokens to buy power-ups and cosmetics in the shop.',
        icon: '🪙',
        target: '.token-display',
      },
      {
        id: 'level',
        title: 'Level Up',
        text: 'Earn XP with each correct answer. Level up to unlock achievements and earn power-ups!',
        icon: '⭐',
        target: '.level-display',
      },
      {
        id: 'powerups',
        title: 'Use Power-Ups',
        text: 'Click power-up buttons to activate them. Hint Shield reveals a letter, 2x Token doubles rewards, and Streak Save protects your streak!',
        icon: '⚡',
        target: '.app__powerups',
      },
      {
        id: 'shop',
        title: 'Visit the Shop',
        text: 'Click the shop button to spend tokens on power-ups and cool wheel skins!',
        icon: '🛒',
        target: '#shopButton',
      },
      {
        id: 'daily',
        title: 'Daily Challenges',
        text: 'Complete daily challenges to earn bonus tokens. Build streaks for even bigger rewards!',
        icon: '🎁',
        target: '.daily-challenge-banner',
      },
      {
        id: 'ready',
        title: 'Ready to Play!',
        text: 'You\'re all set! Spin the wheel and start learning. Good luck!',
        icon: '🚀',
      },
    ];
  }

  // Multiplayer methods
  getMultiplayerMode() {
    return this.state.multiplayerMode;
  }

  getCurrentPlayer() {
    return this.state.currentPlayer;
  }

  getPlayerScore(playerNum) {
    return this.state.players[playerNum]?.score || 0;
  }

  getPlayerStats(playerNum) {
    return this.state.players[playerNum] || { score: 0, correctAnswers: 0, streak: 0 };
  }

  withMultiplayerEnabled() {
    return new GameState({
      ...this.state,
      multiplayerMode: true,
      currentPlayer: 1,
      players: {
        1: { score: 0, correctAnswers: 0, streak: 0 },
        2: { score: 0, correctAnswers: 0, streak: 0 },
      },
    });
  }

  withMultiplayerDisabled() {
    return new GameState({
      ...this.state,
      multiplayerMode: false,
      currentPlayer: 1,
    });
  }

  withPlayerScore(playerNum, score) {
    const newPlayers = {
      ...this.state.players,
      [playerNum]: {
        ...this.state.players[playerNum],
        score: score,
      },
    };

    return new GameState({
      ...this.state,
      players: newPlayers,
    });
  }

  withPlayerCorrectAnswer(playerNum) {
    const player = this.state.players[playerNum];
    const newPlayers = {
      ...this.state.players,
      [playerNum]: {
        score: player.score + 1,
        correctAnswers: player.correctAnswers + 1,
        streak: player.streak + 1,
      },
    };

    return new GameState({
      ...this.state,
      players: newPlayers,
    });
  }

  withPlayerIncorrectAnswer(playerNum) {
    const player = this.state.players[playerNum];
    const newPlayers = {
      ...this.state.players,
      [playerNum]: {
        ...player,
        streak: 0,
      },
    };

    return new GameState({
      ...this.state,
      players: newPlayers,
    });
  }

  withNextPlayer() {
    const nextPlayer = this.state.currentPlayer === 1 ? 2 : 1;
    return new GameState({
      ...this.state,
      currentPlayer: nextPlayer,
    });
  }

  getWinner() {
    if (!this.state.multiplayerMode) return null;

    const player1 = this.state.players[1];
    const player2 = this.state.players[2];

    if (player1.score > player2.score) return 1;
    if (player2.score > player1.score) return 2;
    return 0; // Tie
  }

  // Pronunciation settings
  getPronunciationEnabled() {
    return this.state.pronunciationEnabled;
  }

  withPronunciationEnabled(enabled) {
    return new GameState({
      ...this.state,
      pronunciationEnabled: enabled,
    });
  }

  getPronunciationRate() {
    return this.state.pronunciationRate;
  }

  withPronunciationRate(rate) {
    return new GameState({
      ...this.state,
      pronunciationRate: rate,
    });
  }

  getPronunciationPitch() {
    return this.state.pronunciationPitch;
  }

  withPronunciationPitch(pitch) {
    return new GameState({
      ...this.state,
      pronunciationPitch: pitch,
    });
  }

  getSelectedVoice() {
    return this.state.selectedVoice;
  }

  withSelectedVoice(voiceURI) {
    return new GameState({
      ...this.state,
      selectedVoice: voiceURI,
    });
  }
}
