import { CONFIG, STORAGE_KEY } from '../../src/config.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function mountApp() {
  const htmlPath = path.resolve(__dirname, '../../index.html');
  const rawHtml = readFileSync(htmlPath, 'utf-8');
  document.documentElement.innerHTML = rawHtml.replace(/<script[^>]*>.*?<\/script>/gs, '');
}

function getCorrectAnswerFromStore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    throw new Error('No game state stored.');
  }
  const parsed = JSON.parse(raw);
  return parsed.currentAnswer;
}

describe('Success rate tracking', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
    localStorage.clear();
    mountApp();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('celebrates when success rate exceeds target after 8 spins', async () => {
    await import('../../src/main.js');
    const spinButton = document.getElementById('spinButton');
    const choiceButtons = () => Array.from(document.querySelectorAll('.choice'));
    const feedbackEl = document.getElementById('feedback');

    for (let round = 0; round < 8; round += 1) {
      spinButton.click();
      jest.advanceTimersByTime(CONFIG.ANIMATION_DURATION + 10);

      const correctAnswer = getCorrectAnswerFromStore();
      const buttons = choiceButtons();
      const correctButton = buttons.find((button) => button.dataset.choice === correctAnswer);
      const incorrectButton = buttons.find((button) => button.dataset.choice !== correctAnswer);

      if (round === 0 || round === 1) {
        incorrectButton.click();
      } else {
        correctButton.click();
      }

      if (round < 7) {
        jest.advanceTimersByTime(CONFIG.FEEDBACK_DURATION + 10);
      }
    }

    const successRateDisplay = document.getElementById('successRate').textContent;
    expect(successRateDisplay).toMatch(/Success rate: 75%/);
    expect(feedbackEl.textContent).toMatch(/Amazing|Great job/i);
  });
});
