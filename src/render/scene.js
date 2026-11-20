import * as THREE from 'three';
import { GameState } from '../core/gameState.js';

export function createGameApp(container) {
  const game = new GameState();

  // 1. Scene, Camera, Renderer
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a1128);
  scene.fog = new THREE.FogExp2(0x0a1128, 0.035);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // 2. Lighting (Moonlight & Ambience)
  const ambientLight = new THREE.AmbientLight(0x445588, 0.8);
  scene.add(ambientLight);

  const moonLight = new THREE.DirectionalLight(0xaaccff, 1.2);
  moonLight.position.set(20, 40, 20);
  moonLight.castShadow = true;
  scene.add(moonLight);

  // 3. Island Mesh (Hòn Đảo)
  const islandGeo = new THREE.CylinderGeometry(game.islandRadius, game.islandRadius + 2, 3, 32);
  const islandMat = new THREE.MeshStandardMaterial({ color: 0x1c3b2b, roughness: 0.8 });
  const island = new THREE.Mesh(islandGeo, islandMat);
  island.position.y = -1.5;
  island.receiveShadow = true;
  scene.add(island);

  // Viền nước bao quanh đảo
  const waterGeo = new THREE.PlaneGeometry(200, 200);
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x051329, roughness: 0.1, metalness: 0.8 });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -1.8;
  scene.add(water);

  // 4. Character Mây (Nhân vật người giữ đèn)
  const mayGroup = new THREE.Group();
  
  // Body (Mây)
  const bodyGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.9, 12);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffe0bd });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.45;
  body.castShadow = true;
  mayGroup.add(body);

  // Head
  const headGeo = new THREE.SphereGeometry(0.28, 16, 16);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffdfba });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.05;
  mayGroup.add(head);

  // Hand Lantern
  const handLanternGeo = new THREE.DodecahedronGeometry(0.12);
  const handLanternMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xff8800, emissiveIntensity: 1 });
  const handLantern = new THREE.Mesh(handLanternGeo, handLanternMat);
  handLantern.position.set(0.35, 0.4, 0.2);
  mayGroup.add(handLantern);

  const handLight = new THREE.PointLight(0xffaa22, 1.5, 4);
  handLight.position.copy(handLantern.position);
  mayGroup.add(handLight);

  scene.add(mayGroup);

  // 5. Fireflies (Đom đóm)
  const fireflyMeshes = new Map();
  const fireflyGeo = new THREE.SphereGeometry(0.15, 8, 8);
  const fireflyMat = new THREE.MeshStandardMaterial({ color: 0xaaff55, emissive: 0x88ff22, emissiveIntensity: 2 });

  for (const f of game.fireflies) {
    const ffMesh = new THREE.Mesh(fireflyGeo, fireflyMat);
    ffMesh.position.set(f.x, 0.6, f.z);
    
    const pLight = new THREE.PointLight(0x88ff33, 0.8, 3);
    ffMesh.add(pLight);

    scene.add(ffMesh);
    fireflyMeshes.set(f.id, ffMesh);
  }

  // 6. Great Lanterns (Đèn Lồng Lớn)
  const lanternMeshes = new Map();
  for (const l of game.lanterns) {
    const lGroup = new THREE.Group();
    lGroup.position.set(l.x, 0, l.z);

    // Pillar
    const pillarGeo = new THREE.CylinderGeometry(0.2, 0.25, 2.2, 8);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.y = 1.1;
    lGroup.add(pillar);

    // Glass Lamp top
    const lampGeo = new THREE.OctahedronGeometry(0.5);
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.3 });
    const lamp = new THREE.Mesh(lampGeo, lampMat);
    lamp.position.y = 2.4;
    lGroup.add(lamp);

    // Light source
    const lampLight = new THREE.PointLight(0xff7700, 0, 15);
    lampLight.position.y = 2.4;
    lGroup.add(lampLight);

    scene.add(lGroup);
    lanternMeshes.set(l.id, { group: lGroup, lamp, light: lampLight });
  }

  // 7. Input Controls (WASD / Arrows)
  const keys = {};
  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') {
      const res = game.lightLantern();
      if (res.success) {
        updateLanternVisual(res.lanternId);
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  function updateLanternVisual(id) {
    const item = lanternMeshes.get(id);
    if (item) {
      item.lamp.material.color.setHex(0xffaa22);
      item.lamp.material.emissive = new THREE.Color(0xff6600);
      item.lamp.material.emissiveIntensity = 2.5;
      item.light.intensity = 4.0;
    }
  }

  // 8. Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // Di chuyển nhân vật
    let dx = 0;
    let dz = 0;
    if (keys['KeyW'] || keys['ArrowUp']) dz -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) dz += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) dx += 1;

    if (dx !== 0 || dz !== 0) {
      game.move(dx * delta * 4, dz * delta * 4);
    }

    // Đồng bộ vị trí Mây sang 3D Mesh
    mayGroup.position.x = game.player.x;
    mayGroup.position.z = game.player.z;
    if (dx !== 0 || dz !== 0) {
      mayGroup.rotation.y = Math.atan2(dx, dz);
    }

    // Camera góc nhìn thứ ba bám theo Mây
    camera.position.x = game.player.x;
    camera.position.y = game.player.y + 6;
    camera.position.z = game.player.z + 9;
    camera.lookAt(game.player.x, 1, game.player.z);

    // Hiệu ứng đom đóm lập lòe và ẩn khi đã thu thập
    for (const f of game.fireflies) {
      const m = fireflyMeshes.get(f.id);
      if (m) {
        if (f.collected) {
          m.visible = false;
        } else {
          m.position.y = 0.6 + Math.sin(time * 3 + f.x) * 0.2;
        }
      }
    }

    // Cập nhật trạng thái đèn
    for (const l of game.lanterns) {
      if (l.isLit) {
        updateLanternVisual(l.id);
      }
    }

    // Render 3D
    renderer.render(scene, camera);

    // Cập nhật UI HUD
    const hud = document.getElementById('hud');
    if (hud) {
      hud.innerHTML = `
        <div style="font-weight: bold; font-size: 16px;">🏝️ Đảo Đèn Lồng (Phase 1)</div>
        <div>✨ Đom đóm trong giỏ: <b>${game.player.firefliesInBasket}</b></div>
        <div>🏮 Đèn lồng đã thắp: <b>${game.lanterns.filter(l => l.isLit).length} / ${game.lanterns.length}</b></div>
        <div style="margin-top: 6px; font-size: 12px; color: #aaccff;">Phím: [W, A, S, D] Di chuyển | [Space] Thắp Đèn Lồng</div>
      `;
    }
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
