/**
 * AchievementService - Tracks and unlocks achievements
 * Tracks: streaks, milestones, and special accomplishments
 */

export const ACHIEVEMENTS = {
  FIRST_SPIN: {
    id: 'first-spin',
    name: 'First Spin!',
    description: 'Spin the wheel for the first time',
    icon: '🎡',
    condition: (state) => state.spinCount >= 1,
  },
  FIRST_CORRECT: {
    id: 'first-correct',
    name: 'Getting Started',
    description: 'Answer correctly for the first time',
    icon: '🌟',
    condition: (state) => state.totalCorrect >= 1,
  },
  STREAK_3: {
    id: 'streak-3',
    name: 'Hot Streak!',
    description: 'Get 3 correct answers in a row',
    icon: '🔥',
    condition: (state) => state.currentStreak >= 3,
  },
  STREAK_5: {
    id: 'streak-5',
    name: 'On Fire!',
    description: 'Get 5 correct answers in a row',
    icon: '💥',
    condition: (state) => state.currentStreak >= 5,
  },
  STREAK_10: {
    id: 'streak-10',
    name: 'Unstoppable!',
    description: 'Get 10 correct answers in a row',
    icon: '⚡',
    condition: (state) => state.currentStreak >= 10,
  },
  PERFECT_ROUND: {
    id: 'perfect-round',
    name: 'Perfect Round',
    description: 'Complete a round with 100% accuracy (min 5 spins)',
    icon: '💯',
    condition: (state) => state.spinCount >= 5 && state.successRate === 1,
  },
  TOKEN_COLLECTOR_5: {
    id: 'tokens-5',
    name: 'Token Collector',
    description: 'Earn 5 tokens',
    icon: '🪙',
    condition: (state) => state.tokens >= 5,
  },
  TOKEN_COLLECTOR_10: {
    id: 'tokens-10',
    name: 'Treasure Hunter',
    description: 'Earn 10 tokens',
    icon: '💎',
    condition: (state) => state.tokens >= 10,
  },
  TOKEN_COLLECTOR_20: {
    id: 'tokens-20',
    name: 'Dragon Hoard',
    description: 'Earn 20 tokens',
    icon: '🐉',
    condition: (state) => state.tokens >= 20,
  },
  SPINNER_10: {
    id: 'spinner-10',
    name: 'Dedicated Spinner',
    description: 'Spin the wheel 10 times',
    icon: '🎯',
    condition: (state) => state.spinCount >= 10,
  },
  SPINNER_50: {
    id: 'spinner-50',
    name: 'Wheel Master',
    description: 'Spin the wheel 50 times',
    icon: '🏆',
    condition: (state) => state.spinCount >= 50,
  },
  SPEED_DEMON: {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Get 5 correct answers within 30 seconds',
    icon: '⏱️',
    condition: (state) => false, // Tracked separately
  },
  WORD_FAMILY_MASTER: {
    id: 'word-family-master',
    name: 'Word Family Master',
    description: 'Answer correctly for all 15 word families',
    icon: '📚',
    condition: (state) => false, // Tracked separately
  },
  MASTERY_AT: {
    id: 'mastery-at',
    name: '-at Family Expert',
    description: 'Get 3 correct answers in the -at family',
    icon: '🎓',
    condition: (state) => false, // Tracked separately
  },
  MASTERY_OG: {
    id: 'mastery-og',
    name: '-og Family Expert',
    description: 'Get 3 correct answers in the -og family',
    icon: '🎓',
    condition: (state) => false, // Tracked separately
  },
  MASTERY_IP: {
    id: 'mastery-ip',
    name: '-ip Family Expert',
    description: 'Get 3 correct answers in the -ip family',
    icon: '🎓',
    condition: (state) => false, // Tracked separately
  },
  MASTERY_ET: {
    id: 'mastery-et',
    name: '-et Family Expert',
    description: 'Get 3 correct answers in the -et family',
    icon: '🎓',
    condition: (state) => false, // Tracked separately
  },
  MASTERY_UB: {
    id: 'mastery-ub',
    name: '-ub Family Expert',
    description: 'Get 3 correct answers in the -ub family',
    icon: '🎓',
    condition: (state) => false, // Tracked separately
  },
  MASTERY_AN: {
    id: 'mastery-an',
    name: '-an Family Expert',
    description: 'Get 3 correct answers in the -an family',
    icon: '🎓',
    condition: (state) => false, // Tracked separately
  },
  MASTERY_IG: {
    id: 'mastery-ig',
    name: '-ig Family Expert',
    description: 'Get 3 correct answers in the -ig family',
    icon: '🎓',
    condition: (state) => false, // Tracked separately
  },
  MASTERY_OP: {
    id: 'mastery-op',
    name: '-op Family Expert',
    description: 'Get 3 correct answers in the -op family',
    icon: '🎓',
    condition: (state) => false, // Tracked separately
  },
  MASTERY_EN: {
    id: 'mastery-en',
    name: '-en Family Expert',
    description: 'Get 3 correct answers in the -en family',
    icon: '🎓',
    condition: (state) => false, // Tracked separately
  },
  MASTERY_UG: {
    id: 'mastery-ug',
    name: '-ug Family Expert',
    description: 'Get 3 correct answers in the -ug family',
    icon: '🎓',
    condition: (state) => false, // Tracked separately
  },
  MASTERY_UT: {
    id: 'mastery-ut',
    name: '-ut Family Expert',
    description: 'Get 3 correct answers in the -ut family',
    icon: '🎓',
    condition: (state) => false, // Tracked separately
  },
  MASTERY_OT: {
    id: 'mastery-ot',
    name: '-ot Family Expert',
    description: 'Get 3 correct answers in the -ot family',
    icon: '🎓',
    condition: (state) => false, // Tracked separately
  },
  MASTERY_UN: {
    id: 'mastery-un',
    name: '-un Family Expert',
    description: 'Get 3 correct answers in the -un family',
    icon: '🎓',
    condition: (state) => false, // Tracked separately
  },
  MASTERY_AM: {
    id: 'mastery-am',
    name: '-am Family Expert',
    description: 'Get 3 correct answers in the -am family',
    icon: '🎓',
    condition: (state) => false, // Tracked separately
  },
  MASTERY_ED: {
    id: 'mastery-ed',
    name: '-ed Family Expert',
    description: 'Get 3 correct answers in the -ed family',
    icon: '🎓',
    condition: (state) => false, // Tracked separately
  },
  HALF_WAY_MASTER: {
    id: 'halfway-master',
    name: 'Half Way Hero',
    description: 'Master 8 word families',
    icon: '🏅',
    condition: (state) => false, // Tracked separately
  },
  LEVEL_5: {
    id: 'level-5',
    name: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    condition: (state) => false, // Tracked separately
  },
  LEVEL_10: {
    id: 'level-10',
    name: 'Word Wizard',
    description: 'Reach level 10',
    icon: '🌟',
    condition: (state) => false, // Tracked separately
  },
};

