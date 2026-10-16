/**
 * Particle-Cloak Intro Experience
 * Native HTML Canvas 2D Particle Veil & Spring Dynamics
 * For Professor Jyotiprakash Mishra's Academic Portfolio
 *
 * Exact Specifications:
 * - Device-pixel-ratio-aware Canvas 2D rendering (capped at 2)
 * - Grid generation: step = Math.max(9, Math.min(width, height) / 22)
 * - Raw and eased pointer smoothing: pointer.x += (target.x - pointer.x) * 0.16
 * - Interaction radius: R = 0.34 * Math.min(width, height)
 * - Force: f = Math.pow(1 - d / R, 2) * 3.4 (outward push along normalized vector)
 * - Spring force: vx += (homeX - x) * 0.024, vy += (homeY - y) * 0.024
 * - Damping: vx *= 0.86, vy *= 0.86
 * - Integration: x += vx, y += vy
 * - Alpha: alpha = Math.max(0, 0.72 - distanceFromHome / 70)
 * - Autonomous Lissajous trajectory before pointer interaction
 * - Smooth particle disperse + dissolve transition on "Enter Portfolio" click
 */

(function () {
  'use strict';

  // Palette constants
  const COLOR_PALETTE = [
    { r: 243, g: 240, b: 232, weight: 0.65 }, // Warm ivory
    { r: 115, g: 217, b: 245, weight: 0.25 }, // Electric cyan
    { r: 160, g: 169, b: 188, weight: 0.10 }  // Muted blue-gray
  ];

  class ParticleCloakIntro {
    constructor() {
      this.introEl = document.getElementById('particle-cloak-intro');
      this.canvas = document.getElementById('particle-cloak-canvas');
      this.enterBtn = document.getElementById('cloakEnterBtn');

      if (!this.introEl || !this.canvas) {
        console.warn('[ParticleCloak] Required DOM elements not found.');
        return;
      }

      this.ctx = this.canvas.getContext('2d');
      if (!this.ctx) {
        console.warn('[ParticleCloak] 2D Context not supported.');
        this.fallback();
        return;
      }

      // State flags
      this.isEntering = false;
      this.isDissolving = false;
      this.dissolveStartTime = 0;
      this.dissolveDuration = 750; // ms
      this.userInteracted = false;
      this.isPointerInside = false;
      this.isTouchDevice = false;
      this.lastTouchTime = 0;
      this.rafId = null;

      // Coordinate systems & pointer tracking
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.pointer = { x: this.width * 0.5, y: this.height * 0.5 };
      this.target = { x: this.width * 0.5, y: this.height * 0.5 };
      this.t = 0;

      this.particles = [];

      // Check URL param or session storage
      const urlParams = new URLSearchParams(window.location.search);
      const forceIntro = urlParams.has('intro') || urlParams.get('replay') === '1';
      let hasSeenIntro = false;
      try {
        hasSeenIntro = sessionStorage.getItem('jpm_intro_seen') === '1';
      } catch (e) {
        hasSeenIntro = false;
      }

      // If user has already entered in this session and didn't request replay, bypass immediately
      if (hasSeenIntro && !forceIntro) {
        this.bypassIntro();
        this.wireReplayButton();
        return;
      }

      this.init();
      this.wireReplayButton();
    }

    init() {
      document.body.classList.add('cloak-active');
      this.introEl.style.display = 'flex';
      this.introEl.classList.remove('intro-fade-out');
      this.isEntering = false;
      this.isDissolving = false;

      // Reduced motion check
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.canvas.style.display = 'none';
        this.bindEvents();
        return;
      }

      this.resize();
      this.bindEvents();
      this.startLoop();
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.canvas.style.width = this.width + 'px';
      this.canvas.style.height = this.height + 'px';

      this.ctx.resetTransform?.();
      this.ctx.scale(this.dpr, this.dpr);

      this.generateParticles();
    }

    generateParticles() {
      this.particles = [];
      const { width, height } = this;

      // Exact spacing formula: step = Math.max(9, Math.min(width, height) / 22)
      const step = Math.max(9, Math.min(width, height) / 22);

      const cols = Math.ceil(width / step) + 1;
      const rows = Math.ceil(height / step) + 1;
      const offsetX = (width - (cols - 1) * step) * 0.5;
      const offsetY = (height - (rows - 1) * step) * 0.5;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const homeX = offsetX + c * step + (Math.random() - 0.5) * (step * 0.22);
          const homeY = offsetY + r * step + (Math.random() - 0.5) * (step * 0.22);

          // Radius between 1.0 and 2.6 pixels
          const radius = 1.0 + Math.random() * 1.6;

          // Palette selection
          const roll = Math.random();
          let color = COLOR_PALETTE[0];
          if (roll < COLOR_PALETTE[1].weight) {
            color = COLOR_PALETTE[1];
          } else if (roll < COLOR_PALETTE[1].weight + COLOR_PALETTE[2].weight) {
            color = COLOR_PALETTE[2];
          }

          this.particles.push({
            homeX,
            homeY,
            x: homeX,
            y: homeY,
            vx: 0,
            vy: 0,
            radius,
            r: color.r,
            g: color.g,
            b: color.b
          });
        }
      }
    }

    bindEvents() {
      this.onResize = () => this.resize();
      window.addEventListener('resize', this.onResize);

      // Pointer interactions
      this.onPointerMove = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;

        if (e.pointerType === 'touch') {
          this.isTouchDevice = true;
          this.lastTouchTime = performance.now();
          this.target.x = clientX;
          this.target.y = clientY;
        } else {
          this.userInteracted = true;
          this.isPointerInside = true;
          this.target.x = clientX;
          this.target.y = clientY;
        }
      };

      this.onPointerEnter = (e) => {
        if (e.pointerType !== 'touch') {
          this.userInteracted = true;
          this.isPointerInside = true;
        }
      };

      this.onPointerLeave = (e) => {
        if (e.pointerType !== 'touch') {
          this.isPointerInside = false;
          // Far coordinates allow particles to spring naturally back to home position
          this.target.x = -9999;
          this.target.y = -9999;
        }
      };

      this.onTouchEnd = () => {
        this.isTouchDevice = true;
        this.lastTouchTime = performance.now();
      };

      this.introEl.addEventListener('pointermove', this.onPointerMove, { passive: true });
      this.introEl.addEventListener('pointerenter', this.onPointerEnter, { passive: true });
      this.introEl.addEventListener('pointerleave', this.onPointerLeave, { passive: true });
      this.introEl.addEventListener('touchend', this.onTouchEnd, { passive: true });

      // Enter Portfolio Button click
      this.onEnterClick = (e) => {
        e.preventDefault();
        this.enterPortfolio();
      };

      if (this.enterBtn) {
        this.enterBtn.addEventListener('click', this.onEnterClick);
        this.enterBtn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.enterPortfolio();
          }
        });
      }
    }

    unbindEvents() {
      window.removeEventListener('resize', this.onResize);
      if (this.introEl) {
        this.introEl.removeEventListener('pointermove', this.onPointerMove);
        this.introEl.removeEventListener('pointerenter', this.onPointerEnter);
        this.introEl.removeEventListener('pointerleave', this.onPointerLeave);
        this.introEl.removeEventListener('touchend', this.onTouchEnd);
      }
      if (this.enterBtn) {
        this.enterBtn.removeEventListener('click', this.onEnterClick);
      }
    }

    startLoop() {
      if (this.rafId) cancelAnimationFrame(this.rafId);

      const render = () => {
        this.update();
        this.draw();

        if (!this.isCompleted) {
          this.rafId = requestAnimationFrame(render);
        }
      };

      this.rafId = requestAnimationFrame(render);
    }

    update() {
      this.t += 0.016;
      const { width, height } = this;
      const centerX = width * 0.5;
      const centerY = height * 0.5;

      // Autonomous Lissajous trajectory before first user interaction
      // or after touch interaction settles
      const lissX = centerX + Math.sin(this.t * 0.31) * width * 0.22;
      const lissY = centerY + Math.sin(this.t * 0.47 + 1.2) * height * 0.18;

      if (!this.userInteracted) {
        this.target.x = lissX;
        this.target.y = lissY;
      } else if (this.isTouchDevice) {
        // On touch devices, preserve autonomous movement after touch interaction
        const timeSinceTouch = performance.now() - this.lastTouchTime;
        if (timeSinceTouch > 1400) {
          // Smooth blend back to Lissajous
          this.target.x += (lissX - this.target.x) * 0.04;
          this.target.y += (lissY - this.target.y) * 0.04;
        }
      }

      // Smooth pointer positions
      this.pointer.x += (this.target.x - this.pointer.x) * 0.16;
      this.pointer.y += (this.target.y - this.pointer.y) * 0.16;

      // Interaction radius: R = 0.34 * Math.min(width, height)
      const R = 0.34 * Math.min(width, height);
      const px = this.pointer.x;
      const py = this.pointer.y;

      const len = this.particles.length;
      for (let i = 0; i < len; i++) {
        const p = this.particles[i];

        const dx = p.x - px;
        const dy = p.y - py;
        const d = Math.hypot(dx, dy);

        // Interaction push
        if (d < R && d > 0.0001) {
          // f = Math.pow(1 - d / R, 2) * 3.4
          const f = Math.pow(1 - d / R, 2) * 3.4;
          const nx = dx / d;
          const ny = dy / d;
          p.vx += nx * f;
          p.vy += ny * f;
        }

        // Always apply spring force:
        // vx += (homeX - x) * 0.024
        // vy += (homeY - y) * 0.024
        p.vx += (p.homeX - p.x) * 0.024;
        p.vy += (p.homeY - p.y) * 0.024;

        // Apply damping:
        // vx *= 0.86, vy *= 0.86
        p.vx *= 0.86;
        p.vy *= 0.86;

        // Integrate:
        // x += vx, y += vy
        p.x += p.vx;
        p.y += p.vy;
      }
    }

    draw() {
      const { ctx, width, height } = this;
      ctx.clearRect(0, 0, width, height);

      let dissolveFactor = 1.0;
      if (this.isDissolving) {
        const elapsed = performance.now() - this.dissolveStartTime;
        dissolveFactor = Math.max(0, 1.0 - elapsed / this.dissolveDuration);
      }

      const len = this.particles.length;
      for (let i = 0; i < len; i++) {
        const p = this.particles[i];

        // Fade particles according to their displacement from home:
        // alpha = Math.max(0, 0.72 - distanceFromHome / 70)
        const dx = p.x - p.homeX;
        const dy = p.y - p.homeY;
        const distanceFromHome = Math.hypot(dx, dy);
        let alpha = Math.max(0, 0.72 - distanceFromHome / 70);

        if (this.isDissolving) {
          alpha *= dissolveFactor;
        }

        if (alpha > 0.008) {
          ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    enterPortfolio() {
      if (this.isEntering) return;
      this.isEntering = true;
      this.isDissolving = true;
      this.dissolveStartTime = performance.now();

      // Remember session preference so subsequent visits bypass intro cleanly
      try {
        sessionStorage.setItem('jpm_intro_seen', '1');
      } catch (err) {}

      // Disperse particles outward with impulse
      const cx = this.width * 0.5;
      const cy = this.height * 0.5;
      const len = this.particles.length;
      for (let i = 0; i < len; i++) {
        const p = this.particles[i];
        const angle = Math.atan2(p.y - cy, p.x - cx) + (Math.random() - 0.5) * 0.4;
        const speed = 5 + Math.random() * 10;
        p.vx += Math.cos(angle) * speed;
        p.vy += Math.sin(angle) * speed;
      }

      // Smooth CSS transition to fade out intro overlay
      this.introEl.classList.add('intro-fade-out');

      setTimeout(() => {
        this.bypassIntro();
      }, this.dissolveDuration);
    }

    bypassIntro() {
      this.isCompleted = true;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      this.unbindEvents();

      if (this.introEl) {
        this.introEl.style.display = 'none';
        this.introEl.classList.remove('intro-fade-out');
      }
      document.body.classList.remove('cloak-active');

      // Dispatch resize event so Three.js cosmic canvas and Rolodex Ring calibrate accurately
      window.dispatchEvent(new Event('resize'));
    }

    fallback() {
      this.canvas.style.display = 'none';
      if (this.enterBtn) {
        this.enterBtn.addEventListener('click', () => this.bypassIntro());
      }
    }

    wireReplayButton() {
      const replayBtn = document.getElementById('navReplayIntro');
      if (replayBtn && !replayBtn.__wired) {
        replayBtn.__wired = true;
        replayBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.isCompleted = false;
          this.userInteracted = false;
          this.isPointerInside = false;
          this.init();
        });
      }
    }
  }

  // Auto-instantiate when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.particleCloak = new ParticleCloakIntro();
    });
  } else {
    window.particleCloak = new ParticleCloakIntro();
  }
})();
