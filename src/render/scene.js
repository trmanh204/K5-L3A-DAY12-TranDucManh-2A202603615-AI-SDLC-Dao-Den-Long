import * as THREE from 'three';
import { GameState } from '../core/gameState.js';

// Web Audio API Sound Synthesizer (Zero-dependency audio)
class SoundFX {
  constructor() {
    this.ctx = null;
  }

  _init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPickup() {
    this._init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playDash() {
    this._init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playJump() {
    this._init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(520, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  playPulse() {
    this._init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  playHit() {
    this._init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playLanternLit() {
    this._init();
    if (!this.ctx) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.45);
    });
  }

  playWindWarning() {
    this._init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(320, this.ctx.currentTime + 0.5);
    osc.frequency.linearRampToValueAtTime(140, this.ctx.currentTime + 1.2);
    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.4);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 1.2);
  }

  playWindGust() {
    this._init();
    if (!this.ctx) return;
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 1.5);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(350, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.5);
      filter.frequency.linearRampToValueAtTime(280, this.ctx.currentTime + 1.5);
      filter.Q.value = 2.5;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 0.4);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
      noise.stop(this.ctx.currentTime + 1.5);
    } catch {
      // Fallback simple sweep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 1.0);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.0);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 1.0);
    }
  }

  playMonsterAlert() {
    this._init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(95, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(65, this.ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }
}

export function createGameApp(container) {
  const sound = new SoundFX();
  let currentNight = 1;
  let game = new GameState({ seed: Math.floor(Math.random() * 10000), night: currentNight });

  // 1. Three.js Scene, Camera, Renderer
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0E1430);
  scene.fog = new THREE.FogExp2(0x1B2350, 0.02);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // 2. Lighting
  const ambientLight = new THREE.AmbientLight(0x1B2350, 0.3);
  scene.add(ambientLight);

  const moonLight = new THREE.DirectionalLight(0xaaccff, 1.2);
  moonLight.position.set(40, 60, 30);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.width = 1024;
  moonLight.shadow.mapSize.height = 1024;
  scene.add(moonLight);

  // Sea of Mist (Biển Mây)
  const mistGeo = new THREE.PlaneGeometry(500, 500);
  const mistMat = new THREE.MeshStandardMaterial({
    color: 0x12384A,
    roughness: 0.2,
    metalness: 0.5
  });
  const mist = new THREE.Mesh(mistGeo, mistMat);
  mist.rotation.x = -Math.PI / 2;
  mist.position.y = -2.5;
  scene.add(mist);

  // Groups for Dynamic Elements
  const islandGroup = new THREE.Group();
  scene.add(islandGroup);

  const lanternsGroup = new THREE.Group();
  scene.add(lanternsGroup);

  const motesGroup = new THREE.Group();
  scene.add(motesGroup);

  const shadesGroup = new THREE.Group();
  scene.add(shadesGroup);

  const driftersGroup = new THREE.Group();
  scene.add(driftersGroup);

  const charmsGroup = new THREE.Group();
  scene.add(charmsGroup);

  // 3. Player Character (Mây)
  const mayGroup = new THREE.Group();

  const bodyGeo = new THREE.CylinderGeometry(0.3, 0.45, 0.9, 16);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xE8E2D0 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.45;
  body.castShadow = true;
  mayGroup.add(body);

  const headGeo = new THREE.SphereGeometry(0.26, 16, 16);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffdfba });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.05;
  head.castShadow = true;
  mayGroup.add(head);

  // Vietnamese Nón Lá
  const hatGeo = new THREE.ConeGeometry(0.65, 0.32, 24);
  const hatMat = new THREE.MeshStandardMaterial({ color: 0xd4b26f, roughness: 0.7 });
  const hat = new THREE.Mesh(hatGeo, hatMat);
  hat.position.y = 1.25;
  hat.castShadow = true;
  mayGroup.add(hat);

  // Scarf (Khăn quàng đỏ)
  const scarfGeo = new THREE.TorusGeometry(0.3, 0.08, 8, 16);
  const scarfMat = new THREE.MeshStandardMaterial({ color: 0xC8102E });
  const scarf = new THREE.Mesh(scarfGeo, scarfMat);
  scarf.rotation.x = Math.PI / 2;
  scarf.position.y = 0.92;
  mayGroup.add(scarf);

  // Handheld Lantern
  const smallLanternGeo = new THREE.DodecahedronGeometry(0.12);
  const smallLanternMat = new THREE.MeshStandardMaterial({
    color: 0xFFB347,
    emissive: 0xFFE9B0,
    emissiveIntensity: 2
  });
  const smallLantern = new THREE.Mesh(smallLanternGeo, smallLanternMat);
  smallLantern.position.set(0.35, 0.45, 0.25);
  mayGroup.add(smallLantern);

  const smallLanternLight = new THREE.PointLight(0xFFB347, 2.0, 6);
  smallLanternLight.position.copy(smallLantern.position);
  mayGroup.add(smallLanternLight);

  scene.add(mayGroup);

  // Pulse Wave Ring Effect
  const pulseRingGeo = new THREE.RingGeometry(0.2, 0.8, 32);
  const pulseRingMat = new THREE.MeshBasicMaterial({
    color: 0xF2C14E,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide
  });
  const pulseRing = new THREE.Mesh(pulseRingGeo, pulseRingMat);
  pulseRing.rotation.x = -Math.PI / 2;
  pulseRing.position.y = 0.05;
  scene.add(pulseRing);
  let pulseVisualTimer = 0;

  // Track Mesh instances
  let lanternMeshes = new Map();
  let moteMeshes = new Map();
  let shadeMeshes = new Map();
  let drifterMeshes = new Map();
  let charmMeshes = new Map();

  // Audio & Alert State Tracking
  let prevWindWarn = false;
  let prevWindActive = false;
  let prevAggroShades = new Set();
  let prevChasingDrifter = false;

  // 3D Wind Streaks Particle System
  const windCount = 120;
  const windGeo = new THREE.BufferGeometry();
  const windPositions = new Float32Array(windCount * 3);
  const windData = [];
  for (let i = 0; i < windCount; i++) {
    windPositions[i * 3] = (Math.random() - 0.5) * 80;
    windPositions[i * 3 + 1] = Math.random() * 15 + 0.5;
    windPositions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    windData.push({
      speedMult: 0.8 + Math.random() * 0.8,
      yBase: windPositions[i * 3 + 1]
    });
  }
  windGeo.setAttribute('position', new THREE.BufferAttribute(windPositions, 3));
  const windMat = new THREE.PointsMaterial({
    color: 0xE0F7FA,
    size: 0.35,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending
  });
  const windParticles = new THREE.Points(windGeo, windMat);
  scene.add(windParticles);

  function applyNightAtmosphere(night) {
    if (night === 1) {
      // Đêm 1: Đảo Bến - Đêm rằm tĩnh mịch, ngọc lục bảo huyền bí
      scene.background = new THREE.Color(0x0B162C);
      scene.fog = new THREE.FogExp2(0x102342, 0.015);
      ambientLight.color.setHex(0x1B2C4E);
      ambientLight.intensity = 0.35;
      moonLight.color.setHex(0xBCE0FD);
      moonLight.intensity = 1.3;
      moonLight.position.set(40, 60, 30);
      mistMat.color.setHex(0x113149);
    } else if (night === 2) {
      // Đêm 2: Đảo Cau - Hoàng hôn tím thẫm & trăng vàng mật
      scene.background = new THREE.Color(0x1A0F2E);
      scene.fog = new THREE.FogExp2(0x27163D, 0.018);
      ambientLight.color.setHex(0x351F3D);
      ambientLight.intensity = 0.4;
      moonLight.color.setHex(0xFFD285);
      moonLight.intensity = 1.4;
      moonLight.position.set(50, 50, -30);
      mistMat.color.setHex(0x2B1538);
    } else if (night === 3) {
      // Đêm 3: Đảo Chuông - Đỉnh núi thiêng giông bão, ánh bạc uy nghiêm
      scene.background = new THREE.Color(0x070E22);
      scene.fog = new THREE.FogExp2(0x0E1936, 0.022);
      ambientLight.color.setHex(0x14203A);
      ambientLight.intensity = 0.35;
      moonLight.color.setHex(0xE2F0FF);
      moonLight.intensity = 1.5;
      moonLight.position.set(30, 70, 40);
      mistMat.color.setHex(0x0C2236);
    }
  }

  function createJumpPadVisual(pad, targetAngleDeg) {
    const padGroup = new THREE.Group();
    padGroup.position.set(pad.pos[0], pad.pos[1], pad.pos[2]);

    // Bục đài sen phát sáng
    const padBaseGeo = new THREE.CylinderGeometry(pad.radius, pad.radius * 1.15, 0.22, 32);
    const padBaseMat = new THREE.MeshStandardMaterial({
      color: 0x2A2416,
      roughness: 0.4,
      metalness: 0.6
    });
    const padBase = new THREE.Mesh(padBaseGeo, padBaseMat);
    padBase.position.y = 0.11;
    padBase.receiveShadow = true;
    padGroup.add(padBase);

    // Vòng hào quang phát sáng
    const padRingGeo = new THREE.RingGeometry(pad.radius * 0.35, pad.radius * 0.85, 32);
    const padRingMat = new THREE.MeshStandardMaterial({
      color: 0xF2C14E,
      emissive: 0xF2A900,
      emissiveIntensity: 2.0,
      side: THREE.DoubleSide
    });
    const padRing = new THREE.Mesh(padRingGeo, padRingMat);
    padRing.rotation.x = -Math.PI / 2;
    padRing.position.y = 0.23;
    padGroup.add(padRing);

    // Mũi tên định hướng phóng
    const arrowGeo = new THREE.ConeGeometry(0.35, 0.7, 3);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0xFFF176 });
    const arrow = new THREE.Mesh(arrowGeo, arrowMat);
    arrow.rotation.x = -Math.PI / 2;
    if (targetAngleDeg !== undefined) {
      arrow.rotation.z = -(targetAngleDeg * Math.PI) / 180 + Math.PI / 2;
    }
    arrow.position.y = 0.24;
    padGroup.add(arrow);

    // Cột ánh sáng phong ấn vút lên trời
    const beamGeo = new THREE.CylinderGeometry(pad.radius * 0.7, pad.radius * 0.7, 4.0, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xFFCA28,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 2.0;
    padGroup.add(beam);

    // Điểm sáng ấm
    const padLight = new THREE.PointLight(0xF2C14E, 1.8, 8);
    padLight.position.y = 0.8;
    padGroup.add(padLight);

    return padGroup;
  }

  function buildIslandMeshes(night) {
    islandGroup.clear();

    if (night === 1) {
      // ==========================================
      // ĐÊM 1: ĐẢO BẾN (Emerald Port Island R=40m)
      // ==========================================
      const grassMat1 = new THREE.MeshStandardMaterial({ color: 0x2A624A, roughness: 0.85 });
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x586065, roughness: 0.9 });
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x5C3E24, roughness: 0.7 });
      const sandMat = new THREE.MeshStandardMaterial({ color: 0xC8B88A, roughness: 0.95 });

      // Đảo chính cỏ xanh ngọc
      const geo = new THREE.CylinderGeometry(40, 42, 4, 64);
      const m = new THREE.Mesh(geo, grassMat1);
      m.position.y = -2;
      m.receiveShadow = true;
      islandGroup.add(m);

      // Bờ cát / ghềnh đá ven bờ biển mây (R in [36, 40.2])
      const beachGeo = new THREE.RingGeometry(36, 40.2, 64);
      const beach = new THREE.Mesh(beachGeo, sandMat);
      beach.rotation.x = -Math.PI / 2;
      beach.position.y = 0.02;
      beach.receiveShadow = true;
      islandGroup.add(beach);

      // Bến Cảng Gỗ (Wooden Pier) tại Z=38
      const pierGroup = new THREE.Group();
      pierGroup.position.set(0, 0, 38);

      const deckGeo = new THREE.BoxGeometry(5.2, 0.3, 10.0);
      const deck = new THREE.Mesh(deckGeo, woodMat);
      deck.position.set(0, 0.1, 0);
      deck.receiveShadow = true;
      deck.castShadow = true;
      pierGroup.add(deck);

      // Cột trụ đỡ cầu cảng cắm xuống biển mây
      const stiltGeo = new THREE.CylinderGeometry(0.2, 0.2, 4.5, 8);
      for (const sx of [-2.3, 2.3]) {
        for (const sz of [-4.0, 0, 4.0]) {
          const stilt = new THREE.Mesh(stiltGeo, woodMat);
          stilt.position.set(sx, -2.0, sz);
          pierGroup.add(stilt);
        }
      }

      // Hai cột đèn bến tàu (Mooring Lantern Posts)
      for (const lx of [-2.2, 2.2]) {
        const postGeo = new THREE.CylinderGeometry(0.12, 0.15, 1.8, 8);
        const post = new THREE.Mesh(postGeo, woodMat);
        post.position.set(lx, 0.9, 4.5);
        pierGroup.add(post);

        const lanternCapGeo = new THREE.DodecahedronGeometry(0.25);
        const lanternCapMat = new THREE.MeshStandardMaterial({
          color: 0xF2C14E,
          emissive: 0xFFA000,
          emissiveIntensity: 1.5
        });
        const lanternCap = new THREE.Mesh(lanternCapGeo, lanternCapMat);
        lanternCap.position.set(lx, 1.8, 4.5);
        pierGroup.add(lanternCap);

        const dockLight = new THREE.PointLight(0xFFAA33, 1.5, 8);
        dockLight.position.set(lx, 1.8, 4.5);
        pierGroup.add(dockLight);
      }
      islandGroup.add(pierGroup);

      // Các cụm đá rêu phong ven bờ đảo
      const rockGeo = new THREE.DodecahedronGeometry(1.2, 1);
      const rockPositions = [
        [32, 0.3, 15], [35, 0.2, -12], [-30, 0.4, 18], [-33, 0.3, -15],
        [15, 0.2, -35], [-12, 0.3, -34], [-24, 0.2, 28], [25, 0.2, 27]
      ];
      for (const rp of rockPositions) {
        const rMesh = new THREE.Mesh(rockGeo, rockMat);
        rMesh.position.set(rp[0], rp[1], rp[2]);
        rMesh.scale.set(1 + (rp[0] % 3) * 0.2, 0.7, 1 + (rp[2] % 3) * 0.2);
        rMesh.rotation.y = rp[0];
        rMesh.castShadow = true;
        rMesh.receiveShadow = true;
        islandGroup.add(rMesh);
      }

    } else if (night === 2) {
      // ==========================================
      // ĐÊM 2: ĐẢO CAU (Twin Islands & Sunset Twilight)
      // ==========================================
      const grassMat2 = new THREE.MeshStandardMaterial({ color: 0x365B36, roughness: 0.85 });
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x6E4D2B, roughness: 0.7 });
      const sandMat2 = new THREE.MeshStandardMaterial({ color: 0xC4A972, roughness: 0.95 });
      const bambooMat = new THREE.MeshStandardMaterial({ color: 0x82663A, roughness: 0.6 });
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x2D7A38, roughness: 0.7 });

      // Đảo A tại (0,0) R=28m
      const geoA = new THREE.CylinderGeometry(28, 30, 4, 48);
      const mA = new THREE.Mesh(geoA, grassMat2);
      mA.position.set(0, -2, 0);
      mA.receiveShadow = true;
      islandGroup.add(mA);

      // Bờ đất vàng đảo A
      const beachA = new THREE.Mesh(new THREE.RingGeometry(25, 28.1, 48), sandMat2);
      beachA.rotation.x = -Math.PI / 2;
      beachA.position.set(0, 0.02, 0);
      beachA.receiveShadow = true;
      islandGroup.add(beachA);

      // Đảo B tại (70,0) R=28m
      const geoB = new THREE.CylinderGeometry(28, 30, 4, 48);
      const mB = new THREE.Mesh(geoB, grassMat2);
      mB.position.set(70, -2, 0);
      mB.receiveShadow = true;
      islandGroup.add(mB);

      // Bờ đất vàng đảo B
      const beachB = new THREE.Mesh(new THREE.RingGeometry(25, 28.1, 48), sandMat2);
      beachB.rotation.x = -Math.PI / 2;
      beachB.position.set(70, 0.02, 0);
      beachB.receiveShadow = true;
      islandGroup.add(beachB);

      // Cầu tre (Bamboo Bridge) nối x in [26, 44], z in [-2.2, 2.2]
      const bridgeGroup = new THREE.Group();
      bridgeGroup.position.set(35, 0, 0);

      const bridgePlanks = new THREE.Mesh(new THREE.BoxGeometry(20, 0.35, 4.4), woodMat);
      bridgePlanks.position.y = 0.05;
      bridgePlanks.receiveShadow = true;
      bridgeGroup.add(bridgePlanks);

      // Tay vịn tre hai bên cầu (Bamboo Railings)
      for (const rz of [-2.15, 2.15]) {
        const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 20.0, 8), bambooMat);
        rail.rotation.z = Math.PI / 2;
        rail.position.set(0, 0.9, rz);
        bridgeGroup.add(rail);

        // 7 cột tre chống tay vịn
        for (let i = -3; i <= 3; i++) {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 1.2, 8), bambooMat);
          post.position.set(i * 3.0, 0.45, rz);
          bridgeGroup.add(post);
        }
      }

      // Trụ cầu cắm xuống biển mây
      for (let i = -2; i <= 2; i++) {
        for (const rz of [-1.8, 1.8]) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 3.5, 8), woodMat);
          leg.position.set(i * 4.5, -1.6, rz);
          bridgeGroup.add(leg);
        }
      }
      islandGroup.add(bridgeGroup);

      // Rặng Cây Cau (Areca Palm Trees)
      const palmLocations = [
        [12, 0, -20], [-16, 0, 16], [16, 0, 20], [-20, 0, -12],
        [54, 0, 20], [82, 0, -14], [64, 0, -20], [80, 0, 15]
      ];
      for (const loc of palmLocations) {
        const palmGroup = new THREE.Group();
        palmGroup.position.set(loc[0], loc[1], loc[2]);

        const trunkGeo = new THREE.CylinderGeometry(0.16, 0.26, 8.0, 8);
        const trunk = new THREE.Mesh(trunkGeo, bambooMat);
        trunk.position.y = 4.0;
        trunk.castShadow = true;
        palmGroup.add(trunk);

        for (let a = 0; a < 6; a++) {
          const ang = (a * Math.PI) / 3;
          const frond = new THREE.Mesh(new THREE.ConeGeometry(0.8, 3.2, 4), leafMat);
          frond.position.set(Math.cos(ang) * 1.2, 7.8, Math.sin(ang) * 1.2);
          frond.rotation.x = Math.sin(ang) * 0.8;
          frond.rotation.z = -Math.cos(ang) * 0.8;
          frond.castShadow = true;
          palmGroup.add(frond);
        }
        islandGroup.add(palmGroup);
      }

      // Bục Nhảy (Jump Pads) Đêm 2
      for (const pad of game.jump_pads) {
        const dx = pad.target_center[0] - pad.pos[0];
        const dz = pad.target_center[2] - pad.pos[2];
        const angleDeg = (Math.atan2(dz, dx) * 180) / Math.PI;
        const padMesh = createJumpPadVisual(pad, angleDeg);
        islandGroup.add(padMesh);
      }

    } else if (night === 3) {
      // ==========================================
      // ĐÊM 3: ĐẢO CHUÔNG (Sacred 3-Tier Mountain Sanctuary)
      // ==========================================
      const stoneMat0 = new THREE.MeshStandardMaterial({ color: 0x2A3A34, roughness: 0.9 });
      const stoneWallMat = new THREE.MeshStandardMaterial({ color: 0x4D5852, roughness: 0.85 });
      const jadeTerraceMat = new THREE.MeshStandardMaterial({ color: 0x365A4C, roughness: 0.8 });
      const marbleRimMat = new THREE.MeshStandardMaterial({ color: 0xDCE5DF, roughness: 0.35, metalness: 0.2 });
      const templeWoodMat = new THREE.MeshStandardMaterial({ color: 0x4A2A1A, roughness: 0.7 });
      const tileRoofMat = new THREE.MeshStandardMaterial({ color: 0x9B2828, roughness: 0.5 });
      const bellBronzeMat = new THREE.MeshStandardMaterial({
        color: 0xD4AF37,
        emissive: 0x8A6E20,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.85
      });

      // ----------------------------------------------------
      // TẦNG 0 (Đế đảo Y=0, R <= 45m)
      // ----------------------------------------------------
      const geo0 = new THREE.CylinderGeometry(45, 47, 4, 64);
      const m0 = new THREE.Mesh(geo0, stoneMat0);
      m0.position.y = -2;
      m0.receiveShadow = true;
      islandGroup.add(m0);

      // Thành lan can đá viền quanh đảo (R=44.5m) giúp nhận diện rõ mép vực
      for (let i = 0; i < 36; i++) {
        const a1 = (i * 10 * Math.PI) / 180;
        const x = Math.cos(a1) * 44.5;
        const z = Math.sin(a1) * 44.5;

        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.8, 8), stoneWallMat);
        pillar.position.set(x, 0.4, z);
        pillar.castShadow = true;
        islandGroup.add(pillar);

        const nextA = ((i + 1) * 10 * Math.PI) / 180;
        const nx = Math.cos(nextA) * 44.5;
        const nz = Math.sin(nextA) * 44.5;
        const mx = (x + nx) / 2;
        const mz = (z + nz) / 2;
        const distSeg = Math.hypot(nx - x, nz - z);

        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.2, distSeg), stoneWallMat);
        bar.position.set(mx, 0.55, mz);
        bar.rotation.y = -Math.atan2(nz - z, nx - x) + Math.PI / 2;
        islandGroup.add(bar);
      }

      // ----------------------------------------------------
      // TẦNG 1 (Thềm bán nguyệt ngọc bích Y=3, 12 <= R <= 24, Z > 0)
      // ----------------------------------------------------
      const t1Shape = new THREE.Shape();
      t1Shape.absarc(0, 0, 24.0, 0, Math.PI, false);
      t1Shape.lineTo(-12.0, 0);
      t1Shape.absarc(0, 0, 12.0, Math.PI, 0, true);
      t1Shape.closePath();

      const extrudeSettings = { depth: 3.0, bevelEnabled: false, curveSegments: 36 };
      const t1Geo = new THREE.ExtrudeGeometry(t1Shape, extrudeSettings);
      t1Geo.rotateX(Math.PI / 2);

      const t1Mesh = new THREE.Mesh(t1Geo, jadeTerraceMat);
      t1Mesh.position.set(0, 3.0, 0);
      t1Mesh.receiveShadow = true;
      t1Mesh.castShadow = true;
      islandGroup.add(t1Mesh);

      // Gờ đá cẩm thạch trắng viền sáng mép Tầng 1 (Y=3.02)
      const rimOuter = new THREE.Mesh(new THREE.RingGeometry(23.7, 24.1, 48, 1, 0, Math.PI), marbleRimMat);
      rimOuter.rotation.x = -Math.PI / 2;
      rimOuter.position.set(0, 3.03, 0);
      islandGroup.add(rimOuter);

      const rimInner = new THREE.Mesh(new THREE.RingGeometry(11.9, 12.3, 36, 1, 0, Math.PI), marbleRimMat);
      rimInner.rotation.x = -Math.PI / 2;
      rimInner.position.set(0, 3.03, 0);
      islandGroup.add(rimInner);

      // Hai gờ chắn đá ở 2 đầu cắt Z=0 của thềm bán nguyệt
      const endWallA = new THREE.Mesh(new THREE.BoxGeometry(12.0, 3.0, 0.4), stoneWallMat);
      endWallA.position.set(18.0, 1.5, 0);
      islandGroup.add(endWallA);

      const endWallB = new THREE.Mesh(new THREE.BoxGeometry(12.0, 3.0, 0.4), stoneWallMat);
      endWallB.position.set(-18.0, 1.5, 0);
      islandGroup.add(endWallB);

      // Lan can đá bảo vệ bờ ngoài Tầng 1 (trừ lối mở cho 2 đường dốc 30° và 150°)
      for (let deg = 6; deg < 174; deg += 6) {
        if (Math.abs(deg - 30) <= 7 || Math.abs(deg - 150) <= 7) continue;
        const rad = (deg * Math.PI) / 180;
        const rx = Math.cos(rad) * 23.9;
        const rz = Math.sin(rad) * 23.9;
        const balustrade = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.7, 8), stoneWallMat);
        balustrade.position.set(rx, 3.35, rz);
        balustrade.castShadow = true;
        islandGroup.add(balustrade);
      }

      // ----------------------------------------------------
      // HAI ĐƯỜNG DỐC BẬC THANG ĐÁ (Ramps tại 30° và 150°, R in [24, 30])
      // ----------------------------------------------------
      function buildStoneRamp(targetAngleDeg) {
        const rampGroup = new THREE.Group();
        const rad = (targetAngleDeg * Math.PI) / 180;

        const stepWidth = 5.4;
        const stepCount = 6;
        for (let s = 0; s < stepCount; s++) {
          const t = s / (stepCount - 1);
          const curR = 29.5 - t * 5.0;
          const curY = 0.25 + t * 2.5;

          const sx = Math.cos(rad) * curR;
          const sz = Math.sin(rad) * curR;

          const stepGeo = new THREE.BoxGeometry(stepWidth, 0.5, 1.2);
          const stepMesh = new THREE.Mesh(stepGeo, stoneWallMat);
          stepMesh.position.set(sx, curY, sz);
          stepMesh.rotation.y = -rad + Math.PI / 2;
          stepMesh.castShadow = true;
          stepMesh.receiveShadow = true;
          rampGroup.add(stepMesh);
        }

        // Lan can đá 2 bên hông bậc thang
        for (const side of [-1, 1]) {
          const offset = (side * stepWidth) / 2;
          const perpAngle = rad + Math.PI / 2;
          const startX = Math.cos(rad) * 30.0 + Math.cos(perpAngle) * offset;
          const startZ = Math.sin(rad) * 30.0 + Math.sin(perpAngle) * offset;
          const endX = Math.cos(rad) * 24.0 + Math.cos(perpAngle) * offset;
          const endZ = Math.sin(rad) * 24.0 + Math.sin(perpAngle) * offset;

          const midX = (startX + endX) / 2;
          const midZ = (startZ + endZ) / 2;
          const length = Math.hypot(endX - startX, endZ - startZ);

          const sideRail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, length), marbleRimMat);
          sideRail.position.set(midX, 1.85, midZ);
          sideRail.rotation.y = -rad + Math.PI / 2;
          sideRail.rotation.x = Math.atan2(3.0, 6.0);
          rampGroup.add(sideRail);
        }

        // Đèn đá hoa sen cổ kính ở chân lối vào bậc thang (R=30.5)
        for (const side of [-1, 1]) {
          const offset = (side * (stepWidth + 1.2)) / 2;
          const perpAngle = rad + Math.PI / 2;
          const lx = Math.cos(rad) * 30.5 + Math.cos(perpAngle) * offset;
          const lz = Math.sin(rad) * 30.5 + Math.sin(perpAngle) * offset;

          const lanternBase = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 0.6, 8), stoneWallMat);
          lanternBase.position.set(lx, 0.3, lz);
          rampGroup.add(lanternBase);

          const lanternHead = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 1), marbleRimMat);
          lanternHead.position.set(lx, 0.8, lz);
          rampGroup.add(lanternHead);

          const lanternLight = new THREE.PointLight(0xF2C14E, 1.4, 6);
          lanternLight.position.set(lx, 0.9, lz);
          rampGroup.add(lanternLight);
        }

        return rampGroup;
      }

      islandGroup.add(buildStoneRamp(30));
      islandGroup.add(buildStoneRamp(150));

      // ----------------------------------------------------
      // BỆ NHẢY TẦNG 1 (Jump Pad JP1 tại (0, 3, 13))
      // ----------------------------------------------------
      for (const pad of game.jump_pads) {
        const padMesh = createJumpPadVisual(pad, 90);
        islandGroup.add(padMesh);
      }

      // ----------------------------------------------------
      // TẦNG 2 (Đỉnh thiêng Y=6, R <= 8m)
      // ----------------------------------------------------
      const geo2 = new THREE.CylinderGeometry(8.0, 8.2, 6.0, 48);
      const m2 = new THREE.Mesh(geo2, jadeTerraceMat);
      m2.position.set(0, 3.0, 0);
      m2.receiveShadow = true;
      m2.castShadow = true;
      islandGroup.add(m2);

      const rimT2 = new THREE.Mesh(new THREE.RingGeometry(7.7, 8.1, 48), marbleRimMat);
      rimT2.rotation.x = -Math.PI / 2;
      rimT2.position.set(0, 6.03, 0);
      islandGroup.add(rimT2);

      // Lan can đá quanh Tầng 2 (chừa khoảng hở góc 60° đến 120° ở Z>0 để đón người chơi)
      for (let deg = 0; deg < 360; deg += 12) {
        if (deg >= 60 && deg <= 120) continue;
        const rad = (deg * Math.PI) / 180;
        const rx = Math.cos(rad) * 7.8;
        const rz = Math.sin(rad) * 7.8;
        const bal = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.75, 8), stoneWallMat);
        bal.position.set(rx, 6.38, rz);
        bal.castShadow = true;
        islandGroup.add(bal);
      }

      // ----------------------------------------------------
      // THÁP CHUÔNG CỔ (Grand Pagoda Bell Tower tại (0, 6, 0))
      // ----------------------------------------------------
      const pagodaGroup = new THREE.Group();
      pagodaGroup.position.set(0, 6.0, 0);

      const daisGeo = new THREE.CylinderGeometry(3.6, 4.0, 0.08, 8);
      const dais = new THREE.Mesh(daisGeo, stoneWallMat);
      dais.position.y = 0.04;
      dais.receiveShadow = true;
      pagodaGroup.add(dais);

      const pillarGeo = new THREE.CylinderGeometry(0.28, 0.32, 6.0, 12);
      const pillarOffsets = [
        [-2.0, -2.0], [2.0, -2.0],
        [-2.0, 2.0], [2.0, 2.0]
      ];
      for (const [px, pz] of pillarOffsets) {
        const pillar = new THREE.Mesh(pillarGeo, templeWoodMat);
        pillar.position.set(px, 3.2, pz);
        pillar.castShadow = true;
        pagodaGroup.add(pillar);
      }

      for (let i = 0; i < 4; i++) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.35, 0.35), templeWoodMat);
        beam.position.y = 5.8;
        beam.rotation.y = (i * Math.PI) / 2;
        if (i % 2 === 0) beam.position.z = i === 0 ? 2.0 : -2.0;
        else beam.position.x = i === 1 ? 2.0 : -2.0;
        pagodaGroup.add(beam);
      }

      const lowerRoof = new THREE.Mesh(new THREE.ConeGeometry(5.2, 1.4, 4), tileRoofMat);
      lowerRoof.position.y = 6.4;
      lowerRoof.rotation.y = Math.PI / 4;
      lowerRoof.castShadow = true;
      pagodaGroup.add(lowerRoof);

      const midTier = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.0, 2.4), templeWoodMat);
      midTier.position.y = 7.3;
      pagodaGroup.add(midTier);

      const upperRoof = new THREE.Mesh(new THREE.ConeGeometry(3.6, 1.2, 4), tileRoofMat);
      upperRoof.position.y = 8.3;
      upperRoof.rotation.y = Math.PI / 4;
      upperRoof.castShadow = true;
      pagodaGroup.add(upperRoof);

      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.2, 8), bellBronzeMat);
      spire.position.y = 9.4;
      pagodaGroup.add(spire);

      // ĐẠI HỒNG CHUNG
      const bellGroup = new THREE.Group();
      bellGroup.position.set(0, 3.8, 0);

      const bellBody = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.95, 1.6, 24), bellBronzeMat);
      bellBody.position.y = 0;
      bellBody.castShadow = true;
      bellGroup.add(bellBody);

      const bellDome = new THREE.Mesh(new THREE.SphereGeometry(0.66, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), bellBronzeMat);
      bellDome.position.y = 0.8;
      bellGroup.add(bellDome);

      const bellRim = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.08, 12, 32), bellBronzeMat);
      bellRim.rotation.x = Math.PI / 2;
      bellRim.position.y = -0.8;
      bellGroup.add(bellRim);

      const bellLight = new THREE.PointLight(0xFFD700, 2.5, 14);
      bellLight.position.y = 0.2;
      bellGroup.add(bellLight);

      pagodaGroup.add(bellGroup);
      islandGroup.add(pagodaGroup);
    }
  }

  function setupEntitiesVisual() {
    lanternsGroup.clear();
    lanternMeshes.clear();

    for (const l of game.lanterns) {
      const lGroup = new THREE.Group();
      lGroup.position.set(l.pos[0], l.pos[1], l.pos[2]);

      const pillarGeo = new THREE.CylinderGeometry(0.25, 0.3, 2.6, 12);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x6B4A2F });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.y = 1.3;
      pillar.castShadow = true;
      lGroup.add(pillar);

      const lampGeo = new THREE.OctahedronGeometry(0.7, 1);
      const lampMat = new THREE.MeshStandardMaterial({ color: 0x5B5F6E, roughness: 0.3 });
      const lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.position.y = 2.8;
      lamp.castShadow = true;
      lGroup.add(lamp);

      const lampLight = new THREE.PointLight(0xFFB347, 0, 18);
      lampLight.position.y = 2.8;
      lGroup.add(lampLight);

      const safeRingGeo = new THREE.RingGeometry(5.8, 6.0, 48);
      const safeRingMat = new THREE.MeshBasicMaterial({
        color: 0xFFB347,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide
      });
      const safeRing = new THREE.Mesh(safeRingGeo, safeRingMat);
      safeRing.rotation.x = -Math.PI / 2;
      safeRing.position.y = 0.05;
      lGroup.add(safeRing);

      lanternsGroup.add(lGroup);
      lanternMeshes.set(l.id, { group: lGroup, lamp, light: lampLight, safeRing });
    }

    // Charms Visuals
    charmsGroup.clear();
    charmMeshes.clear();
    for (const c of game.charms) {
      const cGeo = new THREE.BoxGeometry(0.6, 0.9, 0.1);
      const cMat = new THREE.MeshStandardMaterial({
        color: 0xC8102E,
        emissive: 0xF2C14E,
        emissiveIntensity: 0.8
      });
      const cMesh = new THREE.Mesh(cGeo, cMat);
      cMesh.position.set(c.pos[0], c.pos[1] + 0.6, c.pos[2]);
      charmsGroup.add(cMesh);
      charmMeshes.set(c.id, cMesh);
    }
  }

  function restartGame(night) {
    currentNight = night;
    game = new GameState({ seed: Math.floor(Math.random() * 10000), night: currentNight });
    applyNightAtmosphere(currentNight);
    buildIslandMeshes(currentNight);
    setupEntitiesVisual();

    // Update active tab UI
    document.querySelectorAll('.night-tab').forEach((tab, idx) => {
      tab.classList.toggle('active', idx + 1 === currentNight);
    });

    document.getElementById('modal-pause').style.display = 'none';
    document.getElementById('modal-gameover').style.display = 'none';
  }

  restartGame(1);

  // Default Keybindings
  const DEFAULT_KEYBINDS = {
    up: 'KeyW',
    down: 'KeyS',
    left: 'KeyA',
    right: 'KeyD',
    jump: 'Space',
    dash: 'ShiftLeft',
    interact: 'KeyE',
    pulse: 'KeyQ',
    pause: 'KeyP'
  };

  // Settings & Accessibility Persistence (localStorage)
  const savedSettings = JSON.parse(localStorage.getItem('lantern_settings') || JSON.stringify({
    volume: 80,
    sens: 5,
    cbMode: false,
    reduceMotion: false,
    largeText: false,
    keybinds: { ...DEFAULT_KEYBINDS }
  }));
  if (!savedSettings.keybinds) savedSettings.keybinds = { ...DEFAULT_KEYBINDS };

  if (savedSettings.largeText) {
    document.body.classList.add('large-text');
  }

  // Input Handling
  const keys = {};
  let keyInteract = false;
  let keyPulse = false;
  let keyJump = false;
  let keyDash = false;
  let keyPause = false;

  window.addEventListener('keydown', (e) => {
    // Khi đang nhập tên trong input, không nhận input phím điều khiển
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
      return;
    }

    // NGĂN CHẶN BẤM SPACE LÀM CLICK LẠI CÁC NÚT TAB/BUTTON ĐANG CÓ FOCUS (sửa lỗi Space làm reset màn/thời gian)
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }

    // Tự động bỏ focus khỏi bất kỳ button nào khi bắt đầu bấm phím chơi
    if (document.activeElement && document.activeElement.tagName === 'BUTTON') {
      document.activeElement.blur();
    }

    keys[e.code] = true;
    const kb = savedSettings.keybinds || DEFAULT_KEYBINDS;
    if (e.code === kb.interact || e.code === 'KeyE') keyInteract = true;
    if (e.code === kb.pulse || e.code === 'KeyQ' || e.code === 'KeyF') keyPulse = true;
    if (e.code === kb.jump || e.code === 'Space') keyJump = true;
    if (e.code === kb.dash || e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyK') keyDash = true;
    if (e.code === kb.pause || e.code === 'KeyP' || e.code === 'Escape') keyPause = true;
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    const kb = savedSettings.keybinds || DEFAULT_KEYBINDS;
    if (e.code === kb.interact || e.code === 'KeyE') keyInteract = false;
    if (e.code === kb.pulse || e.code === 'KeyQ' || e.code === 'KeyF') keyPulse = false;
    if (e.code === kb.jump || e.code === 'Space') keyJump = false;
    if (e.code === kb.dash || e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyK') keyDash = false;
    if (e.code === kb.pause || e.code === 'KeyP' || e.code === 'Escape') keyPause = false;
  });

  // Settings Modal Elements
  const modalSettings = document.getElementById('modal-settings');
  const inputVol = document.getElementById('input-volume');
  const inputSens = document.getElementById('input-sens');
  const valVol = document.getElementById('val-volume');
  const valSens = document.getElementById('val-sens');
  const inputCbMode = document.getElementById('input-cb-mode');
  const inputReduceMotion = document.getElementById('input-reduce-motion');
  const inputLargeText = document.getElementById('input-large-text');

  const keyUp = document.getElementById('key-up');
  const keyDown = document.getElementById('key-down');
  const keyLeft = document.getElementById('key-left');
  const keyRight = document.getElementById('key-right');
  const keyJumpInput = document.getElementById('key-jump');
  const keyDashInput = document.getElementById('key-dash');
  const keyInteractInput = document.getElementById('key-interact');
  const keyPulseInput = document.getElementById('key-pulse');
  const keyWarn = document.getElementById('keybinds-warn');

  function populateKeybindInputs() {
    const kb = savedSettings.keybinds;
    if (keyUp) keyUp.value = kb.up.replace('Key', '');
    if (keyDown) keyDown.value = kb.down.replace('Key', '');
    if (keyLeft) keyLeft.value = kb.left.replace('Key', '');
    if (keyRight) keyRight.value = kb.right.replace('Key', '');
    if (keyJumpInput) keyJumpInput.value = kb.jump === 'Space' ? 'Space' : kb.jump.replace('Key', '');
    if (keyDashInput) keyDashInput.value = kb.dash.includes('Shift') ? 'Shift' : kb.dash.replace('Key', '');
    if (keyInteractInput) keyInteractInput.value = kb.interact.replace('Key', '');
    if (keyPulseInput) keyPulseInput.value = kb.pulse.replace('Key', '');
  }

  if (inputVol && inputSens) {
    inputVol.value = savedSettings.volume;
    inputSens.value = savedSettings.sens;
    valVol.textContent = `${savedSettings.volume}%`;
    valSens.textContent = savedSettings.sens;
    if (inputCbMode) inputCbMode.checked = !!savedSettings.cbMode;
    if (inputReduceMotion) inputReduceMotion.checked = !!savedSettings.reduceMotion;
    if (inputLargeText) inputLargeText.checked = !!savedSettings.largeText;
    populateKeybindInputs();

    inputVol.addEventListener('input', () => { valVol.textContent = `${inputVol.value}%`; });
    inputSens.addEventListener('input', () => { valSens.textContent = inputSens.value; });
  }

  document.getElementById('btn-reset-keybinds')?.addEventListener('click', () => {
    savedSettings.keybinds = { ...DEFAULT_KEYBINDS };
    populateKeybindInputs();
    if (keyWarn) keyWarn.style.display = 'none';
  });

  document.getElementById('btn-open-settings').addEventListener('click', () => {
    modalSettings.style.display = 'flex';
  });

  document.getElementById('btn-save-settings').addEventListener('click', () => {
    // Check key collision
    const newKeys = [
      keyUp.value.toUpperCase(),
      keyDown.value.toUpperCase(),
      keyLeft.value.toUpperCase(),
      keyRight.value.toUpperCase(),
      keyJumpInput.value.toUpperCase(),
      keyDashInput.value.toUpperCase(),
      keyInteractInput.value.toUpperCase(),
      keyPulseInput.value.toUpperCase()
    ];
    const uniqueKeys = new Set(newKeys);
    if (uniqueKeys.size < newKeys.length) {
      if (keyWarn) keyWarn.style.display = 'block';
      return;
    }
    if (keyWarn) keyWarn.style.display = 'none';

    savedSettings.volume = Number(inputVol.value);
    savedSettings.sens = Number(inputSens.value);
    savedSettings.cbMode = inputCbMode ? inputCbMode.checked : false;
    savedSettings.reduceMotion = inputReduceMotion ? inputReduceMotion.checked : false;
    savedSettings.largeText = inputLargeText ? inputLargeText.checked : false;

    savedSettings.keybinds = {
      up: `Key${keyUp.value.toUpperCase()}`,
      down: `Key${keyDown.value.toUpperCase()}`,
      left: `Key${keyLeft.value.toUpperCase()}`,
      right: `Key${keyRight.value.toUpperCase()}`,
      jump: keyJumpInput.value === 'Space' ? 'Space' : `Key${keyJumpInput.value.toUpperCase()}`,
      dash: keyDashInput.value === 'Shift' ? 'ShiftLeft' : `Key${keyDashInput.value.toUpperCase()}`,
      interact: `Key${keyInteractInput.value.toUpperCase()}`,
      pulse: `Key${keyPulseInput.value.toUpperCase()}`,
      pause: 'KeyP'
    };

    if (savedSettings.largeText) {
      document.body.classList.add('large-text');
    } else {
      document.body.classList.remove('large-text');
    }

    localStorage.setItem('lantern_settings', JSON.stringify(savedSettings));
    modalSettings.style.display = 'none';
  });

  // Leaderboard Modal & Saving Logic
  const modalLeaderboard = document.getElementById('modal-leaderboard');
  const tbodyLeaderboard = document.getElementById('leaderboard-tbody');

  function renderLeaderboardTable() {
    const raw = localStorage.getItem('lantern_leaderboard');
    let entries = [];
    try {
      entries = raw ? JSON.parse(raw).entries || [] : [];
    } catch {
      entries = [];
    }
    if (entries.length === 0) {
      entries = [
        { name: 'Player_Pro', score: 950, nights_won: 3, achieved_at: '2026-11-20T10:00:00.000Z' },
        { name: 'May_Keeper', score: 620, nights_won: 2, achieved_at: '2026-11-20T11:30:00.000Z' },
        { name: 'Lantern_Ace', score: 480, nights_won: 1, achieved_at: '2026-11-20T14:15:00.000Z' }
      ];
    }
    tbodyLeaderboard.innerHTML = entries.map((e, idx) => `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
        <td style="padding: 6px 8px; color: var(--gold); font-weight: 700;">#${idx + 1}</td>
        <td style="padding: 6px 8px; font-weight: 600;">${e.name}</td>
        <td style="padding: 6px 8px; color: #64ffda;">${e.score}</td>
        <td style="padding: 6px 8px;">${e.nights_won}</td>
        <td style="padding: 6px 8px; font-size: 0.75rem; color: var(--text-muted);">${new Date(e.achieved_at).toLocaleDateString()}</td>
      </tr>
    `).join('');
  }

  document.getElementById('btn-open-leaderboard')?.addEventListener('click', () => {
    renderLeaderboardTable();
    modalLeaderboard.style.display = 'flex';
  });

  document.getElementById('btn-close-leaderboard')?.addEventListener('click', () => {
    modalLeaderboard.style.display = 'none';
  });

  // Save Score from Game Over screen
  document.getElementById('btn-save-score')?.addEventListener('click', () => {
    const nameInput = document.getElementById('input-player-name');
    const msgEl = document.getElementById('save-score-msg');
    const val = nameInput ? nameInput.value.trim() : '';

    if (!val || val.length < 3 || val.length > 12 || !/^[A-Za-z0-9_\u00C0-\u1EF9]+$/.test(val)) {
      msgEl.style.display = 'block';
      msgEl.style.color = 'var(--danger)';
      msgEl.textContent = 'Tên phải từ 3–12 ký tự [A-Za-z0-9_]!';
      return;
    }

    const raw = localStorage.getItem('lantern_leaderboard');
    let entries = [];
    try {
      entries = raw ? JSON.parse(raw).entries || [] : [];
    } catch {
      entries = [];
    }

    entries.push({
      name: val,
      score: game.score,
      nights_won: game.state === 'won' ? currentNight : (currentNight - 1),
      achieved_at: new Date().toISOString(),
      seed: game.seed
    });

    entries.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(a.achieved_at).getTime() - new Date(b.achieved_at).getTime();
    });
    if (entries.length > 10) entries = entries.slice(0, 10);

    localStorage.setItem('lantern_leaderboard', JSON.stringify({ entries }));
    msgEl.style.display = 'block';
    msgEl.style.color = '#64ffda';
    msgEl.textContent = '✓ Đã lưu kỷ lục thành công!';
    nameInput.disabled = true;
    document.getElementById('btn-save-score').disabled = true;
  });

  // Global click blur: Khi bấm bất kỳ nút nào, lập tức hủy focus để phím Space không kích hoạt lại nút
  document.addEventListener('click', (e) => {
    if (e.target && (e.target.tagName === 'BUTTON' || e.target.closest('button'))) {
      const btn = e.target.tagName === 'BUTTON' ? e.target : e.target.closest('button');
      btn.blur();
    }
  });

  // UI Button Events
  document.getElementById('tab-n1').addEventListener('click', (e) => { e.currentTarget.blur(); restartGame(1); });
  document.getElementById('tab-n2').addEventListener('click', (e) => { e.currentTarget.blur(); restartGame(2); });
  document.getElementById('tab-n3').addEventListener('click', (e) => { e.currentTarget.blur(); restartGame(3); });
  document.getElementById('btn-resume').addEventListener('click', (e) => {
    e.currentTarget.blur();
    game.step({ pause: true });
    document.getElementById('modal-pause').style.display = 'none';
  });
  document.getElementById('btn-restart-night').addEventListener('click', (e) => { e.currentTarget.blur(); restartGame(currentNight); });
  document.getElementById('btn-retry').addEventListener('click', (e) => { e.currentTarget.blur(); restartGame(currentNight); });
  document.getElementById('btn-next-night').addEventListener('click', (e) => {
    e.currentTarget.blur();
    if (currentNight < 3) restartGame(currentNight + 1);
  });

  // Main Loop
  let clock = new THREE.Clock();
  let tickAccumulator = 0;
  const TICK_INTERVAL = 1 / 60.0;
  let screenShakeTimer = 0;

  function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.1);
    const time = clock.getElapsedTime();

    tickAccumulator += delta;
    while (tickAccumulator >= TICK_INTERVAL) {
      tickAccumulator -= TICK_INTERVAL;

      let moveX = 0;
      let moveZ = 0;
      const kb = savedSettings.keybinds || DEFAULT_KEYBINDS;
      // W / Up tiến lên phía trước màn hình (giảm Z), S / Down lùi về phía người xem (tăng Z)
      if (keys[kb.up] || keys['KeyW'] || keys['ArrowUp']) moveZ -= 1;
      if (keys[kb.down] || keys['KeyS'] || keys['ArrowDown']) moveZ += 1;
      if (keys[kb.left] || keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
      if (keys[kb.right] || keys['KeyD'] || keys['ArrowRight']) moveX += 1;

      const input = {
        x: moveX,
        z: moveZ,
        cam_yaw_deg: 0,
        interact: keyInteract,
        pulse: keyPulse,
        jump: keyJump,
        dash: keyDash,
        pause: keyPause
      };

      const events = game.step(input);

      // Play Sound Effects
      for (const ev of events) {
        if (ev.name === 'mote_picked') sound.playPickup();
        if (ev.name === 'dash') sound.playDash();
        if (ev.name === 'pulse') {
          sound.playPulse();
          pulseVisualTimer = 0.4;
          pulseRing.position.set(game.player.pos[0], game.player.pos[1] + 0.1, game.player.pos[2]);
          pulseRingMat.opacity = 0.8;
        }
        if (ev.name === 'lantern_lit') sound.playLanternLit();
        if (ev.name === 'player_hit') {
          sound.playHit();
          if (!savedSettings.reduceMotion) {
            screenShakeTimer = 0.25;
          }
        }
      }
    }

    // Pulse animation
    if (pulseVisualTimer > 0) {
      pulseVisualTimer -= delta;
      const progress = 1 - (pulseVisualTimer / 0.4);
      const scale = 1 + progress * (game.tuning.pulse_radius * 2);
      pulseRing.scale.set(scale, scale, 1);
      pulseRingMat.opacity = Math.max(0, 0.8 * (1 - progress));
    }

    // Sync Player position & facing rotation
    mayGroup.position.set(game.player.pos[0], game.player.pos[1], game.player.pos[2]);
    if (Math.hypot(game.player.facing[0], game.player.facing[1]) > 0.05) {
      mayGroup.rotation.y = Math.atan2(game.player.facing[0], -game.player.facing[1]);
    }

    if (game.invuln_ticks > 0) {
      mayGroup.visible = Math.floor(time * 15) % 2 === 0;
    } else {
      mayGroup.visible = true;
    }

    // Camera follow with optional screen shake
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, game.player.pos[0], 0.1);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, game.player.pos[1] + 9.5, 0.1);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, game.player.pos[2] + 13.5, 0.1);

    if (screenShakeTimer > 0) {
      screenShakeTimer -= delta;
      camera.position.x += (Math.random() - 0.5) * 0.35;
      camera.position.y += (Math.random() - 0.5) * 0.35;
    }

    camera.lookAt(game.player.pos[0], game.player.pos[1] + 1.0, game.player.pos[2]);

    // Ambient Lighting progressive brightness per spec
    const litCount = game.lanterns.filter(l => l.lit).length;
    ambientLight.intensity = 0.15 + 0.55 * (litCount / game.lanterns.length);

    // Sync Motes
    motesGroup.clear();
    const moteGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const moteMat = new THREE.MeshStandardMaterial({
      color: 0xFFF6C2,
      emissive: 0xFFE58A,
      emissiveIntensity: 2.5
    });

    for (const m of game.motes) {
      if (m.active) {
        const mMesh = new THREE.Mesh(moteGeo, moteMat);
        const floatY = m.pos[1] + Math.sin(time * 3 + m.pos[0]) * 0.2;
        mMesh.position.set(m.pos[0], floatY, m.pos[2]);
        motesGroup.add(mMesh);
      }
    }

    // Sync Lanterns
    for (const l of game.lanterns) {
      const item = lanternMeshes.get(l.id);
      if (item) {
        if (l.lit) {
          // Check low fuel blinking (< 30)
          const isLowFuel = l.fuel < game.tuning.low_fuel_threshold;
          const blinkVisible = !isLowFuel || (Math.floor(time * 2) % 2 === 0);

          item.lamp.scale.set(1, 1, 1);
          item.lamp.material.color.setHex(blinkVisible ? 0xFFB347 : 0x5B5F6E);
          item.lamp.material.emissive = new THREE.Color(blinkVisible ? 0xFFE9B0 : 0x000000);
          item.lamp.material.emissiveIntensity = blinkVisible ? 3.0 : 0.5;
          item.light.intensity = blinkVisible ? 5.0 : 1.0;
          item.safeRing.material.opacity = isLowFuel ? 0 : (0.5 + Math.sin(time * 2) * 0.15);
        } else {
          // Extinguished lantern: in colorblind mode, flattened by 20% (scale.y = 0.8)
          const ratio = l.deposited / (l.ever_lit ? game.tuning.relight_cost : game.tuning.lantern_cost);
          item.lamp.scale.set(1, savedSettings.cbMode ? 0.8 : 1.0, 1);
          item.lamp.material.color.setHex(0x5B5F6E);
          item.lamp.material.emissive = new THREE.Color(0xFFB347);
          item.lamp.material.emissiveIntensity = ratio * 1.5;
          item.light.intensity = ratio * 1.5;
          item.safeRing.material.opacity = 0;
        }
      }
    }

    // Sync Shades with Demonic Eyes & Visual Cues
    shadesGroup.clear();
    for (const s of game.shades) {
      const sGroup = new THREE.Group();
      sGroup.position.set(s.pos[0], s.pos[1] + 0.8 + Math.sin(time * 2.5 + s.pos[0]) * 0.12, s.pos[2]);

      // Core Body (Dark Demon Orb)
      const coreGeo = new THREE.DodecahedronGeometry(0.62, 1);
      const coreMat = new THREE.MeshStandardMaterial({
        color: s.state === 'stunned' ? 0x2A2A38 : (s.state === 'drain' ? 0x330033 : 0x0E071A),
        roughness: 0.8,
        metalness: 0.3,
        emissive: new THREE.Color(s.state === 'chase' ? 0x660011 : (s.state === 'drain' ? 0x4A0055 : 0x240A44)),
        emissiveIntensity: s.state === 'chase' ? 1.5 : 0.8
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.rotation.y = time * 1.5;
      sGroup.add(coreMesh);

      // Glowing Demonic Eyes (2 glowing eyes in front)
      const eyeGeo = new THREE.SphereGeometry(0.09, 8, 8);
      let eyeColor = 0x9D4EDD; // Purple (wander)
      let eyeIntensity = 1.5;
      if (s.state === 'chase') {
        eyeColor = 0xFF0033; // Blazing Red (chase)
        eyeIntensity = 4.0;
      } else if (s.state === 'drain') {
        eyeColor = 0xFF1493; // Deep Pink (drain)
        eyeIntensity = 3.5;
      } else if (s.state === 'stunned') {
        eyeColor = 0x444444; // Dead Grey
        eyeIntensity = 0.2;
      }

      const eyeMat = new THREE.MeshStandardMaterial({
        color: eyeColor,
        emissive: new THREE.Color(eyeColor),
        emissiveIntensity: eyeIntensity,
        roughness: 0.2
      });

      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.2, 0.15, 0.52);
      sGroup.add(leftEye);

      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(0.2, 0.15, 0.52);
      sGroup.add(rightEye);

      // Orient eyes towards moving direction or player
      const dxToP = game.player.pos[0] - s.pos[0];
      const dzToP = game.player.pos[2] - s.pos[2];
      sGroup.rotation.y = Math.atan2(dxToP, dzToP);

      // Special Indicators on Shade head
      if (s.state === 'chase') {
        // Red alert chevron above head
        const alertGeo = new THREE.ConeGeometry(0.16, 0.45, 4);
        const alertMat = new THREE.MeshBasicMaterial({ color: 0xFF1744 });
        const alertMesh = new THREE.Mesh(alertGeo, alertMat);
        alertMesh.rotation.x = Math.PI;
        alertMesh.position.set(0, 1.1 + Math.sin(time * 6) * 0.08, 0);
        sGroup.add(alertMesh);
      } else if (s.state === 'stunned') {
        // 3 spinning yellow stars
        const starGeo = new THREE.OctahedronGeometry(0.08);
        const starMat = new THREE.MeshBasicMaterial({ color: 0xFFEA00 });
        for (let k = 0; k < 3; k++) {
          const starMesh = new THREE.Mesh(starGeo, starMat);
          const starAngle = time * 4 + (k * (Math.PI * 2 / 3));
          starMesh.position.set(Math.cos(starAngle) * 0.5, 0.95, Math.sin(starAngle) * 0.5);
          sGroup.add(starMesh);
        }
      } else if (s.state === 'drain' && s.target_lantern_id) {
        // Purple energy beam to the target lantern
        const targetL = game.lanterns.find(l => l.id === s.target_lantern_id);
        if (targetL) {
          const tdx = targetL.pos[0] - s.pos[0];
          const tdy = (targetL.pos[1] + 1.2) - (s.pos[1] + 0.8);
          const tdz = targetL.pos[2] - s.pos[2];
          const beamLen = Math.sqrt(tdx * tdx + tdy * tdy + tdz * tdz);
          const beamGeo = new THREE.CylinderGeometry(0.04, 0.04, beamLen, 6);
          const beamMat = new THREE.MeshBasicMaterial({
            color: 0xEA00D9,
            transparent: true,
            opacity: 0.7 + Math.sin(time * 10) * 0.25
          });
          const beam = new THREE.Mesh(beamGeo, beamMat);
          beam.position.set(tdx / 2, tdy / 2, tdz / 2);
          beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(tdx, tdy, tdz).normalize());
          sGroup.add(beam);
        }
      }

      shadesGroup.add(sGroup);
    }

    // Sync Drifters (Mini Tornado with glowing stolen motes)
    driftersGroup.clear();
    for (const d of game.drifters) {
      if (d.state !== 'removed') {
        const dGroup = new THREE.Group();
        dGroup.position.set(d.pos[0], d.pos[1] + Math.sin(time * 4) * 0.35, d.pos[2]);

        const spinSpeed = d.state === 'chase' ? 8.0 : 3.0;
        const ringMat = new THREE.MeshStandardMaterial({
          color: d.state === 'chase' ? 0x00E5FF : 0x80D8FF,
          emissive: new THREE.Color(d.state === 'chase' ? 0x00B0FF : 0x0091EA),
          emissiveIntensity: d.state === 'chase' ? 2.0 : 0.8,
          transparent: true,
          opacity: 0.85
        });

        for (let r = 0; r < 3; r++) {
          const ringRadius = 0.25 + r * 0.15;
          const torusGeo = new THREE.TorusGeometry(ringRadius, 0.04, 6, 16);
          const ringMesh = new THREE.Mesh(torusGeo, ringMat);
          ringMesh.position.y = -0.3 + r * 0.35;
          ringMesh.rotation.x = Math.PI / 2 + Math.sin(time * 2 + r) * 0.2;
          ringMesh.rotation.z = time * spinSpeed * (r % 2 === 0 ? 1 : -1);
          dGroup.add(ringMesh);
        }

        // Stolen Motes glowing inside belly
        if (d.stolen > 0) {
          const moteCoreGeo = new THREE.SphereGeometry(0.22, 12, 12);
          const moteCoreMat = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            emissive: 0xFFE58A,
            emissiveIntensity: 3.0 + Math.sin(time * 6) * 1.5,
            roughness: 0.1
          });
          const moteCore = new THREE.Mesh(moteCoreGeo, moteCoreMat);
          moteCore.position.y = 0.1;
          dGroup.add(moteCore);
        }

        driftersGroup.add(dGroup);
      }
    }

    // Update Wind Particles Simulation
    if (windParticles) {
      const isWindActive = game.night === 3 && game.wind && game.wind.active;
      const isWindWarn = game.night === 3 && game.wind && game.wind.warn_ticks > 0;
      const posArray = windGeo.attributes.position.array;
      const dirDeg = (game.wind && game.wind.dir_deg !== undefined) ? game.wind.dir_deg : 45;
      const rad = (dirDeg * Math.PI) / 180;
      const cosW = Math.cos(rad);
      const sinW = Math.sin(rad);

      let moveSpeed = 4.0;
      if (isWindActive) {
        moveSpeed = 38.0;
        windMat.opacity = 0.85;
        windMat.size = 0.55;
        windMat.color.setHex(0xFFE082); // Blazing gold storm
      } else if (isWindWarn) {
        moveSpeed = 16.0;
        windMat.opacity = 0.5;
        windMat.size = 0.42;
        windMat.color.setHex(0xB2EBF2); // Cyan pre-warning
      } else {
        moveSpeed = game.night === 3 ? 5.0 : 2.5;
        windMat.opacity = game.night === 3 ? 0.25 : 0.12;
        windMat.size = 0.28;
        windMat.color.setHex(0xA7FFEB);
      }

      for (let i = 0; i < windCount; i++) {
        const mult = windData[i].speedMult;
        posArray[i * 3] += cosW * moveSpeed * mult * 0.016;
        posArray[i * 3 + 2] += sinW * moveSpeed * mult * 0.016;
        posArray[i * 3 + 1] = windData[i].yBase + Math.sin(time * 3 + i) * 0.5;

        if (posArray[i * 3] > 40) posArray[i * 3] -= 80;
        if (posArray[i * 3] < -40) posArray[i * 3] += 80;
        if (posArray[i * 3 + 2] > 40) posArray[i * 3 + 2] -= 80;
        if (posArray[i * 3 + 2] < -40) posArray[i * 3 + 2] += 80;
      }
      windGeo.attributes.position.needsUpdate = true;
    }

    // Sync Charms
    for (const c of game.charms) {
      const mesh = charmMeshes.get(c.id);
      if (mesh) {
        mesh.visible = c.available;
        mesh.rotation.y = time * 2;
      }
    }

    renderer.render(scene, camera);
    updateHUD(game);
  }

  function updateHUD(game) {
    // Flames
    const flamesEl = document.getElementById('hud-flames');
    if (flamesEl) {
      flamesEl.innerHTML = '🔥'.repeat(Math.max(0, game.player.flames)) || '<span style="color:var(--danger)">Hết lửa</span>';
    }

    // Timer
    const timeLeft = Math.floor(game.getTimeLeft());
    const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const secs = String(timeLeft % 60).padStart(2, '0');
    const timerEl = document.getElementById('hud-timer');
    if (timerEl) {
      timerEl.textContent = `${mins}:${secs}`;
      timerEl.classList.toggle('urgent', timeLeft <= 30);
    }

    // Stats
    const litCount = game.lanterns.filter(l => l.lit).length;
    document.getElementById('stat-lanterns').textContent = `${litCount} / ${game.lanterns.length}`;
    document.getElementById('stat-score').textContent = game.score;

    // 10-slot Motes Basket
    const slots = document.querySelectorAll('.mote-slot');
    slots.forEach((slot, idx) => {
      slot.classList.toggle('filled', idx < game.player.carried);
    });

    // Cooldowns
    const dashOverlay = document.getElementById('cd-dash');
    const dashBadge = document.getElementById('badge-dash');
    if (game.dash_cd_ticks > 0) {
      const pct = (game.dash_cd_ticks / (game.tuning.dash_cooldown_s * 60)) * 100;
      dashOverlay.style.height = `${pct}%`;
      dashBadge.classList.remove('ready');
    } else {
      dashOverlay.style.height = '0%';
      dashBadge.classList.add('ready');
    }

    const pulseOverlay = document.getElementById('cd-pulse');
    const pulseBadge = document.getElementById('badge-pulse');
    if (game.pulse_cd_ticks > 0 || game.player.carried < game.tuning.pulse_cost) {
      const pct = (game.pulse_cd_ticks / (game.tuning.pulse_cooldown_s * 60)) * 100;
      pulseOverlay.style.height = `${Math.max(pct, game.player.carried < 3 ? 100 : 0)}%`;
      pulseBadge.classList.remove('ready');
    } else {
      pulseOverlay.style.height = '0%';
      pulseBadge.classList.add('ready');
    }

    // Interaction prompt
    const promptEl = document.getElementById('prompt-interact');
    let nearLantern = null;
    for (const l of game.lanterns) {
      const canReceive = !l.lit || (l.lit && l.fuel < 100);
      if (canReceive) {
        const dx = l.pos[0] - game.player.pos[0];
        const dz = l.pos[2] - game.player.pos[2];
        if (Math.hypot(dx, dz) <= game.tuning.interact_radius) {
          nearLantern = l;
          break;
        }
      }
    }
    if (nearLantern && promptEl) {
      promptEl.style.display = 'block';
      if (!nearLantern.lit) {
        const cost = nearLantern.ever_lit ? game.tuning.relight_cost : game.tuning.lantern_cost;
        promptEl.textContent = `E — ${nearLantern.ever_lit ? 'Thắp lại' : 'Thắp đèn'} (${nearLantern.deposited}/${cost})`;
      } else {
        promptEl.textContent = `E — Châm dầu (${Math.round(nearLantern.fuel)}/100)`;
      }
    } else if (promptEl) {
      promptEl.style.display = 'none';
    }

    // Directional Arrow pointing to nearest unlit lantern
    const arrowEl = document.getElementById('hud-arrow');
    const arrowIcon = document.getElementById('arrow-icon');
    const arrowText = document.getElementById('arrow-text');
    let nearestUnlit = null;
    let minUnlitDist = Infinity;

    for (const l of game.lanterns) {
      if (!l.lit) {
        const dx = l.pos[0] - game.player.pos[0];
        const dz = l.pos[2] - game.player.pos[2];
        const dist = Math.hypot(dx, dz);
        if (dist < minUnlitDist) {
          minUnlitDist = dist;
          nearestUnlit = l;
        }
      }
    }

    if (nearestUnlit && arrowEl && arrowIcon) {
      arrowEl.style.display = 'flex';
      arrowText.textContent = `${nearestUnlit.id} (${Math.round(minUnlitDist)}m)`;
      const dx = nearestUnlit.pos[0] - game.player.pos[0];
      const dz = nearestUnlit.pos[2] - game.player.pos[2];
      // Angle relative to -Z (camera forward)
      const angleRad = Math.atan2(dx, -dz);
      const angleDeg = (angleRad * 180) / Math.PI;
      arrowIcon.style.transform = `rotate(${angleDeg}deg)`;
    } else if (arrowEl) {
      arrowEl.style.display = 'none';
    }

    // Subtitles & Visual Indicator Alerts
    const subtitleEl = document.getElementById('hud-subtitle');
    if (subtitleEl) {
      if (timeLeft <= 10 && timeLeft > 0) {
        subtitleEl.textContent = '⏳ 10 GIÂY CUỐI CÙNG TRƯỚC BÌNH MINH!';
        subtitleEl.classList.add('visible');
      } else if (game.wind && game.wind.warn_ticks > 0) {
        subtitleEl.textContent = '⚠️ Cơn gió mạnh sắp tràn qua đảo!';
        subtitleEl.classList.add('visible');
      } else {
        const hasLowFuelLantern = game.lanterns.some(l => l.lit && l.fuel < game.tuning.low_fuel_threshold);
        if (hasLowFuelLantern) {
          subtitleEl.textContent = '🏮 Lồng đèn sắp cạn dầu (<30%)!';
          subtitleEl.classList.add('visible');
        } else {
          subtitleEl.classList.remove('visible');
        }
      }
    }

    // 1. Wind Widget Update (Night 3) & Audio Cues
    const windWidget = document.getElementById('hud-wind-widget');
    const windIcon = document.getElementById('wind-icon');
    const windStatus = document.getElementById('wind-status');
    const windTimer = document.getElementById('wind-timer');
    const windArrow = document.getElementById('wind-compass-arrow');
    const windDeg = document.getElementById('wind-compass-deg');

    if (windWidget) {
      if (game.night !== 3) {
        windWidget.style.display = 'none';
      } else {
        windWidget.style.display = 'flex';
        const windPeriod = (game.tuning.wind_interval_s || 30) * 60;
        const windCycle = game.sim_ticks % windPeriod;
        const ticksUntilWarn = Math.max(0, (windPeriod - 120) - windCycle);

        if (game.wind && game.wind.active) {
          if (!prevWindActive) {
            sound.playWindGust();
          }
          windWidget.className = 'active';
          if (windIcon) windIcon.textContent = '💨';
          if (windStatus) {
            windStatus.textContent = 'GIÓ GIẬT CỰC MẠNH!';
            windStatus.style.color = '#FCA5A5';
          }
          if (windTimer) {
            const secLeft = (game.wind.timer_ticks / 60).toFixed(1);
            windTimer.textContent = `Còn: ${secLeft}s · Đẩy 2.0m/s`;
          }
          const deg = game.wind.dir_deg || 0;
          if (windArrow) windArrow.style.transform = `rotate(${deg}deg)`;
          if (windDeg) windDeg.textContent = `${deg}°`;
        } else if (game.wind && game.wind.warn_ticks > 0) {
          if (!prevWindWarn) {
            sound.playWindWarning();
          }
          windWidget.className = 'warn';
          if (windIcon) windIcon.textContent = '⚠️';
          if (windStatus) {
            windStatus.textContent = 'CẢNH BÁO GIÓ MẠNH!';
            windStatus.style.color = '#FDE047';
          }
          if (windTimer) {
            const secLeft = (game.wind.warn_ticks / 60).toFixed(1);
            windTimer.textContent = `Gió giật sau: ${secLeft}s`;
          }
          const deg = game.wind.dir_deg || 0;
          if (windArrow) windArrow.style.transform = `rotate(${deg}deg)`;
          if (windDeg) windDeg.textContent = `Sắp thổi`;
        } else {
          windWidget.className = '';
          if (windIcon) windIcon.textContent = '🍃';
          if (windStatus) {
            windStatus.textContent = 'GIÓ YÊN LẶNG';
            windStatus.style.color = '#64FFDA';
          }
          if (windTimer) {
            const secLeft = Math.ceil(ticksUntilWarn / 60);
            windTimer.textContent = `Cơn gió kế: ${secLeft}s`;
          }
          if (windArrow) windArrow.style.transform = 'rotate(0deg)';
          if (windDeg) windDeg.textContent = 'Yên';
        }

        prevWindActive = !!(game.wind && game.wind.active);
        prevWindWarn = !!(game.wind && game.wind.warn_ticks > 0);
      }
    }

    // 2. Edge Indicator / Monster Danger Radar
    const shadeArrowEl = document.getElementById('shade-arrow');
    const shadeIconEl = document.getElementById('shade-icon');
    const shadeTitleEl = document.getElementById('shade-title');
    const shadeDistEl = document.getElementById('shade-distance');
    const shadeDirEl = document.getElementById('shade-dir');

    let nearestMonster = null;
    let minMonsterDist = Infinity;
    let monsterType = 'shade';

    const currentAggroShades = new Set();
    for (const s of game.shades) {
      const dx = s.pos[0] - game.player.pos[0];
      const dz = s.pos[2] - game.player.pos[2];
      const dist = Math.hypot(dx, dz);

      if (s.state === 'chase') {
        currentAggroShades.add(s.id);
        if (!prevAggroShades.has(s.id) && dist <= 12.0) {
          sound.playMonsterAlert();
        }
      }

      if (dist < minMonsterDist) {
        minMonsterDist = dist;
        nearestMonster = s;
        monsterType = 'shade';
      }
    }
    prevAggroShades = currentAggroShades;

    for (const d of game.drifters) {
      if (d.state !== 'removed') {
        const dx = d.pos[0] - game.player.pos[0];
        const dz = d.pos[2] - game.player.pos[2];
        const dist = Math.hypot(dx, dz);

        if (d.state === 'chase' && !prevChasingDrifter && dist <= 14.0) {
          sound.playMonsterAlert();
        }

        const priorityDist = (d.state === 'chase') ? dist * 0.7 : dist;
        if (priorityDist < minMonsterDist) {
          minMonsterDist = dist;
          nearestMonster = d;
          monsterType = 'drifter';
        }
      }
    }
    prevChasingDrifter = game.drifters.some(d => d.state === 'chase');

    if (nearestMonster && minMonsterDist <= 16.0 && shadeArrowEl) {
      shadeArrowEl.classList.add('visible');
      shadeArrowEl.classList.remove('danger', 'drain', 'stunned');

      const dx = nearestMonster.pos[0] - game.player.pos[0];
      const dz = nearestMonster.pos[2] - game.player.pos[2];
      const angleRad = Math.atan2(dx, -dz);
      const angleDeg = (angleRad * 180) / Math.PI;

      if (shadeDirEl) {
        shadeDirEl.style.transform = `rotate(${angleDeg}deg)`;
        shadeDirEl.textContent = '⬆️';
      }

      const distM = minMonsterDist.toFixed(1);

      if (monsterType === 'shade') {
        if (nearestMonster.state === 'chase') {
          shadeArrowEl.classList.add('danger');
          if (shadeIconEl) shadeIconEl.textContent = '🚨';
          if (shadeTitleEl) shadeTitleEl.textContent = 'BÓNG MỰC ĐANG ĐUỔI THEO!';
          if (shadeDistEl) shadeDistEl.textContent = `Cách: ${distM}m · Hãy chạy vào vùng an toàn hoặc ấn Q!`;
        } else if (nearestMonster.state === 'drain') {
          shadeArrowEl.classList.add('drain');
          if (shadeIconEl) shadeIconEl.textContent = '🏮';
          if (shadeTitleEl) shadeTitleEl.textContent = `BÓNG MỰC ĐANG HÚT ĐÈN ${nearestMonster.target_lantern_id || ''}!`;
          if (shadeDistEl) shadeDistEl.textContent = `Cách: ${distM}m · Đến gần dùng Q Tỏa Sáng giải cứu!`;
        } else if (nearestMonster.state === 'stunned') {
          shadeArrowEl.classList.add('stunned');
          if (shadeIconEl) shadeIconEl.textContent = '💫';
          if (shadeTitleEl) shadeTitleEl.textContent = 'BÓNG MỰC BỊ CHOÁNG';
          if (shadeDistEl) shadeDistEl.textContent = `Cách: ${distM}m · Đang bất động!`;
        } else {
          if (shadeIconEl) shadeIconEl.textContent = '👀';
          if (shadeTitleEl) shadeTitleEl.textContent = 'BÓNG MỰC ĐANG RÌNH RẬP';
          if (shadeDistEl) shadeDistEl.textContent = `Cách: ${distM}m · Giữ khoảng cách >10m`;
        }
      } else {
        if (nearestMonster.state === 'chase') {
          shadeArrowEl.classList.add('danger');
          if (shadeIconEl) shadeIconEl.textContent = '🌪️';
          if (shadeTitleEl) shadeTitleEl.textContent = 'GIÓ LẠC ĐANG LAO TỚI CƯỚP ĐOM ĐÓM!';
          if (shadeDistEl) shadeDistEl.textContent = `Cách: ${distM}m · Dùng Q Tỏa Sáng để đẩy lùi!`;
        } else if (nearestMonster.stolen > 0) {
          shadeArrowEl.classList.add('drain');
          if (shadeIconEl) shadeIconEl.textContent = '✨';
          if (shadeTitleEl) shadeTitleEl.textContent = `GIÓ LẠC GIỮ ${nearestMonster.stolen} ĐOM ĐÓM!`;
          if (shadeDistEl) shadeDistEl.textContent = `Cách: ${distM}m · Dùng Q Tỏa Sáng để lấy lại!`;
        } else {
          if (shadeIconEl) shadeIconEl.textContent = '🌪️';
          if (shadeTitleEl) shadeTitleEl.textContent = 'GIÓ LẠC ĐANG BAY LƠ LỬNG';
          if (shadeDistEl) shadeDistEl.textContent = `Cách: ${distM}m · Mang ≥5 đom đóm sẽ bị chú ý`;
        }
      }
    } else if (shadeArrowEl) {
      shadeArrowEl.classList.remove('visible');
    }

    // Pause Modal
    const pauseModal = document.getElementById('modal-pause');
    if (game.state === 'paused' && pauseModal.style.display !== 'flex') {
      pauseModal.style.display = 'flex';
    } else if (game.state !== 'paused' && pauseModal.style.display === 'flex') {
      pauseModal.style.display = 'none';
    }

    // Game Over Modal
    const goModal = document.getElementById('modal-gameover');
    if (game.state === 'won' || game.state === 'lost') {
      goModal.style.display = 'flex';
      const title = document.getElementById('gameover-title');
      const desc = document.getElementById('gameover-desc');
      const nextBtn = document.getElementById('btn-next-night');
      document.getElementById('gameover-score').textContent = game.score;

      if (game.state === 'won') {
        title.textContent = '🎉 CHIẾN THẮNG!';
        title.style.color = '#F2C14E';
        desc.textContent = currentNight === 3 ? 'BÌNH MINH ĐÃ RẠNG! Bạn đã hoàn thành xuất sắc toàn bộ 3 Đêm trên Đảo Đèn Lồng!' : `Bạn đã thắp sáng toàn bộ lồng đèn của Đêm ${currentNight}!`;
        nextBtn.style.display = currentNight < 3 ? 'inline-block' : 'none';
      } else {
        title.textContent = '💀 THẤT BẠI';
        title.style.color = '#FF5A5F';
        desc.textContent = game.lost_reason === 'dawn' ? 'Bình minh đã đến trước khi bạn kịp thắp sáng các lồng đèn!' : 'Bạn đã đánh mất toàn bộ ngọn lửa sinh mệnh!';
        nextBtn.style.display = 'none';
      }
    }
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
