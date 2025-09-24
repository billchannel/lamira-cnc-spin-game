# CVC Spin Game

An offline-friendly single-page web game that helps early readers practise consonant-vowel-consonant (CVC) words. Spin the colourful wheel, decode the emoji clue, and choose the matching word to earn tokens.

## Features
- Vanilla HTML, CSS, and ES modules—no external dependencies
- Animated conic-gradient wheel with accessible controls
- LocalStorage persistence for tokens, spins, and accuracy
- Responsive layout optimised for touch and desktop
- Jest-based integration and unit tests running in jsdom

## Getting Started
```bash
npm install
npm test
```

> 最常見的原因是直接用 file:// 打開 index.html。在這種情況下，瀏覽器會阻擋 ES module 的相對匯入，src/main.js 及其子模組根本沒載入，事件監聽器也就沒有註冊，所以看起來「按了沒反應、輪盤不轉、題
  目沒有更新」。

  請改成用一個小型本機伺服器開啟：

  1. 在專案根目錄執行 npm install（第一次需要，把 Jest/ESLint 也一起裝好）。
  2. 隨意選一種啟動方式，例如
      - npx http-server . -p 5173
      - 或 python3 -m http.server 5173
  3. 用瀏覽器開 http://localhost:5173/index.html（依你選的 port 調整）。

  只要在 HTTP 伺服器下載入，模組會正確匯入，按下 Spin! 後就會看到輪盤旋轉並顯示題目。

## Project Layout
```
src/
├── config.js
├── data/
├── integration/
├── models/
├── services/
├── ui/
└── main.js
styles/
└── main.css
index.html
```
See `specs/001-docs-idea-md/quickstart.md` for deeper onboarding guidance.

## Scripts
- `npm test` – run integration + unit tests in jsdom
- `npm test -- --watch` – watch mode
- `npm run lint` – ESLint with Prettier compatibility
- `npm run format` – Prettier check

## License
Educational sample project—adapt freely for classroom or home learning.

## Backgroud story
./docs/notes-09232025md


