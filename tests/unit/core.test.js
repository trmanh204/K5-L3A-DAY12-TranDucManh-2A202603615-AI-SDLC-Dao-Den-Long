import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../../src/core/gameState.js';

describe('Đảo Đèn Lồng - Core Logic Tests', () => {
  test('Khởi tạo game với các thông số mặc định', () => {
    const game = new GameState();
    const snap = game.getSnapshot();
    assert.equal(snap.tick, 0);
    assert.equal(snap.player.x, 0);
    assert.equal(snap.player.z, 0);
    assert.equal(snap.player.fireflies, 0);
    assert.equal(snap.litLanternsCount, 0);
    assert.equal(snap.allLanternsLit, false);
  });

  test('Mây di chuyển và tự động nhặt đom đóm trong tầm bán kính', () => {
    const game = new GameState({
      player: { x: 0, z: 0, speed: 2 },
      fireflies: [{ id: 'f1', x: 2, z: 0, collected: false }],
      lanterns: []
    });

    game.step({ type: 'MOVE', dx: 1, dz: 0 });
    const snap = game.getSnapshot();

    assert.equal(snap.player.x, 2);
    assert.equal(snap.player.fireflies, 1);
    assert.equal(snap.remainingFireflies, 0);
  });

  test('Mây thắp sáng Đèn Lồng Lớn khi đủ đom đóm', () => {
    const game = new GameState({
      player: { x: 0, z: 0, speed: 1 },
      fireflies: [
        { id: 'f1', x: 1, z: 0, collected: false },
        { id: 'f2', x: 2, z: 0, collected: false }
      ],
      lanterns: [{ id: 'L1', x: 2, z: 0, required: 2, isLit: false }]
    });

    game.step({ type: 'MOVE', dx: 1, dz: 0 }); // Nhặt f1
    game.step({ type: 'MOVE', dx: 1, dz: 0 }); // Nhặt f2
    assert.equal(game.player.firefliesInBasket, 2);

    const lightRes = game.lightLantern();
    assert.equal(lightRes.success, true);
    assert.equal(game.player.firefliesInBasket, 0);
    assert.equal(game.lanterns[0].isLit, true);
  });

  test('Tính tất định (Determinism): Cùng kịch bản đầu vào cho kết quả giống hệt nhau', () => {
    const scenario = [
      { type: 'MOVE', dx: 1, dz: 1 },
      { type: 'MOVE', dx: -1, dz: 0 },
      { type: 'WAIT' },
      { type: 'LIGHT' }
    ];

    const game1 = new GameState();
    const game2 = new GameState();

    const res1 = game1.runScenario(scenario);
    const res2 = game2.runScenario(scenario);

    assert.deepEqual(res1, res2);
  });
});
