const CVC_PATTERN = /^[bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz]$/i;

export class Word {
  constructor({ text, emoji, rime }) {
    if (typeof text !== 'string' || !CVC_PATTERN.test(text)) {
      throw new Error(`Word ${text} must match the CVC pattern.`);
    }
    if (typeof emoji !== 'string' || !emoji.trim()) {
      throw new Error('Emoji must be a non-empty string.');
    }
    if (typeof rime !== 'string' || !rime.startsWith('-')) {
      throw new Error('Word must define rime pattern.');
    }
    this.text = text.toLowerCase();
    this.emoji = emoji;
    this.rime = rime;
  }
}

export function ensureWord(input) {
  return input instanceof Word ? input : new Word(input);
}

export function shuffleWords(words) {
  const result = [...words];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
