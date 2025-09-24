export class ViewController {
  constructor({ bindings, feedbackService }) {
    this.bindings = bindings;
    this.feedbackService = feedbackService;
  }

  setSpinDisabled(disabled) {
    if (this.bindings.spinButton) {
      this.bindings.spinButton.disabled = disabled;
    }
  }

  setAllControlsDisabled(disabled) {
    this.setSpinDisabled(disabled);
    this.bindings.choiceButtons.forEach(button => {
      button.disabled = disabled;
    });
  }

  resetChoices() {
    this.bindings.choiceButtons.forEach((btn) => {
      btn.disabled = true;
      btn.classList.remove('choice--correct', 'choice--incorrect');
      btn.removeAttribute('data-choice');
      btn.textContent = '';
    });
  }

  prepareForSpin() {
    this.setSpinDisabled(true);
    this.resetChoices();
    if (this.bindings.questionPrompt) {
      this.bindings.questionPrompt.textContent = 'Spinning...';
    }
  }

  displayQuestion(question, gameState) {
    this.setSpinDisabled(true);
    if (this.bindings.questionEmoji) {
      this.bindings.questionEmoji.textContent = question.correctWord.emoji;
    }
    if (this.bindings.questionPrompt) {
      this.bindings.questionPrompt.textContent = question.questionText;
    }
    this.bindings.choiceButtons.forEach((button, index) => {
      const choice = question.choices[index];
      button.disabled = false;
      button.dataset.choice = choice.text;
      button.textContent = choice.text;
    });
    this.feedbackService.handleQuestionReady(gameState, question.correctWord.emoji);
  }

  updateGameStats(gameState) {
    this.feedbackService.renderStats({
      spinCount: gameState.spinCount,
      successRate: gameState.successRate,
    });
    this.feedbackService.renderTokens(gameState.tokens);
  }

  lockChoices() {
    this.bindings.choiceButtons.forEach((button) => {
      button.disabled = true;
    });
  }

  highlightChoice(button, isCorrect) {
    button.classList.add(isCorrect ? 'choice--correct' : 'choice--incorrect');
  }

  showCorrect(gameState, chosenButton) {
    this.lockChoices();
    if (chosenButton) {
      this.highlightChoice(chosenButton, true);
    }
    this.feedbackService.handleCorrectAnswer(gameState);
    this.setSpinDisabled(false);
  }

  showIncorrect(gameState, chosenButton, correctWord) {
    this.lockChoices();
    if (chosenButton) {
      this.highlightChoice(chosenButton, false);
    }
    this.feedbackService.handleIncorrectAnswer(gameState);
    const correctButton = this.bindings.choiceButtons.find(
      (button) => button.dataset.choice === correctWord.text,
    );
    if (correctButton) {
      this.highlightChoice(correctButton, true);
    }
    this.setSpinDisabled(false);
  }
}
