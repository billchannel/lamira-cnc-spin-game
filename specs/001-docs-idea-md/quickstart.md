# Quick Start Guide: CVC Spin Game

## Setup Instructions

### 1. Prerequisites
- Node.js 18+
- npm 9+
- Modern web browser (Chrome, Firefox, Safari, Edge)

### 2. Install Tooling
```bash
npm install
```
This installs Jest, ESLint, and Prettier for local development.

### 3. Project Structure
```
hello_world/
├── index.html              # Single-page application shell
├── styles/
│   └── main.css            # Responsive styles and wheel animation
├── src/
│   ├── config.js           # Shared configuration constants
│   ├── data/
│   │   └── rimes.js        # Canonical CVC word families
│   ├── integration/
│   │   ├── inputHandlers.js
│   │   └── statePersistence.js
│   ├── models/
│   │   ├── GameState.js
│   │   ├── Question.js
│   │   ├── Rime.js
│   │   └── Word.js
│   ├── services/
│   │   ├── feedbackService.js
│   │   ├── gameStateStore.js
│   │   ├── questionFactory.js
│   │   └── wheelAnimation.js
│   ├── ui/
│   │   ├── domBindings.js
│   │   └── viewController.js
│   └── main.js             # Application entry point
├── tests/
│   ├── integration/
│   │   ├── game-smoke.test.js
│   │   ├── mobile-responsive.test.js
│   │   ├── persistence.test.js
│   │   └── success-rate.test.js
│   ├── unit/
│   │   ├── models.test.js
│   │   └── performance-budget.test.js
│   └── setup.js
├── package.json
├── jest.config.js
├── .eslintrc.json
└── .prettierrc
```

## Running the App
1. Open `index.html` directly in your browser (double-click or use `npx serve` style static hosting if preferred).
2. The app works offline once loaded—no build step required.

## Core Gameplay Flow
1. Click **Spin!** to animate the wheel.
2. Wait for the emoji clue and choose the word that matches.
3. Earn tokens for correct answers. After eight spins with ≥70% accuracy, celebratory feedback appears.
4. Game state (tokens, progress) persists automatically via `localStorage`.

## Testing

### Integration Scenarios
- `npm test` runs all Jest suites in jsdom.
- Key coverage:
  - `game-smoke.test.js`: spin → question flow
  - `success-rate.test.js`: success threshold logic
  - `mobile-responsive.test.js`: input state changes
  - `persistence.test.js`: `localStorage` restoration

### Unit Coverage
- `models.test.js`: validation safeguards for models
- `performance-budget.test.js`: ensures animation timing stays within spec

Use `npm test -- --watch` for iterative development.

## Manual QA Checklist
1. Spin the wheel on desktop and mobile.
2. Verify question prompt and three choices appear.
3. Answer correctly and incorrectly to observe feedback messaging.
4. Earn several tokens, refresh the page, and confirm the count persists.
5. Resize the browser window (including <640px) to confirm responsive layout.

## Troubleshooting
- **No wheel animation**: confirm browser supports CSS `conic-gradient` and transforms.
- **Buttons remain disabled**: ensure a choice was clicked after each spin.
- **Tokens reset**: check browser privacy settings—`localStorage` must be enabled.
- **Tests fail to run**: install dependencies with `npm install` and rerun `npm test`.

---
**Happy Learning! 🎡📚**
