# TWEAKIN

TWEAKIN is a browser-native 3D underground crossover fighting game built with Three.js/WebGL for desktop and mobile browsers.

## Play

GitHub Pages: `https://jensonlr.github.io/Tweakin/`

Landscape is recommended on phones. The game has responsive touch controls, keyboard controls and gamepad support. It can be installed as a PWA.

## Character pipeline status

The combat/runtime architecture now distinguishes clearly between **fighter-specific authored assets** and **development reference rigs**.

The three generic GLBs under `assets/characters/reference/` are retargeting/deformation references only. They are not permitted to render as Trump, Netanyahu, Kirk, Floyd, Wojak, Gigachad, Agarthan or Greek, and they are no longer shipped in the production service-worker cache.

A fighter-specific GLB only replaces the fallback character when it has a local path, verified source/licence, acceptable mesh/PBR quality, a proper humanoid skeleton and the complete combat animation contract. Required authored clips are idle, walk, run, light, heavy, grapple, block, hit, knockdown, get-up, special, victory and KO. Ready skinned characters are cloned with Three.js SkeletonUtils and driven by AnimationMixer crossfades.

At present the eight final roster likeness GLBs are **not yet marked production-ready**. The live game therefore uses the procedural fallback characters. The fallback remains playable and now has a dedicated weight/footwork motion pass, but it is not considered final character art.

## Current roster

- Donald Trump — Heavyweight Showman
- Benjamin Netanyahu — Controlled Technician
- Charlie Kirk — High-Tempo Striker
- George Floyd — Grounded Powerhouse
- Wojak — Unstable Counter-Fighter
- Gigachad — Apex Power Hybrid
- Agarthan Gatekeeper — Subterranean Duelist
- The Greek — Living Monument

## Combat

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

The fallback animation stack now applies explicit anticipation, drive, follow-through and recovery phases to strikes, grapples and specials, with locomotion weight shift, pelvis movement, guarding and defensive body motion. Duplicate combo choreography that previously exaggerated attack poses has been removed.

## Modes

- Quick Fight
- Career / Story
- Custom Battle
- Training
- Local Versus
- 4-Way Chaos
- Fighter Viewer
- Fight Guide
- Online P2P via manual WebRTC pairing
- Options

## World

Twelve venues have distinct dressing, lighting, prop layouts, weapon pools and hazards, including Underpass, Iron Gym, The Foundry, Scrapline, Switchyard, Red Room, Lockup, Last Platform, Breakyard, Glasshouse, The Garage and Summit.

## Presentation

- Cinematic versus intro
- Multi-angle special and finish presentation
- Filmic ACES tone mapping and custom post-processing
- Vignette, chromatic impact response, grain and highlight bloom approximation
- Reactive Web Audio soundtrack
- Impact, block, weapon, environmental, pickup, KO and crowd audio
- Responsive HUD for desktop and mobile
- Adaptive render-quality governor

## Progression and persistence

Career mode includes an eight-fight underground circuit, credits, development points, stat improvement, style unlocks, cosmetics, arena/match unlocks, fight-night previews and persistent IndexedDB/localStorage saves.

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

## Character architecture

- `data/characterAssets.js` — fighter-specific asset registry and production-readiness gate
- `game/AuthoredCharacter.js` — GLB loading, SkeletonUtils cloning, PBR preparation and combat validation
- `game/AnimationContract.js` — required combat clip map and validation
- `game/ImportedCombatVisual.js` — AnimationMixer state machine for production-ready authored fighters
- `game/FallbackMotion.js` — temporary weighted motion pass for procedural fallback fighters
- `game/SignatureFighter.js` — combat identity, finishers, metrics and visual bridge

## Runtime architecture

- `main.js` — application bootstrap
- `game/Game.js` — WebGL renderer, fixed-step runtime, camera and adaptive quality
- `game/CombatMatch.js` — match rules, hazards and combat resolution
- `game/CinematicCombatMatch.js` — match intros and finish presentation
- `game/EliteFighter.js` — fighter behaviour, parry/evasion and fallback signature choreography
- `game/PostFX.js` / `game/PresentationDirector.js` — filmic rendering and impact presentation
- `game/Input.js` — keyboard, gamepad and touch input
- `game/AI.js` — adaptive opponents
- `ui/AppUI.js` — core UI, HUD and progression
- `ui/ExtraModes.js` — local versus, four-way chaos, fight history and guide
- `audio/AudioEngine.js` — procedural soundtrack and SFX
- `persistence/SaveStore.js` — saves/settings/history
- `multiplayer/NetSession.js` — WebRTC P2P transport
- `sw.js` — offline/PWA production cache

## Validation

Every push to `main` validates required files, JavaScript syntax, import graph, HTML assets, service-worker cache integrity, roster content and the character asset gate. CI explicitly rejects the generic reference GLBs if they are wired into roster combat runtime, and any fighter marked `status:'ready'` must point to a real local asset.

## Content note

TWEAKIN is a fictional satirical fighting game. Public figures are depicted as exaggerated game characters. No person, estate, organisation or public figure endorses or is affiliated with the project. George Floyd is portrayed only as a fictional game fighter; the game does not reference or recreate his real-world death.
