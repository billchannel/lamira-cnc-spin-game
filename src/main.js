import { CONFIG } from './config.js';
import { defaultGameStateStore } from './services/gameStateStore.js';
import { createQuestionFromRime } from './services/questionFactory.js';
import { WheelAnimation } from './services/wheelAnimation.js';
import { FeedbackService } from './services/feedbackService.js';
import { defaultAudioService } from './services/audioService.js';
import { defaultAchievementService } from './services/achievementService.js';
import { defaultGameSettings } from './services/gameSettings.js';
import { getDomBindings } from './ui/domBindings.js';
import { ViewController } from './ui/viewController.js';
import { registerInputHandlers } from './integration/inputHandlers.js';
import { registerPersistence } from './integration/statePersistence.js';
import { ensureRime } from './models/Rime.js';
import { getRandomRime, RIMES } from './data/rimes.js';
import { GameState } from './models/GameState.js';

// Register service worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('ServiceWorker registration successful:', registration.scope);
      },
      (error) => {
        console.log('ServiceWorker registration failed:', error);
      }
    );
  });
}

const bindings = getDomBindings(document);
const store = defaultGameStateStore;
const settings = defaultGameSettings;
let gameState = store.load();
let currentQuestion = null;
let currentRimePattern = null;
let isProcessingAnswer = false;
let comboCount = 0;
let comboDisplayElement = null;

const audioService = defaultAudioService;
audioService.enabled = settings.soundEnabled;
audioService.volume = settings.soundVolume;
audioService.soundTheme = settings.soundTheme;
audioService.pronunciationEnabled = gameState.getPronunciationEnabled();
audioService.pronunciationRate = gameState.getPronunciationRate();
audioService.pronunciationPitch = gameState.getPronunciationPitch();
const selectedVoice = gameState.getSelectedVoice();
if (selectedVoice && audioService.synth) {
  // Voice will be set when voices are loaded
}

const achievementService = defaultAchievementService;
achievementService.displayCallback = (achievement) => {
  showAchievementNotification(achievement);
};

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

// Apply game speed to animation
const speedMultiplier = settings.getSpeedMultiplier();
const wheelAnimation = new WheelAnimation(bindings.wheelEl, {
  duration: CONFIG.ANIMATION_DURATION * speedMultiplier,
  highlightDuration: CONFIG.HIGHLIGHT_DURATION * speedMultiplier,
});

