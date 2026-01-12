import { CONFIG } from '../config.js';

const POSITIVE_MESSAGES = [
  'Fantastic! 🌟',
  'Awesome job! 🎉',
  'You\'re a star! ⭐',
  'Brilliant! 💎',
  'Perfect! ✨',
  'Amazing! 🚀',
  'Incredible! 🔥',
  'Wonderful! 🌈',
  'Spectacular! 💫',
  'Outstanding! 🏆',
];

const ENCOURAGE_MESSAGES = [
  'Keep going! You\'ve got this! 💪',
  'Almost there! Try again! 🎯',
  'Don\'t give up! You can do it! 💖',
  'Practice makes perfect! 📚',
  'You\'re improving! Keep at it! 🌱',
  'Believe in yourself! ✨',
  'Every mistake is a lesson! 🎓',
  'You\'re doing great! 🌟',
];

const CELEBRATION_MESSAGES = [
  'Unbelievable! You\'re on fire! 🔥',
  'LEGENDARY! What a champion! 👑',
  'PHENOMENAL! You\'re unstoppable! ⚡',
  'EXTRAORDINARY! Pure talent! 🌟',
  'MASTERFUL! You\'re a pro! 🏆',
];

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
    this.messageIndex = Math.floor(Math.random() * 100);
  }

  getRandomMessage(messages) {
    this.messageIndex = (this.messageIndex + 1) % messages.length;
    return messages[this.messageIndex];
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
      ? this.getRandomMessage(CELEBRATION_MESSAGES)
      : this.getRandomMessage(POSITIVE_MESSAGES);
    this.showMessage(message, 'positive');
  }

  handleIncorrectAnswer(gameState) {
    this.renderTokens(gameState.tokens);
    this.renderStats({
      spinCount: gameState.spinCount,
      successRate: gameState.successRate,
    });
    const message = this.getRandomMessage(ENCOURAGE_MESSAGES);
    this.showMessage(message, 'encourage');
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
