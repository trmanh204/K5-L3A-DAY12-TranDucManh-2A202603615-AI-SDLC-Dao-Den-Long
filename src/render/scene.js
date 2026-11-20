import * as THREE from 'three';
import { GameState } from '../core/gameState.js';

export function createGameApp(container) {
  let game = new GameState({ seed: Math.floor(Math.random() * 10000) });

  // 1. Three.js Scene, Camera, Renderer
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060c1e);
  scene.fog = new THREE.FogExp2(0x060c1e, 0.025);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // 2. Lighting (Moonlight & Ambience)
  const ambientLight = new THREE.AmbientLight(0x2a3d66, 0.9);
  scene.add(ambientLight);

  const moonLight = new THREE.DirectionalLight(0x99bbff, 1.4);
  moonLight.position.set(30, 50, 20);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.width = 1024;
  moonLight.shadow.mapSize.height = 1024;
  scene.add(moonLight);

  // 3. Island Terrain (Đảo Cát Lòng Đèn)
  const islandRadius = 32.0;
  const islandGeo = new THREE.CylinderGeometry(islandRadius, islandRadius + 3, 4, 48);
  const islandMat = new THREE.MeshStandardMaterial({
    color: 0x183022,
    roughness: 0.85,
    metalness: 0.1
  });
  const island = new THREE.Mesh(islandGeo, islandMat);
  island.position.y = -2;
  island.receiveShadow = true;
  scene.add(island);

  // Water plane surrounding the island
  const waterGeo = new THREE.PlaneGeometry(300, 300);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x040d1a,
    roughness: 0.1,
    metalness: 0.8
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -2.2;
  scene.add(water);

  // 4. Player Character (Mây) with Vietnamese Nón Lá & Hand Lantern
  const mayGroup = new THREE.Group();

  // Robe / Body
  const bodyGeo = new THREE.CylinderGeometry(0.3, 0.45, 0.9, 16);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xecf0f1, roughness: 0.5 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.45;
  body.castShadow = true;
  mayGroup.add(body);

  // Head
  const headGeo = new THREE.SphereGeometry(0.26, 16, 16);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffdfba });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.05;
  head.castShadow = true;
  mayGroup.add(head);

  // Vietnamese Nón Lá (Conical Hat)
  const hatGeo = new THREE.ConeGeometry(0.65, 0.32, 24);
  const hatMat = new THREE.MeshStandardMaterial({ color: 0xd4b26f, roughness: 0.7 });
  const hat = new THREE.Mesh(hatGeo, hatMat);
  hat.position.y = 1.25;
  hat.castShadow = true;
  mayGroup.add(hat);

  // Handheld Small Lantern
  const smallLanternGeo = new THREE.DodecahedronGeometry(0.12);
  const smallLanternMat = new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    emissive: 0xff8800,
    emissiveIntensity: 2
  });
  const smallLantern = new THREE.Mesh(smallLanternGeo, smallLanternMat);
  smallLantern.position.set(0.35, 0.45, 0.25);
  mayGroup.add(smallLantern);

  const smallLanternLight = new THREE.PointLight(0xffaa33, 1.8, 5);
  smallLanternLight.position.copy(smallLantern.position);
  mayGroup.add(smallLanternLight);

  scene.add(mayGroup);

  // Pulse Skill Visual Wave (Expanding light ring)
  const pulseRingGeo = new THREE.RingGeometry(0.2, 0.6, 32);
  const pulseRingMat = new THREE.MeshBasicMaterial({
    color: 0xffeb3b,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide
  });
  const pulseRing = new THREE.Mesh(pulseRingGeo, pulseRingMat);
  pulseRing.rotation.x = -Math.PI / 2;
  pulseRing.position.y = 0.05;
  scene.add(pulseRing);

  let pulseVisualTimer = 0;

  // 5. Motes (Đom đóm)
  const moteMeshes = new Map();
  const moteGeo = new THREE.SphereGeometry(0.14, 12, 12);
  const moteMat = new THREE.MeshStandardMaterial({
    color: 0x64ffda,
    emissive: 0x1de9b6,
    emissiveIntensity: 3
  });

  for (const m of game.motes) {
    const mMesh = new THREE.Mesh(moteGeo, moteMat);
    mMesh.position.set(m.pos[0], m.pos[1], m.pos[2]);

    const pLight = new THREE.PointLight(0x64ffda, 0.6, 2.5);
    mMesh.add(pLight);

    scene.add(mMesh);
    moteMeshes.set(m.id, mMesh);
  }

  // 6. Great Lanterns (5 Lồng Đèn Lớn L1..L5)
  const lanternMeshes = new Map();
  for (const l of game.lanterns) {
    const lGroup = new THREE.Group();
    lGroup.position.set(l.pos[0], 0, l.pos[2]);

    // Wooden Pillar
    const pillarGeo = new THREE.CylinderGeometry(0.2, 0.25, 2.4, 12);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.9 });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.y = 1.2;
    pillar.castShadow = true;
    lGroup.add(pillar);

    // Decorative Lantern Frame (Vietnamese Silk Lantern)
    const lampGeo = new THREE.OctahedronGeometry(0.65, 1);
    const lampMat = new THREE.MeshStandardMaterial({
      color: 0x4a1212,
      roughness: 0.4
    });
    const lamp = new THREE.Mesh(lampGeo, lampMat);
    lamp.position.y = 2.6;
    lamp.castShadow = true;
    lGroup.add(lamp);

    // Point Light source
    const lampLight = new THREE.PointLight(0xff9900, 0, 16);
    lampLight.position.y = 2.6;
    lGroup.add(lampLight);

    // Safe Zone Indicator Circle (on ground)
    const safeZoneGeo = new THREE.RingGeometry(7.8, 8.0, 48);
    const safeZoneMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    const safeZoneRing = new THREE.Mesh(safeZoneGeo, safeZoneMat);
    safeZoneRing.rotation.x = -Math.PI / 2;
    safeZoneRing.position.y = 0.02;
    lGroup.add(safeZoneRing);

    scene.add(lGroup);
    lanternMeshes.set(l.id, {
      group: lGroup,
      lamp,
      light: lampLight,
      safeRing: safeZoneRing
    });
  }

  // 7. Shades (Bóng Mực Quái Vật S1..S3)
  const shadeMeshes = new Map();
  const shadeGeo = new THREE.DodecahedronGeometry(0.55, 1);
  const shadeMat = new THREE.MeshStandardMaterial({
    color: 0x110519,
    roughness: 0.9,
    metalness: 0.1
  });

  for (const s of game.shades) {
    const sGroup = new THREE.Group();
    sGroup.position.set(s.pos[0], 0.7, s.pos[2]);

    const sMesh = new THREE.Mesh(shadeGeo, shadeMat);
    sMesh.castShadow = true;
    sGroup.add(sMesh);

    // Red Glowing Eyes
    const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(0.18, 0.12, 0.45);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(-0.18, 0.12, 0.45);
    sGroup.add(leftEye);
    sGroup.add(rightEye);

    scene.add(sGroup);
    shadeMeshes.set(s.id, { group: sGroup, mesh: sMesh });
  }

  // 8. Input Handling
  const keys = {};
  let keyInteract = false;
  let keyPulse = false;

  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'KeyE') keyInteract = true;
    if (e.code === 'Space' || e.code === 'KeyQ') keyPulse = true;
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    if (e.code === 'KeyE') keyInteract = false;
    if (e.code === 'Space' || e.code === 'KeyQ') keyPulse = false;
  });

  function triggerPulseFX() {
    pulseVisualTimer = 0.4;
    pulseRing.position.x = game.player.pos[0];
    pulseRing.position.z = game.player.pos[2];
    pulseRing.scale.set(1, 1, 1);
    pulseRingMat.opacity = 0.8;
  }

  // 9. Simulation & Render Loop
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

      // Calculate directional input
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
        jump: false
      };

      const events = game.step(input);

      // Check for pulse event to trigger visual effect
      if (events.some(e => e.name === 'pulse')) {
        triggerPulseFX();
      }
    }

    // Update Pulse FX animation
    if (pulseVisualTimer > 0) {
      pulseVisualTimer -= delta;
      const progress = 1 - (pulseVisualTimer / 0.4);
      const scale = 1 + progress * (game.tuning.pulse_radius * 2);
      pulseRing.scale.set(scale, scale, 1);
      pulseRingMat.opacity = Math.max(0, 0.8 * (1 - progress));
    }

    // Sync Player Visuals
    mayGroup.position.set(game.player.pos[0], 0, game.player.pos[2]);
    if (game.invuln_timer > 0) {
      mayGroup.visible = Math.floor(time * 15) % 2 === 0;
    } else {
      mayGroup.visible = true;
    }

    // Camera 3rd-person follow
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, game.player.pos[0], 0.1);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 8.5, 0.1);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, game.player.pos[2] + 12.0, 0.1);
    camera.lookAt(game.player.pos[0], 1.0, game.player.pos[2]);

    // Sync Motes
    for (const m of game.motes) {
      const mesh = moteMeshes.get(m.id);
      if (mesh) {
        if (!m.active) {
          mesh.visible = false;
        } else {
          mesh.visible = true;
          mesh.position.y = m.pos[1] + Math.sin(time * 3 + m.pos[0]) * 0.2;
        }
      }
    }

    // Sync Lanterns
    for (const l of game.lanterns) {
      const item = lanternMeshes.get(l.id);
      if (item) {
        if (l.lit) {
          item.lamp.material.color.setHex(0xffaa22);
          item.lamp.material.emissive = new THREE.Color(0xff7700);
          item.lamp.material.emissiveIntensity = 3.0;
          item.light.intensity = 4.5;
          item.safeRing.material.opacity = 0.5 + Math.sin(time * 2) * 0.15;
        } else {
          const ratio = l.deposited / game.tuning.lantern_cost;
          item.lamp.material.color.setHex(0x551111);
          item.lamp.material.emissive = new THREE.Color(0xff4400);
          item.lamp.material.emissiveIntensity = ratio * 1.5;
          item.light.intensity = ratio * 1.0;
          item.safeRing.material.opacity = 0;
        }
      }
    }

    // Sync Shades
    for (const s of game.shades) {
      const item = shadeMeshes.get(s.id);
      if (item) {
        item.group.position.set(s.pos[0], 0.7 + Math.sin(time * 2.5 + s.pos[0]) * 0.15, s.pos[2]);
        if (s.state === 'stunned') {
          item.group.rotation.y += delta * 8;
          item.mesh.material.color.setHex(0x444455);
        } else if (s.state === 'chase') {
          item.mesh.material.color.setHex(0x3a0820);
          item.group.lookAt(game.player.pos[0], 0.7, game.player.pos[2]);
        } else {
          item.mesh.material.color.setHex(0x110519);
        }
      }
    }

    // Render 3D Scene
    renderer.render(scene, camera);

    // Update HUD
    updateHUD(game);
  }

  function updateHUD(game) {
    const hud = document.getElementById('hud');
    if (!hud) return;

    const flamesDisplay = '🔥'.repeat(Math.max(0, game.player.flames));
    const motesDisplay = `${game.player.carried} / ${game.tuning.carry_capacity}`;
    const lanternsLit = game.lanterns.filter(l => l.lit).length;
    const timeLeft = Math.floor(game.getTimeLeft());
    const mins = Math.floor(timeLeft / 60);
    const secs = String(timeLeft % 60).padStart(2, '0');

    let statusBanner = '';
    if (game.state === 'won') {
      statusBanner = `
        <div style="background: rgba(46, 204, 113, 0.9); padding: 8px; border-radius: 6px; margin-top: 8px; font-weight: bold; text-align: center;">
          🎉 CHIẾN THẮNG! Toàn bộ 5 Đèn Lồng đã được thắp sáng!<br>
          Điểm chung cuộc: ${game.score}
        </div>
      `;
    } else if (game.state === 'lost') {
      const reason = game.lost_reason === 'dawn' ? 'Bình minh đã đến (Hết giờ)!' : 'Mất hết ngọn lửa sinh mệnh!';
      statusBanner = `
        <div style="background: rgba(231, 76, 60, 0.9); padding: 8px; border-radius: 6px; margin-top: 8px; font-weight: bold; text-align: center;">
          💀 THẤT BẠI: ${reason}<br>
          Điểm số: ${game.score}
        </div>
      `;
    }

    hud.innerHTML = `
      <div style="font-weight: bold; font-size: 17px; color: #ffeb3b; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 4px; margin-bottom: 6px;">
        🏝️ ĐẢO ĐÈN LỒNG (Night 1)
      </div>
      <div>🔥 Ngọn lửa sinh mệnh: <b style="font-size: 16px;">${flamesDisplay || 'Hết lửa'}</b></div>
      <div>✨ Đom đóm mang theo: <b>${motesDisplay}</b></div>
      <div>🏮 Đèn lồng đã thắp: <b>${lanternsLit} / ${game.tuning.lantern_count_night1}</b></div>
      <div>⏳ Thời gian còn lại: <b>${mins}:${secs}</b></div>
      <div>🏆 Điểm số: <b>${game.score}</b></div>
      ${statusBanner}
      <div style="margin-top: 8px; font-size: 12px; color: #aaccff; line-height: 1.4;">
        🎮 <b>Phím điều khiển:</b><br>
        • [W, A, S, D] / [Mũi tên]: Di chuyển Mây<br>
        • [E]: Nạp đom đóm vào đèn (Interact)<br>
        • [Space] / [Q]: Tỏa sáng làm choáng quái (Tốn 2 đom đóm)
      </div>
    `;
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
