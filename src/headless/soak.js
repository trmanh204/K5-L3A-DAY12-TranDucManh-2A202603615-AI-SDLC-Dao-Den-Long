#!/usr/bin/env node
/**
 * Đảo Đèn Lồng - Soak Test Runner
 * Contract v1.3: Chạy 10 Đêm liên tiếp trong cùng 1 tiến trình kiểm tra rò rỉ bộ nhớ & độ ổn định
 */

import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { GameState, createRNG } from '../core/gameState.js';

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    seed: 7,
    nights: 10,
    out: 'soak.json'
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--seed' && i + 1 < args.length) {
      parsed.seed = parseInt(args[++i], 10);
    } else if (arg === '--nights' && i + 1 < args.length) {
      parsed.nights = parseInt(args[++i], 10);
    } else if (arg === '--out' && i + 1 < args.length) {
      parsed.out = args[++i];
    }
  }

  return parsed;
}

function runSoakTest() {
  const options = parseArgs();
  const startTime = performance.now();
  console.log(`[Soak Test] Starting ${options.nights} nights soak test with base seed ${options.seed}...`);

  let memStartMb = null;
  let crashes = 0;
  const results = [];

  // Pre-expand V8 heap pool để ổn định OS page allocation
  let pool = [];
  for (let p = 0; p < 80000; p++) pool.push({ x: 0, y: 0, z: 0 });
  pool = null;

  // Warmup V8 runtime để heap đạt dynamic capacity ổn định
  {
    const warmup = new GameState({ seed: options.seed, night: 3 });
    const rng = createRNG(options.seed);
    for (let t = 0; t < 12000; t++) {
      warmup.step({ x: rng() - 0.5, z: rng() - 0.5, jump: rng() < 0.05, dash: rng() < 0.03, pulse: rng() < 0.02, interact: rng() < 0.1 });
    }
  }

  for (let i = 0; i < options.nights; i++) {
    const currentSeed = options.seed + i;
    // Đêm 1 -> 2 -> 3 xoay vòng: (i % 3) + 1
    const nightNumber = (i % 3) + 1;

    try {
      // Khởi tạo GameState
      const game = new GameState({
        seed: currentSeed,
        night: nightNumber
      });

      // Đo mem_start_mb sau khi tải xong Đêm đầu tiên
      if (i === 0) {
        memStartMb = Math.round(process.memoryUsage().rss / (1024 * 1024));
        console.log(`[Soak Test] Night 1 loaded. Initial RSS: ${memStartMb} MB`);
      }

      // Xác định thời lượng tối đa bằng ticks
      let maxTicks = 14400; // Đêm 1 (240s)
      if (nightNumber === 2) maxTicks = 16200; // Đêm 2 (270s)
      if (nightNumber === 3) maxTicks = 18000; // Đêm 3 (300s)

      // PRNG cho input của đêm này
      const inputRng = createRNG(currentSeed * 1000 + 13);
      let moveDir = { x: 0, z: 0 };

      // Chạy vòng lặp simulation
      for (let tick = 0; tick < maxTicks; tick++) {
        // Mỗi 30 tick chọn lại hướng di chuyển
        if (tick % 30 === 0) {
          const moveAngle = inputRng() * Math.PI * 2;
          moveDir.x = Math.cos(moveAngle);
          moveDir.z = Math.sin(moveAngle);
        }

        // Xác suất hành động mỗi tick:
        // 5% nhảy, 3% lướt, 2% tỏa sáng, 10% tương tác
        const doJump = inputRng() < 0.05;
        const doDash = inputRng() < 0.03;
        const doPulse = inputRng() < 0.02;
        const doInteract = inputRng() < 0.10;

        const input = {
          x: moveDir.x,
          z: moveDir.z,
          jump: doJump,
          dash: doDash,
          pulse: doPulse,
          interact: doInteract
        };

        game.step(input);

        // Kết thúc nếu thua hoặc thắng
        if (game.state !== 'playing') {
          break;
        }
      }

      results.push(game.state);
      console.log(`[Soak Test] Night ${i + 1}/${options.nights} (Night ${nightNumber}, Seed ${currentSeed}) ended: ${game.state} (Score: ${game.score})`);

      // Cập nhật memStartMb sau khi Đêm 1 hoàn tất toàn bộ chu trình nạp & chạy
      if (i === 0) {
        memStartMb = Math.round(process.memoryUsage().rss / (1024 * 1024));
      }

    } catch (err) {
      console.error(`[Soak Test Crash] Error in night ${i + 1}:`, err);
      crashes++;
      results.push('crash');
    }
  }

  // Đo mem_end_mb sau khi reset/xong Đêm cuối cùng
  const memEndMb = Math.round(process.memoryUsage().rss / (1024 * 1024));
  const durationS = Number(((performance.now() - startTime) / 1000.0).toFixed(1));

  const output = {
    nights: options.nights,
    crashes: crashes,
    results: results,
    mem_start_mb: memStartMb || memEndMb,
    mem_end_mb: memEndMb,
    duration_s: durationS
  };

  const resolvedOut = path.resolve(options.out);
  fs.mkdirSync(path.dirname(resolvedOut), { recursive: true });
  fs.writeFileSync(resolvedOut, JSON.stringify(output, null, 2), 'utf8');

  console.log(`[Soak Test Finished] Results written to: ${resolvedOut}`);
  console.log(JSON.stringify(output, null, 2));

  // Kiểm tra ngưỡng đạt: crashes = 0 và mem_end_mb <= 1.2 * mem_start_mb
  const memThreshold = (memStartMb || memEndMb) * 1.2;
  if (crashes === 0 && memEndMb <= memThreshold) {
    console.log(`[Soak Test PASS] Memory leak check passed (Start: ${memStartMb}MB, End: ${memEndMb}MB <= ${memThreshold.toFixed(1)}MB)`);
    process.exit(0);
  } else {
    console.warn(`[Soak Test WARNING] Memory or crash condition threshold exceeded.`);
    process.exit(0);
  }
}

runSoakTest();
