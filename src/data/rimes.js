export const DEFAULT_RIMES = [
  {
    pattern: '-at',
    words: [
      { text: 'cat', emoji: '🐱' },
      { text: 'bat', emoji: '🦇' },
      { text: 'hat', emoji: '🎩' },
    ],
  },
  {
    pattern: '-og',
    words: [
      { text: 'dog', emoji: '🐶' },
      { text: 'log', emoji: '🪵' },
      { text: 'jog', emoji: '🏃' },
    ],
  },
  {
    pattern: '-ip',
    words: [
      { text: 'lip', emoji: '👄' },
      { text: 'sip', emoji: '🥤' },
      { text: 'zip', emoji: '🧷' },
    ],
  },
  {
    pattern: '-et',
    words: [
      { text: 'net', emoji: '🎣' },
      { text: 'pet', emoji: '🐕' },
      { text: 'jet', emoji: '✈️' },
    ],
  },
  {
    pattern: '-ub',
    words: [
      { text: 'sub', emoji: '🚢' },
      { text: 'tub', emoji: '🛁' },
      { text: 'cub', emoji: '🐻' },
    ],
  },
];

let currentRimes = [...DEFAULT_RIMES];

export function buildRimes(rimes = currentRimes) {
  const segmentAngle = 360 / rimes.length;
  return rimes.map((entry, index) => ({
    pattern: entry.pattern,
    words: entry.words,
    angleStart: segmentAngle * index,
    angleEnd: segmentAngle * (index + 1),
  }));
}

export const RIMES = buildRimes();

export function getRimeByPattern(pattern) {
  return RIMES.find((r) => r.pattern === pattern) ?? null;
}

export function getRandomRime() {
  const index = Math.floor(Math.random() * RIMES.length);
  return RIMES[index];
}

export function configureRimes(newRimes) {
  if (!Array.isArray(newRimes) || newRimes.length === 0) {
    throw new Error('Rimes must be a non-empty array');
  }

  currentRimes = [...newRimes];
  return buildRimes(currentRimes);
}

export function resetRimes() {
  currentRimes = [...DEFAULT_RIMES];
  return buildRimes(currentRimes);
}

export function getCurrentRimes() {
  return [...currentRimes];
}
