---
name: verify
description: Drive Para Ti end-to-end in real Chrome and capture screenshot evidence. Use after any gameplay/scene change to verify at the real surface (the browser), not just via unit tests.
---

# Verifying Para Ti

## Launch

```bash
npm run dev   # background; Vite prints the port — 5173 is often taken on this
              # machine, it usually lands on 5174-5177. READ THE PORT from output.
```

## Drive (headless Chrome, no downloads needed)

System Chrome exists; use `playwright-core` with `channel: 'chrome'`, installed in
the session scratchpad (NOT in this project's package.json):

```js
import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 480, height: 320 } });
```

**Key trick:** viewport 480×320 makes Phaser's FIT scale 1:1, so game coordinates
== page coordinates. Click targets:

| Target | Coords |
|---|---|
| `[ PLAY ]` (title) | (240, 243) |
| CASUAL panel | (153, 160) |
| ATHLETIC panel | (327, 160) |
| `[ LET'S GO ]` confirm | (240, 285) |

Movement: `page.keyboard.down('ArrowRight')` / `'KeyD'` etc. — Phaser listens on
window. Allow ~900ms after scene-changing clicks (300ms fadeOut + 300ms fadeIn).
Wait ~1200ms after page load (font gate + boot).

**Never use `page.keyboard.press()`** — its instant down+up is missed by Phaser's
JustDown sampling. Tap keys as `down(key)` → `sleep(80)` → `up(key)` (dialogue
advance on Space, interactions, etc.).

The game instance is exposed as `window.__game` — inspect live scene state via
`page.evaluate(() => window.__game.scene.getScene('EraScene')...)` when
screenshots alone can't show what's happening (e.g. player hidden behind the
dialogue box).

Capture `page.on('console')` and `page.on('pageerror')` — zero pageerrors is part
of the pass bar. A favicon 404 is known noise.

## Flows worth driving

1. Title → PLAY → outfit → select → switch selection → confirm → era loads
2. Walk all 4 directions (arrows AND WASD), check facing dot flips
3. Push into a border wall 2s+, screenshot twice — position must be identical
4. Hold right+down together — must move horizontally only (no diagonal)
5. Reload → must land on a fresh title (BR-7: no persistence)

## Evidence

Screenshot each step to the scratchpad and READ the images — visual confirmation
of layout/colors/position is the evidence, plus the console log capture.
