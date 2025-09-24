import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { CONFIG } from '../../src/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadHtmlFixture() {
  const htmlPath = path.resolve(__dirname, '../../index.html');
  const rawHtml = readFileSync(htmlPath, 'utf-8');
  return rawHtml.replace(/<script[^>]*>.*?<\/script>/gs, '');
}

describe('CVC Spin Game smoke test', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
    localStorage.clear();
    document.documentElement.innerHTML = loadHtmlFixture();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('spins the wheel and surfaces a question with choices', async () => {
    await import('../../src/main.js');

    const spinButton = document.getElementById('spinButton');
    expect(spinButton).toBeTruthy();

    spinButton.click();
    jest.advanceTimersByTime(CONFIG.ANIMATION_DURATION + 20);

    const prompt = document.getElementById('questionPrompt').textContent;
    const choices = Array.from(document.querySelectorAll('.choice')).map((btn) => btn.textContent);

    expect(prompt).toMatch(/What is this\?/);
    expect(choices.filter(Boolean).length).toBe(3);
  });
});
