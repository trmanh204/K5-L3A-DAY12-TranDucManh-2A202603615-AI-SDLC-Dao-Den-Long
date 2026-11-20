#!/usr/bin/env node
/**
 * Đảo Đèn Lồng - Headless Test Contract Runner v1.1
 * Supports Night 1, 2, 3 simulation at 60 ticks/s and outputs JSON Lines (.jsonl).
 */

import fs from 'node:fs';
import path from 'node:path';
import { GameState } from '../core/gameState.js';
import { LeaderboardManager } from '../core/leaderboard.js';

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    seed: 1,
    night: 1,
    scenarioPath: null,
    inputsPath: null,
    ticks: null,
    outPath: null,
    snapshotEvery: 10,
    exportLeaderboard: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--seed' && i + 1 < args.length) {
      parsed.seed = parseInt(args[++i], 10);
    } else if (arg === '--night' && i + 1 < args.length) {
      parsed.night = parseInt(args[++i], 10);
    } else if (arg === '--scenario' && i + 1 < args.length) {
      parsed.scenarioPath = args[++i];
    } else if (arg === '--inputs' && i + 1 < args.length) {
      parsed.inputsPath = args[++i];
    } else if (arg === '--ticks' && i + 1 < args.length) {
      parsed.ticks = parseInt(args[++i], 10);
    } else if (arg === '--out' && i + 1 < args.length) {
      parsed.outPath = args[++i];
    } else if (arg === '--snapshot-every' && i + 1 < args.length) {
      parsed.snapshotEvery = parseInt(args[++i], 10);
    } else if (arg === '--export-leaderboard' && i + 1 < args.length) {
      parsed.exportLeaderboard = args[++i];
    }
  }

  return parsed;
}

function exitWithValidationCode(message) {
  console.error(`[Headless Contract Error] ${message}`);
  process.exit(2);
}

function main() {
  const options = parseArgs();

  // Export Leaderboard command check
  if (options.exportLeaderboard) {
    const lm = new LeaderboardManager();
    // Khởi tạo một số mẫu nếu chưa có dữ liệu
    if (lm.getEntries().length === 0) {
      lm.addEntry({ name: 'Player_Pro', score: 950, nights_won: 3, achieved_at: '2026-11-20T10:00:00.000Z', seed: 42 });
      lm.addEntry({ name: 'May_Keeper', score: 620, nights_won: 2, achieved_at: '2026-11-20T11:30:00.000Z', seed: 7 });
      lm.addEntry({ name: 'Lantern_Ace', score: 480, nights_won: 1, achieved_at: '2026-11-20T14:15:00.000Z', seed: 1 });
    }
    const out = lm.exportJson(options.exportLeaderboard);
    console.log(`[Leaderboard] Exported ${lm.getEntries().length} entries to: ${out}`);
    process.exit(0);
  }

  if (options.ticks === null || isNaN(options.ticks) || options.ticks < 0) {
    console.error('Error: --ticks <int> is required and must be >= 0.');
    process.exit(2);
  }

  if (!options.outPath) {
    console.error('Error: --out <path> is required.');
    process.exit(2);
  }

  if (![1, 2, 3].includes(options.night)) {
    console.error('Error: --night must be 1, 2, or 3.');
    process.exit(2);
  }

  // Load contract tuning if available
  let contractTuning = {};
  const contractFile = path.resolve(process.cwd(), 'game.contract.json');
  if (fs.existsSync(contractFile)) {
    try {
      const contractData = JSON.parse(fs.readFileSync(contractFile, 'utf8'));
      if (contractData.tuning) {
        contractTuning = contractData.tuning;
      }
    } catch (e) {
      exitWithValidationCode(`Failed to parse game.contract.json: ${e.message}`);
    }
  }

  // Load scenario if provided
  let scenario = null;
  if (options.scenarioPath) {
    try {
      const rawScenario = fs.readFileSync(path.resolve(process.cwd(), options.scenarioPath), 'utf8');
      scenario = JSON.parse(rawScenario);
      if (typeof scenario !== 'object' || scenario === null) {
        exitWithValidationCode('Scenario must be a valid JSON object.');
      }
    } catch (e) {
      exitWithValidationCode(`Invalid scenario file: ${e.message}`);
    }
  }

  // Load inputs if provided
  let inputsMap = {};
  if (options.inputsPath) {
    try {
      const rawInputs = fs.readFileSync(path.resolve(process.cwd(), options.inputsPath), 'utf8');
      const parsedInputs = JSON.parse(rawInputs);
      if (Array.isArray(parsedInputs)) {
        for (const item of parsedInputs) {
          if (item && typeof item.tick === 'number') {
            inputsMap[item.tick] = item;
          }
        }
      } else if (typeof parsedInputs === 'object' && parsedInputs !== null) {
        inputsMap = parsedInputs;
      } else {
        exitWithValidationCode('Inputs must be an array or object.');
      }
    } catch (e) {
      exitWithValidationCode(`Invalid inputs file: ${e.message}`);
    }
  }

  // Ensure output directory exists
  const resolvedOut = path.resolve(process.cwd(), options.outPath);
  fs.mkdirSync(path.dirname(resolvedOut), { recursive: true });
  const outStream = fs.createWriteStream(resolvedOut, { flags: 'w', encoding: 'utf8' });

  function writeLine(obj) {
    outStream.write(JSON.stringify(obj) + '\n');
  }

  // Initialize GameState with night parameter
  const game = new GameState({
    seed: options.seed,
    night: options.night,
    tuning: contractTuning,
    scenario: scenario
  });

  // Emit initial pending events (e.g. night_start)
  if (game.pending_events && game.pending_events.length > 0) {
    for (const ev of game.pending_events) {
      writeLine(ev);
    }
    game.pending_events = [];
  }

  // Tick 0 snapshot
  writeLine(game.getSnapshot(0));

  // Run simulation loop
  const totalTicks = options.ticks;
  let lastWrittenSnapshotTick = 0;

  for (let k = 0; k < totalTicks; k++) {
    const inputForTick = inputsMap[k] || {};
    const events = game.step(inputForTick);

    for (const ev of events) {
      writeLine(ev);
    }

    const currentTick = k + 1;
    if (options.snapshotEvery > 0 && currentTick % options.snapshotEvery === 0) {
      writeLine(game.getSnapshot(currentTick));
      lastWrittenSnapshotTick = currentTick;
    }
  }

  if (lastWrittenSnapshotTick !== totalTicks) {
    writeLine(game.getSnapshot(totalTicks));
  }

  // Emit end record
  writeLine({
    type: "end",
    ticks: totalTicks,
    state: game.state,
    score: game.score
  });

  outStream.end(() => {
    console.log(`[Headless Runner v1.1] Finished ${totalTicks} ticks simulation (Night ${options.night}). Output: ${options.outPath}`);
    process.exit(0);
  });
}

main();