export class AchievementService {
  constructor(options = {}) {
    this.unlockedAchievements = new Set();
    this.displayCallback = options.onUnlock ?? null;
    this.recentCorrectTimes = [];
    this.correctWordFamilies = new Set();
    this.wordFamilyCorrectCounts = {};
  }

  checkAchievements(gameState) {
    const newAchievements = [];

    for (const achievement of Object.values(ACHIEVEMENTS)) {
      if (this.unlockedAchievements.has(achievement.id)) {
        continue;
      }

      if (achievement.condition(gameState)) {
        this.unlockAchievement(achievement);
        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  }

  unlockAchievement(achievement) {
    this.unlockedAchievements.add(achievement.id);
    if (this.displayCallback) {
      this.displayCallback(achievement);
    }
  }

  trackCorrectAnswer(word, wordFamily) {
    const now = Date.now();
    this.recentCorrectTimes.push(now);
    this.correctWordFamilies.add(wordFamily);

    // Track correct counts per word family for mastery achievements
    if (!this.wordFamilyCorrectCounts[wordFamily]) {
      this.wordFamilyCorrectCounts[wordFamily] = 0;
    }
    this.wordFamilyCorrectCounts[wordFamily]++;

    // Check for word family mastery achievements (3 correct per family)
    const masteryAchievements = {
      '-at': 'MASTERY_AT',
      '-og': 'MASTERY_OG',
      '-ip': 'MASTERY_IP',
      '-et': 'MASTERY_ET',
      '-ub': 'MASTERY_UB',
      '-an': 'MASTERY_AN',
      '-ig': 'MASTERY_IG',
      '-op': 'MASTERY_OP',
      '-en': 'MASTERY_EN',
      '-ug': 'MASTERY_UG',
      '-ut': 'MASTERY_UT',
      '-ot': 'MASTERY_OT',
      '-un': 'MASTERY_UN',
      '-am': 'MASTERY_AM',
      '-ed': 'MASTERY_ED',
    };

    const masteryId = masteryAchievements[wordFamily];
    if (masteryId && this.wordFamilyCorrectCounts[wordFamily] >= 3 && !this.unlockedAchievements.has(masteryId)) {
      this.unlockAchievement(ACHIEVEMENTS[masteryId]);
    }

    // Keep only last 5 correct answers (within 30 seconds)
    const thirtySecondsAgo = now - 30000;
    this.recentCorrectTimes = this.recentCorrectTimes.filter(t => t > thirtySecondsAgo);

    // Check for speed demon achievement
    if (this.recentCorrectTimes.length >= 5 && !this.unlockedAchievements.has('speed-demon')) {
      this.unlockAchievement(ACHIEVEMENTS.SPEED_DEMON);
    }

    // Check for half way hero (8 families)
    if (this.correctWordFamilies.size >= 8 && !this.unlockedAchievements.has('halfway-master')) {
      this.unlockAchievement(ACHIEVEMENTS.HALF_WAY_MASTER);
    }

    // Check for word family master (all 15 families)
    if (this.correctWordFamilies.size >= 15 && !this.unlockedAchievements.has('word-family-master')) {
      this.unlockAchievement(ACHIEVEMENTS.WORD_FAMILY_MASTER);
    }
  }

  checkLevelAchievements(level) {
    if (level >= 5 && !this.unlockedAchievements.has('level-5')) {
      this.unlockAchievement(ACHIEVEMENTS.LEVEL_5);
    }
    if (level >= 10 && !this.unlockedAchievements.has('level-10')) {
      this.unlockAchievement(ACHIEVEMENTS.LEVEL_10);
    }
  }

  isUnlocked(achievementId) {
    return this.unlockedAchievements.has(achievementId);
  }

  getUnlockedCount() {
    return this.unlockedAchievements.size;
  }

  getTotalCount() {
    return Object.keys(ACHIEVEMENTS).length;
  }

  getProgress() {
    return {
      unlocked: this.getUnlockedCount(),
      total: this.getTotalCount(),
      percentage: Math.round((this.getUnlockedCount() / this.getTotalCount()) * 100),
    };
  }

  reset() {
    this.unlockedAchievements.clear();
    this.recentCorrectTimes = [];
    this.correctWordFamilies.clear();
    this.wordFamilyCorrectCounts = {};
  }
}

export const defaultAchievementService = new AchievementService();
