# TWEAKIN

Browser-native 3D underground crossover fighting game built for desktop and mobile browsers with Three.js/WebGL.

## Play

GitHub Pages: `https://jensonlr.github.io/Tweakin/`

Landscape is recommended on phones. The game uses touch controls on mobile and keyboard/gamepad controls on desktop.

## Current systems

- Eight distinct fighters with different body proportions, stats, palettes, fighting-style blends and two named finishers each
- Twelve procedural 3D venues with crowds, props, weapons, breakable/environmental elements and venue-specific hazards
- Light, heavy, grapple, block, run, weapon pickup, momentum and special/finisher combat
- Physical-condition and consciousness damage model, knockdowns and KOs
- Environmental wall impacts, ring outs, windows, subway and inferno hazards
- Adaptive AI opponents
- Quick Fight, Battle, Training, Career/Story, Fighter Viewer, Options and Online P2P modes
- Eight-bout career circuit with credits, development points, stat upgrades, style unlocks, cosmetics and persistent saves
- IndexedDB/localStorage persistence
- Web Audio generated soundtrack and combat SFX
- Manual-code WebRTC peer-to-peer online fighting without an account/backend
- Responsive iPhone/Android touch HUD with analogue movement and large action buttons
- Desktop keyboard and gamepad support
- Fixed-step 60 Hz combat simulation and network snapshots

## Controls

### Mobile

Use the virtual stick to move. Buttons provide Light, Heavy, Grab, Block, Run, Weapon and Special. Special becomes useful when the momentum meter is full.

### Keyboard

- Move: `W A S D`
- Light: `J`
- Heavy: `K`
- Grapple: `L`
- Block: `I`
- Run: `Left Shift`
- Special: `U`
- Weapon pickup: `O`
- Pause: `Esc`

A second local input mapping exists on arrow keys/numpad for testing.

## Architecture

- `main.js` - application bootstrap
- `game/Game.js` - renderer, fixed-step runtime and camera
- `game/CombatMatch.js` - match rules and combat resolution
- `game/Fighter.js` - procedural fighter models, state machine and animation
- `game/Arena.js` - procedural venues, crowds, props and weapons
- `game/Input.js` - keyboard, gamepad and touch input
- `game/AI.js` - adaptive opponent logic
- `data/roster.js` - fighter definitions
- `data/arenas.js` - venue definitions
- `data/career.js` - career progression
- `ui/AppUI.js` - menus, HUD, touch controls and mode flows
- `audio/AudioEngine.js` - generated music/SFX
- `persistence/SaveStore.js` - saves/settings
- `multiplayer/NetSession.js` - WebRTC P2P transport
- `style.css` - complete responsive UI system

## Content note

TWEAKIN is a fictional satirical fighting game. Public figures are depicted as exaggerated game characters. No person, estate, organisation or public figure endorses or is affiliated with the project. George Floyd is portrayed only as a fictional game fighter; the game does not reference or recreate his real-world death.
