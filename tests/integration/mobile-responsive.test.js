import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { CONFIG, STORAGE_KEY } from '../../src/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function renderFixture() {
  const htmlPath = path.resolve(__dirname, '../../index.html');
  const rawHtml = readFileSync(htmlPath, 'utf-8');
  document.documentElement.innerHTML = rawHtml.replace(/<script[^>]*>.*?<\/script>/gs, '');
}

describe('Mobile interaction guardrails', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
    localStorage.clear();
    renderFixture();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('disables spin button during question and re-enables after answer', async () => {
    await import('../../src/main.js');

    const spinButton = document.getElementById('spinButton');
    const feedbackEl = document.getElementById('feedback');

    expect(spinButton.disabled).toBe(false);

    spinButton.click();
    expect(spinButton.disabled).toBe(true);

    jest.advanceTimersByTime(CONFIG.ANIMATION_DURATION + 10);
    expect(spinButton.disabled).toBe(true);

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const correctChoice = stored.currentAnswer;
    const correctButton = Array.from(document.querySelectorAll('.choice')).find(
      (btn) => btn.dataset.choice === correctChoice,
    );

    correctButton.click();
    expect(spinButton.disabled).toBe(false);
    expect(feedbackEl.textContent).toMatch(/Great job|Amazing/i);
  });
});
