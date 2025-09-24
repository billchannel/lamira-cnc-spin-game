import { CONFIG } from './config.js';
import { defaultGameStateStore } from './services/gameStateStore.js';
import { createQuestionFromRime } from './services/questionFactory.js';
import { WheelAnimation } from './services/wheelAnimation.js';
import { FeedbackService } from './services/feedbackService.js';
import { getDomBindings } from './ui/domBindings.js';
import { ViewController } from './ui/viewController.js';
import { registerInputHandlers } from './integration/inputHandlers.js';
import { registerPersistence } from './integration/statePersistence.js';
import { ensureRime } from './models/Rime.js';
import { getRandomRime, RIMES } from './data/rimes.js';

const bindings = getDomBindings(document);
const store = defaultGameStateStore;
let gameState = store.load();
let currentQuestion = null;
let isProcessingAnswer = false;

const feedbackService = new FeedbackService({
  feedbackEl: bindings.feedbackEl,
  tokenContainerEl: bindings.tokenCounter,
  spinCountEl: bindings.spinCount,
  successRateEl: bindings.successRate,
});

const viewController = new ViewController({
  bindings,
  feedbackService,
});

const wheelAnimation = new WheelAnimation(bindings.wheelEl, {
  duration: CONFIG.ANIMATION_DURATION,
  highlightDuration: CONFIG.HIGHLIGHT_DURATION,
});

function initialiseBoard() {
  viewController.updateGameStats(gameState);
  viewController.setSpinDisabled(false);
  bindings.choiceButtons.forEach((button) => {
    button.disabled = true;
  });
  createWheelSegments();
}

function spinWheel() {
  if (gameState.isSpinning || isProcessingAnswer) {
    return;
  }

  const ensuredRime = ensureRime(getRandomRime());

  viewController.setAllControlsDisabled(true);
  viewController.prepareForSpin();
  gameState = gameState.withSpinStart(ensuredRime.pattern);
  store.save(gameState);

  wheelAnimation.spinToRime(ensuredRime).then((result) => {
    setTimeout(() => {
      const question = createQuestionFromRime(ensuredRime);
      currentQuestion = question;
      gameState = gameState.withSpinResult(question.correctWord.text);
      store.save(gameState);
      viewController.displayQuestion(question, gameState);
      viewController.updateGameStats(gameState);
      isProcessingAnswer = false;
      viewController.setSpinDisabled(false);
    }, CONFIG.QUESTION_DISPLAY_DELAY);
  });
}

function handleChoice(choiceText, button) {
  if (!currentQuestion || isProcessingAnswer) {
    return;
  }
  const question = currentQuestion;
  isProcessingAnswer = true;
  const isCorrect = question.isCorrectAnswer(choiceText);

  if (isCorrect) {
    gameState = gameState.withCorrectAnswer();
    store.save(gameState);
    viewController.showCorrect(gameState, button);
  } else {
    gameState = gameState.withIncorrectAnswer();
    store.save(gameState);
    viewController.showIncorrect(gameState, button, question.correctWord);
  }

  viewController.updateGameStats(gameState);
  currentQuestion = null;
  isProcessingAnswer = false;
}

registerInputHandlers({
  spinButton: bindings.spinButton,
  choiceButtons: bindings.choiceButtons,
  onSpin: spinWheel,
  onChoice: handleChoice,
});

registerPersistence({
  store,
  getState: () => gameState,
});

function createWheelSegments() {
  const wheel = bindings.wheelEl;
  wheel.innerHTML = '';

  const segmentAngle = 360 / RIMES.length;

  RIMES.forEach((rime, index) => {
    const centerAngle = segmentAngle * index + segmentAngle / 2;
    const labelRadius = 35; // 55% from center (inner + (outer-inner) * 0.55)

    const segment = document.createElement('div');
    segment.className = 'wheel-segment';
    segment.textContent = rime.pattern;

    // Convert polar to cartesian coordinates
    const angleRad = (centerAngle - 90) * (Math.PI / 180); // -90 to start from top
    const x = Math.cos(angleRad) * labelRadius;
    const y = Math.sin(angleRad) * labelRadius;

    // Position label at calculated coordinates
    segment.style.position = 'absolute';
    segment.style.left = `calc(50% + ${x}%)`;
    segment.style.top = `calc(50% + ${y}%)`;
    segment.style.transform = 'translate(-50%, -50%)';

    segment.style.fontSize = 'clamp(0.8rem, 2.2vw, 1.1rem)';
    segment.style.fontWeight = '700';
    segment.style.color = '#ffffff';
    segment.style.textShadow = '1px 1px 3px rgba(0, 0, 0, 0.7)';
    segment.style.pointerEvents = 'none';
    segment.style.whiteSpace = 'nowrap';
    segment.style.textAlign = 'center';
    segment.style.lineHeight = '1';

    wheel.appendChild(segment);
  });

  // Add fixed pointer/arrow to wheel container
  const wheelContainer = wheel.parentElement;
  const pointer = document.createElement('div');
  pointer.className = 'wheel-pointer';
  pointer.innerHTML = '▼';
  pointer.setAttribute('aria-hidden', 'true');

  wheelContainer.appendChild(pointer);

  wheelAnimation.updateSegments(RIMES);
}

initialiseBoard();
