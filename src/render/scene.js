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

  function buildIslandMeshes(night) {
    islandGroup.clear();
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x2F5D50, roughness: 0.8 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x6B4A2F, roughness: 0.7 });

    if (night === 1) {
      // Đêm 1: Đảo Bến R=40m
      const geo = new THREE.CylinderGeometry(40, 42, 4, 64);
      const m = new THREE.Mesh(geo, grassMat);
      m.position.y = -2;
      m.receiveShadow = true;
      islandGroup.add(m);
    } else if (night === 2) {
      // Đêm 2: Hai đảo R=28m tại (0,0) và (70,0), cầu tre ở x in [26,44], z in [-2,2]
      const geoA = new THREE.CylinderGeometry(28, 30, 4, 48);
      const mA = new THREE.Mesh(geoA, grassMat);
      mA.position.set(0, -2, 0);
      mA.receiveShadow = true;
      islandGroup.add(mA);

      const geoB = new THREE.CylinderGeometry(28, 30, 4, 48);
      const mB = new THREE.Mesh(geoB, grassMat);
      mB.position.set(70, -2, 0);
      mB.receiveShadow = true;
      islandGroup.add(mB);

      // Bamboo bridge
      const bridgeGeo = new THREE.BoxGeometry(20, 0.4, 4.4);
      const bridge = new THREE.Mesh(bridgeGeo, woodMat);
      bridge.position.set(35, -0.2, 0);
      bridge.receiveShadow = true;
      islandGroup.add(bridge);

      // Jump pads visual
      for (const pad of game.jump_pads) {
        const padGeo = new THREE.CylinderGeometry(1.0, 1.1, 0.2, 24);
        const padMat = new THREE.MeshStandardMaterial({
          color: 0xF2C14E,
          emissive: 0xFFB347,
          emissiveIntensity: 1.5
        });
        const pMesh = new THREE.Mesh(padGeo, padMat);
        pMesh.position.set(pad.pos[0], 0.1, pad.pos[2]);
        islandGroup.add(pMesh);
      }
    } else if (night === 3) {
      // Đêm 3: Đảo Chuông 3 tầng
      // Tier 0: R=45 Y=0
      const geo0 = new THREE.CylinderGeometry(45, 47, 4, 64);
      const m0 = new THREE.Mesh(geo0, grassMat);
      m0.position.y = -2;
      m0.receiveShadow = true;
      islandGroup.add(m0);

      // Tier 1: R=24 ring at z > 0 Y=3
      const geo1 = new THREE.CylinderGeometry(24, 24, 3, 32, 1, false, 0, Math.PI);
      const m1 = new THREE.Mesh(geo1, grassMat);
      m1.position.set(0, 1.5, 0);
      m1.receiveShadow = true;
      islandGroup.add(m1);

      // Tier 2: disc R=8 at Y=6
      const geo2 = new THREE.CylinderGeometry(8, 8, 3, 32);
      const m2 = new THREE.Mesh(geo2, grassMat);
      m2.position.set(0, 4.5, 0);
      m2.receiveShadow = true;
      islandGroup.add(m2);

      // Bell Tower at center of Tier 2
      const towerGeo = new THREE.CylinderGeometry(2, 2.2, 8, 16);
      const tower = new THREE.Mesh(towerGeo, woodMat);
      tower.position.set(0, 10, 0);
      tower.castShadow = true;
      islandGroup.add(tower);
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

  // Input Handling
  const keys = {};
  let keyInteract = false;
  let keyPulse = false;
  let keyJump = false;
  let keyDash = false;
  let keyPause = false;

  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'KeyE') keyInteract = true;
    if (e.code === 'KeyQ' || e.code === 'KeyF') keyPulse = true;
    if (e.code === 'Space') keyJump = true;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyK') keyDash = true;
    if (e.code === 'KeyP' || e.code === 'Escape') keyPause = true;
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    if (e.code === 'KeyE') keyInteract = false;
    if (e.code === 'KeyQ' || e.code === 'KeyF') keyPulse = false;
    if (e.code === 'Space') keyJump = false;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyK') keyDash = false;
    if (e.code === 'KeyP' || e.code === 'Escape') keyPause = false;
  });

  // UI Button Events
  document.getElementById('tab-n1').addEventListener('click', () => restartGame(1));
  document.getElementById('tab-n2').addEventListener('click', () => restartGame(2));
  document.getElementById('tab-n3').addEventListener('click', () => restartGame(3));
  document.getElementById('btn-resume').addEventListener('click', () => {
    game.step({ pause: true });
    document.getElementById('modal-pause').style.display = 'none';
  });
  document.getElementById('btn-restart-night').addEventListener('click', () => restartGame(currentNight));
  document.getElementById('btn-retry').addEventListener('click', () => restartGame(currentNight));
  document.getElementById('btn-next-night').addEventListener('click', () => {
    if (currentNight < 3) restartGame(currentNight + 1);
  });

  // Main Loop
  let clock = new THREE.Clock();
  let tickAccumulator = 0;
  const TICK_INTERVAL = 1 / 60.0;

  function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.1);
    const time = clock.getElapsedTime();

    tickAccumulator += delta;
    while (tickAccumulator >= TICK_INTERVAL) {
      tickAccumulator -= TICK_INTERVAL;

      let moveX = 0;
      let moveZ = 0;
      if (keys['KeyW'] || keys['ArrowUp']) moveZ += 1;
      if (keys['KeyS'] || keys['ArrowDown']) moveZ -= 1;
      if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
      if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;

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
        if (ev.name === 'player_hit') sound.playHit();
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

    // Sync Player
    mayGroup.position.set(game.player.pos[0], game.player.pos[1], game.player.pos[2]);
    if (game.invuln_ticks > 0) {
      mayGroup.visible = Math.floor(time * 15) % 2 === 0;
    } else {
      mayGroup.visible = true;
    }

    // Camera follow
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, game.player.pos[0], 0.1);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, game.player.pos[1] + 9.5, 0.1);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, game.player.pos[2] + 13.5, 0.1);
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
          item.lamp.material.color.setHex(0xFFB347);
          item.lamp.material.emissive = new THREE.Color(0xFFE9B0);
          item.lamp.material.emissiveIntensity = 3.0;
          item.light.intensity = 5.0;
          item.safeRing.material.opacity = 0.5 + Math.sin(time * 2) * 0.15;
        } else {
          const ratio = l.deposited / game.tuning.lantern_cost;
          item.lamp.material.color.setHex(0x5B5F6E);
          item.lamp.material.emissive = new THREE.Color(0xFFB347);
          item.lamp.material.emissiveIntensity = ratio * 1.5;
          item.light.intensity = ratio * 1.5;
          item.safeRing.material.opacity = 0;
        }
      }
    }

    // Sync Shades
    shadesGroup.clear();
    const shadeGeo = new THREE.DodecahedronGeometry(0.65, 1);
    const shadeMat = new THREE.MeshStandardMaterial({ color: 0x120A1A, roughness: 0.9 });
    for (const s of game.shades) {
      const sMesh = new THREE.Mesh(shadeGeo, shadeMat);
      sMesh.position.set(s.pos[0], s.pos[1] + 0.8 + Math.sin(time * 2 + s.pos[0]) * 0.15, s.pos[2]);
      if (s.state === 'stunned') sMesh.material.color.setHex(0x3A3450);
      shadesGroup.add(sMesh);
    }

    // Sync Drifters
    driftersGroup.clear();
    const drifterGeo = new THREE.CylinderGeometry(0.1, 0.4, 1.6, 8);
    const drifterMat = new THREE.MeshStandardMaterial({
      color: 0x8FA3B8,
      transparent: true,
      opacity: 0.85
    });
    for (const d of game.drifters) {
      if (d.state !== 'removed') {
        const dMesh = new THREE.Mesh(drifterGeo, drifterMat);
        dMesh.rotation.z = Math.PI / 4;
        dMesh.position.set(d.pos[0], d.pos[1] + Math.sin(time * 4) * 0.3, d.pos[2]);
        driftersGroup.add(dMesh);
      }
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
    const promptVal = document.getElementById('prompt-val');
    let nearLantern = null;
    for (const l of game.lanterns) {
      if (!l.lit) {
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
      promptVal.textContent = `${nearLantern.deposited}/10`;
    } else if (promptEl) {
      promptEl.style.display = 'none';
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
