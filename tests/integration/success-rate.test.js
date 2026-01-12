import { CONFIG, STORAGE_KEY } from '../../src/config.js';
import { readFileSync } from 'fs';
import path from 'path';

function mountApp() {
  const htmlPath = path.join(process.cwd(), 'index.html');
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
    jest.useRealTimers();
    localStorage.clear();
    mountApp();
  });

  it('celebrates when success rate exceeds target after 8 spins', async () => {
    await import('../../src/main.js');
    const spinButton = document.getElementById('spinButton');
    const choiceButtons = () => Array.from(document.querySelectorAll('.choice'));
    const feedbackEl = document.getElementById('feedback');

    for (let round = 0; round < 8; round += 1) {
      // Wait for spin button to be enabled before clicking
      let retries = 0;
      while (spinButton.disabled && retries < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }

      if (spinButton.disabled) {
        throw new Error(`Spin button still disabled at round ${round} after waiting`);
      }

      spinButton.click();
      // Wait for animation (2000ms) + highlight (800ms) + question display delay (1000ms) + buffer
      await new Promise(resolve => setTimeout(resolve, CONFIG.ANIMATION_DURATION + CONFIG.HIGHLIGHT_DURATION + CONFIG.QUESTION_DISPLAY_DELAY + 500));

      // Additional wait to ensure DOM is updated
      await new Promise(resolve => setTimeout(resolve, 100));

      const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY));
      const correctAnswer = storedData?.currentAnswer;

      if (!correctAnswer) {
        throw new Error(`No correct answer found in localStorage at round ${round}. Stored data: ${JSON.stringify(storedData)}`);
      }

      const buttons = choiceButtons();
      const correctButton = buttons.find((button) => button.dataset.choice === correctAnswer);
      const incorrectButton = buttons.find((button) => button.dataset.choice !== correctAnswer);

      // Safety check to ensure buttons exist
      if (!correctButton || !incorrectButton) {
        throw new Error(`Buttons not found in round ${round}. Correct: ${correctAnswer}, Buttons: ${buttons.map(b => b.dataset.choice).join(', ')}`);
      }

      if (round === 0 || round === 1) {
        incorrectButton.click();
      } else {
        correctButton.click();
      }

      if (round < 7) {
        // Wait for feedback duration + additional buffer between rounds
        await new Promise(resolve => setTimeout(resolve, CONFIG.FEEDBACK_DURATION + 1000));
      }
    }

    const successRateDisplay = document.getElementById('successRate').textContent;
    expect(successRateDisplay).toMatch(/Success rate: 75%/);
    expect(feedbackEl.textContent).toMatch(/Unbelievable|LEGENDARY|PHENOMENAL|EXTRAORDINARY|MASTERFUL/i);
  }, 90000); // Increase timeout to 90 seconds for this slow test
});
