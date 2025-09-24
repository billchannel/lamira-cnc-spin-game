import { CONFIG } from '../config.js';

const DEFAULT_STATE = {
  tokens: 0,
  currentRime: null,
  currentAnswer: null,
  isSpinning: false,
  spinCount: 0,
  correctAnswers: 0,
  lastPlayed: null,
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

  get lastPlayedISO() {
    return this.state.lastPlayed;
  }

  get successRate() {
    if (this.state.spinCount === 0) {
      return 0;
    }
    return this.state.correctAnswers / this.state.spinCount;
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
    return new GameState({
      ...this.state,
      tokens: this.state.tokens + 1,
      correctAnswers: this.state.correctAnswers + 1,
      lastPlayed: new Date().toISOString(),
    });
  }

  withIncorrectAnswer() {
    return new GameState({
      ...this.state,
      lastPlayed: new Date().toISOString(),
    });
  }

  shouldCelebrateSuccess() {
    return (
      this.spinCount >= CONFIG.MIN_SPINS_FOR_SUCCESS &&
      this.successRate >= CONFIG.SUCCESS_RATE_TARGET
    );
  }
}
