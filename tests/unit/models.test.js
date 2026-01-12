import { GameState } from '../../src/models/GameState.js';
import { Rime } from '../../src/models/Rime.js';
import { Word } from '../../src/models/Word.js';
import { Question } from '../../src/models/Question.js';

const BASE_RIME = {
  pattern: '-ab',
  words: [
    { text: 'cab', emoji: '🚕' },
    { text: 'dab', emoji: '🎨' },
    { text: 'lab', emoji: '🧪' },
  ],
  angleStart: 0,
  angleEnd: 72,
};

describe('Model validation', () => {
  test('GameState rejects impossible counts', () => {
    expect(() => new GameState({ tokens: -1 })).toThrow('Invalid tokens');
    expect(() => new GameState({ spinCount: -3 })).toThrow('Invalid spinCount');
    expect(() => new GameState({ spinCount: 1, correctAnswers: 2 })).toThrow(
      'correctAnswers must be less than or equal to spinCount',
    );
  });

  test('Rime enforces three CVC words', () => {
    const invalidWords = { ...BASE_RIME, words: [{ text: 'cab', emoji: '🚕' }] };
    expect(() => new Rime(invalidWords)).toThrow('Rime requires at least 3 words');
    const invalidCvc = {
      ...BASE_RIME,
      words: [
        { text: 'cab', emoji: '🚕' },
        { text: 'nope', emoji: '❌' },
        { text: 'lab', emoji: '🧪' },
      ],
    };
    expect(() => new Rime(invalidCvc)).toThrow('must match CVC pattern');
  });

  test('Question requires one correct answer among three choices', () => {
    const rime = new Rime(BASE_RIME);
    const correctWord = new Word({ text: 'cab', emoji: '🚕', rime: '-ab' });
    const distractor = new Word({ text: 'dab', emoji: '🎨', rime: '-ab' });
    expect(() =>
      new Question({
        rime: rime.pattern,
        correctWord,
        choices: [correctWord, distractor],
      }),
    ).toThrow('exactly three choice words');

    const duplicates = [correctWord, correctWord, distractor];
    expect(() =>
      new Question({
        rime: rime.pattern,
        correctWord,
        choices: duplicates,
      }),
    ).toThrow('exactly one correct answer');
  });
});
