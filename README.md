# CVC Spin Game

An offline-friendly single-page web game that helps early readers practise consonant-vowel-consonant (CVC) words. Spin the colourful wheel, decode the emoji clue, and choose the matching word to earn tokens.

## Features

### Core Gameplay
- **Spin & Learn:** Animated conic-gradient wheel to select word families (rimes).
- **CVC Practice:** Decode emoji clues and match them to CVC words.
- **Difficulty Levels:**
  - **Easy:** 2-letter hints, visible emoji.
  - **Medium:** 1-letter hint, visible emoji.
  - **Hard:** No hints, hidden emoji (challenge mode).
- **Multiplayer Mode:** 2-player local pass-and-play with score tracking.
- **Keyboard Support:** Full keyboard navigation (Arrow keys, Space/Enter to spin, Number keys for answers).

### Gamification & Progression
- **XP & Leveling:** Earn XP to level up from "Novice Reader" to "Word Wizard".
- **Streaks & Combos:** Build daily and session streaks for bonus rewards.
- **Achievements:** Unlock achievements for mastery and milestones.
- **Daily Challenges:** Complete daily goals to earn extra tokens.
- **Word Mastery:** Track progress for each specific word family.

### Shop & Customization
- **Token Shop:** Spend earned tokens on power-ups and cosmetics.
- **Power-ups:**
  - 🛡️ **Hint Shield:** Reveal a letter without penalty.
  - 💰 **2x Token:** Double rewards for the next answer.
  - ❄️ **Streak Freeze:** Protect your streak from a mistake.
- **Cosmetics:** Unlock new visual themes for the wheel (Space, Ocean, Rainbow).

### Accessibility & Tech
- **Accessibility:** High Contrast Mode, screen reader support, and adjustable settings.
- **Audio:** Interactive sound effects, background music, and text-to-speech pronunciation.
- **PWA Support:** Installable as a native-like app on mobile and desktop.
- **Tech Stack:** Vanilla HTML/CSS/JS (ES Modules), LocalStorage persistence, Jest testing.

新增功能與改進 (New Features & Improvements):

   1. 遊戲化與進度系統 (Gamification & Progression):
       * 經驗值與等級 (XP & Levels): 新增經驗值系統，玩家可以從「新手閱讀者 (Novice Reader)」升級至「文字大師 (Word Wizard)」。
       * 連勝獎勵 (Streaks & Combos): 追蹤每日連勝與單局連勝，連續答對會有 Combo 特效與額外獎勵。
       * 成就系統 (Achievements): 新增成就追蹤功能 (雖然 achievementService.js 是 untracked，但已整合至 main.js)。
       * 每日挑戰 (Daily Challenges): 每天提供特定目標，完成後可獲得額外代幣。
       * 文字掌握度 (Word Mastery): 追蹤每個韻腳 (rime) 的學習進度。

   2. 遊戲玩法增強 (Gameplay Enhancements):
       * 難度選擇 (Difficulty Levels):
           * Easy: 顯示 2 個字母提示，可見 Emoji。
           * Medium: 顯示 1 個字母提示，可見 Emoji。
           * Hard: 無提示，隱藏 Emoji (挑戰模式)。
       * 雙人對戰 (Multiplayer Mode): 新增本機雙人輪流對戰模式，即時顯示比分。
       * 鍵盤支援 (Keyboard Support): 支援方向鍵導航、空白鍵/Enter 旋轉、數字鍵 1-3 選擇答案。

   3. 商店與道具 (Shop & Economy):
       * 代幣商店 (Token Shop): 使用遊戲內代幣購買道具與外觀。
       * 強化道具 (Power-ups):
           * 🛡️ Hint Shield: 顯示提示且不扣分。
           * 💰 2x Token: 下次答對獲得雙倍代幣。
           * ❄️ Streak Freeze: 保護連勝紀錄一次。
       * 外觀 (Cosmetics): 可購買不同的輪盤造型 (太空、海洋、彩虹)。

   4. 使用者體驗與技術 (UX & Tech):
       * 新手教學 (Tutorial): 新增互動式教學導覽。
       * 設定選單 (Settings): 可調整遊戲速度、音效/音樂音量、發音設定、以及高對比模式 (High Contrast)。
       * PWA 支援: 新增 manifest.json 與 sw.js，支援安裝為應用程式。
       * 音效增強: 新增背景音樂、點擊/旋轉/答題音效以及 TTS 語音朗讀。

   5. 內容擴充 (Content Expansion):
       * src/data/rimes.js 中新增了更多的單字家族 (如 -en, -ug, -ut 等)。


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


