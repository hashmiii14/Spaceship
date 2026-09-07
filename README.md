# STARFALL: DEFEND THE GALAXY

High-performance, futuristic arcade space combat simulator built with React, TypeScript, Phaser 3, Tailwind CSS, and Vite. Designed for 60 FPS combat, dynamic weapon systems, multi-tier enemy waves, procedural particle effects, responsive mobile controls, and zero-latency client-side deployment.

Live Website: https://spacegame-ten.vercel.app/

---

## Technical Overview

STARFALL combines a high-speed Phaser 3 canvas simulation loop with a decoupled React HUD layer connected via an asynchronous event bus (`EventBus`). This architecture guarantees that rendering and physics operations run at hardware-accelerated 60 FPS without React reconciliation bottlenecks, while UI elements (health meters, weapon selectors, sector alerts, and music controls) remain reactive and accessible.

---

## Core Systems & Engine Design

### 1. Game Scene & Physics Loop
- **Engine**: Phaser 3 (Arcade Physics System).
- **Movement Physics**: 8-directional acceleration with drag damping and responsive banking rolls.
- **Flight Parallax**: 3-layer parallax starfield with adaptive warp streaks and nebulae drifting relative to ship movement.
- **Combat Entity Pools**: Hardware-capped active enemies (maximum 18 concurrent) and projectiles (maximum 36 concurrent) to maintain a steady 60 FPS on mobile devices.
- **Hit Detection & Damage**: Bounding collision geometry with invulnerability frames, shield absorption layers, and multi-stage hull disintegration sequences.

### 2. Progressive Sector & Threat Escalation
The simulation spans 7 distinct sectors, scaling dynamically in density, speed, projectile frequency, and enemy flight patterns:
- **Sector 01 // ORION FRONTIER**: Introductory scout squadrons.
- **Sector 02 // NEBULA DRIFT**: Interceptor sweeps with zig-zag evasive patterns.
- **Sector 03 // ASTEROID BELT**: High-density asteroid fields with recursive physical fragmentation.
- **Sector 04 // SOLARIS REACH**: Heavy cruisers deploying forward plasma cannons.
- **Sector 05 // CRIMSON VOID**: Swarm wings combined with long-range gunship batteries.
- **Sector 06 // ABYSS GATEWAY**: Elite Reaper flagships with 3-round burst lasers and high power-up drop rates.
- **Sector 07 // CORE CITADEL**: Omega Mothership capital boss encounter featuring multi-phase bullet patterns, summon waves, and enrage states.

### 3. Dual Audio Engine Architecture
- **Web Audio SFX Synthesizer (`SoundEffects.ts`)**: Generates procedural laser sweeps, plasma beams, asteroid fractures, shield hums, klaxon sirens, and explosion rumbles via Web Audio API `OscillatorNode` and `BiquadFilterNode`. Zero external asset loading required for sound effects.
- **Sequential 4-Track Music Manager (`MusicManager.ts`)**:
  - `metadata` audio preloading to prevent heavy initial bandwidth overhead on cellular networks.
  - Seamless sequential track advancement (1 -> 2 -> 3 -> 4 -> 1).
  - Explicit interactive controls: Play/Pause, Next Track, Previous Track, Mute/Unmute, and volume retention in `localStorage`.
  - Playlist:
    1. "Chipi Chipi Chapa Chapa (Dubidubidu)" - Christell
    2. "Axel F" - Crazy Frog
    3. "Gangnam Style" - PSY
    4. "Apun Jaise Tapori" - Munna Bhai M.B.B.S.

### 4. Adaptive Responsive HUD
- **Desktop HUD**: Full military telemetry including combat score, vitals, active weapon status, mission objectives, boss health gauges, kill combo multipliers, pilot callsign, and comprehensive music widget.
- **Mobile HUD**: Streamlined three-point layout configured for small viewports:
  - **Top Left**: Combat Score and Pilot Level badge with compact HP and shield bars.
  - **Top Center**: Formatted survival timer and sector indicator.
  - **Top Right**: Compact music controls (play/pause, next track, mute) and quick pause trigger.
