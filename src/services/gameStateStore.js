import { STORAGE_KEY } from '../config.js';
import { GameState } from '../models/GameState.js';

function safeGetStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Test if localStorage is actually writable (some browsers block in private/incognito mode)
      const testKey = '__localStorage_test__';
      window.localStorage.setItem(testKey, 'test');
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    }
  } catch (error) {
    console.warn('localStorage unavailable, falling back to memory storage.', error.message);
  }
  // Fallback to in-memory storage
  let memory = {};
  return {
    getItem(key) {
      return memory[key] ?? null;
    },
    setItem(key, value) {
      try {
        memory[key] = value;
      } catch (error) {
        console.warn('Failed to set item in memory storage:', error.message);
      }
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
    this.memoryFallback = false;
  }

  load() {
    try {
      const raw = this.storage.getItem(this.key);
      if (raw === null || raw === undefined) {
        return GameState.createInitial();
      }
      // Validate JSON before parsing
      if (typeof raw !== 'string') {
        console.warn('Invalid storage data, creating new game state');
        return GameState.createInitial();
      }
      const parsed = JSON.parse(raw);
      // Validate parsed data structure
      if (!parsed || typeof parsed !== 'object') {
        console.warn('Corrupted storage data, creating new game state');
        return GameState.createInitial();
      }
      return GameState.fromStorage(raw);
    } catch (error) {
      console.warn('Failed to load game state, creating new state:', error.message);
      return GameState.createInitial();
    }
  }

  save(gameState) {
    try {
      const payload = typeof gameState.toJSON === 'function' ? gameState.toJSON() : gameState;
      const serialized = JSON.stringify(payload);
      this.storage.setItem(this.key, serialized);
      this.memoryFallback = false;
      return true;
    } catch (error) {
      if (!this.memoryFallback) {
        console.warn('Failed to save to storage, data will be lost on refresh:', error.message);
        this.memoryFallback = true;
      }
      return false;
    }
  }

  clear() {
    try {
      this.storage.removeItem(this.key);
    } catch (error) {
      console.warn('Failed to clear storage:', error.message);
    }
  }

  isPersisted() {
    return !this.memoryFallback;
  }
}

export const defaultGameStateStore = new GameStateStore();
