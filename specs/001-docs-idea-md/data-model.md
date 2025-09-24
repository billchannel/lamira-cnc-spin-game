# Data Model: CVC Spin Game

## Core Entities

### 1. GameState
Represents the complete game state that persists across sessions.

**Properties**:
- `tokens: number` - Count of earned tokens (starts at 0)
- `currentRime: string | null` - Currently active rime (e.g., "-at")
- `currentAnswer: string | null` - Correct answer for current question
- `isSpinning: boolean` - Whether wheel is currently animating
- `spinCount: number` - Total number of spins completed
- `correctAnswers: number` - Number of correct answers given

**Validation Rules**:
- `tokens >= 0`
- `spinCount >= 0`
- `correctAnswers >= 0`
- `correctAnswers <= spinCount`

### 2. Rime
Represents a CVC word family (vowel-consonant ending pattern).

**Properties**:
- `pattern: string` - The rime pattern (e.g., "-at", "-og")
- `words: Word[]` - Array of words in this rime family
- `angleStart: number` - Starting angle on wheel (degrees)
- `angleEnd: number` - Ending angle on wheel (degrees)

**Validation Rules**:
- `pattern` must start with hyphen
- `words.length === 3` (exactly 3 words per rime)
- `angleStart >= 0 && angleStart < 360`
- `angleEnd > angleStart && angleEnd <= 360`

### 3. Word
Represents a single CVC word with its associated emoji.

**Properties**:
- `text: string` - The word (e.g., "cat", "dog")
- `emoji: string` - Unicode emoji representing the word
- `rime: string` - The rime pattern this word belongs to

**Validation Rules**:
- `text.length === 3` (CVC pattern)
- `text` must match CVC regex: `^[bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz]$`
- `emoji` must be a valid Unicode emoji
- `rime` must match existing rime pattern

### 4. Question
Represents the current question being displayed to the user.

**Properties**:
- `rime: string` - The rime pattern for this question
- `correctWord: Word` - The correct answer
- `choices: Word[]` - Array of 3 word choices (1 correct, 2 distractors)
- `questionText: string` - The display text (e.g., "What is this? 🐱")

**Validation Rules**:
- `choices.length === 3`
- `choices` must contain exactly one correct answer
- All choices must be from the same rime family
- `questionText` must include the emoji

## Data Relationships

```
GameState (1) ── contains ── (1) Question
GameState (1) ── tracks ── (*) Token
Rime (1) ── contains ── (3) Word
Question (1) ── references ── (1) Rime
Question (1) ── contains ── (3) Word choices
```

## State Transitions

### Game Flow States
1. **IDLE**: Initial state, waiting for spin
2. **SPINNING**: Wheel animation in progress
3. **QUESTION**: Question displayed, awaiting answer
4. **FEEDBACK**: Showing result of answer
5. **COMPLETE**: Ready for next spin

### State Machine Rules
- IDLE → SPINNING: User clicks "Spin!" button
- SPINNING → QUESTION: Animation completes
- QUESTION → FEEDBACK: User selects answer
- FEEDBACK → IDLE: Feedback timeout completes

## Data Persistence

### localStorage Schema
```javascript
{
  "tokens": 0,
  "currentRime": null,
  "currentAnswer": null,
  "isSpinning": false,
  "spinCount": 0,
  "correctAnswers": 0,
  "lastPlayed": "2025-09-22T10:30:00Z"
}
```

### Persistence Rules
- State saved after each token earned
- State loaded on page initialization
- Migration: Add new fields with default values
- Cleanup: Remove stale entries after 30 days

## Constants & Configuration

### Word Bank
```javascript
const RIMES = {
  '-at': [
    {word: 'cat', emoji: '🐱'},
    {word: 'bat', emoji: '🦇'},
    {word: 'hat', emoji: '🎩'}
  ],
  '-og': [
    {word: 'dog', emoji: '🐶'},
    {word: 'log', emoji: '🪵'},
    {word: 'jog', emoji: '🏃'}
  ],
  '-ip': [
    {word: 'lip', emoji: '👄'},
    {word: 'sip', emoji: '🥤'},
    {word: 'zip', emoji: '🧷'}
  ],
  '-et': [
    {word: 'net', emoji: '🎣'},
    {word: 'pet', emoji: '🐕'},
    {word: 'jet', emoji: '✈️'}
  ],
  '-ub': [
    {word: 'sub', emoji: '🚢'},
    {word: 'tub', emoji: '🛁'},
    {word: 'cub', emoji: '🐻'}
  ]
};
```

### Game Configuration
```javascript
const CONFIG = {
  ANIMATION_DURATION: 2000,        // 2 seconds
  FEEDBACK_DURATION: 1500,        // 1.5 seconds
  WHEEL_SEGMENTS: 5,               // 5 rimes
  CHOICES_COUNT: 3,                // 3 choices per question
  MAX_TOKENS_DISPLAY: 20,          // Visual limit for token display
  SUCCESS_RATE_TARGET: 0.7,        // 70% target success rate
  MIN_SPINS_FOR_SUCCESS: 8        // Minimum spins to measure success
};
```

## Validation Functions

### Word Validation
```javascript
function isValidCVCWord(word) {
  return /^[bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz]$/.test(word);
}

function isValidEmoji(emoji) {
  return /\p{Emoji}/u.test(emoji);
}
```

### Game State Validation
```javascript
function isValidGameState(state) {
  return (
    state.tokens >= 0 &&
    state.spinCount >= 0 &&
    state.correctAnswers >= 0 &&
    state.correctAnswers <= state.spinCount &&
    (state.currentRime === null || RIMES.hasOwnProperty(state.currentRime))
  );
}
```

## Error Handling

### Data Validation Errors
- `InvalidWordError`: Word doesn't match CVC pattern
- `InvalidEmojiError`: Invalid emoji character
- `InvalidRimeError`: Rime pattern not found
- `InvalidStateError`: Game state corruption detected

### Recovery Strategies
- Reset to initial state on corruption
- Use default word bank if validation fails
- Graceful degradation for missing localStorage