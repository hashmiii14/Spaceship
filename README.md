# STARFALL: DEFEND THE GALAXY 🚀

A complete, polished, futuristic arcade space shooter built with **React**, **Vite**, **TypeScript**, and **Phaser 3**. Designed for high-speed action, retina visuals, and 100% client-side deployment directly to **Vercel**.

![STARFALL Banner](https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80)

---

## 🎮 Game Features

- **Continuous Forward Space-Flight Feel**:
  - 3-layer parallax starfields with high-speed warp streaks and twinkling stellar dust.
  - Procedural drifting deep-space nebulae (cyan, magenta, and deep violet cosmic clouds).
  - Celestial planetary bodies drifting through the background.
  - Responsive horizontal tilt and background parallax tied directly to ship banking.

- **Futuristic Player Spaceship**:
  - Responsive delta-wing fighter with twin plasma cannons, metallic hull shading, and cockpit canopy.
  - Dynamic dual thruster engine particles.
  - 8-directional smooth acceleration, damping, and banking roll animation.
  - Translucent hexagonal energy forcefield dome with rotation and impact absorption.
  - Invulnerability flashing and catastrophic multi-stage destruction sequence.

- **Tactical Power-Up Arsenal**:
  - 🛡️ **Shield Dome**: Absorbs 3 direct hits before hull integrity takes damage.
  - ⚡ **Rapid Fire**: Quadruples laser cannon fire rate with neon cyan pulses.
  - 🔥 **Overcharge Beam**: Heavy piercing magenta death beam dealing 3x damage.
  - 🎯 **Triple Spread**: 3-way fan spread laser bolts.
  - 💚 **Hull Repair**: Instantly restores +35 ship health.
  - 🏆 **2X Score Boost**: Multiplies all enemy and asteroid bounties for 15 seconds.

- **Hostile Intelligence**:
  - **Scout**: Swift crimson interceptor gliding in sine-wave sweeps.
  - **Striker**: Golden needle fighter executing sharp, evasive zig-zag bursts.
  - **Cruiser**: Heavy armored battlecruiser with twin forward plasma cannons.
  - **Gunship**: Tactical patrol ship that hovers and fires targeted plasma volleys.
  - **Reaper Elite**: Shielded ruby flagship with 3-round burst lasers and high power-up drop rates.

- **Asteroid Fragmentation**:
  - Procedural craggy polygonal asteroids with crater shading and glowing crystal veins.
  - Physical split mechanics: Large asteroids shatter into 2 Medium chunks; Mediums shatter into 2 Small chunks with debris particles.

- **Boss Battle: Omega Mothership**:
  - Dramatic **"BOSS INCOMING"** emergency klaxon and warning banner.
  - Colossal flagship with animated hyperdrive reactor core, wing cannons, and multi-phase combat:
    - **Phase 1**: Heavy laser spreads, plasma spheres, and escort fighters.
    - **Phase 2 (<50% HP)**: Enraged overdrive, spiral bullet hell storm, homing projectiles, and rapid barrage.
  - Epic destruction sequence with cascading explosions, camera shake, whiteout flash, and 5000-point bounty!

- **Web Audio SFX Engine**:
  - Zero-latency procedural sound synthesizer (laser sweeps, heavy beams, impact sparks, asteroid crunches, shield deflects, boss siren klaxon, fanfare, game over stings).
  - No external audio file dependencies for SFX; works 100% offline.

- **Sequential 3-Track Music Playlist**:
  - Strict sequential playback:
    1. **"Dubidubidu (Chipi Chipi Chapa Chapa)"** — Christell
    2. **"Axel F"** — Crazy Frog
    3. **"Gangnam Style"** — PSY
    (Repeats 1 ➔ 2 ➔ 3 ➔ 1 indefinitely, NO shuffle).
  - Respects browser autoplay restrictions (starts upon pressing "PLAY GAME").
  - Includes an emergency procedural synthesizer fallback so music plays reliably in any browser environment even if files are blocked or offline.
  - Easy drop-in replacement in `/public/audio/` (`dubidubidu.mp3`, `axel-f.mp3`, `gangnam-style.mp3`).

- **Controls**:
  - **Desktop**: `Arrow Keys` or `WASD` to navigate, `SPACE` to fire, `ESC` to pause.
  - **Mobile & Tablet**: Ergonomic virtual joystick on bottom-left and dedicated touch fire button on bottom-right. Responsive across all screen ratios.

- **Persistence & Celebrations**:
  - Persistent high score, music preference, sound preference, and volume stored in `localStorage`.
  - Animated **"NEW HIGH SCORE!"** celebration with confetti cannons and pulsing neon borders when breaking records.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Bundler**: Vite 6
- **Game Engine**: Phaser 3 (Arcade Physics, Particle Emitters, Scale Manager, Texture Manager)
- **Styling**: Tailwind CSS + Bespoke Cyber Sci-Fi Glassmorphism & Neon Shadows
- **Audio**: HTML5 Audio + Web Audio API (AudioContext)
- **Effects**: Canvas Confetti + Custom Particle Emitters

---

## 🚀 Deployment to Vercel

The application is completely client-side and requires zero backend configuration.

### One-Click Vercel Deploy:
1. Push this repository to GitHub.
2. Import the repository into your Vercel dashboard.
3. Vercel automatically detects the Vite configuration:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Click **Deploy**!

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```
