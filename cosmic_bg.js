/**
 * cosmic_bg.js - Full-Screen Immersive Three.js WebGL Cosmic Background
 * Professor Jyotiprakash Mishra — Immersive Research Portfolio
 *
 * Implements:
 * - Deep cosmic space background with floating iridescent dust & stars
 * - Interactive mouse-responsive parallax
 * - Subtly morphing 3D geometric wireframe cyber-core
 * - Dynamic theme color harmonization (Matrix, Amber CRT, Neon, Ice, Red team, Ghost, Paper)
 * - Automatic pause when tab is hidden, reduced-motion compliance, and graceful CSS fallback
 */

(function () {
  'use strict';

  class CosmicBackground {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;

      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.dustParticles = null;
      this.coreMesh = null;
      this.outerCoreMesh = null;
      this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
      this.clock = null;
      this.isRunning = true;
      this.isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      this.init();
    }

    hasWebGL() {
      try {
        const testCanvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')));
      } catch (e) {
        return false;
      }
    }

    init() {
      if (!this.hasWebGL() || typeof THREE === 'undefined') {
        console.warn('WebGL or Three.js unavailable, applying fallback CSS cosmic gradient.');
        if (this.canvas) this.canvas.style.display = 'none';
        return;
      }

      const w = window.innerWidth;
      const h = window.innerHeight;

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(55, w / h, 1, 3000);
      this.camera.position.z = 1000;

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: true
      });
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      this.clock = new THREE.Clock();

      // Ambient Lighting
      this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      this.scene.add(this.ambientLight);

      this.pointLight1 = new THREE.PointLight(0x39ff7a, 2.0, 1500);
      this.pointLight1.position.set(300, 400, 300);
      this.scene.add(this.pointLight1);

      this.pointLight2 = new THREE.PointLight(0x7928ca, 2.5, 1500);
      this.pointLight2.position.set(-400, -300, 200);
      this.scene.add(this.pointLight2);

      this.createCosmicDust();
      this.createCyberCore();
      this.setupEvents();
      this.updateThemeColors();
      this.animate();
    }

    createCosmicDust() {
      const particleCount = this.isReducedMotion ? 120 : 600;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      const color1 = new THREE.Color(0x39ff7a);
      const color2 = new THREE.Color(0x00f0ff);
      const color3 = new THREE.Color(0xb4410f);

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 2400;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 1800;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 1600;

        const mixedColor = Math.random() > 0.5 ? color1 : color2;
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      this.dustMaterial = new THREE.PointsMaterial({
        size: 3.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending
      });

      this.dustParticles = new THREE.Points(geometry, this.dustMaterial);
      this.scene.add(this.dustParticles);
    }

    createCyberCore() {
      // Geometric abstract wireframe core
      const coreGeo = new THREE.IcosahedronGeometry(180, 2);
      this.coreMaterial = new THREE.MeshBasicMaterial({
        color: 0x39ff7a,
        wireframe: true,
        transparent: true,
        opacity: 0.12
      });
      this.coreMesh = new THREE.Mesh(coreGeo, this.coreMaterial);
      this.coreMesh.position.set(0, -40, -200);
      this.scene.add(this.coreMesh);

      const outerGeo = new THREE.TorusGeometry(260, 2, 16, 100);
      this.outerMaterial = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0.08
      });
      this.outerCoreMesh = new THREE.Mesh(outerGeo, this.outerMaterial);
      this.outerCoreMesh.position.set(0, -40, -200);
      this.outerCoreMesh.rotation.x = Math.PI / 3;
      this.scene.add(this.outerCoreMesh);
    }

    setupEvents() {
      window.addEventListener('mousemove', (e) => {
        this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
        this.mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
      });

      window.addEventListener('resize', () => {
        if (!this.renderer || !this.camera) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      });

      document.addEventListener('visibilitychange', () => {
        this.isRunning = !document.hidden;
      });
    }

    updateThemeColors() {
      const style = getComputedStyle(document.documentElement);
      const accent = style.getPropertyValue('--accent').trim() || '#39ff7a';
      const accent2 = style.getPropertyValue('--accent2').trim() || '#00f0ff';

      if (this.pointLight1) this.pointLight1.color.set(accent);
      if (this.pointLight2) this.pointLight2.color.set(accent2);
      if (this.coreMaterial) this.coreMaterial.color.set(accent);
      if (this.outerMaterial) this.outerMaterial.color.set(accent2);
    }

    animate() {
      requestAnimationFrame(() => this.animate());
      if (!this.isRunning) return;

      const delta = this.clock.getDelta();
      const elapsed = this.clock.getElapsedTime();

      // Smooth mouse parallax
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

      this.camera.position.x = this.mouse.x * 60;
      this.camera.position.y = this.mouse.y * 40;
      this.camera.lookAt(0, 0, 0);

      // Subtle rotation of background elements
      if (!this.isReducedMotion) {
        if (this.dustParticles) {
          this.dustParticles.rotation.y = elapsed * 0.02;
          this.dustParticles.rotation.x = elapsed * 0.01;
        }

        if (this.coreMesh) {
          this.coreMesh.rotation.y = elapsed * 0.08;
          this.coreMesh.rotation.x = elapsed * 0.05;
        }

        if (this.outerCoreMesh) {
          this.outerCoreMesh.rotation.z = -elapsed * 0.06;
          this.outerCoreMesh.rotation.y = elapsed * 0.04;
        }
      }

      this.renderer.render(this.scene, this.camera);
    }
  }

  window.CosmicBackground = CosmicBackground;
})();