function showAchievementNotification(achievement) {
  // Trigger confetti animation
  createConfetti();

  const notification = document.createElement('div');
  notification.className = 'achievement-notification';
  notification.innerHTML = `
    <span class="achievement-icon">${achievement.icon}</span>
    <div class="achievement-text">
      <div class="achievement-title">Achievement Unlocked!</div>
      <div class="achievement-name">${achievement.name}</div>
    </div>
  `;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 1000;
    animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
    font-family: 'Nunito', sans-serif;
  `;

  // Add animation keyframes if not already present
  if (!document.getElementById('achievement-animations')) {
    const style = document.createElement('style');
    style.id = 'achievement-animations';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);
  audioService.playTokenEarned();

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function createConfetti() {
  const colors = ['#f94144', '#f3722c', '#f9c74f', '#90be6d', '#577590', '#667eea', '#764ba2'];
  const confettiCount = 100;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';

    const x = Math.random() * 100;
    const y = -10;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const rotation = Math.random() * 360;
    const scale = Math.random() * 0.5 + 0.5;
    const duration = Math.random() * 2 + 2;
    const delay = Math.random() * 0.5;

    confetti.style.cssText = `
      position: fixed;
      left: ${x}%;
      top: ${y}%;
      width: 10px;
      height: 10px;
      background: ${color};
      transform: rotate(${rotation}deg) scale(${scale});
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      z-index: 9999;
      pointer-events: none;
      animation: confettiFall ${duration}s ease-in ${delay}s forwards;
    `;

    document.body.appendChild(confetti);

    setTimeout(() => {
      confetti.remove();
    }, (duration + delay) * 1000);
  }

  // Add confetti animation if not present
  if (!document.getElementById('confetti-animations')) {
    const style = document.createElement('style');
    style.id = 'confetti-animations';
    style.textContent = `
      @keyframes confettiFall {
        0% {
          transform: translateY(0) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

function showStreakCelebration(streak) {
  const messages = {
    3: { emoji: '🔥', text: 'Hot Streak!', subtitle: '3 in a row!' },
    5: { emoji: '⚡', text: 'On Fire!', subtitle: '5 in a row!' },
    10: { emoji: '💥', text: 'Unstoppable!', subtitle: '10 in a row!' },
    15: { emoji: '🌟', text: 'Incredible!', subtitle: '15 in a row!' },
    20: { emoji: '👑', text: 'Legendary!', subtitle: '20 in a row!' },
  };

  const celebration = messages[streak];
  if (!celebration) return;

  const overlay = document.createElement('div');
  overlay.className = 'streak-celebration';
  overlay.innerHTML = `
    <div class="streak-content">
      <div class="streak-emoji">${celebration.emoji}</div>
      <div class="streak-text">${celebration.text}</div>
      <div class="streak-subtitle">${celebration.subtitle}</div>
    </div>
  `;

  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;

  document.body.appendChild(overlay);

  // Add smaller confetti burst for streaks
  createConfetti();

  setTimeout(() => {
    overlay.style.animation = 'fadeOut 0.5s ease forwards';
    setTimeout(() => overlay.remove(), 500);
  }, 2000);

  // Add fadeIn/fadeOut animations if not present
  if (!document.getElementById('streak-animations')) {
    const style = document.createElement('style');
    style.id = 'streak-animations';
    style.textContent = `
      .streak-content {
        text-align: center;
        animation: popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }
      .streak-emoji {
        font-size: 5rem;
        animation: bounce 1s ease infinite;
      }
      .streak-text {
        font-size: 3rem;
        font-weight: 800;
        color: #fff;
        text-shadow: 0 4px 20px rgba(255, 107, 107, 0.8);
        margin-top: 1rem;
      }
      .streak-subtitle {
        font-size: 1.5rem;
        color: #feca57;
        font-weight: 600;
        margin-top: 0.5rem;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      @keyframes popIn {
        0% { transform: scale(0); }
        100% { transform: scale(1); }
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
      }
    `;
    document.head.appendChild(style);
  }
}

function getLevelTitle(level) {
  const titles = {
    1: 'Novice Reader',
    2: 'Novice Reader',
    3: 'Novice Reader',
    4: 'Word Apprentice',
    5: 'Word Apprentice',
    6: 'Word Apprentice',
    7: 'Word Wizard',
    8: 'Word Wizard',
    9: 'Word Wizard',
    10: 'Master Reader',
    11: 'Master Reader',
    12: 'Master Reader',
    13: 'Legendary Reader',
    14: 'Legendary Reader',
    15: 'Legendary Reader',
  };

  return titles[level] || 'Supreme Reader';
}

function showLevelUpCelebration(newLevel, previousLevel) {
  const title = getLevelTitle(newLevel);

  const overlay = document.createElement('div');
  overlay.className = 'level-up-celebration';
  overlay.innerHTML = `
    <div class="level-up-content">
      <div class="level-up-emoji">🎉</div>
      <div class="level-up-text">LEVEL UP!</div>
      <div class="level-up-number">Level ${newLevel}</div>
      <div class="level-up-title">${title}</div>
    </div>
  `;

  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(99, 102, 241, 0.3);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;

  document.body.appendChild(overlay);

  // Add extra confetti for level up
  createConfetti();
  setTimeout(() => createConfetti(), 300);
  setTimeout(() => createConfetti(), 600);

  setTimeout(() => {
    overlay.style.animation = 'fadeOut 0.5s ease forwards';
    setTimeout(() => overlay.remove(), 500);
  }, 3000);

  // Add level-up animations if not present
  if (!document.getElementById('level-up-animations')) {
    const style = document.createElement('style');
    style.id = 'level-up-animations';
    style.textContent = `
      .level-up-content {
        text-align: center;
        animation: levelUpPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }
      .level-up-emoji {
        font-size: 6rem;
        animation: sparkle 1s ease infinite;
      }
      .level-up-text {
        font-size: 2.5rem;
        font-weight: 900;
        background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-top: 1rem;
      }
      .level-up-number {
        font-size: 4rem;
        font-weight: 900;
        color: #fff;
        text-shadow: 0 0 30px rgba(99, 102, 241, 0.8), 0 0 60px rgba(168, 85, 247, 0.6);
        margin-top: 0.5rem;
      }
      .level-up-title {
        font-size: 1.5rem;
        color: #a855f7;
        font-weight: 700;
        margin-top: 0.5rem;
      }
      @keyframes levelUpPop {
        0% { transform: scale(0) rotate(-10deg); }
        50% { transform: scale(1.2) rotate(5deg); }
        100% { transform: scale(1) rotate(0deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

function showDailyRewardCelebration(bonus) {
  const overlay = document.createElement('div');
  overlay.className = 'daily-reward-celebration';
  overlay.innerHTML = `
    <div class="daily-reward-content">
      <div class="daily-reward-emoji">🎁</div>
      <div class="daily-reward-text">Daily Challenge Complete!</div>
      <div class="daily-reward-bonus">+${bonus} Tokens!</div>
      <div class="daily-reward-subtitle">Come back tomorrow for a new challenge!</div>
    </div>
  `;

  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(254, 202, 87, 0.3);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;

  document.body.appendChild(overlay);

  // Add confetti bursts
  createConfetti();
  setTimeout(() => createConfetti(), 200);
  setTimeout(() => createConfetti(), 400);

  audioService.playTokenEarned();

  setTimeout(() => {
    overlay.style.animation = 'fadeOut 0.5s ease forwards';
    setTimeout(() => overlay.remove(), 500);
  }, 2500);

  // Add daily-reward animations if not present
  if (!document.getElementById('daily-reward-animations')) {
    const style = document.createElement('style');
    style.id = 'daily-reward-animations';
    style.textContent = `
      .daily-reward-content {
        text-align: center;
        animation: rewardPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }
      .daily-reward-emoji {
        font-size: 6rem;
        animation: wiggle 0.5s ease-in-out infinite;
      }
      .daily-reward-text {
        font-size: 2rem;
        font-weight: 900;
        background: linear-gradient(135deg, #feca57, #ff6b6b);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-top: 1rem;
      }
      .daily-reward-bonus {
        font-size: 3.5rem;
        font-weight: 900;
        color: #feca57;
        text-shadow: 0 0 30px rgba(254, 202, 87, 0.8), 0 0 60px rgba(255, 107, 107, 0.6);
        margin-top: 0.5rem;
      }
      .daily-reward-subtitle {
        font-size: 1.2rem;
        color: #fff;
        font-weight: 600;
        margin-top: 0.5rem;
      }
      @keyframes rewardPop {
        0% { transform: scale(0) rotate(-5deg); }
        50% { transform: scale(1.1) rotate(3deg); }
        100% { transform: scale(1) rotate(0deg); }
      }
      @keyframes wiggle {
        0%, 100% { transform: rotate(-5deg); }
        50% { transform: rotate(5deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

function updateLevelDisplay() {
  const levelInfo = gameState.getLevelInfo();
  const currentLevelEl = document.getElementById('currentLevel');
  const xpFillEl = document.getElementById('xpFill');

  if (currentLevelEl) {
    currentLevelEl.textContent = levelInfo.level;
  }

  if (xpFillEl) {
    xpFillEl.style.width = `${levelInfo.progress * 100}%`;
  }
}

function updateComboDisplay() {
  if (!comboDisplayElement && comboCount >= 2) {
    comboDisplayElement = document.createElement('div');
    comboDisplayElement.className = 'combo-display';
    comboDisplayElement.innerHTML = `
      <div class="combo-label">COMBO</div>
      <div class="combo-count">x${comboCount}</div>
    `;
    comboDisplayElement.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: linear-gradient(135deg, #ff6b6b, #feca57);
      color: white;
      padding: 12px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
      z-index: 100;
      animation: slideInRight 0.3s ease, pulse 0.5s ease infinite;
      font-weight: 800;
      text-align: center;
    `;
    document.body.appendChild(comboDisplayElement);
  } else if (comboDisplayElement) {
    const countElement = comboDisplayElement.querySelector('.combo-count');
    if (countElement) {
      countElement.textContent = `x${comboCount}`;
    }
    // Scale up combo for higher values
    const scale = 1 + (comboCount - 2) * 0.05;
    comboDisplayElement.style.transform = `scale(${Math.min(scale, 1.5)})`;
  }
}

function createAnswerParticles(button, isCorrect) {
  if (!button || !isCorrect) return;

  const rect = button.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const particleCount = 12;
  const colors = ['#34d399', '#10b981', '#059669', '#047857', '#6ee7b7', '#a7f3d0'];

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    const angle = (i / particleCount) * Math.PI * 2;
    const distance = 60 + Math.random() * 40;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    particle.style.cssText = `
      left: ${centerX}px;
      top: ${centerY}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      --tx: ${tx}px;
      --ty: ${ty}px;
      box-shadow: 0 0 6px ${colors[Math.floor(Math.random() * colors.length)]};
    `;

    document.body.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 800);
  }
}

function hideComboDisplay() {
  if (comboDisplayElement) {
    comboDisplayElement.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => {
      if (comboDisplayElement) {
        comboDisplayElement.remove();
        comboDisplayElement = null;
      }
    }, 300);
  }
}

function showComboPopup(combo) {
  const popup = document.createElement('div');
  popup.className = 'combo-popup';

  const messages = {
    2: 'Double!',
    3: 'Triple!',
    4: 'Quad!',
    5: 'Amazing!',
    6: 'Incredible!',
    7: 'Unstoppable!',
    8: 'Godlike!',
    9: 'LEGENDARY!',
    10: 'PERFECT!'
  };

  const message = messages[Math.min(combo, 10)] || `${combo}x Combo!`;

  popup.innerHTML = `
    <div class="combo-popup-content">
      <div class="combo-popup-number">${combo}x</div>
      <div class="combo-popup-text">${message}</div>
    </div>
  `;

  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.95), rgba(254, 202, 87, 0.95));
    color: white;
    padding: 20px 40px;
    border-radius: 20px;
    box-shadow: 0 15px 40px rgba(255, 107, 107, 0.5);
    z-index: 1000;
    animation: comboPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    font-weight: 800;
    text-align: center;
  `;

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.style.animation = 'comboFadeOut 0.3s ease forwards';
    setTimeout(() => popup.remove(), 300);
  }, 800);

  // Add combo animations if not present
  if (!document.getElementById('combo-animations')) {
    const style = document.createElement('style');
    style.id = 'combo-animations';
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0) scale(1); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0) scale(1); opacity: 1; }
        to { transform: translateX(100px); opacity: 0; }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      @keyframes comboPop {
        0% { transform: translate(-50%, -50%) scale(0); }
        100% { transform: translate(-50%, -50%) scale(1); }
      }
      @keyframes comboFadeOut {
        from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        to { opacity: 0; transform: translate(-50%, -50%) scale(1.2); }
      }
      .combo-popup-number {
        font-size: 3rem;
        line-height: 1;
      }
      .combo-popup-text {
        font-size: 1.5rem;
        margin-top: 0.5rem;
      }
    `;
    document.head.appendChild(style);
  }
}

function createWheelSparkles() {
  const wheel = bindings.wheelEl;
  if (!wheel) return;

  const rect = wheel.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const radius = rect.width / 2;

  // Create sparkles around the wheel
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const sparkle = document.createElement('div');
      sparkle.className = 'wheel-sparkle';

      const angle = Math.random() * Math.PI * 2;
      const distance = radius * 0.6 + Math.random() * radius * 0.4;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;

      const size = Math.random() * 6 + 4;
      const colors = ['#FFD700', '#FFA500', '#FFFF00', '#ADFF2F', '#00CED1'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      sparkle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        animation: sparkle 0.6s ease-out forwards;
        box-shadow: 0 0 ${size * 2}px ${color};
      `;

      document.body.appendChild(sparkle);

      setTimeout(() => sparkle.remove(), 600);
    }, i * 50);
  }

  // Add sparkle animation if not present
  if (!document.getElementById('sparkle-animations')) {
    const style = document.createElement('style');
    style.id = 'sparkle-animations';
    style.textContent = `
      @keyframes sparkle {
        0% {
          transform: scale(0) rotate(0deg);
          opacity: 1;
        }
        50% {
          transform: scale(1.5) rotate(180deg);
          opacity: 1;
        }
        100% {
          transform: scale(0) rotate(360deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

function initialiseBoard() {
  viewController.updateGameStats(gameState);
  viewController.setSpinDisabled(false);
  bindings.choiceButtons.forEach((button) => {
    button.disabled = true;
  });
  createWheelSegments();
  updateLevelDisplay();
  initDailyChallenge();
  updatePowerUpsDisplay();
  updateMultiplayerDisplay();

  // Show tutorial for new players
  if (!gameState.getTutorialCompleted()) {
    setTimeout(() => {
      showTutorial();
    }, 500);
  }
}

function initDailyChallenge() {
  // Check if we need to reset the daily challenge
  if (gameState.needsDailyReset()) {
    gameState = gameState.withDailyReset();
    store.save(gameState);
  }
  updateDailyChallengeDisplay();
}

function updateDailyChallengeDisplay() {
  const challenge = gameState.getDailyChallenge();
  const progressEl = document.getElementById('dailyChallengeProgress');
  const targetEl = document.getElementById('dailyChallengeTarget');
  const daysEl = document.getElementById('consecutiveDays');
  const claimBtn = document.getElementById('claimDailyReward');

  if (progressEl) progressEl.textContent = challenge.progress;
  if (targetEl) targetEl.textContent = challenge.target;
  if (daysEl) daysEl.textContent = gameState.getConsecutiveDays();

  // Show claim button when challenge is completed but reward not claimed
  if (claimBtn) {
    if (challenge.completed && !challenge.rewardClaimed) {
      claimBtn.style.display = 'inline-block';
    } else {
      claimBtn.style.display = 'none';
    }
  }
}

function updatePowerUpsDisplay() {
  const powerUps = gameState.getPowerUps();
  const activePowerUp = gameState.getActivePowerUp();

  // Update power-up counts
  const hintCount = document.getElementById('hintShieldCount');
  const doubleCount = document.getElementById('doubleTokenCount');
  const freezeCount = document.getElementById('streakFreezeCount');

  if (hintCount) hintCount.textContent = powerUps.hintShield;
  if (doubleCount) doubleCount.textContent = powerUps.doubleToken;
  if (freezeCount) freezeCount.textContent = powerUps.streakFreeze;

  // Update button states
  const hintButton = document.getElementById('powerUpHint');
  const doubleButton = document.getElementById('powerUpDouble');
  const freezeButton = document.getElementById('powerUpFreeze');

  if (hintButton) {
    hintButton.disabled = !gameState.hasPowerUp('hintShield');
    hintButton.classList.toggle('active', activePowerUp === 'hintShield');
  }
  if (doubleButton) {
    doubleButton.disabled = !gameState.hasPowerUp('doubleToken');
    doubleButton.classList.toggle('active', activePowerUp === 'doubleToken');
  }
  if (freezeButton) {
    freezeButton.disabled = !gameState.hasPowerUp('streakFreeze');
    freezeButton.classList.toggle('active', activePowerUp === 'streakFreeze');
  }

  // Update active power-up indicator
  const indicator = document.getElementById('activePowerUpIndicator');
  const indicatorText = document.getElementById('activePowerUpText');

  if (indicator && indicatorText) {
    if (activePowerUp) {
      const powerUpNames = {
        hintShield: 'Hint Active - First letter revealed!',
        doubleToken: '2x Token Active - Double rewards!',
        streakFreeze: 'Streak Save Active - Protected!',
      };
      indicator.style.display = 'flex';
      indicatorText.textContent = powerUpNames[activePowerUp];
    } else {
      indicator.style.display = 'none';
    }
  }
}

function activatePowerUp(type) {
  if (!gameState.hasPowerUp(type)) {
    return;
  }

  gameState = gameState.activatePowerUp(type);
  store.save(gameState);
  updatePowerUpsDisplay();

  // Play activation sound
  audioService.playClick();

  // Show activation notification
  showPowerUpActivationNotification(type);
}

function showPowerUpActivationNotification(type) {
  const messages = {
    hintShield: '🛡️ Hint Shield activated! First letter will be revealed.',
    doubleToken: '💰 Double Token activated! Earn 2x tokens on next correct answer.',
    streakFreeze: '❄️ Streak Save activated! Your streak is protected once.',
  };

  const notification = document.createElement('div');
  notification.className = 'powerup-notification';
  notification.innerHTML = `
    <div class="powerup-notification-content">
      <div class="powerup-notification-text">${messages[type]}</div>
    </div>
  `;

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    z-index: 10000;
    animation: slideDown 0.3s ease;
    font-weight: 700;
    text-align: center;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideUp 0.3s ease forwards';
    setTimeout(() => notification.remove(), 300);
  }, 2500);

  if (!document.getElementById('powerup-notification-animations')) {
    const style = document.createElement('style');
    style.id = 'powerup-notification-animations';
    style.textContent = `
      @keyframes slideUp {
        from {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        to {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }
      }
    `;
    document.head.appendChild(style);
  }
}

function spinWheel() {
  if (gameState.isSpinning || isProcessingAnswer) {
    return;
  }

  audioService.init(); // Initialize audio on first user interaction
  audioService.playSpin();

  // Create sparkle effect during spin
  createWheelSparkles();

  const ensuredRime = ensureRime(getRandomRime());
  currentRimePattern = ensuredRime.pattern;

  viewController.setAllControlsDisabled(true);
  viewController.prepareForSpin();
  gameState = gameState.withSpinStart(ensuredRime.pattern);
  store.save(gameState);

  // Check for spin-related achievements
  achievementService.checkAchievements(gameState);

  const questionDelay = CONFIG.QUESTION_DISPLAY_DELAY * settings.getSpeedMultiplier();

  wheelAnimation.spinToRime(ensuredRime).then((result) => {
    setTimeout(() => {
      // Create question with current difficulty setting
      const question = createQuestionFromRime(ensuredRime, {
        difficulty: settings.difficulty,
        randomizeChoices: true,
      });
      currentQuestion = question;
      gameState = gameState.withSpinResult(question.correctWord.text);
      store.save(gameState);

      // Update hint display based on difficulty
      updateHintDisplay(question);

      viewController.displayQuestion(question, gameState);
      viewController.updateGameStats(gameState);
      isProcessingAnswer = false;
      viewController.setSpinDisabled(false);
    }, questionDelay);
  });
}

function updateHintDisplay(question) {
  const hintEl = document.getElementById('hintDisplay');
  if (hintEl) {
    const hint = question.getHint();
    hintEl.textContent = hint;
    hintEl.style.display = hint ? 'block' : 'none';
  }

  // Show/hide emoji based on difficulty
  const config = { easy: { showEmoji: true }, medium: { showEmoji: true }, hard: { showEmoji: false } };
  const emojiEl = document.getElementById('questionEmoji');
  if (emojiEl) {
    emojiEl.style.display = config[question.difficulty]?.showEmoji !== false ? 'block' : 'none';
  }
}

function handleChoice(choiceText, button) {
  if (!currentQuestion || isProcessingAnswer) {
    return;
  }
  audioService.playClick();
  const question = currentQuestion;
  isProcessingAnswer = true;
  const isCorrect = question.isCorrectAnswer(choiceText);
  const previousStreak = gameState.currentStreak;

  // Update word family progress
  settings.updateWordFamilyProgress(currentRimePattern, isCorrect);
  updateProgressDisplay();

  // Handle multiplayer mode
  const isMultiplayer = gameState.getMultiplayerMode();
  const currentPlayer = gameState.getCurrentPlayer();

  if (isCorrect) {
    const previousLevel = gameState.level;
    const previousXP = gameState.experiencePoints;

    if (isMultiplayer) {
      // Update multiplayer score
      gameState = gameState.withPlayerCorrectAnswer(currentPlayer);
      gameState = gameState.withNextPlayer();
      store.save(gameState);
      updateMultiplayerScores();

      // Check for winner (first to 10)
      if (gameState.getPlayerScore(currentPlayer === 1 ? 1 : 2) >= 10) {
        setTimeout(() => {
          const winner = gameState.getWinner();
          showMultiplayerWinner(winner);
        }, 1000);
      }
    } else {
      gameState = gameState.withCorrectAnswer();
      store.save(gameState);
    }

    // Check for level up (single player only)
    if (!isMultiplayer) {
      const newLevel = gameState.level;
      if (newLevel > previousLevel) {
        // Grant power-ups on level up
        gameState = gameState.withLevelUpPowerUps(newLevel);
        store.save(gameState);
        updatePowerUpsDisplay();

        showLevelUpCelebration(newLevel, previousLevel);
        // Check for level achievements
        achievementService.checkLevelAchievements(newLevel);
      }

      // Update level display
      updateLevelDisplay();

      // Update combo
      comboCount++;
      updateComboDisplay();

      // Update streak indicator
      updateStreakIndicator(gameState.currentStreak);

      // Play enhanced sounds for combos
      if (comboCount >= 5) {
        audioService.playCorrect();
        // Play additional token sound for combo
        setTimeout(() => audioService.playTokenEarned(), 100);
      } else {
        audioService.playCorrect();
      }
      audioService.playTokenEarned();

      // Speak the correct word for pronunciation learning
      if (question.correctWord && question.correctWord.text) {
        setTimeout(() => {
          audioService.speakWord(question.correctWord.text);
        }, 500);
      }

      // Track word family for achievements
      achievementService.trackCorrectAnswer(question.correctWord.text, currentRimePattern);

      // Check for streak celebration milestones
      const newStreak = gameState.currentStreak;
      if (newStreak > previousStreak && [3, 5, 10, 15, 20].includes(newStreak)) {
        showStreakCelebration(newStreak);
      }

      // Show combo popup
      if (comboCount >= 2) {
        showComboPopup(comboCount);
      }
    }

    viewController.showCorrect(gameState, button);

    // Create particle effect for correct answer
    createAnswerParticles(button, true);
  } else {
    if (isMultiplayer) {
      // Update multiplayer streak reset
      gameState = gameState.withPlayerIncorrectAnswer(currentPlayer);
      gameState = gameState.withNextPlayer();
      store.save(gameState);
      updateMultiplayerScores();
    } else {
      gameState = gameState.withIncorrectAnswer();
      store.save(gameState);

      // Reset combo on incorrect answer
      comboCount = 0;
      hideComboDisplay();

      // Update streak indicator (resets to 0)
      updateStreakIndicator(0);
    }

    audioService.playIncorrect();
    viewController.showIncorrect(gameState, button, question.correctWord);
  }

  // Check for achievements after state update (single player only)
  if (!isMultiplayer) {
    achievementService.checkAchievements(gameState);

    // Update daily challenge progress (for correct answers)
    if (isCorrect) {
      gameState = gameState.withDailyProgress();
      store.save(gameState);
      updateDailyChallengeDisplay();
    }
  }

  viewController.updateGameStats(gameState);
  currentQuestion = null;
  currentRimePattern = null;
  isProcessingAnswer = false;
}

function updateStreakIndicator(streak) {
  const streakIndicator = document.getElementById('streakIndicator');
  const streakCount = document.getElementById('currentStreak');

  if (streakIndicator && streakCount) {
    streakCount.textContent = streak;

    if (streak >= 2) {
      streakIndicator.classList.add('active');
    } else {
      streakIndicator.classList.remove('active');
    }

    // Update emoji based on streak level
    const streakIcon = streakIndicator.querySelector('.streak-icon');
    if (streakIcon) {
      const emojis = ['🔥', '⚡', '💥', '🌟', '👑'];
      const emojiIndex = Math.min(Math.floor(streak / 5), emojis.length - 1);
      streakIcon.textContent = emojis[emojiIndex];
    }
  }
}

function updateProgressDisplay() {
  const progressBars = document.querySelectorAll('.word-family-progress');
  progressBars.forEach(progressBar => {
    const rime = progressBar.dataset.rime;
    const progress = settings.getWordFamilyProgress(rime);
    const percentage = progress.total > 0 ? (progress.correct / progress.total) * 100 : 0;

    const fill = progressBar.querySelector('.progress-fill');
    const count = progressBar.querySelector('.progress-count');

    if (fill) fill.style.width = `${percentage}%`;
    if (count) count.textContent = `${progress.correct}/${progress.total}`;
  });
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

// Sound toggle functionality
const soundToggle = document.getElementById('soundToggle');
if (soundToggle) {
  soundToggle.addEventListener('click', () => {
    audioService.init();
    const enabled = audioService.toggle();
    settings.soundEnabled = enabled;
    const icon = soundToggle.querySelector('.sound-icon');
    if (icon) {
      icon.textContent = enabled ? '🔊' : '🔇';
    }
    soundToggle.setAttribute('aria-pressed', !enabled);
  });
}

// Difficulty selector functionality
const difficultyButtons = document.querySelectorAll('.difficulty-button');
difficultyButtons.forEach(button => {
  button.addEventListener('click', () => {
    const difficulty = button.dataset.difficulty;
    settings.difficulty = difficulty;

    difficultyButtons.forEach(b => {
      b.setAttribute('aria-pressed', b.dataset.difficulty === difficulty);
    });
  });
});

// Settings modal functionality
const settingsButton = document.getElementById('settingsButton');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');

if (settingsButton && settingsModal) {
  settingsButton.addEventListener('click', () => {
    settingsModal.showModal();
    updateSettingsDisplay();
  });
}

if (closeSettings) {
  closeSettings.addEventListener('click', () => {
    settingsModal.close();
  });

  // Close on backdrop click
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      settingsModal.close();
    }
  });
}

// Help modal functionality
const helpButton = document.getElementById('helpButton');
const helpModal = document.getElementById('helpModal');
const closeHelp = document.getElementById('closeHelp');

if (helpButton && helpModal) {
  helpButton.addEventListener('click', () => {
    helpModal.showModal();
  });
}

if (closeHelp) {
  closeHelp.addEventListener('click', () => {
    helpModal.close();
  });

  // Close on backdrop click
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
      helpModal.close();
    }
  });
}

// Statistics modal functionality
const statsModal = document.getElementById('statsModal');
const viewStatsButton = document.getElementById('viewStatsButton');
const closeStats = document.getElementById('closeStats');

if (viewStatsButton && statsModal) {
  viewStatsButton.addEventListener('click', () => {
    updateStatisticsDisplay();
    statsModal.showModal();
  });
}

if (closeStats) {
  closeStats.addEventListener('click', () => {
    statsModal.close();
  });

  statsModal.addEventListener('click', (e) => {
    if (e.target === statsModal) {
      statsModal.close();
    }
  });
}

function updateStatisticsDisplay() {
  // Update main stats
  document.getElementById('statTotalSpins').textContent = gameState.spinCount;
  document.getElementById('statCorrectAnswers').textContent = gameState.correctAnswers;
  document.getElementById('statSuccessRate').textContent = `${Math.round(gameState.successRate * 100)}%`;
  document.getElementById('statBestStreak').textContent = gameState.bestStreak;
  document.getElementById('statTotalTokens').textContent = gameState.tokens;
  document.getElementById('statAchievements').textContent = `${achievementService.getUnlockedCount()}/38`;

  // Update level stats
  const levelInfo = gameState.getLevelInfo();
  document.getElementById('statLevel').textContent = levelInfo.level;
  document.getElementById('statTotalXP').textContent = levelInfo.totalXP;

  // Update word family mastery
  const masteryGrid = document.getElementById('masteryGrid');
  if (masteryGrid) {
    const wordFamilies = [
      '-at', '-og', '-ip', '-et', '-ub', '-an', '-ig', '-op', '-en', '-ug',
      '-ut', '-ot', '-un', '-am', '-ed', '-ap', '-id', '-in', '-it', '-ix',
      '-ack', '-ell', '-ill', '-uck', '-um', '-ush'
    ];
    const progress = settings.getAllProgress();

    masteryGrid.innerHTML = wordFamilies.map(family => {
      const familyProgress = progress[family] || { correct: 0, total: 0 };
      const isMastered = familyProgress.correct >= 3;
      return `
        <div class="mastery-item ${isMastered ? 'mastered' : ''}">
          <div class="mastery-pattern">${family}</div>
          <div class="mastery-status">${familyProgress.correct}/${familyProgress.total}</div>
        </div>
      `;
    }).join('');
  }

  // Update difficulty stats (placeholder - would need tracking per difficulty)
  const easyPercent = Math.min(100, Math.round((gameState.spinCount > 0 ? gameState.correctAnswers / gameState.spinCount : 0) * 100));
  const mediumPercent = Math.min(100, Math.round((gameState.spinCount > 0 ? gameState.correctAnswers / gameState.spinCount : 0) * 100));
  const hardPercent = Math.min(100, Math.round((gameState.spinCount > 0 ? gameState.correctAnswers / gameState.spinCount : 0) * 100));

  document.getElementById('easyProgress').style.width = `${easyPercent}%`;
  document.getElementById('easyPercent').textContent = `${easyPercent}%`;
  document.getElementById('mediumProgress').style.width = `${mediumPercent}%`;
  document.getElementById('mediumPercent').textContent = `${mediumPercent}%`;
  document.getElementById('hardProgress').style.width = `${hardPercent}%`;
  document.getElementById('hardPercent').textContent = `${hardPercent}%`;
}

function updateSettingsDisplay() {
  // Update speed buttons
  const speedButtons = document.querySelectorAll('.speed-button');
  speedButtons.forEach(button => {
    button.setAttribute('aria-pressed', button.dataset.speed === settings.gameSpeed);
  });

  // Update volume slider
  const volumeSlider = document.getElementById('volumeSlider');
  const volumeValue = document.querySelector('.volume-value');
  if (volumeSlider && volumeValue) {
    volumeSlider.value = settings.soundVolume * 100;
    volumeValue.textContent = `${Math.round(settings.soundVolume * 100)}%`;
  }

  // Update sound theme buttons
  const themeButtons = document.querySelectorAll('.theme-button');
  themeButtons.forEach(button => {
    button.setAttribute('aria-pressed', button.dataset.theme === settings.soundTheme);
  });

  // Update music toggle
  const musicToggle = document.getElementById('musicToggle');
  if (musicToggle) {
    const musicEnabled = audioService.isMusicEnabled();
    musicToggle.setAttribute('aria-pressed', musicEnabled);
    const musicLabel = musicToggle.querySelector('.music-label');
    if (musicLabel) {
      musicLabel.textContent = musicEnabled ? 'Music Enabled' : 'Enable Ambient Music';
    }
  }

  // Update music volume slider
  const musicVolumeSlider = document.getElementById('musicVolumeSlider');
  const musicVolumeValue = document.getElementById('musicVolumeValue');
  if (musicVolumeSlider && musicVolumeValue) {
    const musicVolume = audioService.getMusicVolume();
    musicVolumeSlider.value = musicVolume * 100;
    musicVolumeValue.textContent = `${Math.round(musicVolume * 100)}%`;
  }

  // Update pronunciation toggle
  const pronunciationToggle = document.getElementById('pronunciationToggle');
  if (pronunciationToggle) {
    const pronunciationEnabled = audioService.isPronunciationEnabled();
    pronunciationToggle.setAttribute('aria-pressed', pronunciationEnabled);
    const pronunciationLabel = pronunciationToggle.querySelector('.pronunciation-label');
    if (pronunciationLabel) {
      pronunciationLabel.textContent = pronunciationEnabled ? 'Pronunciation Enabled' : 'Speak Words Aloud';
    }
  }

  // Update pronunciation rate slider
  const pronunciationRateSlider = document.getElementById('pronunciationRateSlider');
  const pronunciationRateValue = document.getElementById('pronunciationRateValue');
  if (pronunciationRateSlider && pronunciationRateValue) {
    const rate = audioService.pronunciationRate;
    pronunciationRateSlider.value = rate * 100;
    pronunciationRateValue.textContent = `${Math.round(rate * 100)}%`;
  }

  // Update pronunciation pitch slider
  const pronunciationPitchSlider = document.getElementById('pronunciationPitchSlider');
  const pronunciationPitchValue = document.getElementById('pronunciationPitchValue');
  if (pronunciationPitchSlider && pronunciationPitchValue) {
    const pitch = audioService.pronunciationPitch;
    pronunciationPitchSlider.value = pitch * 100;
    pronunciationPitchValue.textContent = `${Math.round(pitch * 100)}%`;
  }

  // Update high contrast toggle
  const highContrastToggle = document.getElementById('highContrastToggle');
  if (highContrastToggle) {
    highContrastToggle.setAttribute('aria-pressed', settings.highContrastMode);
  }

  // Update statistics
  document.getElementById('totalSpins').textContent = gameState.spinCount;
  document.getElementById('bestStreak').textContent = gameState.bestStreak || 0;
  document.getElementById('achievementCount').textContent = achievementService.getUnlockedCount();
}

// Speed selector functionality
const speedButtons = document.querySelectorAll('.speed-button');
speedButtons.forEach(button => {
  button.addEventListener('click', () => {
    const speed = button.dataset.speed;
    settings.gameSpeed = speed;

    speedButtons.forEach(b => {
      b.setAttribute('aria-pressed', b.dataset.speed === speed);
    });

    // Apply new speed (requires reload)
    location.reload();
  });
});

// Sound theme selector functionality
const themeButtons = document.querySelectorAll('.theme-button');
themeButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    // Check if preview button was clicked
    if (e.target.classList.contains('theme-preview')) {
      e.stopPropagation();
      const theme = button.dataset.theme;
      audioService.init();
      audioService.playThemePreview(theme);
      return;
    }

    // Change theme
    const theme = button.dataset.theme;
    settings.soundTheme = theme;
    audioService.soundTheme = theme;

    themeButtons.forEach(b => {
      b.setAttribute('aria-pressed', b.dataset.theme === theme);
    });
  });
});

// Volume slider functionality
const volumeSlider = document.getElementById('volumeSlider');
if (volumeSlider) {
  volumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value / 100;
    settings.soundVolume = volume;
    audioService.volume = volume;

    const volumeValue = document.querySelector('.volume-value');
    if (volumeValue) {
      volumeValue.textContent = `${e.target.value}%`;
    }
  });
}

// Background music toggle functionality
const musicToggle = document.getElementById('musicToggle');
if (musicToggle) {
  musicToggle.addEventListener('click', () => {
    audioService.init();
    const isEnabled = audioService.toggleBackgroundMusic();
    musicToggle.setAttribute('aria-pressed', isEnabled);

    const musicLabel = musicToggle.querySelector('.music-label');
    if (musicLabel) {
      musicLabel.textContent = isEnabled ? 'Music Enabled' : 'Enable Ambient Music';
    }
  });
}

// Music volume slider functionality
const musicVolumeSlider = document.getElementById('musicVolumeSlider');
if (musicVolumeSlider) {
  musicVolumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value / 100;
    audioService.setMusicVolume(volume);

    const musicVolumeValue = document.getElementById('musicVolumeValue');
    if (musicVolumeValue) {
      musicVolumeValue.textContent = `${e.target.value}%`;
    }
  });
}

// Pronunciation controls
const pronunciationToggle = document.getElementById('pronunciationToggle');
if (pronunciationToggle) {
  pronunciationToggle.setAttribute('aria-pressed', gameState.getPronunciationEnabled());
  pronunciationToggle.addEventListener('click', () => {
    audioService.init();
    const isEnabled = audioService.togglePronunciation();
    gameState = gameState.withPronunciationEnabled(isEnabled);
    store.save(gameState);
    pronunciationToggle.setAttribute('aria-pressed', isEnabled);
  });
}

const pronunciationRateSlider = document.getElementById('pronunciationRateSlider');
const pronunciationRateValue = document.getElementById('pronunciationRateValue');
if (pronunciationRateSlider && pronunciationRateValue) {
  const rate = gameState.getPronunciationRate();
  pronunciationRateSlider.value = rate * 100;
  pronunciationRateValue.textContent = `${Math.round(rate * 100)}%`;

  pronunciationRateSlider.addEventListener('input', (e) => {
    const rateValue = e.target.value / 100;
    audioService.setPronunciationRate(rateValue);
    gameState = gameState.withPronunciationRate(rateValue);
    store.save(gameState);
    pronunciationRateValue.textContent = `${e.target.value}%`;
  });
}

const pronunciationPitchSlider = document.getElementById('pronunciationPitchSlider');
const pronunciationPitchValue = document.getElementById('pronunciationPitchValue');
if (pronunciationPitchSlider && pronunciationPitchValue) {
  const pitch = gameState.getPronunciationPitch();
  pronunciationPitchSlider.value = pitch * 100;
  pronunciationPitchValue.textContent = `${Math.round(pitch * 100)}%`;

  pronunciationPitchSlider.addEventListener('input', (e) => {
    const pitchValue = e.target.value / 100;
    audioService.setPronunciationPitch(pitchValue);
    gameState = gameState.withPronunciationPitch(pitchValue);
    store.save(gameState);
    pronunciationPitchValue.textContent = `${e.target.value}%`;
  });
}

const voiceSelector = document.getElementById('voiceSelector');
if (voiceSelector && audioService.synth) {
  // Populate voice selector when voices are loaded
  const loadVoices = () => {
    const voices = audioService.getAvailableVoices();
    voiceSelector.innerHTML = '<option value="">Default Voice</option>';
    voices.forEach(voice => {
      const option = document.createElement('option');
      option.value = voice.voiceURI;
      option.textContent = `${voice.name} (${voice.lang})`;
      voiceSelector.appendChild(option);
    });

    // Set selected voice
    const selectedVoice = gameState.getSelectedVoice();
    if (selectedVoice) {
      voiceSelector.value = selectedVoice;
    }
  };

  // Load voices immediately and on voice changes
  if (audioService.synth.getVoices().length > 0) {
    loadVoices();
  }
  audioService.synth.onvoiceschanged = loadVoices;

  voiceSelector.addEventListener('change', (e) => {
    const voiceURI = e.target.value;
    audioService.setVoice(voiceURI);
    gameState = gameState.withSelectedVoice(voiceURI || null);
    store.save(gameState);
  });
}

const testPronunciationButton = document.getElementById('testPronunciation');
if (testPronunciationButton) {
  testPronunciationButton.addEventListener('click', () => {
    audioService.init();
    audioService.speakWord('cat'); // Test with a simple CVC word
  });
}

// Reset progress functionality
const resetButton = document.getElementById('resetProgress');
if (resetButton) {
  resetButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      store.clear();
      settings.reset();
      achievementService.reset();
      location.reload();
    }
  });
}

// Daily reward claim functionality
const claimRewardButton = document.getElementById('claimDailyReward');
if (claimRewardButton) {
  claimRewardButton.addEventListener('click', () => {
    const challenge = gameState.getDailyChallenge();
    if (challenge.completed && !challenge.rewardClaimed) {
      gameState = gameState.withClaimedDailyReward();
      store.save(gameState);
      updateDailyChallengeDisplay();

      // Show celebration for claiming reward
      showDailyRewardCelebration(gameState.getDailyBonus());
    }
  });
}

// Power-up buttons functionality
document.getElementById('powerUpHint')?.addEventListener('click', () => {
  activatePowerUp('hintShield');
});

document.getElementById('powerUpDouble')?.addEventListener('click', () => {
  activatePowerUp('doubleToken');
});

document.getElementById('powerUpFreeze')?.addEventListener('click', () => {
  activatePowerUp('streakFreeze');
});

// Shop modal functionality
const shopButton = document.getElementById('shopButton');
const shopModal = document.getElementById('shopModal');
const closeShop = document.getElementById('closeShop');

if (shopButton && shopModal) {
  shopButton.addEventListener('click', () => {
    updateShopDisplay();
    shopModal.showModal();
  });
}

if (closeShop) {
  closeShop.addEventListener('click', () => {
    shopModal.close();
  });

  // Close on backdrop click
  shopModal.addEventListener('click', (e) => {
    if (e.target === shopModal) {
      shopModal.close();
    }
  });
}

function updateShopDisplay() {
  // Update token display
  const shopTokenCount = document.getElementById('shopTokenCount');
  if (shopTokenCount) {
    shopTokenCount.textContent = gameState.tokens;
  }

  // Update all shop items
  const shopItems = document.querySelectorAll('.shop-item');
  const shopItemsConfig = GameState.getShopItems();

  shopItems.forEach(item => {
    const itemId = item.dataset.item;
    const buyButton = item.querySelector('.shop-item-buy');
    const price = shopItemsConfig[itemId]?.price || 0;
    const itemType = shopItemsConfig[itemId]?.type;

    if (!buyButton) return;

    // Check if player can afford the item
    const canAfford = gameState.tokens >= price;

    // For cosmetics, check if already purchased
    const alreadyOwned = itemType === 'cosmetic' && gameState.hasSkin(itemId);

    // Update button state
    if (alreadyOwned) {
      buyButton.textContent = 'Owned';
      buyButton.disabled = true;
      item.classList.add('owned');
    } else if (!canAfford) {
      buyButton.disabled = true;
      item.classList.add('cannot-afford');
    } else {
      buyButton.disabled = false;
      buyButton.textContent = 'Buy';
      item.classList.remove('owned', 'cannot-afford');
    }
  });
}

// Shop buy button handlers
document.querySelectorAll('.shop-item-buy').forEach(button => {
  button.addEventListener('click', (e) => {
    const itemId = button.dataset.item;
    handleShopPurchase(itemId);
  });
});

function handleShopPurchase(itemId) {
  const shopItemsConfig = GameState.getShopItems();
  const itemConfig = shopItemsConfig[itemId];

  if (!itemConfig) return;

  const price = itemConfig.price;
  const itemType = itemConfig.type;

  // Check if player can afford
  if (gameState.tokens < price) {
    showShopNotification('Not enough tokens!', 'error');
    return;
  }

  // Process purchase based on type
  if (itemType === 'powerup') {
    // Grant power-up
    gameState = gameState.withPowerUpBonus(itemId, 1);
    store.save(gameState);
    updatePowerUpsDisplay();
    showShopNotification(`Purchased ${itemConfig.name}!`, 'success');
  } else if (itemType === 'cosmetic') {
    // Check if already owned
    if (gameState.hasSkin(itemId)) {
      showShopNotification('You already own this!', 'error');
      return;
    }

    // Purchase cosmetic
    const newGameState = gameState.purchaseSkin(itemId, price);
    if (!newGameState) {
      showShopNotification('Purchase failed!', 'error');
      return;
    }

    gameState = newGameState;
    store.save(gameState);
    showShopNotification(`Purchased ${itemConfig.name}!`, 'success');

    // Apply skin if it's a wheel skin
    if (itemId.startsWith('wheelSkin')) {
      applyWheelSkin(itemId);
    }
  }

  // Update display
  updateShopDisplay();
  viewController.updateGameStats(gameState);

  // Play purchase sound
  audioService.playTokenEarned();
}

function showShopNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `shop-notification ${type}`;
  notification.innerHTML = `
    <div class="shop-notification-content">
      <div class="shop-notification-icon">${type === 'success' ? '✅' : '❌'}</div>
      <div class="shop-notification-text">${message}</div>
    </div>
  `;

  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    background: ${type === 'success'
      ? 'linear-gradient(135deg, #10b981, #059669)'
      : 'linear-gradient(135deg, #ef4444, #dc2626)'};
    color: white;
    padding: 1.5rem 2rem;
    border-radius: 16px;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
    z-index: 10001;
    display: flex;
    align-items: center;
    gap: 1rem;
    font-weight: 700;
    animation: shopNotificationPop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'shopNotificationFade 0.3s ease forwards';
    setTimeout(() => notification.remove(), 300);
  }, 2000);

  // Add animations if not present
  if (!document.getElementById('shop-notification-animations')) {
    const style = document.createElement('style');
    style.id = 'shop-notification-animations';
    style.textContent = `
      @keyframes shopNotificationPop {
        0% { transform: translate(-50%, -50%) scale(0); }
        100% { transform: translate(-50%, -50%) scale(1); }
      }
      @keyframes shopNotificationFade {
        from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        to { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
      }
    `;
    document.head.appendChild(style);
  }
}

function applyWheelSkin(skinId) {
  const wheel = bindings.wheelEl;

  // Remove existing skin classes
  wheel.classList.remove('wheel-skin-space', 'wheel-skin-ocean', 'wheel-skin-rainbow');

  // Apply new skin class
  const skinClasses = {
    wheelSkinSpace: 'wheel-skin-space',
    wheelSkinOcean: 'wheel-skin-ocean',
    wheelSkinRainbow: 'wheel-skin-rainbow',
  };

  const skinClass = skinClasses[skinId];
  if (skinClass) {
    wheel.classList.add(skinClass);
  }

  // Save selected skin to settings
  settings.selectedWheelSkin = skinId;
}

// Tutorial System
const tutorialModal = document.getElementById('tutorialModal');
const tutorialSteps = GameState.getTutorialSteps();
let currentTutorialStep = 0;

function showTutorial() {
  if (!tutorialModal) return;
  currentTutorialStep = gameState.getTutorialStep();
  updateTutorialDisplay();

  // Check if showModal is supported (not in JSDOM)
  if (typeof tutorialModal.showModal === 'function') {
    tutorialModal.showModal();
  } else {
    // Fallback for testing - just show the modal
    tutorialModal.style.display = 'block';
  }
}

function updateTutorialDisplay() {
  const step = tutorialSteps[currentTutorialStep];

  // Update content
  const iconEl = document.getElementById('tutorialIcon');
  const titleEl = document.getElementById('tutorialStepTitle');
  const textEl = document.getElementById('tutorialStepText');
  const indicatorEl = document.getElementById('tutorialStepIndicator');

  if (iconEl) iconEl.textContent = step.icon;
  if (titleEl) titleEl.textContent = step.title;
  if (textEl) textEl.textContent = step.text;
  if (indicatorEl) indicatorEl.textContent = `${currentTutorialStep + 1}/${tutorialSteps.length}`;

  // Update navigation buttons
  const prevBtn = document.getElementById('tutorialPrev');
  const nextBtn = document.getElementById('tutorialNext');

  if (prevBtn) {
    prevBtn.disabled = currentTutorialStep === 0;
  }

  if (nextBtn) {
    // Change text to "Finish" on last step
    if (currentTutorialStep === tutorialSteps.length - 1) {
      nextBtn.textContent = 'Finish';
      nextBtn.classList.add('tutorial-finish-button');
    } else {
      nextBtn.textContent = 'Next';
      nextBtn.classList.remove('tutorial-finish-button');
    }
  }

  // Update dots
  const dots = document.querySelectorAll('.tutorial-dot');
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentTutorialStep);
  });

  // Highlight target element if specified
  removeTutorialHighlights();
  if (step.target) {
    highlightTutorialElement(step.target);
  }

  // Save current step
  gameState = gameState.withTutorialStep(currentTutorialStep);
  store.save(gameState);
}

function highlightTutorialElement(selector) {
  try {
    const element = document.querySelector(selector);
    if (element) {
      element.classList.add('tutorial-highlight');
    }
  } catch (e) {
    console.warn('Could not highlight element:', selector);
  }
}

function removeTutorialHighlights() {
  document.querySelectorAll('.tutorial-highlight').forEach(el => {
    el.classList.remove('tutorial-highlight');
  });
}

function nextTutorialStep() {
  if (currentTutorialStep < tutorialSteps.length - 1) {
    currentTutorialStep++;
    updateTutorialDisplay();
  } else {
    completeTutorial();
  }
}

function prevTutorialStep() {
  if (currentTutorialStep > 0) {
    currentTutorialStep--;
    updateTutorialDisplay();
  }
}

function skipTutorial() {
  completeTutorial();
}

function completeTutorial() {
  removeTutorialHighlights();
  gameState = gameState.withTutorialCompleted();
  store.save(gameState);

  if (tutorialModal) {
    if (typeof tutorialModal.close === 'function') {
      tutorialModal.close();
    } else {
      tutorialModal.style.display = 'none';
    }
  }

  // Show completion celebration
  showTutorialCompletion();
}

function showTutorialCompletion() {
  const notification = document.createElement('div');
  notification.className = 'tutorial-completion';
  notification.innerHTML = `
    <div class="tutorial-completion-content">
      <div class="tutorial-completion-emoji">🎓</div>
      <div class="tutorial-completion-text">Tutorial Complete!</div>
      <div class="tutorial-completion-subtitle">You're ready to play!</div>
    </div>
  `;

  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 2rem 3rem;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(16, 185, 129, 0.4);
    z-index: 10002;
    text-align: center;
    animation: tutorialCompletionPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'tutorialCompletionFade 0.3s ease forwards';
    setTimeout(() => notification.remove(), 300);
  }, 2500);

  if (!document.getElementById('tutorial-completion-animations')) {
    const style = document.createElement('style');
    style.id = 'tutorial-completion-animations';
    style.textContent = `
      @keyframes tutorialCompletionPop {
        0% { transform: translate(-50%, -50%) scale(0); }
        100% { transform: translate(-50%, -50%) scale(1); }
      }
      @keyframes tutorialCompletionFade {
        from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        to { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
      }
      .tutorial-completion-emoji {
        font-size: 4rem;
        margin-bottom: 1rem;
      }
      .tutorial-completion-text {
        font-size: 1.8rem;
        font-weight: 800;
        margin-bottom: 0.5rem;
      }
      .tutorial-completion-subtitle {
        font-size: 1.2rem;
        opacity: 0.9;
      }
    `;
    document.head.appendChild(style);
  }
}

// Tutorial event listeners
document.getElementById('tutorialNext')?.addEventListener('click', nextTutorialStep);
document.getElementById('tutorialPrev')?.addEventListener('click', prevTutorialStep);
document.getElementById('tutorialSkip')?.addEventListener('click', skipTutorial);

// Close tutorial on backdrop click
tutorialModal?.addEventListener('click', (e) => {
  if (e.target === tutorialModal) {
    // Don't close, just notify they should use buttons
    audioService.playClick();
  }
});

// Multiplayer mode functionality
const multiplayerToggle = document.getElementById('multiplayerToggle');
const multiplayerScoreboard = document.getElementById('multiplayerScoreboard');

if (multiplayerToggle) {
  multiplayerToggle.addEventListener('click', () => {
    const isMultiplayer = gameState.getMultiplayerMode();

    if (isMultiplayer) {
      // Disable multiplayer
      if (confirm('Disable multiplayer mode? Current game progress will be lost.')) {
        gameState = gameState.withMultiplayerDisabled();
        store.save(gameState);
        updateMultiplayerDisplay();
      }
    } else {
      // Enable multiplayer
      gameState = gameState.withMultiplayerEnabled();
      store.save(gameState);
      updateMultiplayerDisplay();
      showMultiplayerStart();
    }

    audioService.playClick();
  });
}

function updateMultiplayerDisplay() {
  const isMultiplayer = gameState.getMultiplayerMode();
  const multiText = multiplayerToggle?.querySelector('.multiplayer-text');

  if (isMultiplayer) {
    multiplayerToggle?.classList.add('active');
    if (multiText) multiText.textContent = '2P';
    multiplayerScoreboard.style.display = 'block';
    updateMultiplayerScores();
  } else {
    multiplayerToggle?.classList.remove('active');
    if (multiText) multiText.textContent = '1P';
    multiplayerScoreboard.style.display = 'none';
  }
}

function updateMultiplayerScores() {
  const player1Stats = gameState.getPlayerStats(1);
  const player2Stats = gameState.getPlayerStats(2);
  const currentPlayer = gameState.getCurrentPlayer();

  // Update scores
  const p1Score = document.getElementById('player1Score');
  const p2Score = document.getElementById('player2Score');
  const p1Streak = document.getElementById('player1Streak');
  const p2Streak = document.getElementById('player2Streak');

  if (p1Score) p1Score.textContent = player1Stats.score;
  if (p2Score) p2Score.textContent = player2Stats.score;
  if (p1Streak) p1Streak.textContent = player1Stats.streak > 0 ? `🔥 ${player1Stats.streak}` : '';
  if (p2Streak) p2Streak.textContent = player2Stats.streak > 0 ? `🔥 ${player2Stats.streak}` : '';

  // Update turn indicators
  const p1Card = document.getElementById('player1Card');
  const p2Card = document.getElementById('player2Card');

  if (p1Card && p2Card) {
    p1Card.classList.toggle('active-turn', currentPlayer === 1);
    p2Card.classList.toggle('active-turn', currentPlayer === 2);
  }
}

function showMultiplayerStart() {
  const notification = document.createElement('div');
  notification.className = 'multiplayer-start-notification';
  notification.innerHTML = `
    <div class="multiplayer-start-content">
      <div class="multiplayer-start-icon">🎮</div>
      <div class="multiplayer-start-text">2-Player Mode Activated!</div>
      <div class="multiplayer-start-subtitle">Player 1 starts first</div>
    </div>
  `;

  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 2rem 3rem;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(102, 126, 234, 0.5);
    z-index: 10002;
    text-align: center;
    animation: multiplayerStartPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => notification.remove(), 300);
  }, 2500);

  if (!document.getElementById('multiplayer-start-animations')) {
    const style = document.createElement('style');
    style.id = 'multiplayer-start-animations';
    style.textContent = `
      @keyframes multiplayerStartPop {
        0% { transform: translate(-50%, -50%) scale(0); }
        100% { transform: translate(-50%, -50%) scale(1); }
      }
      .multiplayer-start-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }
      .multiplayer-start-text {
        font-size: 1.8rem;
        font-weight: 800;
        margin-bottom: 0.5rem;
      }
      .multiplayer-start-subtitle {
        font-size: 1.2rem;
        opacity: 0.9;
      }
    `;
    document.head.appendChild(style);
  }
}

function showMultiplayerWinner(winner) {
  const overlay = document.createElement('div');
  overlay.className = 'multiplayer-winner-overlay';

  const isTie = winner === 0;
  const winnerName = isTie ? "It's a Tie!" : `Player ${winner} Wins!`;
  const playerStats = isTie ? null : gameState.getPlayerStats(winner);
  const score = isTie ? `${gameState.getPlayerStats(1).score} - ${gameState.getPlayerStats(2).score}` : playerStats.score;

  overlay.innerHTML = `
    <div class="multiplayer-winner-content">
      <div class="multiplayer-winner-trophy">${isTie ? '🤝' : '🏆'}</div>
      <div class="multiplayer-winner-title">${winnerName}</div>
      ${!isTie ? `<div class="multiplayer-winner-subtitle">Congratulations!</div>` : ''}
      <div class="multiplayer-winner-score">${score}</div>
      <div class="multiplayer-winner-actions">
        <button class="multiplayer-winner-button" id="rematchButton">Rematch</button>
        <button class="multiplayer-winner-button" id="backToSinglePlayer">Single Player</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('rematchButton')?.addEventListener('click', () => {
    gameState = gameState.withMultiplayerEnabled();
    store.save(gameState);
    updateMultiplayerDisplay();
    overlay.remove();
  });

  document.getElementById('backToSinglePlayer')?.addEventListener('click', () => {
    gameState = gameState.withMultiplayerDisabled();
    store.save(gameState);
    updateMultiplayerDisplay();
    overlay.remove();
  });
}


// High contrast toggle functionality
const highContrastToggle = document.getElementById('highContrastToggle');
if (highContrastToggle) {
  // Initialize state based on settings
  highContrastToggle.setAttribute('aria-pressed', settings.highContrastMode);
  if (settings.highContrastMode) {
    document.body.classList.add('high-contrast');
  }

  highContrastToggle.addEventListener('click', () => {
    const newState = !settings.highContrastMode;
    settings.highContrastMode = newState;
    highContrastToggle.setAttribute('aria-pressed', newState);
  });
}

// Initialize progress display on load
updateProgressDisplay();

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
