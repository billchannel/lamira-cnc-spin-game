import { RIMES, getRandomRime } from '../data/rimes.js';
import { ensureRime } from '../models/Rime.js';
import { ensureWord } from '../models/Word.js';
import { Question } from '../models/Question.js';

function gatherDistractors(rime, correctWord) {
  return rime.words
    .filter((word) => word.text !== correctWord.text)
    .slice(0, 2)
    .map(ensureWord);
}

export function createQuestionFromRime(rimeInput) {
  const rime = ensureRime(rimeInput);
  const correctWord = ensureWord(rime.pickRandomWord());
  const distractors = gatherDistractors(rime, correctWord);
  return Question.fromRime(rime, correctWord, distractors);
}

export function createRandomQuestion() {
  const rime = ensureRime(getRandomRime());
  const question = createQuestionFromRime(rime);
  return { question, rime };
}

export function listAllRimes() {
  return RIMES.map((entry) => ensureRime(entry));
}
