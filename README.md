# Professor Jyotiprakash Mishra — Immersive 3D Digital Experience
### Three.js WebGL · GLSL Iridescent Shaders · GSAP ScrollTrigger · Particle-Cloak Intro · Interactive 3D Lab

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![WebGL: Three.js](https://img.shields.io/badge/WebGL-Three.js%20r128-green.svg)](https://threejs.org)
[![Animation: GSAP](https://img.shields.io/badge/Animation-GSAP%203%20%2B%20ScrollTrigger-brightgreen.svg)](https://greensock.com/gsap/)
[![Architecture: RISC--V](https://img.shields.io/badge/Security-RISC--V%20Hardware%20Defense-emerald)](https://jyotiprakash.org)

An award-winning, experimental, cinematic academic digital experience commemorating the contributions of **Professor Jyotiprakash Mishra** — Assistant Professor of Computer Science at KIIT, PhD Candidate at BITS Pilani (thesis submitted), and Co-founder/CEO of ENineHQ Technologies.

---

## 🌟 The Experience Architecture

### 1. Particle-Cloak Intro (`particle_cloak.js`)
- **Full-Screen Living Particle Veil:** High-density Canvas 2D particle simulation with spring dynamics and autonomous Lissajous drift.
- **Pointer Repulsion Physics:** Mouse and touch movement parts the particles to reveal the introduction underneath.
- **Explosive Dissolve Transition:** Clicking **"Enter Portfolio ↗"** triggers an outward radial particle dispersal that transitions into the 3D portfolio.

### 2. Central Procedural Organic Spine Sculpture (`spine_sculpture.js`)
- **Twisting Iridescent Crystal Vortex:** Multi-layered Catmull-Rom tubular geometry rendered with custom GLSL vertex and fragment shaders.
- **Spectrum Iridescence:** View-dependent dynamic color shifts across electric cyan (`#48E8F5`), turquoise (`#38DCCB`), cobalt (`#477BFF`), ultraviolet (`#9865FF`), hot pink (`#FF39C8`), fuchsia (`#FF63B5`), and warm gold (`#FFD38B`).
- **Orbiting Helical Filaments:** Pulsing golden and cyan energy helix ribbons spiraling along the spine.
- **Wet Reflective Obsidian Floor:** Dark glossy floor plane at the base that dynamically reflects the colored light with organic wave ripples.
- **Rising 3D Embers:** Ascending cyber-dust and sparkling particles with additive blending.

### 3. Spatial Glass Constellation (`index.html`)
Inspired by modern 3D spatial interfaces ("Knowledge for a Better Tomorrow"):
- **Editorial Introduction:** Typography featuring Cinzel, Cormorant Garamond, Inter, and JetBrains Mono.
- **Six Floating Spatial Portals:**
  1. **`01 RESEARCH`** — Side-channel security on RISC-V processors, BITS Pilani PhD thesis.
  2. **`02 PUBLICATIONS`** — Peer-reviewed papers across IEEE, Springer, and ELSEVIER.
  3. **`03 BOOKS & PATENTS`** — Textbooks with De Gruyter Brill and patented hardware security innovations.
  4. **`04 TEACHING & RESOURCES`** — Open-access systems simulators and educational tools.
  5. **`05 ACADEMIC TIMELINE`** — 16-year career timeline across Oracle, Epic Systems, KIIT, and ENineHQ.
  6. **`06 3D LABORATORY`** — Live interactive microarchitectural simulation studio.

### 4. Interactive 3D Simulation Studio (`cache_sim.js`)
- Hardware-accurate simulation of **Software-Managed Cache Coherency (CMO) & DMA Hazard Bypass** based on published research (*SmartCom LNNS 2026*).
- Live step-by-step state machine illustrating how Zicbom instructions prevent data corruption and eliminate redundant cache maintenance operations.

### 5. Sliding Glass Drawer & Research Terminal (`app_logic_full.js`)
- **Sliding Glass Drawer Modal (`#sheet`):** In-depth modal views for all publications, thesis chapters, course tools, and printable CV.
- **Interactive Terminal Console (`#term`):** UNIX-style command-line environment accessible via hotkey (<kbd>`</kbd> or <kbd>~</kbd>) or navigation button.

---

## 🚀 Running Locally

```bash
# Clone the repository
git clone https://github.com/adityasystems99/prof-JpM-portpolio.git
cd prof-JpM-portpolio

# Start any local HTTP server
npx -y http-server . -p 8888 -c-1 --cors
```

Open `http://localhost:8888/` in any modern web browser with WebGL support.

---

## 📄 License

Copyright (C) 2026 Jyotiprakash Mishra. Released under the [MIT License](LICENSE).
