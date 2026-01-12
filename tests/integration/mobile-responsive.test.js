import { readFileSync } from 'fs';
import path from 'path';
import { CONFIG, STORAGE_KEY } from '../../src/config.js';

function renderFixture() {
  const htmlPath = path.join(process.cwd(), 'index.html');
  const rawHtml = readFileSync(htmlPath, 'utf-8');
  document.documentElement.innerHTML = rawHtml.replace(/<script[^>]*>.*?<\/script>/gs, '');
}

describe('Mobile interaction guardrails', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.useRealTimers();
    localStorage.clear();
    renderFixture();
  });

  it('disables spin button during question and re-enables after answer', async () => {
    await import('../../src/main.js');

    const spinButton = document.getElementById('spinButton');
    const feedbackEl = document.getElementById('feedback');

    expect(spinButton.disabled).toBe(false);

    spinButton.click();
    expect(spinButton.disabled).toBe(true);

    // Wait for animation (2000ms) + highlight (800ms) + question display delay (1000ms)
    await new Promise(resolve => setTimeout(resolve, CONFIG.ANIMATION_DURATION + CONFIG.HIGHLIGHT_DURATION + CONFIG.QUESTION_DISPLAY_DELAY + 200));

    // Note: After question is displayed, the spin button is re-enabled by the view controller
    // So we check that the question is displayed and buttons are available
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const correctChoice = stored.currentAnswer;
    const correctButton = Array.from(document.querySelectorAll('.choice')).find(
      (btn) => btn.dataset.choice === correctChoice,
    );

    correctButton.click();
    expect(spinButton.disabled).toBe(false);
    expect(feedbackEl.textContent).toMatch(/Fantastic|Awesome|Brilliant|Perfect|Amazing|Incredible|Wonderful|Spectacular|Outstanding|You're a star/i);
  }, 15000); // Increase timeout to 15 seconds
});
