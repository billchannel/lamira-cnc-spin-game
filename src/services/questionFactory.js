import { RIMES, getRandomRime } from '../data/rimes.js';
import { ensureRime } from '../models/Rime.js';
import { ensureWord } from '../models/Word.js';
import { Question } from '../models/Question.js';

export const DIFFICULTY_LEVELS = {
  easy: {
    name: 'Easy',
    description: 'Practice mode with visual hints',
    hintLevel: 2, // Show 2 letters as hint
    showEmoji: true,
    timeLimit: null,
  },
  medium: {
    name: 'Medium',
    description: 'Standard gameplay',
    hintLevel: 1, // Show 1 letter as hint
    showEmoji: true,
    timeLimit: null,
  },
  hard: {
    name: 'Hard',
    description: 'Challenge mode - no hints',
    hintLevel: 0, // No hints
    showEmoji: false, // Hide emoji
    timeLimit: 10000, // 10 second limit
  },
};

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function gatherDistractors(rime, correctWord, difficulty = 'medium') {
  const baseDistractors = rime.words
    .filter((word) => word.text !== correctWord.text);

  // In hard mode, occasionally add distractors from other rimes
  if (difficulty === 'hard' && Math.random() > 0.7) {
    const otherRimes = RIMES.filter(r => r.pattern !== rime.pattern);
    const randomRime = otherRimes[Math.floor(Math.random() * otherRimes.length)];
    const crossRimeWord = randomRime.words[Math.floor(Math.random() * randomRime.words.length)];
    baseDistractors.push(crossRimeWord);
  }

  return baseDistractors
    .slice(0, 2)
    .map(ensureWord);
}

export function createQuestionFromRime(rimeInput, options = {}) {
  const { difficulty = 'medium', randomizeChoices = true } = options;
  const rime = ensureRime(rimeInput);
  const correctWord = ensureWord(rime.pickRandomWord());
  const distractors = gatherDistractors(rime, correctWord, difficulty);

  // Create choices array
  let choices = [correctWord, ...distractors];

  // Randomize choice order for variety
  if (randomizeChoices) {
    choices = shuffleArray(choices);
  }

  return Question.fromRime(rime, correctWord, distractors, choices, difficulty);
}

export function createRandomQuestion(options = {}) {
  const rime = ensureRime(getRandomRime());
  const question = createQuestionFromRime(rime, options);
  return { question, rime };
}

export function listAllRimes() {
  return RIMES.map((entry) => ensureRime(entry));
}

export function getDifficultyConfig(level = 'medium') {
  return DIFFICULTY_LEVELS[level] || DIFFICULTY_LEVELS.medium;
}
