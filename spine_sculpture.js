/**
 * Spine Sculpture — Iridescent Organic 3D Centerpiece
 * Inspired by Reference 2: Luminous twisting crystal vortex,
 * orbiting golden energy filaments, reflective wet obsidian floor,
 * rising embers, and scroll-reactive spatial depth.
 */
(function () {
  'use strict';

  // ── Crystal Core Vertex Shader ──
  const VERT = `
    uniform float uTime;
    uniform float uScroll;
    uniform float uTwist;
    uniform float uMorph;
    uniform vec2  uPointer;
    varying vec3  vNormal;
    varying vec3  vPosition;
    varying vec3  vWorldPos;
    varying float vDisplace;
    varying float vY;

    #define PI 3.14159265

    mat2 rot2(float a){ float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }

    void main(){
      vec3 pos = position;
      vY = pos.y;

      // Progressive twist along vertical axis
      float twistAmt = uTwist * 0.75 + sin(uTime * 0.4) * 0.2;
      float twistAngle = pos.y * twistAmt * 0.45;
      pos.xz = rot2(twistAngle) * pos.xz;

      // Organic fluid deformation
      float morph = uMorph * 0.55;
      float wave1 = sin(pos.y * 2.4 + uTime * 0.8) * morph * 0.4;
      float wave2 = cos(pos.y * 1.6 + uTime * 0.6 + 1.2) * morph * 0.25;
      float wave3 = sin(pos.y * 4.2 + uTime * 1.2) * morph * 0.15;
      pos.x += wave1 + wave3;
      pos.z += wave2;

      // Pointer interactive sway
      vec2 ptr = uPointer * 0.5;
      float pdist = length(pos.xz - ptr);
      float pfactor = smoothstep(4.0, 0.5, pdist) * 0.2;
      pos.x += (ptr.x - pos.x) * pfactor;
      pos.z += (ptr.y - pos.z) * pfactor;

      vDisplace = length(pos - position);
      vPosition = pos;
      vNormal = normalMatrix * normal;
      vec4 worldPos = modelMatrix * vec4(pos, 1.0);
      vWorldPos = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `;

  // ── Luminous Iridescent Fragment Shader ──
  const FRAG = `
    uniform float uTime;
    uniform float uScroll;
    varying vec3  vNormal;
    varying vec3  vPosition;
    varying vec3  vWorldPos;
    varying float vDisplace;
    varying float vY;

    #define PI 3.14159265

    // Saturated iridescent spectrum from cyan to magenta to amber
    vec3 getIridescence(vec3 viewDir, vec3 norm, float t){
      float ndv = abs(dot(normalize(viewDir), normalize(norm)));
      float shift = ndv * 2.8 + t * 0.35 + vY * 0.35;

      vec3 cCyan       = vec3(0.28, 0.91, 0.96); // #48E8F5
      vec3 cTurquoise  = vec3(0.22, 0.86, 0.80); // #38DCCB
      vec3 cCobalt     = vec3(0.28, 0.48, 1.00); // #477BFF
      vec3 cViolet     = vec3(0.60, 0.40, 1.00); // #9865FF
      vec3 cHotPink    = vec3(1.00, 0.22, 0.78); // #FF39C8
      vec3 cFuchsia    = vec3(1.00, 0.39, 0.71); // #FF63B5
      vec3 cAmber      = vec3(1.00, 0.68, 0.34); // #FFAD56
      vec3 cGold       = vec3(1.00, 0.83, 0.55); // #FFD38B

      float s = mod(shift, 8.0);
      vec3 col;
      if(s < 1.0) col = mix(cCyan, cTurquoise, s);
      else if(s < 2.0) col = mix(cTurquoise, cCobalt, s - 1.0);
      else if(s < 3.0) col = mix(cCobalt, cViolet, s - 2.0);
      else if(s < 4.0) col = mix(cViolet, cHotPink, s - 3.0);
      else if(s < 5.0) col = mix(cHotPink, cFuchsia, s - 4.0);
      else if(s < 6.0) col = mix(cFuchsia, cAmber, s - 5.0);
      else if(s < 7.0) col = mix(cAmber, cGold, s - 6.0);
      else col = mix(cGold, cCyan, s - 7.0);

      return col;
    }

    void main(){
      vec3 viewDir = normalize(cameraPosition - vWorldPos);
      vec3 norm = normalize(vNormal);

      vec3 iriCol = getIridescence(viewDir, norm, uTime);

      // Intense Fresnel rim glow
      float ndv = abs(dot(viewDir, norm));
      float fresnel = 1.0 - ndv;
      float rimGlow = pow(fresnel, 2.2);

      // Multiple light sources
      vec3 light1 = normalize(vec3(3.0, 5.0, 4.0));
      vec3 light2 = normalize(vec3(-4.0, -2.0, 3.0));
      vec3 lightBottom = normalize(vec3(0.0, -1.0, 1.0)); // warm base glow

      float diff1 = max(dot(norm, light1), 0.0) * 0.7;
      float diff2 = max(dot(norm, light2), 0.0) * 0.35;
      float diffBase = max(dot(norm, -lightBottom), 0.0) * 0.4;

      // Specular highlight
      vec3 halfDir = normalize(light1 + viewDir);
      float spec = pow(max(dot(norm, halfDir), 0.0), 48.0) * 1.2;

      // Base color with ambient and diffuse
      vec3 col = iriCol * (0.35 + diff1 + diff2);

      // Warm core / base reflection
      vec3 warmGold = vec3(1.0, 0.72, 0.38);
      col += warmGold * diffBase * smoothstep(2.0, -4.5, vY);

      // Add intense rim illumination
      col += iriCol * rimGlow * 2.2;
      col += vec3(1.0) * spec;

      // Inner volumetric crystal glow
      float innerGlow = smoothstep(0.0, 1.0, 1.0 - ndv);
      col += vec3(0.4, 0.7, 1.0) * innerGlow * 0.4;

      // Alpha with slight glass translucency
      float alpha = 0.88 + rimGlow * 0.12;

      gl_FragColor = vec4(col, alpha);
    }
  `;

  // ── Orbiting Energy Filament Shader ──
  const FILAMENT_VERT = `
    uniform float uTime;
    varying float vProgress;
    void main(){
      vProgress = uv.x;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const FILAMENT_FRAG = `
    uniform float uTime;
    varying float vProgress;
    void main(){
      float pulse = sin(vProgress * 12.0 - uTime * 4.0) * 0.5 + 0.5;
      vec3 gold = vec3(1.0, 0.78, 0.35);
      vec3 cyan = vec3(0.3, 0.95, 1.0);
      vec3 col = mix(gold, cyan, sin(vProgress * 6.28 + uTime) * 0.5 + 0.5);
      col += vec3(1.0) * pulse * 0.6;
      gl_FragColor = vec4(col, 0.85);
    }
  `;

  // ── Wet Reflective Obsidian Floor Shader ──
  const FLOOR_VERT = `
    varying vec2 vUv;
    varying vec3 vWorldPos;
    void main(){
      vUv = uv;
      vec4 wp = modelMatrix * vec4(position, 1.0);
      vWorldPos = wp.xyz;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }
  `;

  const FLOOR_FRAG = `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vWorldPos;
    void main(){
      vec2 center = vWorldPos.xz * 0.2;
      float dist = length(center);

      // Ripples in the dark wet floor
      float ripple1 = sin(dist * 14.0 - uTime * 1.5) * 0.05;
      float ripple2 = cos(center.x * 10.0 + center.y * 8.0 - uTime * 0.8) * 0.04;
      float ripple = ripple1 + ripple2;

      // Obsidian dark water surface
      vec3 floorCol = vec3(0.03, 0.025, 0.05);

      // Reflected glow from the central crystal vortex base
      float baseGlow = smoothstep(5.5, 0.0, dist + ripple * 2.0);
      vec3 cyanReflection = vec3(0.2, 0.85, 0.95) * baseGlow * 0.55;
      vec3 pinkReflection = vec3(0.95, 0.25, 0.75) * baseGlow * 0.45;
      vec3 goldReflection = vec3(1.0, 0.75, 0.35) * pow(baseGlow, 2.0) * 0.85;

      vec3 reflection = cyanReflection + pinkReflection + goldReflection;

      // Distance fog to fade into darkness at edges
      float fade = smoothstep(16.0, 4.0, dist);

      vec3 finalCol = (floorCol + reflection) * fade;
      gl_FragColor = vec4(finalCol, 0.92 * fade);
    }
  `;

  class SpineSculpture {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas || typeof THREE === 'undefined') {
        console.warn('[SpineSculpture] Canvas or Three.js not found');
        return;
      }
      this.ready = false;
      this.scroll = 0;
      this.pointer = { x: 0, y: 0 };
      this.targetPointer = { x: 0, y: 0 };
      this.clock = new THREE.Clock();

      this.init();
      this.ready = true;
    }

    init() {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      // Renderer
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(W, H);
      this.renderer.setPixelRatio(dpr);
      this.renderer.setClearColor(0x08070D, 1);

      // Scene
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0x08070D, 0.035);

      // Camera
      this.camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 150);
      this.camera.position.set(0, 0.5, 11.5);
      this.camera.lookAt(0, 0, 0);

      // Sculpture Master Group
      this.sculptureGroup = new THREE.Group();
      this.scene.add(this.sculptureGroup);

      // Uniforms shared across materials
      this.uniforms = {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uTwist: { value: 1.0 },
        uMorph: { value: 1.0 },
        uPointer: { value: new THREE.Vector2(0, 0) }
      };

      this.createSpine();
      this.createFilaments();
      this.createSecondaryStrands();
      this.createRings();
      this.createFragments();
      this.createFloor();
      this.createParticles();
      this.createLights();

      // Events
      this.onResize = () => this.resize();
      window.addEventListener('resize', this.onResize);

      this.onPointerMove = (e) => {
        this.targetPointer.x = ((e.clientX / window.innerWidth) - 0.5) * 2;
        this.targetPointer.y = -((e.clientY / window.innerHeight) - 0.5) * 2;
      };
      window.addEventListener('pointermove', this.onPointerMove, { passive: true });

      // Animation
      this.animate = this.animate.bind(this);
      this.animate();
    }

    createSpine() {
      // Main central twisting crystal spine
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -5.5, 0),
        new THREE.Vector3(0.45, -3.6, 0.5),
        new THREE.Vector3(-0.5, -1.6, -0.4),
        new THREE.Vector3(0.35, 0.3, 0.55),
        new THREE.Vector3(-0.4, 2.2, -0.3),
        new THREE.Vector3(0.55, 4.0, 0.35),
        new THREE.Vector3(-0.15, 6.0, -0.1)
      ]);

      const tubeGeo = new THREE.TubeBufferGeometry(curve, 140, 0.48, 20, false);
      const mat = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: true
      });
      this.spineMesh = new THREE.Mesh(tubeGeo, mat);
      this.sculptureGroup.add(this.spineMesh);

      // Inner warm luminous core tube
      const innerGeo = new THREE.TubeBufferGeometry(curve, 90, 0.22, 12, false);
      const innerMat = new THREE.MeshBasicMaterial({
        color: 0xFFD38B,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      });
      this.innerCore = new THREE.Mesh(innerGeo, innerMat);
      this.sculptureGroup.add(this.innerCore);
    }

    createFilaments() {
      // Glowing thin golden helix filaments orbiting around the crystal vortex (as in Ref 2)
      this.filaments = [];
      const filamentCount = 3;

      for (let f = 0; f < filamentCount; f++) {
        const pts = [];
        const phase = (f / filamentCount) * Math.PI * 2;
        const totalSteps = 70;

        for (let i = 0; i <= totalSteps; i++) {
          const t = (i / totalSteps) * 11.5 - 5.5;
          const angle = phase + t * 1.5;
          const r = 0.85 + Math.sin(t * 0.8 + phase) * 0.3;
          pts.push(new THREE.Vector3(
            Math.cos(angle) * r,
            t,
            Math.sin(angle) * r
          ));
        }

        const curve = new THREE.CatmullRomCurve3(pts);
        const geo = new THREE.TubeBufferGeometry(curve, 100, 0.035, 8, false);
        const mat = new THREE.ShaderMaterial({
          uniforms: { uTime: this.uniforms.uTime },
          vertexShader: FILAMENT_VERT,
          fragmentShader: FILAMENT_FRAG,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const mesh = new THREE.Mesh(geo, mat);
        this.sculptureGroup.add(mesh);
        this.filaments.push(mesh);
      }
    }

    createSecondaryStrands() {
      // Intertwined ribbon strands winding along the spine
      const offsets = [
        { angle: 0, radius: 0.85, phase: 0 },
        { angle: Math.PI * 0.5, radius: 0.95, phase: 1.8 },
        { angle: Math.PI, radius: 0.8, phase: 3.2 },
        { angle: Math.PI * 1.5, radius: 0.9, phase: 4.8 }
      ];

      this.strands = [];
      offsets.forEach(({ angle, radius, phase }) => {
        const pts = [];
        for (let i = 0; i <= 45; i++) {
          const t = (i / 45) * 11.5 - 5.5;
          const a = angle + t * 0.9 + phase;
          const r = radius * (0.8 + 0.25 * Math.sin(t * 0.65 + phase));
          pts.push(new THREE.Vector3(
            Math.cos(a) * r,
            t,
            Math.sin(a) * r
          ));
        }
        const curve = new THREE.CatmullRomCurve3(pts);
        const geo = new THREE.TubeBufferGeometry(curve, 90, 0.1, 10, false);
        const mat = new THREE.ShaderMaterial({
          uniforms: this.uniforms,
          vertexShader: VERT,
          fragmentShader: FRAG,
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false
        });
        const mesh = new THREE.Mesh(geo, mat);
        this.sculptureGroup.add(mesh);
        this.strands.push(mesh);
      });
    }

    createRings() {
      // Torus rings along the spine
      this.rings = [];
      for (let i = 0; i < 9; i++) {
        const y = -4.5 + i * 1.15;
        const r = 0.65 + Math.sin(i * 0.8) * 0.3;
        const geo = new THREE.TorusBufferGeometry(r, 0.03, 8, 36);
        const mat = new THREE.ShaderMaterial({
          uniforms: this.uniforms,
          vertexShader: VERT,
          fragmentShader: FRAG,
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false
        });
        const ring = new THREE.Mesh(geo, mat);
        ring.position.y = y;
        ring.rotation.x = Math.PI / 2 + Math.sin(i) * 0.3;
        ring.rotation.z = Math.cos(i * 1.2) * 0.4;
        ring.userData = { baseY: y, index: i };
        this.sculptureGroup.add(ring);
        this.rings.push(ring);
      }
    }

    createFragments() {
      // Floating crystalline shards
      this.fragments = [];
      const fragGeo = new THREE.OctahedronBufferGeometry(0.12, 0);
      const fragMat = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      for (let i = 0; i < 48; i++) {
        const mesh = new THREE.Mesh(fragGeo, fragMat);
        const angle = Math.random() * Math.PI * 2;
        const r = 1.3 + Math.random() * 3.0;
        const y = (Math.random() - 0.5) * 11;
        mesh.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
        mesh.scale.setScalar(0.6 + Math.random() * 1.8);
        mesh.userData = {
          basePos: mesh.position.clone(),
          speed: 0.3 + Math.random() * 0.8,
          phase: Math.random() * Math.PI * 2,
          orbitSpeed: 0.12 + Math.random() * 0.25
        };
        this.sculptureGroup.add(mesh);
        this.fragments.push(mesh);
      }
    }

    createFloor() {
      // Wet reflective obsidian floor at base
      const floorGeo = new THREE.PlaneBufferGeometry(36, 36, 32, 32);
      floorGeo.rotateX(-Math.PI / 2);
      const floorMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: this.uniforms.uTime
        },
        vertexShader: FLOOR_VERT,
        fragmentShader: FLOOR_FRAG,
        transparent: true,
        depthWrite: false
      });
      this.floorMesh = new THREE.Mesh(floorGeo, floorMat);
      this.floorMesh.position.y = -5.5;
      this.scene.add(this.floorMesh);
    }

    createParticles() {
      // Rising golden embers and atmospheric cyber-dust
      const isMobile = window.innerWidth < 768;
      const count = isMobile ? 800 : 2200;

      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);

      const palette = [
        [0.28, 0.91, 0.96], // cyan
        [0.22, 0.86, 0.80], // turquoise
        [0.28, 0.48, 1.00], // cobalt
        [0.60, 0.40, 1.00], // ultraviolet
        [1.00, 0.22, 0.78], // hot pink
        [1.00, 0.68, 0.34], // amber
        [1.00, 0.83, 0.55]  // gold
      ];

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 1.2 + Math.random() * 16;

        positions[i3] = Math.sin(phi) * Math.cos(theta) * r;
        positions[i3 + 1] = (Math.random() - 0.4) * 16 - 2;
        positions[i3 + 2] = Math.sin(phi) * Math.sin(theta) * r;

        const c = palette[Math.floor(Math.random() * palette.length)];
        colors[i3] = c[0];
        colors[i3 + 1] = c[1];
        colors[i3 + 2] = c[2];

        sizes[i] = 2.0 + Math.random() * 3.5;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const particleMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: this.uniforms.uTime
        },
        vertexShader: `
          attribute float size;
          attribute vec3 color;
          varying vec3 vColor;
          varying float vAlpha;
          uniform float uTime;
          void main(){
            vColor = color;
            vec3 pos = position;
            // Rising ember drift
            pos.y += mod(uTime * 0.8 + position.y + 6.0, 16.0) - 8.0;
            pos.x += sin(uTime * 0.3 + position.z * 0.4) * 0.35;
            pos.z += cos(uTime * 0.25 + position.x * 0.4) * 0.35;

            vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
            float dist = length(mvPos.xyz);
            vAlpha = smoothstep(22.0, 2.0, dist) * 0.85;
            gl_PointSize = size * (220.0 / -mvPos.z);
            gl_Position = projectionMatrix * mvPos;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vAlpha;
          void main(){
            float d = length(gl_PointCoord - 0.5) * 2.0;
            if(d > 1.0) discard;
            float alpha = (1.0 - d * d) * vAlpha;
            gl_FragColor = vec4(vColor, alpha);
          }
        `,
        transparent: true,
        depthWrite: false,
        vertexColors: true,
        blending: THREE.AdditiveBlending
      });

      this.particleSystem = new THREE.Points(geo, particleMat);
      this.scene.add(this.particleSystem);
    }

    createLights() {
      const a = new THREE.AmbientLight(0x181528, 0.6);
      this.scene.add(a);

      const d1 = new THREE.DirectionalLight(0x48E8F5, 1.0);
      d1.position.set(5, 8, 8);
      this.scene.add(d1);

      const d2 = new THREE.DirectionalLight(0xFF39C8, 0.8);
      d2.position.set(-6, -2, 6);
      this.scene.add(d2);

      // Warm golden point light at base
      const pBase = new THREE.PointLight(0xFFAD56, 1.8, 15);
      pBase.position.set(0, -4.5, 2);
      this.scene.add(pBase);

      // Orbiting cobalt/cyan point light
      this.pointLight = new THREE.PointLight(0x477BFF, 1.2, 18);
      this.pointLight.position.set(3, 2, 4);
      this.scene.add(this.pointLight);
    }

    setScroll(progress) {
      this.scroll = progress;
    }

    resize() {
      const W = window.innerWidth;
      const H = window.innerHeight;
      this.camera.aspect = W / H;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(W, H);
    }

    animate() {
      if (!this.ready) return;
      requestAnimationFrame(this.animate);

      if (document.hidden) return;

      const t = this.clock.getElapsedTime();
      const s = this.scroll;

      // Smooth pointer interpolation
      this.pointer.x += (this.targetPointer.x - this.pointer.x) * 0.05;
      this.pointer.y += (this.targetPointer.y - this.pointer.y) * 0.05;

      // Update uniforms
      this.uniforms.uTime.value = t;
      this.uniforms.uScroll.value = s;
      this.uniforms.uTwist.value = 1.0 + s * 1.8 + Math.sin(t * 0.25) * 0.3;
      this.uniforms.uMorph.value = 0.6 + s * 0.9 + Math.sin(t * 0.18) * 0.2;
      this.uniforms.uPointer.value.set(this.pointer.x * 2, this.pointer.y * 2);

      // Sculpture dynamic rotation & twist
      this.sculptureGroup.rotation.y = t * 0.09 + s * Math.PI * 1.6 + this.pointer.x * 0.16;
      this.sculptureGroup.rotation.x = Math.sin(t * 0.1) * 0.08 + this.pointer.y * 0.12;
      this.sculptureGroup.rotation.z = Math.sin(t * 0.08 + 1.0) * 0.05;

      // Vertical position shifts with scroll
      this.sculptureGroup.position.y = s * -2.2 + Math.sin(t * 0.12) * 0.15;

      // Filaments orbit
      if (this.filaments) {
        this.filaments.forEach((fil, idx) => {
          fil.rotation.y = t * 0.2 * (idx % 2 === 0 ? 1 : -1);
        });
      }

      // Torus rings breathing
      this.rings.forEach((ring) => {
        const i = ring.userData.index;
        ring.rotation.z = Math.sin(t * 0.35 + i * 0.7) * 0.35;
        ring.position.y = ring.userData.baseY + Math.sin(t * 0.25 + i * 0.5) * 0.1;
        const rs = 0.9 + Math.sin(t * 0.4 + i) * 0.16;
        ring.scale.setScalar(rs);
      });

      // Floating crystal shards orbit
      this.fragments.forEach((frag) => {
        const ud = frag.userData;
        const orbitAngle = t * ud.orbitSpeed + ud.phase;
        const bx = ud.basePos.x;
        const bz = ud.basePos.z;
        const dist = Math.sqrt(bx * bx + bz * bz);
        frag.position.x = Math.cos(orbitAngle) * dist;
        frag.position.z = Math.sin(orbitAngle) * dist;
        frag.position.y = ud.basePos.y + Math.sin(t * ud.speed + ud.phase) * 0.6;
        frag.rotation.x = t * ud.speed * 0.6;
        frag.rotation.y = t * ud.speed * 0.4;
      });

      // Camera parallax
      const camX = Math.sin(t * 0.06) * 0.4 + this.pointer.x * 1.1;
      const camY = 0.5 + Math.cos(t * 0.05) * 0.25 + this.pointer.y * 0.7 - s * 1.6;
      this.camera.position.x += (camX - this.camera.position.x) * 0.02;
      this.camera.position.y += (camY - this.camera.position.y) * 0.02;
      this.camera.lookAt(0, -s * 1.1, 0);

      // Orbiting light
      this.pointLight.position.x = Math.sin(t * 0.35) * 6;
      this.pointLight.position.z = Math.cos(t * 0.35) * 6;
      this.pointLight.position.y = Math.sin(t * 0.25) * 3.5;

      this.renderer.render(this.scene, this.camera);
    }

    dispose() {
      this.ready = false;
      window.removeEventListener('resize', this.onResize);
      window.removeEventListener('pointermove', this.onPointerMove);
      this.renderer.dispose();
    }
  }

  window.SpineSculpture = SpineSculpture;
})();
