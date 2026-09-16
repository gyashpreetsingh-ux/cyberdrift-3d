<div align="center">

# ⚡ CYBERDRIFT 3D: NEO TOKYO OVERDRIVE ⚡
### *High-Octane 3D Cyberpunk Highway Web Racing Experience*

[![Three.js](https://img.shields.io/badge/Three.js-0.160.0-00f3ff?style=for-the-badge&logo=three.js&logoColor=black)](https://threejs.org/)
[![WebGL](https://img.shields.io/badge/WebGL-3D_Engine-ff0055?style=for-the-badge&logo=webgl&logoColor=white)](https://www.khronos.org/webgl/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio-Procedural_Synth-ffe600?style=for-the-badge&logo=soundcharts&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Author](https://img.shields.io/badge/Architect-Yashpreet_Singh-00ff66?style=for-the-badge&logo=github&logoColor=black)](https://github.com/gyashpreetsingh-ux)
[![License](https://img.shields.io/badge/License-MIT-a800ff?style=for-the-badge)](LICENSE)

<br/>

> **"Crafting immersive, high-velocity 3D interactive experiences for the modern web."**  
> — **Created & Engineered by Yashpreet Singh**

---

</div>

## 🌌 OVERVIEW

**CyberDrift 3D** is a next-generation real-time 3D web game engineered from scratch with **Three.js** and **WebGL**. Players navigate a customizable cybercar through an endless multi-lane expressway set in a procedural Neo-Tokyo metropolis, dodging AI traffic, collecting nitro energy cells, and pulling off high-speed near-miss combo multipliers.

Featuring **zero external audio dependencies**, the game uses a custom **Web Audio API sound synthesizer** that generates real-time engine RPM audio, tire screeching, supersonic whoosh effects, and an entire 80s procedural Synthwave soundtrack on the fly.

---

## ✨ Key Features

### 🏙️ 1. 3D Procedural Metropolis & Visuals
- **Dynamic Cyberpunk Skyline**: Procedurally generated skyscrapers with illuminated windows, antenna warning lights, and flyover maglev monorail overpasses.
- **Holographic Neon Billboards**: High-resolution 3D animated signs featuring developer branding:
  - `DEVELOPED BY YASHPREET SINGH`
  - `NEO TOKYO OVERDRIVE 2099`
  - `YASHPREET'S CYBER LABS`
- **Dynamic Weather Engine**:
  - 🌧️ **Cyber Rain**: 1,800+ rain particles, wet reflective asphalt road physics, and windscreen water droplets.
  - 🌃 **Neon Night**: Deep volumetric fog with electric cyan & magenta road lighting.
  - 🌅 **Synth Sunset**: Warm retro golden-hour glow across the highway.
  - ⚡ **Thunder Storm**: Dynamic lightning sky flashes with synthesized thunder audio.

### 🏎️ 2. Customizable Vehicle & Physics
- Detailed 3D cybercar model with aerodynamic chassis, LED headlights, glowing taillights, wheel suspension roll/yaw tilt, and glowing neon ground underglow.
- Dual rocket exhaust pipes with reactive particle flame ignition on Nitro boost.
- 3 Selectable Car Models including the **Yashpreet Edition Golden Hypercar**!
- Paint studio (Cyan, Crimson Fury, Tokyo Gold, Acid Lime, Hyper Violet, Stealth Obsidian).

### 🎥 3. Multi-Perspective Dynamic Camera
- **Chase Cam**: Smooth spring-damped follow cam with high-speed FOV warp (60° to 85°).
- **Cockpit Cam**: First-person interior dashboard view with digital cluster display.
- **Cinematic Action Cam**: Low-angle side-tracking drone camera.
- *Switch seamlessly with `[C]` key!*

### 🎵 4. Procedural Web Audio Synthesizer
- **Real-Time Engine RPM Synthesis**: Dynamic pitch and harmonic distortion scaled to car velocity and simulated 6-speed gearbox.
- **Synthwave Music Generator**: Multi-channel 80s retrowave electronic music engine (Bassline, kick, snare, hi-hats, and arpeggios).
- **Dynamic SFX**: Nitro rocket rumble, tire screech noise, near-miss whoosh, collision crunch, and pickup chimes.

### 🕹️ 5. AI Traffic & Interactive HUD
- Multi-lane AI civilian traffic with autonomous lane-changing logic.
- Near-miss combo multiplier system (`x1.0` to `x8.0` bonus score).
- 2D Canvas Radar Scanner displaying oncoming traffic radar blips.
- Full mobile / tablet touch controls overlay.

---

## 🎮 Controls

| Action | Keyboard | Touch / Mobile | Gamepad |
|---|---|---|---|
| **Steer Left / Right** | `[A]` / `[D]` or `[←]` / `[→]` | `◀` / `▶` Buttons | Left Analog Stick / D-Pad |
| **Accelerate** | `[W]` or `[↑]` | `GAS` Button | `RT` / Right Trigger |
| **Brake / Drift** | `[S]` or `[SPACE]` | `BRAKE` Button | `LT` / Left Trigger |
| **Nitro Overdrive** | `[SHIFT]` or `[W]` | `NITRO` Button | `A` / Cross Button |
| **Cycle Camera View** | `[C]` | Camera Icon | `Y` / Triangle Button |
| **Pause / Resume** | `[P]` or `[ESC]` | Pause Icon | `START` / Options |

---

## 🛠️ Tech Stack & Architecture

```
cyberdrift-3d/
├── index.html            # Main web entry & high-tech glassmorphism HUD
├── package.json          # Project dependencies & Vite scripts
├── vite.config.js        # Vite bundler & allowed hosts configuration
├── manifest.json         # PWA Web App Manifest (Android Play Store Ready)
├── public/
│   ├── sw.js             # Service Worker for offline caching
│   ├── icon-192.png      # 192x192 Cyberpunk App Icon
│   └── icon-512.png      # 512x512 High-Res App Icon
├── css/
│   └── style.css         # Cyberpunk design system, HUD overlays & responsive UI
└── js/
    ├── main.js           # Game bootstrap, state manager & game loop
    ├── engine/
    │   ├── Renderer.js   # Three.js pipeline, lighting & dynamic cameras
    │   ├── City.js       # Procedural highway, skyline & neon billboards
    │   ├── Weather.js    # Rain particles, lightning & atmospheric presets
    │   └── AudioEngine.js# Web Audio synthesis (engine RPM, SFX & music)
    ├── entities/
    │   ├── PlayerCar.js  # Player vehicle mesh, physics & nitro system
    │   ├── TrafficCar.js # AI Traffic spawning, lane change & collisions
    │   └── Pickups.js    # Collectibles (Nitro, Multipliers, Shields)
    ├── ui/
    │   ├── HUD.js        # Speedometer, tachometer, combo alerts & 2D radar
    │   ├── Garage.js     # Vehicle painter, underglow tuning & upgrades
    │   └── AuthorModal.js# Yashpreet Singh creator profile & golden car unlock
    └── utils/
        └── MathUtils.js  # Interpolation, distance & math helpers
```

---

## 🚀 Quick Start (Run Locally)

### 1. Clone the repository
```bash
git clone https://github.com/gyashpreetsingh-ux/cyberdrift-3d.git
cd cyberdrift-3d
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
Open **`http://localhost:5173/`** in your browser and enjoy the game!

### 4. Build for production
```bash
npm run build
```

---

## 🌐 1-Click Deployment

### Deploy to Netlify / Vercel:
- **Netlify Drop**: Drag & drop the `dist/` folder directly onto [app.netlify.com/drop](https://app.netlify.com/drop).
- **Vercel**: Import this GitHub repository on [vercel.com](https://vercel.com) — it will auto-detect Vite and deploy in seconds.

### Deploy to Google Play Store (PWA / Android):
- Enter your live URL into [PWABuilder](https://www.pwabuilder.com) and click **"Package for Android"** to generate the signed `.aab` bundle.

---

## 👨‍💻 Creator & Lead Developer

<div align="center">

### **Yashpreet Singh**
*Lead Architect & Creative Developer*

[![GitHub](https://img.shields.io/badge/GitHub-gyashpreetsingh--ux-181717?style=flat-square&logo=github)](https://github.com/gyashpreetsingh-ux)
[![Email](https://img.shields.io/badge/Email-gyashpreetsingh%40gmail.com-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:gyashpreetsingh@gmail.com)

</div>

---

## 📄 License

This project is licensed under the **MIT License** - feel free to fork, modify, and build upon this project.

<div align="center">
  <b>⭐ If you enjoyed this game, don't forget to give it a star on GitHub! ⭐</b>
</div>
