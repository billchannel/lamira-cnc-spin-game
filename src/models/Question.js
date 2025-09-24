import { ensureWord, shuffleWords } from './Word.js';

export class Question {
  constructor({ rime, correctWord, choices, questionText }) {
    if (typeof rime !== 'string' || !rime.startsWith('-')) {
      throw new Error('Question requires a rime pattern.');
    }
    this.rime = rime;
    this.correctWord = ensureWord(correctWord);

    const normalizedChoices = (choices ?? []).map(ensureWord);
    if (normalizedChoices.length !== 3) {
      throw new Error('Question requires exactly three choice words.');
    }
    const correctMatches = normalizedChoices.filter(
      (word) => word.text === this.correctWord.text,
    );
    if (correctMatches.length !== 1) {
      throw new Error('Question choices must include exactly one correct answer.');
    }
    if (!normalizedChoices.every((word) => word.rime === rime)) {
      throw new Error('All question choices must share the same rime pattern.');
    }

    this.questionText = questionText ?? `What is this? ${this.correctWord.emoji}`;
    this.choices = normalizedChoices;
  }

  static fromRime(rime, correctWord, distractors) {
    const shuffled = shuffleWords([correctWord, ...distractors]);
    return new Question({
      rime: rime.pattern,
      correctWord,
      choices: shuffled,
      questionText: `What is this? ${correctWord.emoji}`,
    });
  }

  isCorrectAnswer(wordText) {
    return wordText.toLowerCase() === this.correctWord.text;
  }
}
