# Professor Jyotiprakash Mishra — Immersive Research Portfolio
### 3D Cybernetic Space Gallery · Systems Laboratory Terminal · Academic CV

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![WebGL: Three.js](https://img.shields.io/badge/WebGL-Three.js-green.svg)](https://threejs.org)
[![RISC--V: Hardware%20Security](https://img.shields.io/badge/Architecture-RISC--V%20Hardware%20Security-emerald)](https://jyotiprakash.org)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

An award-winning interactive 3D research portfolio and cybernetic systems laboratory commemorating the academic, industrial, and teaching contributions of **Professor Jyotiprakash Mishra** — Senior Assistant Professor of Computer Science at KIIT, PhD Candidate in Computer Science at BITS Pilani (thesis submitted), and Co-founder/CEO of ENineHQ Technologies.

---

## 🌟 Key Features

### 1. Central 3D Cylindrical Gallery (Three.js WebGL)
- **Nine Primary Nodes:** Evenly distributed in 3D radial space:
  1. `01 / Patents` — Hardware data-flow monitors & silicon IP (6 published patent applications)
  2. `02 / Publications` — 23 scholarly publications across microarchitectural side channels, RISC-V, and memory encryption
  3. `03 / Teaching Tools` — 8 open browser-based systems laboratories (`xv6`, `8086`, `netsim`, `compy`, `baysik`, `lohgo`, `see`, `strux`)
  4. `04 / Research` — Doctoral research at BITS Pilani on open-source RISC-V processor security
  5. `05 / Books` — 2 published textbooks with De Gruyter Brill (*Cryptographic Foundations* & *RISC-V Architecture and XV6*)
  6. `06 / Experience` — 16 years of leadership across KIIT, Epic Systems (Madison, WI), Oracle (Bangalore), and ENineHQ
  7. `07 / Education` — BITS Pilani (PhD, BE Hons with 9.53 CGPA), University of Wisconsin-Madison (MS in CS with 3.9/4.0 GPA)
  8. `08 / Teaching` — Core courses in computer architecture, operating systems, 78+ lecture videos, 250+ technical articles
  9. `09 / Contact` — Verified email (`mail@jyotiprakash.org`), Google Scholar, GitHub (`ShowMeTheStack`), LinkedIn, and Hashnode
- **Natural Interaction:** Mouse drag, touch drag, wheel momentum, inertia damping, and keyboard navigation (<kbd>←</kbd> <kbd>→</kbd> <kbd>Enter</kbd>).
- **Depth-Aware Scaling & Opacity:** Perspective camera with dynamic z-index rendering and glassmorphic translucent panels.
- **Graceful Non-WebGL Fallback:** Automatic degradation to an accessible 2D card grid if WebGL is disabled or unsupported.

### 2. Procedural Luma Portrait Engine
- Canvas-based procedural renderer sampling the professor's genuine portrait and rendering it uniquely per active theme:
  - **Matrix:** Procedural green Katakana and binary matrix rain glyphs
  - **Amber CRT:** 1983 raster phosphor CRT scanlines
  - **Neon:** Duotone cyan/magenta glitch distortion
  - **Ice:** Cyan halftone dot matrix
  - **Red Team:** Thermal camera crosshair target
  - **Ghost:** Monochromatic high-density ASCII art (` .:-=+*#%@`)
  - **Paper:** Grayscale print photograph

### 3. Interactive Research Simulations (Cache Coherency & CMO)
- Real-time simulation of **Software-Managed Cache Coherency (Zicbom)** for RISC-V heterogeneous embedded systems based on Professor Mishra's research (*SmartCom LNNS 2026*):
  - Hardware components: RISC-V Core, Zicbom Cache Line, Physical DRAM, DMA Peripheral, and Promela/Spin Invariant Monitor.
  - Interactive operations: `CPU Read`, `CPU Write (Dirty)`, `CBO.CLEAN`, `CBO.INVAL`, `CBO.FLUSH`, `DMA Read`, `DMA Write`.
  - Automatic detection of stale cache and stale memory hazards, verifying how Zicbom instructions safely eliminate **58.8% of redundant CMOs**.

### 4. Seven Coordinated Themes
- Switch themes in real-time using keys <kbd>1</kbd>–<kbd>7</kbd> or navigation buttons:
  - `Matrix` (#39ff7a green terminal)
  - `Amber CRT` (#ffb000 retro monochrome)
  - `Neon` (#ff2bd6 / #00f0ff synthwave)
  - `Ice` (#4cc3ff deep cold blue)
  - `Red team` (#ff3b3b offensive security red)
  - `Ghost` (#ececec clean stealth dark)
  - `Paper` (#0b6e4f editorial daylight print)

### 5. Research Terminal Subsystem
- Accessible by pressing <kbd>`</kbd>, <kbd>~</kbd>, or <kbd>:</kbd>.
- Full CLI prompt `guest@jyotiprakash.org:~$` supporting:
  - `help` — Show available commands
  - `cat [section]` — Display verified research and CV records directly in the terminal
  - `theme [name]` — Switch themes via command line
  - `open [section]` — Launch deep-link sheets
  - `clear` — Clear terminal buffer

### 6. Academic Curriculum Vitae & Clean Print Mode
- Access via `#cv` or pressing the `Full CV` link.
- Strict `@media print` layout stripping out all 3D canvas and decorative animations to produce a clean, multi-page, publication-grade academic CV formatted for browser **Print** and **Save as PDF**.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+) or any static HTTP web server.

### 2. Local Execution
```bash
# Clone the repository
git clone https://github.com/adityasystems99/prof-JpM-portpolio.git
cd prof-JpM-portpolio

# Run verification tests
npm test

# Start local server
npm start
```

Visit **`http://localhost:3000`** in your browser.

---

## 🗄️ Database Architecture (Supabase / PostgreSQL)

A complete, normalized schema is provided in [`supabase/schema.sql`](supabase/schema.sql) with strict Row Level Security (RLS) policies:
- `profiles` — Biographical metadata and credentials
- `papers` — 23 peer-reviewed journal and conference publications with DOI, abstracts, and citation metadata
- `patents` — 6 published patent applications
- `books` — Published textbooks with De Gruyter Brill
- `tools` — Interactive educational simulators and software repositories
- `experiences` — Chronological industry and faculty appointments
- `education` — Verified academic degrees (BITS Pilani, UW-Madison)
- `contact_inquiries` — Public write-only message dispatch

---

## 🌐 Deployment

### Vercel (1-Click Deployment)
The project includes [`vercel.json`](vercel.json) pre-configured with security headers and clean URL routing:
```bash
npx vercel
```

### Static Hosting (GitHub Pages / Cloudflare Pages)
This repository is 100% portable and static. Point any static hosting service to the repository root directory.

---

## 📄 Provenance & Academic Integrity
All research claims, paper titles, DOIs, patent applications, degrees, and employment timelines are verified against Professor Jyotiprakash Mishra's official scholarly records.

- **Google Scholar:** [citations?user=sE2dRWIAAAAJ](https://scholar.google.com/citations?user=sE2dRWIAAAAJ)
- **GitHub:** [@ShowMeTheStack](https://github.com/ShowMeTheStack)
- **LinkedIn:** [in/mishrajp88](https://linkedin.com/in/mishrajp88/)
- **Blog:** [blog.jyotiprakash.org](https://blog.jyotiprakash.org/)

---
*Built with precision and respect for Professor Jyotiprakash Mishra.*
