# TWEAKIN

TWEAKIN is a browser-native 3D underground crossover fighting game built with Three.js/WebGL for desktop and mobile browsers.

## Play

GitHub Pages: `https://jensonlr.github.io/Tweakin/`

Landscape is recommended on phones. The game has a responsive touch layout, keyboard controls and gamepad support. It can be installed as a PWA and caches the production runtime after first load.

## Current build

### Fighters

Eight distinct fighters use separate proportions, palettes, wardrobe geometry, facial construction, material treatment, stance and attack choreography:

- Donald Trump — Heavyweight Showman
- Benjamin Netanyahu — Controlled Technician
- Charlie Kirk — High-Tempo Striker
- George Floyd — Grounded Powerhouse
- Wojak — Unstable Counter-Fighter
- Gigachad — Apex Power Hybrid
- Agarthan Gatekeeper — Subterranean Duelist
- The Greek — Living Monument

The live menu and Fighter Viewer render the same detailed 3D fighter pipeline used in combat. Fighters have layered face geometry, clothing/identity details, procedural surface maps, progressive non-gory wear, sweat/stone cracking, weapon models, momentum effects and character-specific combat animation accents.

### Combat

- Light and heavy strikes
- Grapples
- Blocking
- Timing-based parries
- Block + run evasive steps with a short invulnerability window
- Buffered attack inputs
- Running and positional pressure
- Pick-up weapons: bottle, pipe, bat and broom
- Physical-condition and consciousness damage model
- Knockdowns, get-ups and knockouts
- Momentum meter and fighter-specific special/finisher sequences
- Hit stop, camera shake, impact particles, weapon/hand trails and cinematic camera cuts
- Environmental wall impacts and destructible props
- Functional ring-out, window, subway and inferno hazards
- Reactive crowds and destructible debris
- Adaptive AI with style-aware offence, defence, parries, evasions, weapon use and pressure

### Modes

- Quick Fight
- Career / Story
- Custom Battle
- Training with an auto-reset dummy and permanent special meter
- Local Versus
- 4-Way Chaos
- Fighter Viewer
- Fight Guide
- Online P2P via manual WebRTC pairing
- Options

### World

Twelve distinct procedural venues have their own dressing, lighting, prop layouts, weapon pools and hazards, including Underpass, Iron Gym, The Foundry, Scrapline, Switchyard, Red Room, Lockup, Last Platform, Breakyard, Glasshouse, The Garage and Summit.

Venue presentation includes layered architecture, crowd dressing, practical lighting, surface bump/roughness treatment, breakable panels/glass, debris and atmosphere particles.

### Presentation

- Animated 3D menu environment using live fighter models
- Cinematic versus intro
- Multi-angle special and finish presentation
- Filmic ACES tone mapping and custom post-processing
- Vignette, subtle chromatic impact response, grain and highlight bloom approximation
- Reactive Web Audio soundtrack whose intensity follows the fight
- Impact, block, weapon, environmental, pickup, KO and crowd audio
- Responsive HUD for desktop and mobile
- Adaptive render-quality governor for weaker/mobile hardware

### Progression and persistence

Career mode includes an eight-fight underground circuit, credits, development points, stat improvement, style unlocks, cosmetics, arena/match unlocks and persistent IndexedDB/localStorage saves.

## Controls

### Mobile

Use the virtual stick to move. Touch buttons provide Light, Heavy, Grab, Block, Run, Weapon and Special. Tap Block shortly before impact to attempt a parry. Hold Block + Run while moving to evade.

### Keyboard

Player 1:
- Move: `W A S D`
- Light: `J`
- Heavy: `K`
- Grapple: `L`
- Block / parry timing: `I`
- Run: `Left Shift`
- Special: `U`
- Weapon pickup: `O`
- Pause: `Esc`

Player 2 local controls use arrow keys and the numpad. Gamepads are also supported.

## Architecture

- `main.js` — application bootstrap
- `game/Game.js` — WebGL renderer, fixed-step runtime, camera and adaptive quality
- `game/CombatMatch.js` — match rules, hazards and combat resolution
- `game/CinematicCombatMatch.js` — match intros and finish presentation
- `game/EliteFighter.js` — top-level fighter behaviour, parry/evasion and signature choreography
- `game/FaceDetail.js` / `game/CharacterDetail.js` — identity geometry
- `game/CombatWear.js` — progressive visual wear
- `game/VenueArena.js` — venue-specific dressing
- `game/Arena.js` — props, weapons, crowd, hazards and destructibles
- `game/PostFX.js` / `game/PresentationDirector.js` — filmic rendering and impact presentation
- `game/MenuBackdrop.js` — live 3D menu and fighter showcase
- `game/Input.js` — keyboard, gamepad and touch input
- `game/AI.js` — adaptive opponents
- `ui/AppUI.js` — core UI, HUD and progression flows
- `ui/ExtraModes.js` — local versus, four-way chaos and guide
- `ui/UIShowcase.js` — live fighter viewer bridge
- `audio/AudioEngine.js` — procedural soundtrack and SFX
- `persistence/SaveStore.js` — saves/settings
- `multiplayer/NetSession.js` — WebRTC P2P transport
- `sw.js` — offline/PWA production cache

## Validation

Every push to `main` runs GitHub Actions checks for required production files, JavaScript syntax, the local import graph, HTML assets, service-worker cache integrity and roster/arena data. GitHub Pages deploys from the production branch.

## Content note

TWEAKIN is a fictional satirical fighting game. Public figures are depicted as exaggerated game characters. No person, estate, organisation or public figure endorses or is affiliated with the project. George Floyd is portrayed only as a fictional game fighter; the game does not reference or recreate his real-world death.
