# Professor Jyotiprakash Mishra — Immersive 3D Research Portfolio
### 3D Cosmic WebGL · 22-Card Rolodex Ring · Research Terminal · Academic CV

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![WebGL: Three.js](https://img.shields.io/badge/WebGL-Three.js-green.svg)](https://threejs.org)
[![Animation: GSAP](https://img.shields.io/badge/Animation-GSAP%20ScrollTrigger-brightgreen.svg)](https://greensock.com/gsap/)
[![RISC--V: Hardware%20Security](https://img.shields.io/badge/Architecture-RISC--V%20Hardware%20Security-emerald)](https://jyotiprakash.org)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

An award-winning interactive 3D research portfolio and cybernetic systems laboratory commemorating the academic, industrial, and teaching contributions of **Professor Jyotiprakash Mishra** — Senior Assistant Professor of Computer Science at KIIT, PhD Candidate in Computer Science at BITS Pilani (thesis submitted), and Co-founder/CEO of ENineHQ Technologies.

---

## 🚀 Dual Immersive Experiences

| Experience | Entry File | Description & Highlights |
|---|---|---|
| **🌌 Cosmic Luxury 3D Landing Page** | [`landing.html`](landing.html) | **Awwwards-level cinematic experience**: 1,800 iridescent floating Three.js particles, interactive rotating 3D Torus-Knot geometry, GSAP ScrollTrigger anti-gravity window physics, 3D card tilt on hover, glassmorphism UI, and Tailwind styling. |
| **⚡ Cyber-Terminal & 22-Card 3D Lab** | [`index.html`](index.html) | **Complete research laboratory & CV**: 22-Card Rolodex Ring in 3D space with inertia, hardware-accurate RISC-V Zicbom cache coherency simulator, UNIX terminal emulator, 7 matrix theme modes, and one-click printable academic CV. |

---

## 🌟 Key Features

### 1. Central 22-Card Rolodex Ring (`rolodex_ring.js`)
- **Mathematical Ring Geometry:**
  - $N = 22$ cards representing verified research, publications, books, patents, tools, and career highlights.
  - Radius: $R = 0.62 \times \min(\text{stage width}, \text{stage height})$.
  - Angle per frame: $a = \text{rotation} + (i / N) \times 2\pi$.
  - 3D Coordinates:
    $$x = \sin(a) \times R$$
    $$z = \cos(a) \times R$$
    $$y = -\cos(a) \times R \times 0.42$$
  - Depth-aware parameters:
    $$\text{depth} = \frac{z / R + 1}{2}$$
    $$\text{scale} = 0.55 + \text{depth} \times 0.55$$
    $$\text{opacity} = 0.30 + \text{depth} \times 0.70$$
    $$\text{brightness} = 0.5 + \text{depth} \times 0.7$$
    $$\text{cardRotation} = \sin(a) \times 14^\circ$$
  - Transform order: `translate(-50%, -50%) translate3d(x, y, 0) rotate(cardRotation deg) scale(scale)`
- **True Depth Sorting:** Array sorted by $z$ ascending each frame; sorted index assigned as `z-index`.
- **Drag & Momentum:** Pointer capture with horizontal delta tracking, idle drift of `0.0045`, and smooth decay:
  $$\text{vel} \leftarrow \text{vel} + (0.0045 - \text{vel}) \times 0.02$$

### 2. Immersive Three.js WebGL Cosmic Background (`cosmic_bg.js`)
- Full-screen WebGL scene with deep space ambiance, floating iridescent dust particles, glowing point lights, and an abstract 3D wireframe cyber-core.
- Interactive mouse-responsive parallax with smooth interpolation.
- Full theme synchronization across all 7 themes.
- Automatic pause when tab is hidden and strict compliance with `prefers-reduced-motion`.

### 3. Scroll-Driven 3D Window Transitions (`scroll_experience.js`)
- GSAP & ScrollTrigger multi-section experience with rotating 3D panels and staggered reveals:
  - **Hero & Rolodex Ring**
  - **Research & Formal Methods (BITS Pilani Thesis)**
  - **Publications Highlights (23 Peer-Reviewed Papers)**
  - **Teaching Tools & Systems Simulators (8 Free Laboratories)**
  - **Books & Intellectual Property (2 De Gruyter Textbooks, 6 Patents)**
  - **Career Timeline & Education (16 Years Across KIIT, Epic Systems, Oracle, BITS Pilani, UW-Madison)**

### 4. Interactive Research Simulations (`cache_sim.js`)
- Hardware-accurate simulation of **Software-Managed Cache Coherency (Zicbom) & DMA Bypass** (*SmartCom LNNS 2026*):
  - RV64G CPU Core, Zicbom Cache Line, Physical DRAM, DMA Peripheral, and Promela/Spin Monitor.
  - Operations: `CPU Read`, `CPU Write (Dirty)`, `CBO.CLEAN`, `CBO.INVAL`, `CBO.FLUSH`, `DMA Read`, `DMA Write`.
  - Proves how Zicbom instructions safely eliminate **58.8% of redundant CMOs** without data staleness.

### 5. Nine Primary Academic Categories
1. **Patents** — Hardware monitors & silicon IP (6 published patent applications)
2. **Publications** — 23 peer-reviewed journal and conference publications
3. **Teaching Tools** — 8 browser systems simulators (`xv6`, `8086`, `netsim`, `compy`, `baysik`, `lohgo`, `see`, `strux`)
4. **Research** — RISC-V hardware security, microarchitectural side-channels, BITS Pilani thesis
5. **Books** — 2 published textbooks with De Gruyter Brill
6. **Experience** — 16 years of leadership across KIIT, Epic Systems (USA), Oracle, ENineHQ
7. **Education** — BITS Pilani (PhD, BE Hons with 9.53 CGPA), University of Wisconsin-Madison (MS in CS with 3.9/4.0 GPA)
8. **Teaching** — Courses in computer architecture, operating systems, 78+ lecture videos, 250+ articles
9. **Contact** — Academic email (`mail@jyotiprakash.org`), Google Scholar, GitHub, LinkedIn

### 6. Seven Coordinated Themes
Switch anytime with keys <kbd>1</kbd>–<kbd>7</kbd> or navigation buttons:
- `Matrix` (#39ff7a green terminal)
- `Amber CRT` (#ffb000 retro monochrome)
- `Neon` (#ff2bd6 / #00f0ff synthwave)
- `Ice` (#4cc3ff deep cold blue)
- `Red team` (#ff3b3b offensive security red)
- `Ghost` (#ececec clean stealth dark)
- `Paper` (#0b6e4f editorial daylight print)

### 7. Complete CV & Clean Print Mode
- Access via `#cv` or top navigation.
- Dedicated `@media print` layout stripping out all 3D canvas and decorative animations to produce a clean, multi-page, publication-grade academic CV formatted for browser **Print** and **Save as PDF**.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+) or any static HTTP web server.

### 2. Local Execution
```bash
# Clone the repository
git clone https://github.com/adityasystems99/prof-JpM-portpolio.git
cd prof-JpM-portpolio

# Run verification test suite
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
