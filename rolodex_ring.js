/**
 * rolodex_ring.js - Central 22-Card Rolodex Ring
 * Professor Jyotiprakash Mishra — Immersive Research Portfolio
 *
 * Implements exact mathematical specification:
 * - N = 22 cards representing verified research, publications, books, patents, tools, and career highlights
 * - R = 0.62 * min(stage width, stage height)
 * - a = rotation + (i / N) * TAU
 * - x = sin(a) * R
 * - z = cos(a) * R
 * - y = -cos(a) * R * 0.42
 * - depth = (z / R + 1) / 2
 * - scale = 0.55 + depth * 0.55
 * - opacity = 0.30 + depth * 0.70
 * - brightness = 0.5 + depth * 0.7
 * - cardRotation = sin(a) * 14deg
 * - Transform: translate(-50%, -50%) translate3d(x, y, 0) rotate(cardRotation deg) scale(scale)
 * - Depth sorting every frame by z ascending, assigning sorted index as z-index
 * - Pointer drag with momentum: vel += (0.0045 - vel) * 0.02
 */

(function () {
  'use strict';

  // Exactly 22 verified cards
  const RING_CARDS = [
    {
      id: 'pace',
      category: 'papers',
      categoryLabel: 'PUBLICATION · CHIPS 2026',
      badge: 'ESCI / OPEN ACCESS',
      title: 'PACE: Memory Encryption Engine for RISC-V',
      subtitle: 'Formally Verified nth-Order DPA Resistance',
      desc: 'Page-adaptive, cache-anchored memory encryption engine placing TileLink adapters on Rocket & BOOM. Precomputes keystreams during cache residency, cutting eviction latency 9x.',
      meta: 'Mishra, Sahay, Mishra, Pathak · Chips Vol. 5',
      link: 'https://doi.org/10.3390/chips5030025',
      primaryCategory: 'Publications'
    },
    {
      id: 'archer',
      category: 'papers',
      categoryLabel: 'PUBLICATION · COMPUTERS 2026',
      badge: 'SCOPUS Q1 / MIT ARTIFACT',
      title: 'ARCHER: Cycle-Accurate RISC-V Emulator',
      subtitle: 'Side-Channel & Memory Encryption Research',
      desc: 'Fast RV64IMAFDC emulator with 4 core types, coherent caches, and SV39. Boots Linux 6.6 in under 3 minutes, running 3.7x faster than gem5 DerivO3CPU.',
      meta: 'Mishra, Sahay, Mishra, Pathak · Computers Vol. 15',
      link: 'https://doi.org/10.3390/computers15080479',
      primaryCategory: 'Publications'
    },
    {
      id: 'novel-riscv-sca',
      category: 'papers',
      categoryLabel: 'PUBLICATION · CHIPS 2026',
      badge: 'SILICON VALIDATED',
      title: 'Novel Side-Channel Attacks on RISC-V Cores',
      subtitle: 'Simulation-to-Silicon Security Characterization',
      desc: '23 attack classes characterized across 6 open cores (Rocket, VexiiRiscv, CVA6, BOOM). Discovers PMPectre, PMP WARL fingerprinting, and TileLink covert channels.',
      meta: 'Mishra, Sahay, Mishra, Pathak · Chips Vol. 5',
      link: 'https://doi.org/10.3390/chips5030029',
      primaryCategory: 'Publications'
    },
    {
      id: 'twig-ptw-partitioning',
      category: 'papers',
      categoryLabel: 'PUBLICATION · IEEE ISED 2026',
      badge: 'IEEE SCOPUS',
      title: 'TWIG: Page-Table-Walker Cache Partitioning',
      subtitle: 'Deterministic Domain Isolation on BOOM',
      desc: 'Proves RISC-V page-table walker caches leak across security domains. Closes the timing channel with a 113-cell way partition on out-of-order BOOM v4.',
      meta: 'Mishra, Sahay, Mishra, Vashishtha, Pathak · NIT Warangal',
      primaryCategory: 'Publications'
    },
    {
      id: 'mspecsafe-spectre-v1-boom',
      category: 'papers',
      categoryLabel: 'PUBLICATION · IEEE ISED 2026',
      badge: 'IEEE SCOPUS',
      title: 'mspecsafe: Defeating Spectre-v1 on BOOM',
      subtitle: 'Minimal Per-Domain Miss Allocation Gate',
      desc: 'Demonstrates end-to-end Spectre-v1 on BOOM v4. Proves BOOM v3 !IsKilledByBranch guard leaks, and introduces mspecsafe CSR gating miss allocation on br_mask != 0.',
      meta: 'Mishra, Sahay, Mishra, Vashishtha, Pathak · IEEE ISED',
      primaryCategory: 'Publications'
    },
    {
      id: 'safehint-riscv-hint',
      category: 'papers',
      categoryLabel: 'PUBLICATION · IEEE ISED 2026',
      badge: 'IEEE SCOPUS',
      title: 'SafeHint: Fail-Closed Security Directives',
      subtitle: 'Backward-Compatible Contract in HINT Space',
      desc: 'Resolves silent ignorability hazard in RISC-V HINTs. Delivers security directives with canary CSR useccap and fail-closed enforcement CSR usecctl on BOOM v4.',
      meta: 'Mishra, Sahay, Mishra, Vashishtha, Pathak · IEEE ISED',
      primaryCategory: 'Publications'
    },
    {
      id: 'chroma-branch-predictor',
      category: 'papers',
      categoryLabel: 'PUBLICATION · IEEE ISED 2026',
      badge: 'IEEE SCOPUS',
      title: 'CHROMA: Warm Branch Predictor Isolation',
      subtitle: 'Why Index Coloring Cannot Isolate History',
      desc: 'Proves index coloring leaves TAGE history covert channels at 100%. Introduces banked warm global history register and RAS isolation per domain without flushing.',
      meta: 'Mishra, Sahay, Mishra, Vashishtha, Pathak · IEEE ISED',
      primaryCategory: 'Publications'
    },
    {
      id: 'setsentry-eviction-set-detection',
      category: 'papers',
      categoryLabel: 'PUBLICATION · SPRINGER CCIS 2026',
      badge: 'SPRINGER SCOPUS',
      title: 'SetSentry: Hardware Eviction-Set Detector',
      subtitle: 'Invariant LLC Monitor on Shared Caches',
      desc: 'Passive domain-aware LLC monitor detecting Prime+Probe eviction-set construction. Rate-invariant detection across 256x attacker slowdown with zero false alarms.',
      meta: 'Mishra, Sahay, Mishra, Vashishtha, Pathak · COCOLE 2026',
      primaryCategory: 'Publications'
    },
    {
      id: 'dirs-reload-refresh',
      category: 'papers',
      categoryLabel: 'PUBLICATION · SPRINGER CCIS 2026',
      badge: 'SPRINGER SCOPUS',
      title: 'DIRS: Closing Reload+Refresh on RISC-V',
      subtitle: 'Policy-Level Cache Replacement State Isolation',
      desc: 'First open-RTL Reload+Refresh channel on RISC-V. DIRS isolates per-set PLRU replacement metadata without capacity partitioning (+73 LUTs, machine-checked with Z3).',
      meta: 'Mishra, Sahay, Mishra, Vashishtha, Pathak · COCOLE 2026',
      primaryCategory: 'Publications'
    },
    {
      id: 'memory-security-review',
      category: 'papers',
      categoryLabel: 'REVIEW · SPRINGER LNNS 2026',
      badge: 'SPRINGER SCOPUS',
      title: 'Memory Security: Cold Boot to Side Channels',
      subtitle: 'Systematic Hardware Review of DRAM Defense',
      desc: 'Structured survey comparing AMD SME/SEV, Intel TME/MKTME, Bonsai Merkle trees, and power-analysis masking countermeasures for hardware engineers.',
      meta: 'Mishra, Sahay, Mishra, Pathak · ICTIS 2026',
      primaryCategory: 'Publications'
    },
    {
      id: 'cmo-coherency-smartcom',
      category: 'research',
      categoryLabel: 'RESEARCH & FORMAL METHODS',
      badge: 'SPIN / PROMELA VERIFIED',
      title: 'Software-Managed Cache Coherency (CMO)',
      subtitle: 'Formal Verification for RISC-V Heterogeneous SoCs',
      desc: 'Models Zicbom cache maintenance (CBO.CLEAN/INVAL/FLUSH) with DMA bypass in Promela/Spin. Eliminates 58.8% of redundant CMO operations while proving zero data staleness.',
      meta: 'SmartCom LNNS Vol. 1997, Springer, pp. 430-442',
      primaryCategory: 'Research'
    },
    {
      id: 'rv-josh-smartcom',
      category: 'research',
      categoryLabel: 'RESEARCH & SYSTEMS',
      badge: 'RISC-V OS DESIGN',
      title: 'RV-JOSH: Java Kernel on Bare-Metal RISC-V',
      subtitle: 'Dual-Stage Malware Classifier & PUF Encryption',
      desc: 'An operating system kernel written in Java on bare-metal RISC-V with 10 QEMU hardware performance monitors, LSTM/iForest runtime detection, and PUF-keyed page encryption.',
      meta: 'SmartCom LNNS Vol. 1997, Springer, pp. 443-455',
      primaryCategory: 'Research'
    },
    {
      id: 'patent-dataflow-monitor',
      category: 'patents',
      categoryLabel: 'PATENT APPLICATION',
      badge: 'INTELLECTUAL PROPERTY',
      title: 'Hardware Data-Flow Integrity Monitor',
      subtitle: 'Register-File Provenance Tagging for RISC-V',
      desc: 'A hardware monitor tracking register provenance and taint tags in the pipeline to prevent control-flow and data-flow hijacking on embedded IoT processors.',
      meta: 'Inventors: Mishra, et al. · Published Indian Patent Application',
      primaryCategory: 'Patents'
    },
    {
      id: 'patent-event-classifier',
      category: 'patents',
      categoryLabel: 'PATENT APPLICATION',
      badge: 'INTELLECTUAL PROPERTY',
      title: 'Microarchitectural Event Classifier',
      subtitle: 'Real-Time Malware Detection in Silicon',
      desc: 'Hardware-accelerated microarchitectural classifier with programmable feature extraction pipeline and on-chip ensemble inference engine for real-time malware detection.',
      meta: 'Inventors: Mishra, et al. · Published Indian Patent Application',
      primaryCategory: 'Patents'
    },
    {
      id: 'patent-crypto-session',
      category: 'patents',
      categoryLabel: 'PATENT APPLICATION',
      badge: 'INTELLECTUAL PROPERTY',
      title: 'Per-Peripheral Cryptographic Engine',
      subtitle: 'Hardware Key Rotation for RISC-V IoT SoC',
      desc: 'Dedicated hardware crypto session engine providing autonomous peripheral-to-peripheral encryption and key rotation without CPU supervisor intervention.',
      meta: 'Inventors: Mishra, et al. · Published Indian Patent Application',
      primaryCategory: 'Patents'
    },
    {
      id: 'book-crypto-foundations',
      category: 'books',
      categoryLabel: 'TEXTBOOK · DE GRUYTER BRILL',
      badge: 'ACADEMIC TEXTBOOK',
      title: 'Cryptographic Foundations',
      subtitle: 'Mathematical Principles & Implementations',
      desc: 'A comprehensive academic textbook covering mathematical foundations, symmetric ciphers, public-key schemes, post-quantum cryptography, and hardware implementations.',
      meta: 'Author: Jyotiprakash Mishra · De Gruyter Brill, Berlin',
      primaryCategory: 'Books'
    },
    {
      id: 'book-riscv-xv6',
      category: 'books',
      categoryLabel: 'TEXTBOOK · DE GRUYTER BRILL',
      badge: 'SYSTEMS TEXTBOOK',
      title: 'RISC-V Architecture and XV6',
      subtitle: 'From Gate-Level Logic to Kernel Internals',
      desc: 'Hands-on curriculum guide explaining computer architecture through RISC-V ISA and operating systems concepts through complete source tours of MIT xv6.',
      meta: 'Author: Jyotiprakash Mishra · De Gruyter Brill, Berlin',
      primaryCategory: 'Books'
    },
    {
      id: 'tool-xv6-tours',
      category: 'tools',
      categoryLabel: 'TEACHING TOOL · OPEN SOURCE',
      badge: '83 FILES CROSS-REFERENCED',
      title: 'xv6 Line-by-Line Interactive Commentary',
      subtitle: '52 Guided Tours & 25 Extension Labs',
      desc: 'Every single line of MIT xv6-riscv explained with live register state transitions, interactive architecture tours, 500 self-graded questions, and reference solutions.',
      meta: 'ShowMeTheStack / xv6-line-by-line · https://xv6.jyotiprakash.org',
      primaryCategory: 'Teaching Tools'
    },
    {
      id: 'tool-netsim',
      category: 'tools',
      categoryLabel: 'TEACHING TOOL · OPEN SOURCE',
      badge: 'CLIENT-SIDE SIMULATOR',
      title: 'NetSim: Browser-Based IPv4 Laboratory',
      subtitle: 'Packet-by-Packet Protocol Visualizer',
      desc: 'Interactive canvas network builder running ARP, ICMP, DHCP, DNS, and TCP packet stepping with raw hex frame dissection entirely in the browser.',
      meta: 'ShowMeTheStack / netsim · https://netsim.jyotiprakash.org',
      primaryCategory: 'Teaching Tools'
    },
    {
      id: 'tool-compy',
      category: 'tools',
      categoryLabel: 'TEACHING TOOL · OPEN SOURCE',
      badge: 'C89 TO RISC-V',
      title: 'Compy: The Visible Compiler Studio',
      subtitle: 'Interactive Lexer, AST, IR & RISC-V Codegen',
      desc: 'Educational compiler in the browser showing tokens, AST visualization, type checking, intermediate three-address code, optimization passes, and RISC-V assembly.',
      meta: 'ShowMeTheStack / compy · https://compy.jyotiprakash.org',
      primaryCategory: 'Teaching Tools'
    },
    {
      id: 'phd-dissertation',
      category: 'education',
      categoryLabel: 'DOCTORAL DISSERTATION · BITS PILANI',
      badge: 'THESIS SUBMITTED',
      title: 'Side-Channel Security in RISC-V Processors',
      subtitle: 'Microarchitectural Leaks & Hardware Defenses',
      desc: 'Comprehensive doctoral thesis under Prof. Sanjay K. Sahay spanning cache side channels, transient execution on BOOM/Rocket, and hardware-accelerated memory encryption.',
      meta: 'BITS Pilani · 2021–2026 Expected · 16 Publications · 6 Patents',
      primaryCategory: 'Education'
    },
    {
      id: 'career-leadership',
      category: 'experience',
      categoryLabel: 'CAREER TIMELINE · 16 YEARS',
      badge: 'INDUSTRY & FACULTY',
      title: 'Academic & Industry Leadership',
      subtitle: 'KIIT · ENineHQ · Epic Systems · Oracle',
      desc: 'Senior Assistant Professor at KIIT, CEO at ENineHQ Technologies, Team Lead at Epic Systems (Madison, WI), Senior Member of Technical Staff at Oracle (Bangalore), MS CS from UW-Madison.',
      meta: 'Bhubaneswar, India · Madison, WI, USA · Bangalore, India',
      primaryCategory: 'Experience'
    }
  ];

  class RolodexRing {
    constructor(stageElement, options = {}) {
      this.stage = stageElement;
      if (!this.stage) return;

      this.cards = RING_CARDS;
      this.N = 22; // Exactly 22 cards
      this.TAU = Math.PI * 2;
      this.rotation = 0;
      this.velocity = 0.0045; // Initial idle drift
      this.targetVelocity = 0.0045;
      this.isDragging = false;
      this.lastPointerX = 0;
      this.dragDeltaX = 0;
      this.lastTime = performance.now();
      this.cardElements = [];
      this.tempSortArray = [];
      this.onSelectCallback = options.onSelect || null;
      this.activeFilter = 'all';

      this.init();
    }

    init() {
      this.stage.innerHTML = '';
      this.stage.style.position = 'relative';
      this.stage.style.overflow = 'hidden';
      this.stage.style.userSelect = 'none';
      this.stage.style.touchAction = 'pan-y';

      // Ring Track Container (centered)
      this.ringCenter = document.createElement('div');
      this.ringCenter.className = 'rolodex-center';
      this.ringCenter.style.position = 'absolute';
      this.ringCenter.style.left = '50%';
      this.ringCenter.style.top = '52%';
      this.ringCenter.style.width = '0px';
      this.ringCenter.style.height = '0px';
      this.ringCenter.style.transformStyle = 'preserve-3d';
      this.stage.appendChild(this.ringCenter);

      // Create 22 DOM Cards
      this.cards.forEach((data, i) => {
        const card = document.createElement('div');
        card.className = 'rolodex-card';
        card.setAttribute('data-id', data.id);
        card.setAttribute('data-category', data.category);
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `${data.title} (${data.categoryLabel})`);

        card.style.position = 'absolute';
        card.style.width = '280px';
        card.style.height = '370px';
        card.style.left = '0px';
        card.style.top = '0px';
        card.style.cursor = 'pointer';
        card.style.transformOrigin = 'center center';
        card.style.willChange = 'transform, opacity, filter';
        card.style.borderRadius = '16px';
        card.style.padding = '18px 20px';
        card.style.boxSizing = 'border-box';
        card.style.border = '1px solid var(--line)';
        card.style.background = 'var(--panel2)';
        card.style.backdropFilter = 'blur(16px)';
        card.style.webkitBackdropFilter = 'blur(16px)';
        card.style.boxShadow = '0 18px 40px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.justifyContent = 'space-between';
        card.style.transition = 'border-color 0.25s, box-shadow 0.25s';

        card.innerHTML = `
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span style="font-family:var(--font);font-size:10px;font-weight:700;color:var(--accent);letter-spacing:0.08em;text-transform:uppercase;">${data.categoryLabel}</span>
              <span style="font-family:var(--font);font-size:9.5px;color:var(--muted);border:1px solid var(--line);padding:1px 6px;border-radius:4px;">${data.badge}</span>
            </div>
            <h3 style="margin:4px 0 6px;font-family:var(--font);font-size:16px;font-weight:800;color:var(--fg);line-height:1.25;letter-spacing:-0.01em;">${data.title}</h3>
            <div style="font-family:var(--font);font-size:12px;color:var(--accent2);margin-bottom:10px;font-weight:600;">${data.subtitle}</div>
            <p style="margin:0;font-family:var(--font);font-size:11.5px;color:var(--muted);line-height:1.45;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;">${data.desc}</p>
          </div>
          <div style="border-top:1px dashed var(--line);padding-top:10px;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-family:var(--font);font-size:10.5px;color:var(--dim);">${data.primaryCategory}</span>
            <span style="font-family:var(--font);font-size:11.5px;color:var(--accent);font-weight:bold;">EXPLORE ↵</span>
          </div>
        `;

        // Card events
        card.addEventListener('mouseenter', () => {
          card.style.borderColor = 'var(--accent)';
          card.style.boxShadow = '0 20px 50px rgba(0,0,0,0.6), var(--glow)';
        });
        card.addEventListener('mouseleave', () => {
          card.style.borderColor = 'var(--line)';
          card.style.boxShadow = '0 18px 40px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)';
        });
        card.addEventListener('click', (e) => {
          if (Math.abs(this.dragDeltaX) > 5) return; // Ignore if dragged
          this.focusCard(i);
        });
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.focusCard(i);
          }
        });

        this.ringCenter.appendChild(card);
        this.cardElements.push({ el: card, data: data, index: i, z: 0 });
      });

      this.tempSortArray = [...this.cardElements];

      this.setupPointerEvents();
      this.animate();
    }

    setupPointerEvents() {
      const stage = this.stage;

      const onPointerDown = (e) => {
        this.isDragging = true;
        this.lastPointerX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        this.dragDeltaX = 0;
        this.velocity = 0;
        if (stage.setPointerCapture && e.pointerId !== undefined) {
          try { stage.setPointerCapture(e.pointerId); } catch (err) {}
        }
      };

      const onPointerMove = (e) => {
        if (!this.isDragging) return;
        const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        const dx = currentX - this.lastPointerX;
        this.lastPointerX = currentX;
        this.dragDeltaX += Math.abs(dx);

        // Add dx * 0.0045 to rotation as requested
        this.rotation += dx * 0.0045;
        this.velocity = dx * 0.0045;
      };

      const onPointerUp = (e) => {
        if (!this.isDragging) return;
        this.isDragging = false;
        if (stage.releasePointerCapture && e.pointerId !== undefined) {
          try { stage.releasePointerCapture(e.pointerId); } catch (err) {}
        }
      };

      stage.addEventListener('pointerdown', onPointerDown);
      stage.addEventListener('pointermove', onPointerMove);
      stage.addEventListener('pointerup', onPointerUp);
      stage.addEventListener('pointercancel', onPointerUp);

      // Wheel Navigation
      stage.addEventListener('wheel', (e) => {
        e.preventDefault();
        this.rotation += e.deltaY * 0.0012;
      }, { passive: false });

      // Keyboard Controls
      window.addEventListener('keydown', (e) => {
        if (document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
        if (e.key === 'ArrowLeft') {
          this.rotation -= (this.TAU / this.N);
        } else if (e.key === 'ArrowRight') {
          this.rotation += (this.TAU / this.N);
        }
      });
    }

    focusCard(index) {
      // Rotate the ring so that card `index` is directly at the front (a = 0, so sin(a) = 0, cos(a) = 1)
      const targetRotation = -(index / this.N) * this.TAU;
      // Animate smoothly to target rotation
      this.rotation = targetRotation;
      this.velocity = 0;

      const card = this.cards[index];
      if (this.onSelectCallback) {
        this.onSelectCallback(card);
      } else if (window.App && typeof window.App.open === 'function') {
        window.App.open(card.category || 'papers');
      }
    }

    filterCategory(categoryKey) {
      this.activeFilter = categoryKey;
      this.cardElements.forEach(item => {
        if (categoryKey === 'all' || item.data.category === categoryKey || item.data.primaryCategory.toLowerCase() === categoryKey.toLowerCase()) {
          item.el.style.display = 'flex';
        } else {
          item.el.style.display = 'none';
        }
      });
    }

    animate() {
      requestAnimationFrame(() => this.animate());

      const stageW = this.stage.clientWidth || window.innerWidth;
      const stageH = this.stage.clientHeight || 560;

      // Exact Formula: R = 0.62 * min(stage width, stage height)
      const R = 0.62 * Math.min(stageW, stageH);

      // Idle drift & momentum decay formula:
      // vel += (0.0045 - vel) * 0.02
      if (!this.isDragging) {
        this.velocity += (0.0045 - this.velocity) * 0.02;
        this.rotation += this.velocity;
      }

      const N = this.N;
      const TAU = this.TAU;

      // Calculate geometry for each card i
      for (let i = 0; i < N; i++) {
        const item = this.cardElements[i];
        const a = this.rotation + (i / N) * TAU;

        const x = Math.sin(a) * R;
        const z = Math.cos(a) * R;
        const y = -Math.cos(a) * R * 0.42; // Vertical tilt derived from z

        const depth = (z / R + 1) / 2; // 0 (back) to 1 (front)
        const scale = 0.55 + depth * 0.55;
        const opacity = 0.30 + depth * 0.70;
        const brightness = 0.5 + depth * 0.7;
        const cardRotation = Math.sin(a) * 14; // in degrees

        item.z = z;

        // Apply card transforms in exact requested order:
        // translate(-50%, -50%) translate3d(x, y, 0) rotate(cardRotation deg) scale(scale)
        item.el.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0px) rotate(${cardRotation.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        item.el.style.opacity = opacity.toFixed(3);
        item.el.style.filter = `brightness(${brightness.toFixed(2)})`;
      }

      // Depth Sorting:
      // Copy card references into temporary array, sort by z ascending, assign sorted index as z-index
      this.tempSortArray.sort((a, b) => a.z - b.z);
      for (let s = 0; s < N; s++) {
        this.tempSortArray[s].el.style.zIndex = s + 10;
      }
    }
  }

  window.RolodexRing = RolodexRing;
})();
