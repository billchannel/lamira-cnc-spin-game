import { readFileSync } from 'fs';
import path from 'path';
import { CONFIG } from '../../src/config.js';

function loadHtmlFixture() {
  const htmlPath = path.join(process.cwd(), 'index.html');
  const rawHtml = readFileSync(htmlPath, 'utf-8');
  return rawHtml.replace(/<script[^>]*>.*?<\/script>/gs, '');
}

describe('CVC Spin Game smoke test', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.useRealTimers();
    localStorage.clear();
    document.documentElement.innerHTML = loadHtmlFixture();
  });

  it('spins the wheel and surfaces a question with choices', async () => {
    await import('../../src/main.js');

    const spinButton = document.getElementById('spinButton');
    expect(spinButton).toBeTruthy();

    spinButton.click();
    // Wait for animation (2000ms) + highlight (800ms) + question display delay (1000ms) + buffer
    await new Promise(resolve => setTimeout(resolve, CONFIG.ANIMATION_DURATION + CONFIG.HIGHLIGHT_DURATION + CONFIG.QUESTION_DISPLAY_DELAY + 500));

    const prompt = document.getElementById('questionPrompt').textContent;
    const choices = Array.from(document.querySelectorAll('.choice')).map((btn) => btn.textContent);

    expect(prompt).toMatch(/What is this\?/);
    expect(choices.filter(Boolean).length).toBe(3);
  }, 15000); // Increase timeout to 15 seconds
});
