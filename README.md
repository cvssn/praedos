# praedos

> a windowed warframe companion — real-time world state, market lookups, log feed, and personal goals. built with electron + react + tailwind 4.

```
  praedos · v1.0
  ─────────────────────────────────────────
  a tenno-side helper that lives next to the game.
```

---

## what it is

praedos is a modern desktop app for warframe players. it pulls live data from the public warframe apis and tails the game log so you always know:

- which **fissures** are open and how long they last
- which **cycle** cetus, vallis, cambion, zariman, earth and duviri are in
- what the current **sortie** and **archon hunt** are
- when **baro ki'teer** arrives or leaves and what he's selling
- the active **nightwave** challenges
- the live **buy / sell** orders on warframe.market for any item
- everything happening in your **ee.log** as it happens
- your personal **farm goals** and notes, persisted locally

all in a frameless dark window with a single font (jetbrainsmono nerd font) and everything in lowercase.

---

## tech stack

| layer | choice | why |
|-------|--------|-----|
| shell | electron 42 | mature, cross-platform desktop runtime |
| build | electron forge 7 + vite 6 | fast hmr, modern bundling |
| ui | react 19 + typescript 5.6 | strict typed components |
| styling | tailwindcss 4 (`@tailwindcss/vite`) | utility-first, theme tokens via `@theme` |
| data | @tanstack/react-query 5 | caching, polling, refetch-on-stale |
| state | zustand 5 | tiny global ui store |
| icons | lucide-react | crisp svg icons |
| persistence | plain json file in `userData` | zero native deps, easy to inspect |

no rust, no node-gyp, no ESM/CJS gymnastics. installs clean on any windows box.

---

## features

### world state dashboard
six cycle cards with live countdowns (`useNow` re-renders every second), sortie + archon hunt cards with mission breakdown, void trader status with inventory, nightwave challenges grouped daily / weekly / elite, and a quick-look fissure list.

### fissures
full list of currently active relics. filter by:

- tier (lith / meso / neo / axi / requiem / omnia)
- steel path only
- void storm only

each row is color-coded per tier.

### market lookup
search **warframe.market** (auto-completes after 2 chars), pick an item, see live orders. only **in-game** sellers and buyers are shown by default (so you can pm them right now). lowest sell and median sell are computed and surfaced at the top. auto-refreshes every 30 seconds.

### log feed
points at `%LOCALAPPDATA%\Warframe\EE.log` by default, tails it, and prints categorized events:

- login / startup / profile
- challenge progress
- mission end
- host migration
- inventory drops
- warnings / errors

pause, resume, clear, or browse to a different log file from the toolbar.

### notes
local checklist for farm targets, riven plans, daily reminders, syndicate caps, etc. stored in `%APPDATA%\praedos\praedos-store.json`.

### settings
- platform: pc / playstation / xbox / switch (worldstate api respects this)
- ee.log path (browse to override default)
- world-state poll interval in seconds (15-600)
- start minimized to tray
- notify on rare fissure / arbitration (placeholders for future native notifications)

---

## architecture

```
src/
├── main.ts               · electron main: window, tray, lifecycle, fuses
├── preload.ts            · contextbridge → window.praedos api
├── renderer.tsx          · react entry + react-query provider
├── index.css             · tailwind 4 import, @theme tokens, global lowercase
│
├── main/                 · main-process only
│   ├── worldstate.ts     · fetch api.warframestat.us
│   ├── market.ts         · fetch api.warframe.market, 12h items cache
│   ├── logWatcher.ts     · fs.stat polling + regex categorization
│   ├── store.ts          · json file in app.getPath('userData')
│   └── ipc.ts            · registers all ipcMain handlers
│
├── shared/               · types + ipc channel constants
│   ├── types.ts
│   └── channels.ts
│
└── renderer/             · ui code (alias `@/`)
    ├── App.tsx
    ├── components/       · titlebar, sidebar, card, empty, cyclecard
    ├── screens/          · dashboard, fissures, market, logfeed, notes, settings
    ├── hooks/            · useworldstate, usenow
    ├── store/ui.ts       · zustand ui store
    └── lib/              · cn() helper, format helpers
```

### security model

- `contextIsolation: true`, `nodeIntegration: false`
- preload exposes a **single typed bridge** (`window.praedos`) — renderer never touches `ipcRenderer` directly
- strict content-security-policy in `index.html`:
  - `connect-src` allowlists only the two public apis
  - `img-src` allowlists known warframe asset hosts
  - inline scripts blocked
- electron **fuses** enabled in `forge.config.ts`:
  - `OnlyLoadAppFromAsar`, `EnableEmbeddedAsarIntegrityValidation`, etc.
- `setWindowOpenHandler` → opens external links in user browser via `shell.openExternal`, blocks in-app windows
- `shell.openExternal` ipc handler verifies `https?://` scheme

### data sources

| api | what | docs |
|-----|------|------|
| `api.warframestat.us` | world state, cycles, sortie, fissures, etc | https://docs.warframestat.us |
| `api.warframe.market` | items, orders, prices | https://warframe.market/api_docs |
| local `EE.log` | live game events | game-produced file |

