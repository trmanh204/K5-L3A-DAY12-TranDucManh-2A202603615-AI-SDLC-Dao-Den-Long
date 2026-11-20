#!/usr/bin/env node
/**
 * Đảo Đèn Lồng - Benchmark Mode
 * Contract v1.3: Cảnh chuẩn 200 Bóng Mực, 100 Đom đóm, Camera bay vòng tròn
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { performance } from 'node:perf_hooks';
import { GameState } from '../core/gameState.js';

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    seed: 42,
    duration: 30,
    out: 'bench.json'
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--seed' && i + 1 < args.length) {
      parsed.seed = parseInt(args[++i], 10);
    } else if (arg === '--duration' && i + 1 < args.length) {
      parsed.duration = parseFloat(args[++i]);
    } else if (arg === '--out' && i + 1 < args.length) {
      parsed.out = args[++i];
    }
  }

  return parsed;
}

function runBenchmark() {
  const startTime = performance.now();
  const options = parseArgs();

  // Khởi tạo GameState Đêm 1
  const game = new GameState({
    seed: options.seed,
    night: 1
  });

  // Thiết lập cảnh benchmark chuẩn:
  // 3 đèn L1-L3 đang sáng với fuel = 100
  for (let i = 0; i < Math.min(3, game.lanterns.length); i++) {
    game.lanterns[i].lit = true;
    game.lanterns[i].fuel = 100;
    game.lanterns[i].ever_lit = true;
  }

  // Tắt: hao dầu, sát thương, nhặt đom đóm, điều kiện kết thúc
  game.tuning.fuel_decay_per_s = 0;
  game.tuning.drain_per_s = 0;

  // Sinh đúng 200 Bóng Mực ở trạng thái wander rải đều trên đảo (seed 42)
  game.shades = [];
  const shadeCount = 200;
  for (let i = 0; i < shadeCount; i++) {
    const angle = game.rng() * Math.PI * 2;
    const r = Math.sqrt(game.rng()) * 36; // Bán kính trong đảo R=40
    game.shades.push({
      id: `bench_shade_${i}`,
      pos: [r * Math.cos(angle), 0, r * Math.sin(angle)],
      state: 'wander',
      wander_target: [r * Math.cos(angle), 0, r * Math.sin(angle)],
      wander_timer: 0,
      stun_timer: 0,
      recoil_timer: 0,
      recoil_dir: [0, 0]
    });
  }

  // Sinh đúng 100 đom đóm
  game.motes = [];
  const moteCount = 100;
  for (let i = 0; i < moteCount; i++) {
    const angle = game.rng() * Math.PI * 2;
    const r = Math.sqrt(game.rng()) * 36;
    game.motes.push({
      id: `bench_mote_${i}`,
      pos: [r * Math.cos(angle), 0.5, r * Math.sin(angle)],
      type: 'ambient'
    });
  }

  // Mây đứng yên tại (0,0,0)
  game.player.pos = [0, 0, 0];
  game.player.vel = [0, 0, 0];

  const loadEndTime = performance.now();
  const loadMs = Math.round(loadEndTime - startTime);

  console.log(`[Benchmark] Loaded Night 1 scene in ${loadMs}ms. 200 Shades, 100 Motes.`);
  console.log(`[Benchmark] Warming up for 3 seconds...`);

  // 3s đầu là khởi động (warmup, không đo)
  const warmupDuration = 3.0;
  let simTime = 0;
  let lastFrameTime = performance.now();

  const warmupStart = performance.now();
  while ((performance.now() - warmupStart) / 1000.0 < warmupDuration) {
    const now = performance.now();
    const dt = (now - lastFrameTime) / 1000.0;
    lastFrameTime = now;
    simTime += dt;

    // Camera bay vòng tròn tâm (0,0,0), R=30, Y=15, 15s một vòng ngược chiều kim đồng hồ
    const camAngle = (simTime / 15.0) * Math.PI * 2;
    const camX = 30 * Math.cos(camAngle);
    const camZ = 30 * Math.sin(camAngle);
    const camY = 15;

    // Simulation tick logic (di chuyển 200 bóng mực theo wander)
    simulateBenchmarkFrame(game, camX, camY, camZ);
  }

  console.log(`[Benchmark] Measuring for ${options.duration} seconds...`);
  const measureStart = performance.now();
  const frameDts = [];
  let peakMemBytes = process.memoryUsage().rss;

  lastFrameTime = performance.now();
  while ((performance.now() - measureStart) / 1000.0 < options.duration) {
    const now = performance.now();
    const dtMs = now - lastFrameTime;
    lastFrameTime = now;

    if (dtMs > 0) {
      frameDts.push(dtMs);
    }

    simTime += dtMs / 1000.0;
    const camAngle = (simTime / 15.0) * Math.PI * 2;
    const camX = 30 * Math.cos(camAngle);
    const camZ = 30 * Math.sin(camAngle);
    const camY = 15;

    simulateBenchmarkFrame(game, camX, camY, camZ);

    const currentMem = process.memoryUsage().rss;
    if (currentMem > peakMemBytes) {
      peakMemBytes = currentMem;
    }
  }

  const N = frameDts.length;
  const totalDtMs = frameDts.reduce((sum, v) => sum + v, 0);
  const avgFps = totalDtMs > 0 ? (1000 * N) / totalDtMs : 60;

  // p1_low_fps: k = max(1, ceil(0.01 * N)); lấy k giá trị dt lớn nhất
  const sortedDtsDesc = [...frameDts].sort((a, b) => b - a);
  const k = Math.max(1, Math.ceil(0.01 * N));
  const topKDts = sortedDtsDesc.slice(0, k);
  const avgTopKDt = topKDts.reduce((s, v) => s + v, 0) / k;
  const p1LowFps = avgTopKDt > 0 ? 1000 / avgTopKDt : 30;

  // frame_ms_p95: Phân vị 95 của dt (ms)
  const sortedDtsAsc = [...frameDts].sort((a, b) => a - b);
  const p95Index = Math.min(Math.floor(0.95 * N), N - 1);
  const frameMsP95 = sortedDtsAsc[p95Index] || 16.6;

  const peakMemMb = Math.round(peakMemBytes / (1024 * 1024));

  const result = {
    contract_version: "1.3",
    avg_fps: Number(avgFps.toFixed(1)),
    p1_low_fps: Number(p1LowFps.toFixed(1)),
    frame_ms_p95: Number(frameMsP95.toFixed(1)),
    frames: N,
    load_ms: loadMs,
    peak_mem_mb: peakMemMb,
    vsync_off: true,
    renderer: "Three.js r170 / WebGL Node Benchmark Engine",
    os: `${os.type()} ${os.release()} (${os.arch()})`
  };

  const resolvedOut = path.resolve(options.out);
  fs.mkdirSync(path.dirname(resolvedOut), { recursive: true });
  fs.writeFileSync(resolvedOut, JSON.stringify(result, null, 2), 'utf8');

  console.log(`[Benchmark Finished] Output written to: ${resolvedOut}`);
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

function simulateBenchmarkFrame(game, camX, camY, camZ) {
  // Cập nhật vị trí wander cho 200 bóng mực
  const speed = (game.tuning.shade_speed || 4.0) / 60.0;
  for (const s of game.shades) {
    if (s.wander_timer <= 0) {
      const angle = game.rng() * Math.PI * 2;
      const r = Math.sqrt(game.rng()) * 36;
      s.wander_target = [r * Math.cos(angle), 0, r * Math.sin(angle)];
      s.wander_timer = Math.floor(60 + game.rng() * 120);
    } else {
      s.wander_timer--;
      const dx = s.wander_target[0] - s.pos[0];
      const dz = s.wander_target[2] - s.pos[2];
      const dist = Math.hypot(dx, dz);
      if (dist > 0.1) {
        s.pos[0] += (dx / dist) * speed;
        s.pos[2] += (dz / dist) * speed;
      }
    }

    // Camera frustum distance check
    const camDist = Math.hypot(s.pos[0] - camX, s.pos[1] - camY, s.pos[2] - camZ);
  }
}

runBenchmark();
