const CVC_PATTERN = /^[bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz]$/i;

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

export class Rime {
  constructor({ pattern, words, angleStart, angleEnd }) {
    if (typeof pattern !== 'string' || !pattern.startsWith('-')) {
      throw new Error('Rime pattern must be a hyphen-prefixed string.');
    }
    if (!Array.isArray(words) || words.length !== 3) {
      throw new Error('Rime requires exactly 3 words.');
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