---

## getting started

### prerequisites
- **node.js 18+** (24 lts recommended)
- **npm 10+**
- windows 10 / 11 (works on mac/linux too — installers are configured)

### install

```bash
git clone <your-fork> praedos
cd praedos
npm install
```

### run in dev (hot reload)

```bash
npm start
```

opens the electron window pointed at `http://localhost:5173`. edits in `src/renderer/**` hot-reload instantly. edits in `src/main.ts` / `src/preload.ts` rebuild the bundle (electron restarts automatically). type `rs` in the terminal to force-restart main.

### type check

```bash
npx tsc --noEmit
```

### build a windows installer

```bash
npm run make
```

outputs to:
- `out/make/squirrel.windows/x64/praedos-1.0.0 Setup.exe` (installer)
- `out/make/squirrel.windows/x64/praedos-1.0.0-full.nupkg`

### package without installer (just the .exe directory)

```bash
npm run package
```

writes to `out/praedos-win32-x64/`.

---

## usage

1. launch the app — the world-state dashboard appears immediately.
2. confirm your platform under **settings** if you're not on pc.
3. **fissures**: filter the list to find your tier. column shows time-left countdown.
4. **market**: type any item name (e.g. `mesa prime set`, `riven mod`, `arcane energize`). click a result. lowest sell and median sell appear top-right. seller/buyer panels refresh every 30 s.
5. **log feed**: open warframe — events start streaming in. use **change** to point at a different `EE.log` (the kubrow/dojo log etc.). use **pause** when you want to scroll without the feed jumping.
6. **notes**: hit enter to save a goal. click the checkbox to mark done. hover → trash icon to delete.

### keyboard / window

- minimize, maximize, close — top-right of the custom titlebar
- the **green dot** in the titlebar = world state is live; **yellow** = syncing; **red** = api offline
- tray icon → click to toggle window, right-click for menu

### where data lives

- settings + notes → `%APPDATA%\praedos\praedos-store.json`
- nothing leaves your machine except calls to the two public apis listed above.

---

## customization

### font
all text uses **jetbrainsmono nerd font**. fallback chain:

```
'JetBrainsMono Nerd Font'
  → 'JetBrainsMonoNL Nerd Font'
  → 'JetBrains Mono'
  → ui-monospace
  → monospace
```

if the nerd font isn't installed locally, you'll get plain jetbrains mono or the system monospace. install via [nerd fonts](https://www.nerdfonts.com/font-downloads).

### theme
edit color tokens in `src/index.css` under `@theme`:

```css
@theme {
  --color-bg: #07070a;
  --color-accent: #00e0ff;
  --color-accent-2: #6f5cff;
  --color-tier-lith: #c98a4a;
  /* ... */
}
```

tailwind 4 picks them up automatically — use as utilities like `bg-bg-1`, `text-accent`, `border-border-bright`.

### lowercase enforcement
forced globally by:

```css
html, body, *, *::before, *::after, ::placeholder {
  text-transform: lowercase !important;
  font-family: var(--font-sans) !important;
}
```

remove the `text-transform` rule if you want mixed-case content.

### refresh rate
`settings → refresh` sets worldstate poll interval. minimum 15 s (be kind to the public api).

---

## scripts

```jsonc
"scripts": {
  "start":   "electron-forge start",    // dev w/ hmr
  "package": "electron-forge package",  // unpacked app dir
  "make":    "electron-forge make",     // installer
  "publish": "electron-forge publish",
  "lint":    "eslint --ext .ts,.tsx ."
}
```

---

## troubleshooting

| symptom | fix |
|---------|-----|
| `unknown at rule @theme` warning in vscode | already silenced via `.vscode/settings.json` (`css.lint.unknownAtRules: ignore`). reload the window. |
| `option 'baseUrl' is deprecated` | already removed from `tsconfig.json`. paths now resolve relative to the tsconfig directory. |
| log feed shows nothing | the game has to be writing to `EE.log`. confirm path in **settings**. file is rotated at session start, so events appear as warframe runs. |
| market shows no orders | warframe.market may be rate-limiting. wait 30 s and retry. |
| world state stuck on "connecting" | the **status dot** is red? `api.warframestat.us` may be down — verify in a browser. |
| ipc errors after editing `src/main/**` | type `rs<enter>` in the terminal where `npm start` runs, to restart the main process. |

---

## roadmap (ideas, not promises)

- native windows toast notifications on rare fissures and arbitrations
- riven roll planner with stat weights
- relic refinement helper (radiant vs intact ev)
- mission stopwatch synced to log events
- inventory diff between sessions
- syndicate standing tracker
- conclave / steel essence weekly reset countdowns

prs welcome.

---

## license

mit — see `package.json`. game content, names, and images belong to digital extremes.

---

## credits

- world state data: [warframestat.us](https://docs.warframestat.us) (open-source)
- market data: [warframe.market](https://warframe.market) (community)
- icons: [lucide](https://lucide.dev)
- font: [jetbrains mono](https://www.jetbrains.com/lp/mono/) + [nerd fonts](https://www.nerdfonts.com)
- built by tenno, for tenno.
