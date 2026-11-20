/**
 * Headless Test Runner: CLI thực thi kịch bản kiểm thử không cần giao diện
 * Sử dụng: node src/headless/runner.js [kịch_bản.json]
 */

import fs from 'node:fs';
import { GameState } from '../core/gameState.js';

function run() {
  const args = process.argv.slice(2);
  let scenario = null;

  if (args.length > 0 && fs.existsSync(args[0])) {
    try {
      const raw = fs.readFileSync(args[0], 'utf-8');
      scenario = JSON.parse(raw);
    } catch (err) {
      console.error(JSON.stringify({ error: `Khong the doc file: ${err.message}` }));
      process.exit(1);
    }
  } else {
    // Kịch bản mặc định nếu không truyền file
    scenario = {
      config: {
        player: { x: 0, z: 0, speed: 1.0 },
        fireflies: [
          { id: 'f1', x: 1, z: 0, collected: false },
          { id: 'f2', x: 2, z: 0, collected: false }
        ],
        lanterns: [
          { id: 'L1', x: 3, z: 0, required: 2, isLit: false }
        ]
      },
      actions: [
        { type: 'MOVE', dx: 1, dz: 0 }, // May di chuyển tới (1, 0) -> nhặt f1
        { type: 'MOVE', dx: 1, dz: 0 }, // May di chuyển tới (2, 0) -> nhặt f2
        { type: 'MOVE', dx: 1, dz: 0 }, // May di chuyển tới (3, 0)
        { type: 'LIGHT' }               // May thắp đèn L1
      ]
    };
  }

  const game = new GameState(scenario.config);
  const result = game.runScenario(scenario.actions);

  // Xuất snapshot ra stdout theo chuẩn Test Contract
  console.log(JSON.stringify(result, null, 2));
}

run();
