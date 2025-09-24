import { STORAGE_KEY } from '../config.js';
import { GameState } from '../models/GameState.js';

function safeGetStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch (error) {
    console.warn('localStorage unavailable, falling back to memory.', error);
  }
  let memory = {};
  return {
    getItem(key) {
      return memory[key] ?? null;
    },
    setItem(key, value) {
      memory[key] = value;
    },
    removeItem(key) {
      delete memory[key];
    },
  };
}

export class GameStateStore {
  constructor(options = {}) {
    this.storage = options.storage ?? safeGetStorage();
    this.key = options.key ?? STORAGE_KEY;
  }

  load() {
    const raw = this.storage.getItem(this.key);
    return GameState.fromStorage(raw);
  }

  save(gameState) {
    const payload = typeof gameState.toJSON === 'function' ? gameState.toJSON() : gameState;
    this.storage.setItem(this.key, JSON.stringify(payload));
  }

  clear() {
    this.storage.removeItem(this.key);
  }
}

export const defaultGameStateStore = new GameStateStore();
