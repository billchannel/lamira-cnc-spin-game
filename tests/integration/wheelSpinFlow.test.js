import { WheelAnimation } from '../../src/services/wheelAnimation.js';
import { ViewController } from '../../src/ui/viewController.js';
import { FeedbackService } from '../../src/services/feedbackService.js';
import { RIMES } from '../../src/data/rimes.js';
import { CONFIG } from '../../src/config.js';

describe('Wheel Spin Flow Integration', () => {
  let wheelElement;
  let spinButton;
  let choiceButtons;
  let questionPrompt;
  let questionEmoji;
  let feedbackEl;
  let tokenCounter;
  let wheelAnimation;
  let viewController;
  let feedbackService;

  beforeEach(() => {
    document.body.innerHTML = `
      <div class="app">
        <div class="app__wheel-section">
          <div class="wheel" role="img" aria-label="Word family wheel"></div>
          <button id="spinButton" class="button button--primary" type="button">Spin!</button>
        </div>
        <div id="question" class="app__question">
          <div class="question__emoji" id="questionEmoji"></div>
          <p class="question__prompt" id="questionPrompt">Click spin to start!</p>
          <div class="question__choices" role="group" aria-label="Choose the matching word">
            <button class="choice" data-choice-index="0" type="button"></button>
            <button class="choice" data-choice-index="1" type="button"></button>
            <button class="choice" data-choice-index="2" type="button"></button>
          </div>
        </div>
        <div id="feedback" class="app__feedback"></div>
        <div class="status__tokens" id="tokenCounter"></div>
      </div>
    `;

    wheelElement = document.querySelector('.wheel');
    spinButton = document.getElementById('spinButton');
    choiceButtons = document.querySelectorAll('.choice');
    questionPrompt = document.getElementById('questionPrompt');
    questionEmoji = document.getElementById('questionEmoji');
    feedbackEl = document.getElementById('feedback');
    tokenCounter = document.getElementById('tokenCounter');

    feedbackService = new FeedbackService({
      feedbackEl,
      tokenContainerEl: tokenCounter,
      spinCountEl: document.createElement('div'),
      successRateEl: document.createElement('div'),
    });

    const bindings = {
      wheelEl: wheelElement,
      spinButton,
      choiceButtons,
      questionPrompt,
      questionEmoji,
      feedbackEl,
      tokenCounter,
    };

    viewController = new ViewController({
      bindings,
      feedbackService,
    });

    wheelAnimation = new WheelAnimation(wheelElement, {
      duration: CONFIG.ANIMATION_DURATION,
      highlightDuration: CONFIG.HIGHLIGHT_DURATION,
    });

    const segmentAngle = 360 / RIMES.length;

    RIMES.forEach((rime, index) => {
      const segment = document.createElement('div');
      segment.className = 'wheel-segment';
      segment.textContent = rime.pattern;
      segment.style.transform = `rotate(${segmentAngle * index + segmentAngle / 2}deg)`;
      segment.style.transformOrigin = '100% 100%';
      segment.style.position = 'absolute';
      segment.style.width = '50%';
      segment.style.height = '50%';
      segment.style.right = '0';
      segment.style.bottom = '0';
      segment.style.display = 'flex';
      segment.style.alignItems = 'center';
      segment.style.justifyContent = 'center';
      wheelElement.appendChild(segment);
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Complete Spin Flow', () => {
    it('should disable all controls during spin and re-enable after completion', async () => {
      const rime = RIMES[0];

      viewController.setAllControlsDisabled(true);
      viewController.prepareForSpin();

      expect(spinButton.disabled).toBe(true);
      choiceButtons.forEach(button => {
        expect(button.disabled).toBe(true);
      });

      await wheelAnimation.spinToRime(rime);

      setTimeout(() => {
        expect(spinButton.disabled).toBe(false);
      }, CONFIG.HIGHLIGHT_DURATION + CONFIG.QUESTION_DISPLAY_DELAY);
    });

    it('should show spinning text during animation', async () => {
      const rime = RIMES[0];

      viewController.setAllControlsDisabled(true);
      viewController.prepareForSpin();

      expect(questionPrompt.textContent).toBe('Spinning...');

      await wheelAnimation.spinToRime(rime);
    });

    it('should highlight the selected segment for the minimum duration', async () => {
      const rime = RIMES[0];
      const segmentIndex = Math.floor(rime.angleStart / (360 / RIMES.length));

      await wheelAnimation.spinToRime(rime);

      const segments = wheelElement.querySelectorAll('.wheel-segment');
      const highlightedSegment = segments[segmentIndex];

      expect(highlightedSegment.classList.contains('highlighted')).toBe(true);

      setTimeout(() => {
        expect(highlightedSegment.classList.contains('highlighted')).toBe(false);
      }, CONFIG.HIGHLIGHT_DURATION);
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper ARIA attributes during spin', async () => {
      const rime = RIMES[0];

      expect(wheelElement.getAttribute('role')).toBe('img');
      expect(wheelElement.getAttribute('aria-label')).toBe('Word family wheel');

      await wheelAnimation.spinToRime(rime);

      expect(wheelElement.getAttribute('role')).toBe('img');
      expect(wheelElement.getAttribute('aria-label')).toBe('Word family wheel');
    });

    it('should have appropriate button states for accessibility', async () => {
      const rime = RIMES[0];

      viewController.setAllControlsDisabled(true);

      expect(spinButton.disabled).toBe(true);
      choiceButtons.forEach(button => {
        expect(button.disabled).toBe(true);
      });

      await wheelAnimation.spinToRime(rime);

      setTimeout(() => {
        expect(spinButton.disabled).toBe(false);
      }, CONFIG.HIGHLIGHT_DURATION + CONFIG.QUESTION_DISPLAY_DELAY);
    });
  });

  describe('Timing Requirements', () => {
    it('should respect highlight duration timing', async () => {
      const rime = RIMES[0];
      const startTime = Date.now();

      await wheelAnimation.spinToRime(rime);

      const segments = wheelElement.querySelectorAll('.wheel-segment');
      const highlightedSegment = segments[0];

      expect(highlightedSegment.classList.contains('highlighted')).toBe(true);

      return new Promise((resolve) => {
        setTimeout(() => {
          const endTime = Date.now();
          const highlightTime = endTime - startTime;
          expect(highlightTime).toBeGreaterThanOrEqual(CONFIG.HIGHLIGHT_DURATION);
          resolve();
        }, CONFIG.HIGHLIGHT_DURATION);
      });
    });

    it('should complete question display within required timeframe', async () => {
      const rime = RIMES[0];
      const startTime = Date.now();

      await wheelAnimation.spinToRime(rime);

      setTimeout(() => {
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        const expectedMaxTime = CONFIG.ANIMATION_DURATION + CONFIG.HIGHLIGHT_DURATION + CONFIG.QUESTION_DISPLAY_DELAY;
        expect(totalTime).toBeLessThanOrEqual(expectedMaxTime + 100);
      }, CONFIG.HIGHLIGHT_DURATION + CONFIG.QUESTION_DISPLAY_DELAY);
    });
  });

  describe('Error Handling', () => {
    it('should prevent multiple simultaneous spins', async () => {
      const rime = RIMES[0];

      const firstSpin = wheelAnimation.spinToRime(rime);
      expect(wheelAnimation.isSpinning).toBe(true);

      await expect(wheelAnimation.spinToRime(rime)).rejects.toThrow('Wheel is already spinning');

      await firstSpin;
      expect(wheelAnimation.isSpinning).toBe(false);
    });
  });
});