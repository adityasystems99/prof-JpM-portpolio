/**
 * Spine Sculpture — Iridescent Organic 3D Centerpiece
 * Three.js procedural sculpture with custom GLSL shaders,
 * multi-strand twisted geometry, atmospheric particles,
 * scroll-driven animation, and pointer interaction.
 */
(function () {
  'use strict';

  // ── Vertex Shader ──
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

      // Organic twist along Y axis
      float twistAmt = uTwist * 0.6 + sin(uTime * 0.3) * 0.15;
      float twistAngle = pos.y * twistAmt * 0.4;
      pos.xz = rot2(twistAngle) * pos.xz;

      // Morph: sinusoidal displacement
      float morph = uMorph * 0.5;
      float wave1 = sin(pos.y * 2.8 + uTime * 0.7) * morph * 0.35;
      float wave2 = cos(pos.y * 1.4 + uTime * 0.5 + 1.2) * morph * 0.2;
      float wave3 = sin(pos.y * 4.5 + uTime * 1.1) * morph * 0.12;
      pos.x += wave1 + wave3;
      pos.z += wave2;

      // Pointer attraction (subtle)
      vec2 ptr = uPointer * 0.6;
      float pdist = length(pos.xz - ptr);
      float pfactor = smoothstep(3.0, 0.5, pdist) * 0.15;
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

  // ── Fragment Shader ──
  const FRAG = `
    uniform float uTime;
    uniform float uScroll;
    varying vec3  vNormal;
    varying vec3  vPosition;
    varying vec3  vWorldPos;
    varying float vDisplace;
    varying float vY;

    #define PI 3.14159265

    // Iridescence: view-dependent color shift
    vec3 iridescence(vec3 viewDir, vec3 norm, float t){
      float ndv = abs(dot(normalize(viewDir), normalize(norm)));
      float shift = ndv * 3.0 + t * 0.4 + vY * 0.5;

      // Broad saturated palette
      vec3 c1 = vec3(0.282, 0.910, 0.961); // cyan #48E8F5
      vec3 c2 = vec3(0.278, 0.482, 1.000); // cobalt #477BFF
      vec3 c3 = vec3(0.596, 0.396, 1.000); // ultraviolet #9865FF
      vec3 c4 = vec3(1.000, 0.224, 0.784); // hot pink #FF39C8
      vec3 c5 = vec3(1.000, 0.420, 0.514); // coral #FF6B83
      vec3 c6 = vec3(1.000, 0.678, 0.337); // amber #FFAD56
      vec3 c7 = vec3(0.220, 0.863, 0.796); // turquoise #38DCCB

      float s = mod(shift, 7.0);
      vec3 col;
      if(s < 1.0) col = mix(c1, c2, s);
      else if(s < 2.0) col = mix(c2, c3, s - 1.0);
      else if(s < 3.0) col = mix(c3, c4, s - 2.0);
      else if(s < 4.0) col = mix(c4, c5, s - 3.0);
      else if(s < 5.0) col = mix(c5, c6, s - 4.0);
      else if(s < 6.0) col = mix(c6, c7, s - 5.0);
      else col = mix(c7, c1, s - 6.0);

      return col;
    }

    void main(){
      vec3 viewDir = normalize(cameraPosition - vWorldPos);
      vec3 norm = normalize(vNormal);

      vec3 iriCol = iridescence(viewDir, norm, uTime);

      // Fresnel rim glow
      float fresnel = 1.0 - abs(dot(viewDir, norm));
      fresnel = pow(fresnel, 2.5);

      // Lighting
      vec3 lightDir1 = normalize(vec3(2.0, 3.0, 4.0));
      vec3 lightDir2 = normalize(vec3(-3.0, -1.0, 2.0));
      float diff1 = max(dot(norm, lightDir1), 0.0) * 0.7;
      float diff2 = max(dot(norm, lightDir2), 0.0) * 0.3;
      float ambient = 0.25;

      vec3 halfDir = normalize(lightDir1 + viewDir);
      float spec = pow(max(dot(norm, halfDir), 0.0), 64.0) * 0.8;

      vec3 col = iriCol * (ambient + diff1 + diff2) + vec3(1.0) * spec;

      // Fresnel adds white-ish glow
      col += iriCol * fresnel * 1.5;

      // Displacement glow
      col += iriCol * vDisplace * 0.4;

      // Subtle emissive
      col += iriCol * 0.15;

      // Alpha: slightly translucent for depth
      float alpha = 0.85 + fresnel * 0.15;

      gl_FragColor = vec4(col, alpha);
    }
  `;

  // ── Wireframe Fragment Shader ──
  const WIRE_FRAG = `
    uniform float uTime;
    varying float vY;
    varying vec3 vPosition;

    void main(){
      float t = uTime * 0.3 + vY * 0.8;
      vec3 c1 = vec3(0.282, 0.910, 0.961);
      vec3 c2 = vec3(0.596, 0.396, 1.000);
      vec3 c3 = vec3(1.000, 0.224, 0.784);
      float s = mod(t, 3.0);
      vec3 col;
      if(s < 1.0) col = mix(c1, c2, s);
      else if(s < 2.0) col = mix(c2, c3, s - 1.0);
      else col = mix(c3, c1, s - 2.0);
      gl_FragColor = vec4(col, 0.18);
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
      this.renderer.setClearColor(0x000000, 0);

      // Scene
      this.scene = new THREE.Scene();

      // Camera
      this.camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 200);
      this.camera.position.set(0, 0, 12);
      this.camera.lookAt(0, 0, 0);

      // Sculpture group
      this.sculptureGroup = new THREE.Group();
      this.scene.add(this.sculptureGroup);

      // Uniforms shared across sculpture materials
      this.uniforms = {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uTwist: { value: 1.0 },
        uMorph: { value: 1.0 },
        uPointer: { value: new THREE.Vector2(0, 0) }
      };

      this.createSpine();
      this.createSecondaryStrands();
      this.createRings();
      this.createFragments();
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
      // Central twisted tube — the main spine
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -5.5, 0),
        new THREE.Vector3(0.3, -3.5, 0.4),
        new THREE.Vector3(-0.4, -1.5, -0.3),
        new THREE.Vector3(0.2, 0, 0.5),
        new THREE.Vector3(-0.3, 1.5, -0.2),
        new THREE.Vector3(0.5, 3.5, 0.3),
        new THREE.Vector3(-0.1, 5.5, -0.1)
      ]);

      const tubeGeo = new THREE.TubeBufferGeometry(curve, 120, 0.35, 16, false);
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

      // Wireframe overlay
      const wireGeo = new THREE.TubeBufferGeometry(curve, 60, 0.42, 12, false);
      const wireMat = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: VERT,
        fragmentShader: WIRE_FRAG,
        transparent: true,
        wireframe: true,
        depthWrite: false
      });
      this.wireSpine = new THREE.Mesh(wireGeo, wireMat);
      this.sculptureGroup.add(this.wireSpine);
    }

    createSecondaryStrands() {
      // 4 thinner strands winding around the main spine
      const offsets = [
        { angle: 0, radius: 0.7, phase: 0 },
        { angle: Math.PI / 2, radius: 0.8, phase: 1.5 },
        { angle: Math.PI, radius: 0.65, phase: 3.0 },
        { angle: 3 * Math.PI / 2, radius: 0.75, phase: 4.5 }
      ];

      this.strands = [];
      offsets.forEach(({ angle, radius, phase }) => {
        const pts = [];
        for (let i = 0; i <= 40; i++) {
          const t = (i / 40) * 11 - 5.5;
          const a = angle + t * 0.8 + phase;
          const r = radius * (0.8 + 0.2 * Math.sin(t * 0.7 + phase));
          pts.push(new THREE.Vector3(
            Math.cos(a) * r,
            t,
            Math.sin(a) * r
          ));
        }
        const curve = new THREE.CatmullRomCurve3(pts);
        const geo = new THREE.TubeBufferGeometry(curve, 80, 0.08, 8, false);
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
      // Skeletal rings at intervals along the spine
      this.rings = [];
      for (let i = 0; i < 9; i++) {
        const y = -4.5 + i * 1.12;
        const r = 0.5 + Math.sin(i * 0.9) * 0.25;
        const geo = new THREE.TorusBufferGeometry(r, 0.025, 8, 32);
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
        ring.rotation.z = Math.cos(i * 1.3) * 0.4;
        ring.userData = { baseY: y, index: i };
        this.sculptureGroup.add(ring);
        this.rings.push(ring);
      }
    }

    createFragments() {
      // Small floating crystalline fragments around the sculpture
      this.fragments = [];
      const fragGeo = new THREE.OctahedronBufferGeometry(0.08, 0);
      const fragMat = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      for (let i = 0; i < 40; i++) {
        const mesh = new THREE.Mesh(fragGeo, fragMat);
        const angle = Math.random() * Math.PI * 2;
        const r = 1.2 + Math.random() * 2.5;
        const y = (Math.random() - 0.5) * 10;
        mesh.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
        mesh.scale.setScalar(0.5 + Math.random() * 1.5);
        mesh.userData = {
          basePos: mesh.position.clone(),
          speed: 0.3 + Math.random() * 0.7,
          phase: Math.random() * Math.PI * 2,
          orbitSpeed: 0.1 + Math.random() * 0.2
        };
        this.sculptureGroup.add(mesh);
        this.fragments.push(mesh);
      }
    }

    createParticles() {
      // Atmospheric particles — colourful micro-points in 3D space
      const isMobile = window.innerWidth < 768;
      const count = isMobile ? 600 : 1800;

      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);

      const palette = [
        [0.282, 0.910, 0.961], // cyan
        [0.220, 0.863, 0.796], // turquoise
        [0.278, 0.482, 1.000], // cobalt
        [0.596, 0.396, 1.000], // ultraviolet
        [1.000, 0.224, 0.784], // hot pink
        [1.000, 0.389, 0.710], // fuchsia
        [1.000, 0.420, 0.514], // coral
        [1.000, 0.678, 0.337], // amber
        [1.000, 0.827, 0.545]  // soft gold
      ];

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        // Distribute in a large sphere with bias toward the center column
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 2 + Math.random() * 18;
        positions[i3] = Math.sin(phi) * Math.cos(theta) * r;
        positions[i3 + 1] = (Math.random() - 0.5) * 20;
        positions[i3 + 2] = Math.sin(phi) * Math.sin(theta) * r;

        const c = palette[Math.floor(Math.random() * palette.length)];
        colors[i3] = c[0];
        colors[i3 + 1] = c[1];
        colors[i3 + 2] = c[2];

        sizes[i] = 1.5 + Math.random() * 3.0;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const particleMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: this.uniforms.uTime,
          uScroll: this.uniforms.uScroll
        },
        vertexShader: `
          attribute float size;
          attribute vec3 color;
          varying vec3 vColor;
          varying float vAlpha;
          uniform float uTime;
          uniform float uScroll;
          void main(){
            vColor = color;
            vec3 pos = position;
            pos.y += sin(uTime * 0.15 + position.x * 0.3) * 0.4;
            pos.x += cos(uTime * 0.1 + position.z * 0.2) * 0.3;
            vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
            float dist = length(mvPos.xyz);
            vAlpha = smoothstep(25.0, 3.0, dist) * 0.7;
            gl_PointSize = size * (200.0 / -mvPos.z);
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
      this.particlePositions = positions;
    }

    createLights() {
      const a = new THREE.AmbientLight(0x222233, 0.4);
      this.scene.add(a);

      const d1 = new THREE.DirectionalLight(0x48E8F5, 0.6);
      d1.position.set(5, 8, 10);
      this.scene.add(d1);

      const d2 = new THREE.DirectionalLight(0xFF39C8, 0.4);
      d2.position.set(-5, -3, 5);
      this.scene.add(d2);

      const p1 = new THREE.PointLight(0x9865FF, 0.8, 20);
      p1.position.set(3, 2, 4);
      this.scene.add(p1);
      this.pointLight = p1;
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

      // Smooth pointer
      this.pointer.x += (this.targetPointer.x - this.pointer.x) * 0.05;
      this.pointer.y += (this.targetPointer.y - this.pointer.y) * 0.05;

      // Update uniforms
      this.uniforms.uTime.value = t;
      this.uniforms.uScroll.value = s;
      this.uniforms.uTwist.value = 1.0 + s * 1.5 + Math.sin(t * 0.2) * 0.3;
      this.uniforms.uMorph.value = 0.6 + s * 0.8 + Math.sin(t * 0.15) * 0.2;
      this.uniforms.uPointer.value.set(this.pointer.x * 2, this.pointer.y * 2);

      // Sculpture rotation
      this.sculptureGroup.rotation.y = t * 0.08 + s * Math.PI * 1.5 + this.pointer.x * 0.15;
      this.sculptureGroup.rotation.x = Math.sin(t * 0.1) * 0.08 + this.pointer.y * 0.1;
      this.sculptureGroup.rotation.z = Math.sin(t * 0.07 + 1.0) * 0.05;

      // Sculpture vertical shift with scroll
      this.sculptureGroup.position.y = s * -2.0 + Math.sin(t * 0.12) * 0.15;

      // Scale breathing
      const breathe = 1.0 + Math.sin(t * 0.25) * 0.02;
      this.sculptureGroup.scale.setScalar(breathe);

      // Rings subtle animation
      this.rings.forEach((ring) => {
        const i = ring.userData.index;
        ring.rotation.z = Math.sin(t * 0.3 + i * 0.7) * 0.3;
        ring.position.y = ring.userData.baseY + Math.sin(t * 0.2 + i * 0.5) * 0.08;
        const rs = 0.9 + Math.sin(t * 0.4 + i) * 0.15;
        ring.scale.setScalar(rs);
      });

      // Fragments orbit & float
      this.fragments.forEach((frag) => {
        const ud = frag.userData;
        const orbitAngle = t * ud.orbitSpeed + ud.phase;
        const bx = ud.basePos.x;
        const bz = ud.basePos.z;
        const dist = Math.sqrt(bx * bx + bz * bz);
        frag.position.x = Math.cos(orbitAngle) * dist;
        frag.position.z = Math.sin(orbitAngle) * dist;
        frag.position.y = ud.basePos.y + Math.sin(t * ud.speed + ud.phase) * 0.5;
        frag.rotation.x = t * ud.speed * 0.5;
        frag.rotation.y = t * ud.speed * 0.3;
      });

      // Camera subtle movement
      const camX = Math.sin(t * 0.06) * 0.5 + this.pointer.x * 1.2;
      const camY = Math.cos(t * 0.05) * 0.3 + this.pointer.y * 0.8 - s * 1.5;
      this.camera.position.x += (camX - this.camera.position.x) * 0.02;
      this.camera.position.y += (camY - this.camera.position.y) * 0.02;
      this.camera.lookAt(0, -s * 1.0, 0);

      // Point light orbits
      this.pointLight.position.x = Math.sin(t * 0.3) * 5;
      this.pointLight.position.z = Math.cos(t * 0.3) * 5;
      this.pointLight.position.y = Math.sin(t * 0.2) * 3;

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
