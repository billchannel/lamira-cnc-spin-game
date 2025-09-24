export function registerInputHandlers({
  spinButton,
  choiceButtons,
  onSpin,
  onChoice,
}) {
  if (spinButton && typeof onSpin === 'function') {
    spinButton.addEventListener('click', (event) => {
      event.preventDefault();
      onSpin();
    });
  }

  if (Array.isArray(choiceButtons) && typeof onChoice === 'function') {
    choiceButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const choice = button.dataset.choice;
        if (!choice) {
          return;
        }
        onChoice(choice, button);
      });
    });
  }
}
