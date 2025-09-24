# Tasks: CVC Spin Game

**Input**: `specs/001-docs-idea-md/plan.md`, `specs/001-docs-idea-md/research.md`, `specs/001-docs-idea-md/data-model.md`, `specs/001-docs-idea-md/quickstart.md`
**Prerequisites**: Node.js 18+, npm, modern browser for manual QA

## Execution Flow (main)
```
1. Load plan.md for tech stack (vanilla HTML/CSS/JS, offline-first)
2. Load research.md for animation, persistence, testing decisions
3. Load data-model.md for GameState, Rime, Word, Question definitions
4. Load quickstart.md for user flows and acceptance scenarios
5. Generate tasks honoring TDD order, model->service->UI layering, offline constraints
6. Mark [P] tasks only when files do not overlap and dependencies are satisfied
7. Output ordered task list and parallel execution guidance
```

## Phase 3.1: Setup
- [ ] T001 Establish project skeleton with stub entry points (Paths: `index.html`, `styles/main.css`, `src/main.js`, directories `src/models`, `src/services`, `src/ui`, `src/integration`, `tests/integration`, `tests/unit`; Depends on: —)
- [ ] T002 Initialize npm project with Jest (jsdom) and scripts (`package.json`, `jest.config.js`; Depends on: T001)
- [ ] T003 Configure ESLint + Prettier for browser ES modules (`.eslintrc.json`, `.prettierrc`, lint scripts in `package.json`; Depends on: T002)

## Phase 3.2: Tests First (TDD) — write failing tests before implementation
- [ ] T004 [P] Author smoke-flow integration test covering spin->question->token path (`tests/integration/game-smoke.test.js`; Depends on: T001-T003)
- [ ] T005 [P] Author success-rate integration test for 8-round target accuracy logic (`tests/integration/success-rate.test.js`; Depends on: T001-T003)
- [ ] T006 [P] Author responsive/touch integration test for mobile interactions and layout (`tests/integration/mobile-responsive.test.js`; Depends on: T001-T003)
- [ ] T007 [P] Author persistence integration test validating localStorage restore/reset rules (`tests/integration/persistence.test.js`; Depends on: T001-T003)

## Phase 3.3: Core Implementation (after tests are failing)
- [ ] T008 [P] Implement GameState model with invariants and serialization helpers (`src/models/GameState.js`; Depends on: T004-T007)
- [ ] T009 [P] Implement Rime model enforcing segment angles and word families (`src/models/Rime.js`; Depends on: T004-T007)
- [ ] T010 [P] Implement Word model with CVC and emoji validation utilities (`src/models/Word.js`; Depends on: T004-T007)
- [ ] T011 [P] Implement Question model enforcing choice composition rules (`src/models/Question.js`; Depends on: T004-T007)
- [ ] T012 [P] Codify canonical rime dataset and wheel metadata (`src/data/rimes.js`; Depends on: T009-T010)
- [ ] T013 Build question factory to assemble randomized Question objects (`src/services/questionFactory.js`; Depends on: T008-T012)
- [ ] T014 Build game state store for localStorage load/save and migrations (`src/services/gameStateStore.js`; Depends on: T008, T012)
- [ ] T015 [P] Build wheel animation controller encapsulating CSS class toggles and timers (`src/services/wheelAnimation.js`; Depends on: T012)
- [ ] T016 [P] Build feedback service managing token awards and messaging (`src/services/feedbackService.js`; Depends on: T008, T012)

## Phase 3.4: Integration & UI Wiring
- [ ] T017 Complete accessible markup for wheel, question area, controls, and token counter (`index.html`; Depends on: T008-T016)
- [ ] T018 Implement responsive styling and animations per research decisions (`styles/main.css`; Depends on: T017)
- [ ] T019 Implement DOM bindings utility for querying and caching UI nodes (`src/ui/domBindings.js`; Depends on: T017)
- [ ] T020 Implement view controller to render wheel state, questions, and feedback (`src/ui/viewController.js`; Depends on: T019)
- [ ] T021 [P] Implement input handlers for click, touch, and keyboard control flow (`src/integration/inputHandlers.js`; Depends on: T015, T019)
- [ ] T022 [P] Implement persistence integration to sync GameStateStore with lifecycle events (`src/integration/statePersistence.js`; Depends on: T014)
- [ ] T023 Wire application entry point combining services, handlers, and tests hooks (`src/main.js`; Depends on: T020-T022)

## Phase 3.5: Polish
- [ ] T024 [P] Add unit tests for model validators and error paths (`tests/unit/models.test.js`; Depends on: T008-T016)
- [ ] T025 [P] Add performance guard test for animation and feedback timing budgets (`tests/unit/performance-budget.test.js`; Depends on: T015-T016)
- [ ] T026 [P] Update quickstart and docs with final structure, test commands, and accessibility notes (`specs/001-docs-idea-md/quickstart.md`, `README.md`; Depends on: T017-T023)

## Dependencies
- T001 → T002 → T003 establish tooling before tests.
- T004-T007 must complete before any implementation task (T008-T023).
- Model tasks T008-T011 unblock data/service layers T012-T016.
- UI wiring (T017-T023) depends on services and models being available.
- Polish tasks (T024-T026) run only after core and integration tasks pass.
- [P] tasks assume their dependencies are satisfied and do not share target files.

## Parallel Example
```
# Kick off integration test writing in parallel once setup is done:
task start "T004 Write game-smoke integration test"
task start "T005 Write success-rate integration test"
task start "T006 Write mobile-responsive integration test"
task start "T007 Write persistence integration test"
```

## Notes
- Ensure integration tests fail prior to implementation commits to maintain TDD flow.
- Favor ES module imports to keep browser runtime dependency-free.
- Verify localStorage usage with manual browser smoke tests after T023.
