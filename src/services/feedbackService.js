import { CONFIG } from '../config.js';

export class FeedbackService {
  constructor({
    feedbackEl,
    tokenContainerEl,
    spinCountEl,
    successRateEl,
  }) {
    this.feedbackEl = feedbackEl;
    this.tokenContainerEl = tokenContainerEl;
    this.spinCountEl = spinCountEl;
    this.successRateEl = successRateEl;
    this.timeoutId = null;
  }

  showMessage(message, tone = 'neutral') {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }
    this.feedbackEl.textContent = message;
    this.feedbackEl.dataset.tone = tone;
    this.timeoutId = window.setTimeout(() => {
      this.feedbackEl.textContent = '';
      this.feedbackEl.dataset.tone = 'neutral';
    }, CONFIG.FEEDBACK_DURATION);
  }

  renderTokens(tokenCount) {
    if (!this.tokenContainerEl) return;
    this.tokenContainerEl.innerHTML = '';
    const visibleTokens = Math.min(tokenCount, CONFIG.MAX_TOKENS_DISPLAY);
    for (let i = 0; i < visibleTokens; i += 1) {
      const token = document.createElement('span');
      token.className = 'token';
      token.setAttribute('aria-hidden', 'true');
      this.tokenContainerEl.appendChild(token);
    }
    this.tokenContainerEl.setAttribute('aria-label', `Tokens earned ${tokenCount}`);
  }

  renderStats({ spinCount, successRate }) {
    if (this.spinCountEl) {
      this.spinCountEl.textContent = `Spins: ${spinCount}`;
    }
    if (this.successRateEl) {
      const percent = Math.round(successRate * 100);
      this.successRateEl.textContent = `Success rate: ${percent}%`;
    }
  }

  handleCorrectAnswer(gameState) {
    this.renderTokens(gameState.tokens);
    this.renderStats({
      spinCount: gameState.spinCount,
      successRate: gameState.successRate,
    });
    const celebrate = gameState.shouldCelebrateSuccess();
    const message = celebrate
      ? 'Amazing! You are on a roll! 🎉'
      : 'Great job! You earned a token.';
    this.showMessage(message, 'positive');
  }

  handleIncorrectAnswer(gameState) {
    this.renderTokens(gameState.tokens);
    this.renderStats({
      spinCount: gameState.spinCount,
      successRate: gameState.successRate,
    });
    this.showMessage('Keep trying! You can do it!', 'encourage');
  }

  handleQuestionReady(gameState, emoji) {
    this.renderTokens(gameState.tokens ?? 0);
    this.renderStats({
      spinCount: gameState.spinCount ?? 0,
      successRate: gameState.successRate ?? 0,
    });
    this.showMessage(`Which word matches ${emoji}?`, 'prompt');
  }
}
