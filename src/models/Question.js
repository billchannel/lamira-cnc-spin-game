import { ensureWord } from './Word.js';

export class Question {
  constructor({ rime, correctWord, choices, questionText, difficulty = 'medium' }) {
    if (typeof rime !== 'string' || !rime.startsWith('-')) {
      throw new Error('Question requires a rime pattern.');
    }
    this.rime = rime;
    this.correctWord = ensureWord(correctWord);
    this.difficulty = difficulty;

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
    // Note: In hard mode, choices can come from different rimes, so we skip that validation

    this.questionText = questionText ?? `What is this? ${this.correctWord.emoji}`;
    this.choices = normalizedChoices;
  }

  static fromRime(rime, correctWord, distractors, choices = null, difficulty = 'medium') {
    // If choices not provided, use the distractors to create shuffled choices
    const finalChoices = choices || [correctWord, ...distractors];
    return new Question({
      rime: rime.pattern,
      correctWord,
      choices: finalChoices,
      questionText: `What is this? ${correctWord.emoji}`,
      difficulty,
    });
  }

  isCorrectAnswer(wordText) {
    return wordText.toLowerCase() === this.correctWord.text;
  }

  getHint() {
    const text = this.correctWord.text;
    const hintLevels = { easy: 2, medium: 1, hard: 0 };
    const lettersToShow = hintLevels[this.difficulty] ?? 1;

    if (lettersToShow === 0) return '';

    // Show first N letters
    return text.substring(0, lettersToShow) + '_'.repeat(text.length - lettersToShow);
  }
}
