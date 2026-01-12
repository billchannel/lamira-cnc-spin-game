// Relaxed CVC pattern that allows phonics words with:
// - CVC (cat)
// - CCVC with blends (stop, sled)
// - Double consonant endings (bell, duck, sack)
// - Digraph endings (bush, fish)
const CVC_PATTERN = /^[bcdfghjklmnpqrstvwxyz]+[aeiou][bcdfghjklmnpqrstvwxyz]+$/i;

function validateWord(wordEntry) {
  if (!wordEntry || typeof wordEntry.text !== 'string' || typeof wordEntry.emoji !== 'string') {
    throw new Error('Word entry requires text and emoji.');
  }
  if (!CVC_PATTERN.test(wordEntry.text)) {
    throw new Error(`Word ${wordEntry.text} must match CVC pattern.`);
  }
  if (!wordEntry.emoji.trim()) {
    throw new Error('Emoji must be a non-empty string.');
  }
}

function validatePattern(pattern) {
  if (typeof pattern !== 'string') {
    throw new Error('Rime pattern must be a string.');
  }
  // Allow both hyphen-prefixed (like -at) and non-hyphen patterns (like and, end)
  // Non-hyphen patterns are for words that don't follow the simple CVC+rime pattern
  if (!pattern.startsWith('-') && !/^[a-z]+$/.test(pattern)) {
    throw new Error('Rime pattern must be a valid string.');
  }
}

export class Rime {
  constructor({ pattern, words, angleStart, angleEnd }) {
    validatePattern(pattern);
    if (!Array.isArray(words) || words.length < 3) {
      throw new Error('Rime requires at least 3 words.');
    }
    if (words.length > 8) {
      throw new Error('Rime cannot have more than 8 words.');
    }
    words.forEach(validateWord);
    if (typeof angleStart !== 'number' || typeof angleEnd !== 'number') {
      throw new Error('Rime must define numeric angleStart and angleEnd.');
    }
    if (!(angleStart >= 0 && angleStart < 360)) {
      throw new Error('angleStart must be within [0, 360).');
    }
    if (!(angleEnd > angleStart && angleEnd <= 360)) {
      throw new Error('angleEnd must be within (angleStart, 360].');
    }
    this.pattern = pattern;
    this.words = words.map((word) => ({
      text: word.text.toLowerCase(),
      emoji: word.emoji,
      rime: pattern,
    }));
    this.angleStart = angleStart;
    this.angleEnd = angleEnd;
  }

  pickRandomWord() {
    const index = Math.floor(Math.random() * this.words.length);
    return this.words[index];
  }
}

export function ensureRime(input) {
  return input instanceof Rime ? input : new Rime(input);
}
