#!/usr/bin/env node
/**
 * Đảo Đèn Lồng - Headless Test Contract Runner v1.0
 * Runs deterministic simulation at 60 ticks/s and outputs JSON Lines (.jsonl).
 */

import fs from 'node:fs';
import path from 'node:path';
import { GameState } from '../core/gameState.js';

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    seed: 1,
    night: 1,
    scenarioPath: null,
    inputsPath: null,
    ticks: null,
    outPath: null,
    snapshotEvery: 10
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

  if (options.ticks === null || isNaN(options.ticks) || options.ticks < 0) {
    console.error('Error: --ticks <int> is required and must be >= 0.');
    process.exit(2);
  }

  if (!options.outPath) {
    console.error('Error: --out <path> is required.');
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
  let inputsMap = {}; // tick -> input
  if (options.inputsPath) {
    try {
      const rawInputs = fs.readFileSync(path.resolve(process.cwd(), options.inputsPath), 'utf8');
      const parsedInputs = JSON.parse(rawInputs);
      if (Array.isArray(parsedInputs)) {
        // [{tick: 0, x: 0, z: 1, ...}]
        for (const item of parsedInputs) {
          if (item && typeof item.tick === 'number') {
            inputsMap[item.tick] = item;
          }
        }
      } else if (typeof parsedInputs === 'object' && parsedInputs !== null) {
        // {"0": {...}, "1": {...}}
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

  // Initialize GameState
  const game = new GameState({
    seed: options.seed,
    tuning: contractTuning,
    scenario: scenario
  });

  // Emit initial events (e.g. shade_spawned)
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

    // Emit events produced by step k (labeled tick = k + 1)
    for (const ev of events) {
      writeLine(ev);
    }

    const currentTick = k + 1;
    // Emit periodic snapshots
    if (options.snapshotEvery > 0 && currentTick % options.snapshotEvery === 0) {
      writeLine(game.getSnapshot(currentTick));
      lastWrittenSnapshotTick = currentTick;
    }
  }

  // Final snapshot if not already emitted
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
    console.log(`[Headless Runner] Finished ${totalTicks} ticks simulation. Output saved to ${options.outPath}`);
    process.exit(0);
  });
}

main();
