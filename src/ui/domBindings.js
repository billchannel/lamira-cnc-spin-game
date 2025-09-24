export function getDomBindings(root = document) {
  return {
    wheelEl: root.querySelector('.wheel'),
    spinButton: root.getElementById('spinButton'),
    questionEmoji: root.getElementById('questionEmoji'),
    questionPrompt: root.getElementById('questionPrompt'),
    choiceButtons: Array.from(root.querySelectorAll('.choice')),
    tokenCounter: root.getElementById('tokenCounter'),
    spinCount: root.getElementById('spinCount'),
    successRate: root.getElementById('successRate'),
    feedbackEl: root.getElementById('feedback'),
  };
}