- **Touch Navigation**: Virtual analog joystick positioned at the lower-left edge and tactile fire trigger at the lower-right edge, ensuring complete forward flight visibility.

---

## Tactical Power-Up Arsenal

Power-ups drop dynamically from destroyed hostiles and asteroid cores:
- **Shield Dome**: Deploys an energy barrier absorbing up to 3 direct hits.
- **Rapid Fire**: Quadruples primary laser firing cadence.
- **Overcharge**: Piercing heavy plasma blast dealing triple hull damage.
- **Spread Shot**: 3-way fan pattern laser bolts.
- **Hull Repair**: Instantly restores +35 hull integrity.
- **Score Boost**: Applies a 2X score multiplier across all combat actions for 15 seconds.

---

## Controls Reference

### Desktop
- **Steer**: `W`, `A`, `S`, `D` or `Arrow Keys`
- **Primary Weapon**: `Spacebar` (hold for continuous firing)
- **Pause / Resume**: `Escape` or `P`
- **Audio Mute**: `M`
- **Next Song**: `N`

### Mobile & Tablet
- **Steer**: Touch and drag the virtual joystick (lower-left quadrant).
- **Fire**: Press and hold the primary fire button (lower-right quadrant).
- **Audio / Pause**: Dedicated HUD toggles anchored to the top-right margin.

---

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript 5.7
- **Bundler**: Vite 6
- **Simulation Engine**: Phaser 3.87 (Arcade Physics, Canvas/WebGL Renderers)
- **Styling**: Tailwind CSS 3.4
- **Iconography**: Lucide React
- **Celebration Effects**: Canvas Confetti
- **Audio**: Web Audio API (procedural synthesis) + HTML5 Audio (soundtrack management)

---

## Directory Layout

```
├── public/
│   ├── audio/              # 4 soundtrack MP3 assets
│   ├── og-image.jpg        # Open Graph & Twitter promotional banner
│   └── favicon.svg         # Delta-wing fighter SVG icon
├── src/
│   ├── audio/
│   │   ├── MusicManager.ts # HTML5 Audio playlist state machine
│   │   └── SoundEffects.ts # Web Audio procedural synthesizer
│   ├── game/
│   │   ├── config/         # Level definitions and enemy parameters
│   │   ├── entities/       # Player, Enemy, Boss, Bullet, Asteroid, PowerUp
│   │   ├── scenes/         # Phaser GameScene, BackgroundScene
│   │   └── StarfallGame.ts # Phaser Game bootstrap
│   ├── types/              # TypeScript interface definitions
│   ├── ui/                 # React HUD, MainMenu, PauseModal, GameOverModal
│   ├── utils/              # EventBus, Storage
│   ├── App.tsx             # Root React application component
│   └── main.tsx            # React application entry point
├── index.html              # HTML shell with Open Graph and font preconnects
├── package.json            # Project dependencies and npm scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

---

## Local Development

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation
```bash
# Clone repository
git clone https://github.com/hashmiii14/Spaceship.git
cd Spaceship

# Install dependencies
npm install
```

### Commands
```bash
# Start local development server with Hot Module Replacement
npm run dev

# Run TypeScript typecheck and compile production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## Performance Considerations

- **Entity Pooling & Capping**: Projectiles are strictly capped at 36 active instances, and enemies at 18 active instances. Inactive objects are pooled using `getFirstDead()` and recycled instead of allocated dynamically during combat.
- **Throttled React HUD Updates**: The physics loop runs at hardware 60 FPS in Phaser, but stats emitted to React via `EventBus` are throttled to ~10 Hz (every 85ms). This avoids React reconciliation overhead during intense combat.
- **On-Demand Audio Loading**: Audio elements use `preload = 'metadata'` to eliminate mobile first-load stalls on cellular connections. Audio tracks load on-demand upon player sortie initiation.
- **Procedural Audio Synthesizer**: Web Audio API oscillators are generated on-the-fly and automatically disconnected/stopped with exponential decay ramps to prevent audio node leakage.
- **RAF & Timer Lifecycle Safety**: Animation loops and intervals track cancellation handles and unmount cleanups to guarantee zero background memory leaks.

