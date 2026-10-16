/**
 * gallery3d.js - Interactive 3D Cylindrical Gallery & Cosmic Space Scene
 * Professor Jyotiprakash Mishra — Immersive Research Portfolio
 *
 * Implements:
 * - Exactly nine primary portfolio nodes distributed radially on a cylinder
 * - Mouse drag, touch drag, wheel/scroll momentum & damping
 * - Raycasting for hover & click focus
 * - Depth-aware perspective, scaling, and opacity
 * - Theme-reactive glassmorphic cards and ambient dust particle field
 * - Keyboard navigation (Left/Right to rotate, Enter to inspect)
 * - Automatic graceful fallback when WebGL is unavailable
 */

(function () {
  'use strict';

  // Exactly 9 Primary Portfolio Nodes (as defined in Master Project Prompt)
  const GALLERY_NODES = [
    {
      id: 'patents',
      number: '01',
      title: 'Patents',
      subtitle: 'Hardware Monitors & Silicon IP',
      count: '6 Applications',
      desc: 'Hardware data-flow monitors, RISC-V event classifiers, PUF cryptographic session engines, and tiered-memory ISA extensions.'
    },
    {
      id: 'papers',
      number: '02',
      title: 'Publications',
      subtitle: '23 Scholarly Papers',
      count: '23 Published',
      desc: 'PACE memory encryption, ARCHER cycle-accurate emulator, novel RISC-V side channels, TWIG, mspecsafe, CHROMA, and SetSentry.'
    },
    {
      id: 'tools',
      number: '03',
      title: 'Teaching Tools',
      subtitle: 'Interactive Simulators & Labs',
      count: '8 Free Tools',
      desc: 'Browser-based systems laboratories: xv6 tour, 8086 chip wiring studio, netsim IPv4 lab, compy compiler visualizer, see C89 workbench, and strux.'
    },
    {
      id: 'research',
      number: '04',
      title: 'Research',
      subtitle: 'RISC-V Hardware Security',
      count: 'Doctoral Thesis',
      desc: 'Microarchitectural side-channels, transient execution defenses, memory encryption engines, and malware detection in open silicon.'
    },
    {
      id: 'books',
      number: '05',
      title: 'Books',
      subtitle: 'Published Textbooks',
      count: '2 Volumes',
      desc: 'De Gruyter Brill textbooks on Cryptographic Foundations and RISC-V Architecture with XV6.'
    },
    {
      id: 'experience',
      number: '06',
      title: 'Experience',
      subtitle: 'Industry & Academia',
      count: '16 Years',
      desc: 'Assistant Professor at KIIT, CEO at ENineHQ Technologies, Team Lead at Epic Systems (Madison, USA), and Senior MTS at Oracle.'
    },
    {
      id: 'education',
      number: '07',
      title: 'Education',
      subtitle: 'BITS Pilani & UW-Madison',
      count: 'PhD · MS · BE',
      desc: 'PhD in CS (BITS Pilani, thesis submitted), MS in CS (University of Wisconsin-Madison, GPA 3.9/4.0), and BE Hons in CS (BITS Pilani, 9.53 CGPA).'
    },
    {
      id: 'teaching',
      number: '08',
      title: 'Teaching',
      subtitle: 'Lectures & Outreach',
      count: '78+ Videos',
      desc: 'Computer architecture, operating systems, and systems programming courses at KIIT, plus 250+ technical deep-dives on blog and YouTube.'
    },
    {
      id: 'contact',
      number: '09',
      title: 'Contact',
      subtitle: 'Academic & Industry Reach',
      count: 'Get In Touch',
      desc: 'Direct email (mail@jyotiprakash.org), Google Scholar, GitHub (ShowMeTheStack), LinkedIn, and KIIT faculty profile.'
    }
  ];

  class CylindricalGallery {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      if (!this.container) return;

      this.nodes = GALLERY_NODES;
      this.cardCount = this.nodes.length; // Exactly 9
      this.radius = 480; // Cylinder radius
      this.currentAngle = 0;
      this.targetAngle = 0;
      this.velocity = 0;
      this.isDragging = false;
      this.dragStartX = 0;
      this.dragStartTime = 0;
      this.dragStartAngle = 0;
      this.selectedIndex = 0;

      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.cards = [];
      this.raycaster = null;
      this.mouse = null;
      this.hoveredIndex = -1;
      this.particles = null;

      this.init();
    }

    hasWebGL() {
      try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      } catch (e) {
        return false;
      }
    }

    init() {
      if (!this.hasWebGL() || typeof THREE === 'undefined') {
        console.warn('WebGL or Three.js unavailable, activating graceful 2D fallback.');
        this.fallback();
        return;
      }

      this.setupThree();
      this.createParticles();
      this.createCylinderCards();
      this.setupEvents();
      this.animate();
    }

    fallback() {
      if (this.container) {
        this.container.classList.add('webgl-fallback');
      }
    }

    setupThree() {
      const w = this.container.clientWidth || window.innerWidth;
      const h = this.container.clientHeight || 580;

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(46, w / h, 1, 3000);
      this.camera.position.set(0, 20, 920);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.container.appendChild(this.renderer.domElement);

      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2(-1000, -1000);

      // Ambient & dynamic point lights
      this.ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      this.scene.add(this.ambientLight);

      this.accentLight = new THREE.PointLight(0x39ff7a, 2.5, 1200);
      this.accentLight.position.set(0, 150, 400);
      this.scene.add(this.accentLight);

      this.rimLight = new THREE.PointLight(0xb6ff3b, 1.2, 1000);
      this.rimLight.position.set(0, -200, 300);
      this.scene.add(this.rimLight);
    }

    createParticles() {
      const count = 350;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const scales = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 1800;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 1200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 1400;
        scales[i] = Math.random() * 2.5 + 1.0;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

      // Particle shader or simple point material
      this.particleMaterial = new THREE.PointsMaterial({
        color: 0x39ff7a,
        size: 3,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending
      });

      this.particles = new THREE.Points(geometry, this.particleMaterial);
      this.scene.add(this.particles);
    }

    createCardTexture(node, isHovered) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 680;
      const ctx = canvas.getContext('2d');

      const style = getComputedStyle(document.documentElement);
      const accent = style.getPropertyValue('--accent').trim() || '#39ff7a';
      const accent2 = style.getPropertyValue('--accent2').trim() || '#b6ff3b';
      const fg = style.getPropertyValue('--fg').trim() || '#c9ffd9';
      const muted = style.getPropertyValue('--muted').trim() || '#6fb98a';
      const panel = isHovered ? 'rgba(12, 38, 22, 0.96)' : 'rgba(4, 18, 10, 0.88)';
      const border = isHovered ? accent : (style.getPropertyValue('--line').trim() || '#134a2a');

      // Rounded background
      ctx.fillStyle = panel;
      this.roundRect(ctx, 16, 16, 480, 648, 24);
      ctx.fill();

      // Border with subtle glow
      ctx.lineWidth = isHovered ? 4 : 2;
      ctx.strokeStyle = border;
      ctx.stroke();

      // Cyber header tag
      ctx.font = 'bold 22px "JetBrains Mono", monospace';
      ctx.fillStyle = accent;
      ctx.fillText(`./NODE-${node.number}`, 44, 70);

      ctx.textAlign = 'right';
      ctx.font = '18px "JetBrains Mono", monospace';
      ctx.fillStyle = muted;
      ctx.fillText(node.count, 468, 70);

      // Horizontal separator line
      ctx.beginPath();
      ctx.moveTo(44, 94);
      ctx.lineTo(468, 94);
      ctx.strokeStyle = isHovered ? accent : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Category Title
      ctx.textAlign = 'left';
      ctx.font = 'bold 44px "JetBrains Mono", monospace';
      ctx.fillStyle = fg;
      ctx.fillText(node.title, 44, 160);

      // Subtitle
      ctx.font = '22px "JetBrains Mono", monospace';
      ctx.fillStyle = accent2;
      ctx.fillText(node.subtitle, 44, 204);

      // Body Description (wrapped)
      ctx.font = '20px/1.5 "JetBrains Mono", monospace';
      ctx.fillStyle = muted;
      this.wrapText(ctx, node.desc, 44, 260, 420, 32);

      // Bottom Interaction Prompt
      ctx.textAlign = 'center';
      ctx.fillStyle = isHovered ? accent : 'rgba(255, 255, 255, 0.35)';
      ctx.font = 'bold 20px "JetBrains Mono", monospace';
      ctx.fillText(isHovered ? '► CLICK TO INSPECT ◄' : 'CLICK TO EXPLORE', 256, 610);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    }

    roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
      const words = text.split(' ');
      let line = '';
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, x, y);
          line = words[n] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, y);
    }

    createCylinderCards() {
      const cardWidth = 240;
      const cardHeight = 320;
      const geometry = new THREE.PlaneGeometry(cardWidth, cardHeight, 1, 1);

      this.cards = [];
      const angleStep = (Math.PI * 2) / this.cardCount;

      this.nodes.forEach((node, i) => {
        const theta = i * angleStep;
        const texture = this.createCardTexture(node, false);
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          opacity: 0.92,
          side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = { index: i, node: node, baseTheta: theta };

        // Position on cylinder radius
        mesh.position.x = Math.sin(theta) * this.radius;
        mesh.position.z = Math.cos(theta) * this.radius;
        mesh.rotation.y = theta;

        this.scene.add(mesh);
        this.cards.push(mesh);
      });
    }

    updateTheme() {
      if (!this.cards || this.cards.length === 0) return;
      const style = getComputedStyle(document.documentElement);
      const accent = style.getPropertyValue('--accent').trim() || '#39ff7a';
      const accent2 = style.getPropertyValue('--accent2').trim() || '#b6ff3b';

      if (this.accentLight) this.accentLight.color.set(accent);
      if (this.rimLight) this.rimLight.color.set(accent2);
      if (this.particleMaterial) this.particleMaterial.color.set(accent);

      this.cards.forEach((mesh, idx) => {
        const isHovered = idx === this.hoveredIndex;
        const newTex = this.createCardTexture(mesh.userData.node, isHovered);
        mesh.material.map.dispose();
        mesh.material.map = newTex;
        mesh.material.needsUpdate = true;
      });
    }

    setupEvents() {
      const dom = this.renderer.domElement;

      // Pointer Drag Handling
      const onPointerDown = (clientX) => {
        this.isDragging = true;
        this.dragStartX = clientX;
        this.dragStartTime = performance.now();
        this.dragStartAngle = this.targetAngle;
        this.velocity = 0;
      };

      const onPointerMove = (clientX, clientY, rect) => {
        this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        if (this.isDragging) {
          const deltaX = clientX - this.dragStartX;
          this.targetAngle = this.dragStartAngle + deltaX * 0.005;
        }
      };

      const onPointerUp = () => {
        if (!this.isDragging) return;
        this.isDragging = false;
        // Snap to nearest card
        this.snapToNearest();
      };

      // Mouse
      dom.addEventListener('mousedown', (e) => onPointerDown(e.clientX));
      window.addEventListener('mousemove', (e) => {
        const rect = dom.getBoundingClientRect();
        onPointerMove(e.clientX, e.clientY, rect);
      });
      window.addEventListener('mouseup', onPointerUp);

      // Touch
      dom.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) onPointerDown(e.touches[0].clientX);
      }, { passive: true });
      window.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) {
          const rect = dom.getBoundingClientRect();
          onPointerMove(e.touches[0].clientX, e.touches[0].clientY, rect);
        }
      }, { passive: true });
      window.addEventListener('touchend', onPointerUp);

      // Wheel Navigation
      dom.addEventListener('wheel', (e) => {
        e.preventDefault();
        this.targetAngle += e.deltaY * 0.0018;
        this.snapToNearest();
      }, { passive: false });

      // Click to focus and open sheet
      dom.addEventListener('click', (e) => {
        if (Math.abs(this.currentAngle - this.dragStartAngle) > 0.05) return; // ignore if dragged
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.cards);

        if (intersects.length > 0) {
          const targetCard = intersects[0].object;
          const idx = targetCard.userData.index;
          this.selectNode(idx);
        }
      });

      // Keyboard navigation (Arrow keys + Enter)
      window.addEventListener('keydown', (e) => {
        if (document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
        if (e.key === 'ArrowLeft') {
          this.rotateStep(-1);
        } else if (e.key === 'ArrowRight') {
          this.rotateStep(1);
        } else if (e.key === 'Enter' && this.hoveredIndex >= 0) {
          this.selectNode(this.hoveredIndex);
        }
      });

      // Window resize
      window.addEventListener('resize', () => {
        if (!this.container || !this.renderer || !this.camera) return;
        const w = this.container.clientWidth;
        const h = this.container.clientHeight || 580;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      });
    }

    snapToNearest() {
      const angleStep = (Math.PI * 2) / this.cardCount;
      const normalizedAngle = Math.round(this.targetAngle / angleStep) * angleStep;
      this.targetAngle = normalizedAngle;
    }

    rotateStep(direction) {
      const angleStep = (Math.PI * 2) / this.cardCount;
      this.targetAngle += direction * angleStep;
      this.snapToNearest();
    }

    selectNode(index) {
      const angleStep = (Math.PI * 2) / this.cardCount;
      // Rotate cylinder so that node is directly in front (theta = 0)
      this.targetAngle = -index * angleStep;
      this.snapToNearest();

      const node = this.nodes[index];
      if (node && window.App && typeof window.App.open === 'function') {
        setTimeout(() => {
          window.App.open(node.id);
        }, 220);
      }
    }

    animate() {
      requestAnimationFrame(() => this.animate());

      // Smooth damping interpolation
      const diff = this.targetAngle - this.currentAngle;
      this.currentAngle += diff * 0.085;

      // Animate background particles
      if (this.particles) {
        this.particles.rotation.y += 0.0004;
        this.particles.rotation.x += 0.0002;
      }

      // Update card positions along cylindrical ring
      const angleStep = (Math.PI * 2) / this.cardCount;
      this.cards.forEach((mesh, i) => {
        const theta = mesh.userData.baseTheta + this.currentAngle;
        mesh.position.x = Math.sin(theta) * this.radius;
        mesh.position.z = Math.cos(theta) * this.radius;
        mesh.rotation.y = theta;

        // Depth-based scaling and opacity for natural perspective
        const normZ = (mesh.position.z + this.radius) / (this.radius * 2); // 0 (back) to 1 (front)
        const scale = 0.72 + normZ * 0.38;
        mesh.scale.set(scale, scale, 1);
        mesh.material.opacity = Math.max(0.25, Math.min(1.0, 0.35 + normZ * 0.65));
      });

      // Raycasting for interactive hover state
      if (!this.isDragging) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.cards);

        if (intersects.length > 0) {
          const hitIdx = intersects[0].object.userData.index;
          if (this.hoveredIndex !== hitIdx) {
            this.setHovered(hitIdx);
          }
        } else if (this.hoveredIndex !== -1) {
          this.setHovered(-1);
        }
      }

      this.renderer.render(this.scene, this.camera);
    }

    setHovered(index) {
      this.hoveredIndex = index;
      if (this.container) {
        this.container.style.cursor = index >= 0 ? 'pointer' : 'grab';
      }

      this.cards.forEach((mesh, idx) => {
        const isHovered = idx === index;
        const newTex = this.createCardTexture(mesh.userData.node, isHovered);
        mesh.material.map.dispose();
        mesh.material.map = newTex;
        mesh.material.needsUpdate = true;
      });
    }
  }

  window.Gallery3D = CylindricalGallery;
})();
