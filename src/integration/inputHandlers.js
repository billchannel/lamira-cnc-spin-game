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
    choiceButtons.forEach((button, index) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const choice = button.dataset.choice;
        if (!choice) {
          return;
        }
        onChoice(choice, button);
      });

      // Add keyboard support with number keys (1-3)
      button.dataset.keyIndex = index + 1;
    });
  }

  // Keyboard navigation support
  document.addEventListener('keydown', (event) => {
    // Space or Enter on spin button
    if ((event.code === 'Space' || event.code === 'Enter') &&
        document.activeElement === spinButton &&
        !spinButton.disabled) {
      event.preventDefault();
      onSpin();
      return;
    }

    // Number keys (1-3) for choices
    if (/^[1-3]$/.test(event.key)) {
      const keyIndex = parseInt(event.key, 10);
      const button = choiceButtons[keyIndex - 1];
      if (button && !button.disabled && button.dataset.choice) {
        event.preventDefault();
        onChoice(button.dataset.choice, button);
        return;
      }
    }

    // Arrow keys for choice navigation
    if (event.code === 'ArrowRight' || event.code === 'ArrowDown') {
      const enabledButtons = Array.from(choiceButtons).filter(b => !b.disabled);
      if (enabledButtons.length > 0) {
        event.preventDefault();
        const currentIndex = enabledButtons.indexOf(document.activeElement);
        const nextIndex = (currentIndex + 1) % enabledButtons.length;
        enabledButtons[nextIndex].focus();
      }
    }

    if (event.code === 'ArrowLeft' || event.code === 'ArrowUp') {
      const enabledButtons = Array.from(choiceButtons).filter(b => !b.disabled);
      if (enabledButtons.length > 0) {
        event.preventDefault();
        const currentIndex = enabledButtons.indexOf(document.activeElement);
        const prevIndex = currentIndex <= 0 ? enabledButtons.length - 1 : currentIndex - 1;
        enabledButtons[prevIndex].focus();
      }
    }
  });
}