---

## Developer Extension Guides

### 1. How to Add a New Enemy Archetype
1. Open `src/game/config/LevelConfig.ts` and add the archetype name to the `EnemyType` union:
   ```typescript
   export type EnemyType = 'scout' | 'interceptor' | 'shooter' | 'tank' | 'bomber' | 'elite' | 'your_enemy';
   ```
2. In `src/game/scenes/GameScene.ts`:
   - Register the enemy texture in `preload()` if using a custom sprite or procedural graphics generator.
   - Configure health, velocity, and bounty inside `createEnemy(type, x, y)`.
   - Implement motion and attack logic inside `updateEnemies(time, dt)`.
3. Add the new enemy archetype into the target sector's `enemyPool` array in `LevelConfig.ts`.

### 2. How to Add a New Sector / Level
1. Open `src/game/config/LevelConfig.ts` and locate the `SECTORS` array.
2. Append a new `SectorConfig` entry:
   ```typescript
   {
     id: 8,
     name: 'SECTOR 08',
     codename: 'HYPERION GATE',
     subtitle: 'TERMINAL CONVERGENCE',
     startSecond: 420,
     endSecond: 480,
     starSpeedMult: 2.2,
     nebulaColors: { primary: 0x3b82f6, secondary: 0x1d4ed8, core: 0x0284c7 },
     enemySpawnInterval: 650,
     enemyPool: ['interceptor', 'bomber', 'elite'],
     asteroidDensity: 0.35,
     debrisFrequency: 0.25,
     signatureEvent: 'VOID_DISTORTION',
     bossType: 'boss_galactic_core',
     bossHp: 8000,
   }
   ```
3. The progression engine seamlessly transitions to the sector when `survivalTime >= startSecond`.

### 3. How to Add or Replace Soundtrack Tracks
1. Place the `.mp3` asset inside `/public/audio/` (e.g. `/public/audio/my-track.mp3`).
2. Open `src/audio/MusicManager.ts` and add a new track configuration to `PLAYLIST`:
   ```typescript
   {
     id: 'my-track',
     title: 'Track Title',
     artist: 'Artist Name',
     url: '/audio/my-track.mp3',
   }
   ```
3. The sequential playlist cycle automatically includes the new track (e.g. 1 -> 2 -> 3 -> 4 -> 5 -> 1).

---

## Troubleshooting

- **Audio Autoplay Policy**: Modern browsers restrict unmuted audio before user interaction. Music starts automatically upon clicking "PLAY" on the main menu.
- **Viewport Scaling**: If the canvas appears cropped on specific mobile viewports, verify that `viewport-fit=cover` and dynamic viewport units (`100dvh`) are preserved on the root container.
- **Virtual Joystick Not Appearing**: Touch controls automatically initialize on touch devices or screens under 1024px width. On desktop browsers with emulation, toggle Device Mode in Chrome DevTools and reload.

---

## Deployment Guidelines

The project compiles to pure static HTML/JS/CSS assets with zero server dependencies:
- **Build Output Directory**: `dist`
- **Build Command**: `npm run build`
- **Hosting Targets**: Vercel, Cloudflare Pages, Netlify, or GitHub Pages.

---

## Credits

- **Pilot Callsign**: MUHAMMAD HASHMI
- **Project**: STARFALL: DEFEND THE GALAXY
- **Repository**: https://github.com/hashmiii14/Spaceship.git
- **Production URL**: https://spacegame-ten.vercel.app/
