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

    // Sync Shades
    shadesGroup.clear();
    const shadeGeo = new THREE.DodecahedronGeometry(0.65, 1);
    const shadeMat = new THREE.MeshStandardMaterial({
      color: 0x120A1A,
      roughness: 0.9,
      emissive: new THREE.Color(savedSettings.cbMode ? 0x00B3FF : 0x7A3CFF),
      emissiveIntensity: 0.6
    });
    for (const s of game.shades) {
      const sMesh = new THREE.Mesh(shadeGeo, shadeMat);
      sMesh.position.set(s.pos[0], s.pos[1] + 0.8 + Math.sin(time * 2 + s.pos[0]) * 0.15, s.pos[2]);
      if (s.state === 'stunned') sMesh.material.color.setHex(0x3A3450);
      if (s.state === 'drain') sMesh.material.color.setHex(0x550055);
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

    // Edge Arrow for nearest Shade
    const shadeArrowEl = document.getElementById('shade-arrow');
    const shadeDirEl = document.getElementById('shade-dir');
    let nearestShade = null;
    let minShadeDist = Infinity;
    for (const s of game.shades) {
      if (s.state !== 'stunned') {
        const dx = s.pos[0] - game.player.pos[0];
        const dz = s.pos[2] - game.player.pos[2];
        const dist = Math.hypot(dx, dz);
        if (dist < minShadeDist) {
          minShadeDist = dist;
          nearestShade = s;
        }
      }
    }

    if (nearestShade && minShadeDist <= 14.0 && shadeArrowEl && shadeDirEl) {
      shadeArrowEl.classList.add('visible');
      const dx = nearestShade.pos[0] - game.player.pos[0];
      const dz = nearestShade.pos[2] - game.player.pos[2];
      if (Math.abs(dx) > Math.abs(dz)) {
        shadeDirEl.textContent = dx > 0 ? '➡️' : '⬅️';
      } else {
        shadeDirEl.textContent = dz > 0 ? '⬇️' : '⬆️';
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
