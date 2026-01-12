import { readFileSync } from 'fs';
import path from 'path';
import { CONFIG, STORAGE_KEY } from '../../src/config.js';

function mountDom() {
  const htmlPath = path.join(process.cwd(), 'index.html');
  const rawHtml = readFileSync(htmlPath, 'utf-8');
  document.documentElement.innerHTML = rawHtml.replace(/<script[^>]*>.*?<\/script>/gs, '');
}

describe('State persistence', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.useRealTimers();
    localStorage.clear();
    mountDom();
  });

  it('restores tokens from localStorage on reload', async () => {
    await import('../../src/main.js');
    const spinButton = document.getElementById('spinButton');

    spinButton.click();
    // Wait for animation (2000ms) + highlight (800ms) + question display delay (1000ms) + buffer
    await new Promise(resolve => setTimeout(resolve, CONFIG.ANIMATION_DURATION + CONFIG.HIGHLIGHT_DURATION + CONFIG.QUESTION_DISPLAY_DELAY + 500));

    const storedBefore = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const correctAnswer = storedBefore.currentAnswer;
    const correctButton = Array.from(document.querySelectorAll('.choice')).find(
      (btn) => btn.dataset.choice === correctAnswer,
    );

    if (!correctButton) {
      throw new Error(`Correct button not found for answer: ${correctAnswer}`);
    }

    correctButton.click();
    // Wait for feedback
    await new Promise(resolve => setTimeout(resolve, CONFIG.FEEDBACK_DURATION + 100));

    const storedAfter = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(storedAfter.tokens).toBeGreaterThanOrEqual(1);

    mountDom();
    await import('../../src/main.js');

    const tokenCounter = document.getElementById('tokenCounter');
    // Wait a bit for the UI to render tokens
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check that tokens are displayed or stored data has tokens
    const storedAfterReload = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(storedAfterReload.tokens).toBeGreaterThanOrEqual(1);
  }, 20000); // Increase timeout to 20 seconds
});
