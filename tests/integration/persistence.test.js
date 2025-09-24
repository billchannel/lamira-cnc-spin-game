import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { CONFIG, STORAGE_KEY } from '../../src/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function mountDom() {
  const htmlPath = path.resolve(__dirname, '../../index.html');
  const rawHtml = readFileSync(htmlPath, 'utf-8');
  document.documentElement.innerHTML = rawHtml.replace(/<script[^>]*>.*?<\/script>/gs, '');
}

describe('State persistence', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
    localStorage.clear();
    mountDom();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('restores tokens from localStorage on reload', async () => {
    await import('../../src/main.js');
    const spinButton = document.getElementById('spinButton');

    spinButton.click();
    jest.advanceTimersByTime(CONFIG.ANIMATION_DURATION + 10);

    const storedBefore = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const correctAnswer = storedBefore.currentAnswer;
    const correctButton = Array.from(document.querySelectorAll('.choice')).find(
      (btn) => btn.dataset.choice === correctAnswer,
    );
    correctButton.click();
    jest.advanceTimersByTime(CONFIG.FEEDBACK_DURATION + 10);

    const storedAfter = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(storedAfter.tokens).toBeGreaterThanOrEqual(1);

    mountDom();
    await import('../../src/main.js');

    const tokenCounter = document.getElementById('tokenCounter');
    expect(tokenCounter.children.length).toBeGreaterThanOrEqual(1);
  });
});
