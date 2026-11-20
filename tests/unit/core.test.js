import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState, createRNG } from '../../src/core/gameState.js';

test('GameState - Khởi tạo mặc định đúng contract Phase 1', () => {
  const game = new GameState({ seed: 42 });
  const snapshot = game.getSnapshot(0);

  assert.equal(snapshot.state, 'playing');
  assert.equal(snapshot.player.flames, 3);
  assert.equal(snapshot.player.carried, 0);
  assert.equal(snapshot.lanterns.length, 5, 'Phải có đúng 5 lồng đèn L1..L5');
  assert.equal(snapshot.lanterns.every(l => !l.lit), true, 'Tất cả đèn ban đầu chưa thắp');
  assert.equal(snapshot.shades.length, 3, 'Khởi tạo 3 Bóng Mực');
  assert.equal(game.getTimeLeft(), 420, 'Thời gian đêm 1 là 420 giây');
});

test('GameState - Determinism: Cùng seed và input cho kết quả giống hệt nhau', () => {
  const game1 = new GameState({ seed: 100 });
  const game2 = new GameState({ seed: 100 });

  for (let i = 0; i < 60; i++) {
    const input = { x: 0.5, z: 0.5, cam_yaw_deg: 45, interact: false, pulse: false };
    game1.step(input);
    game2.step(input);
  }

  const snap1 = game1.getSnapshot();
  const snap2 = game2.getSnapshot();

  assert.deepEqual(snap1.player.pos, snap2.player.pos);
  assert.equal(snap1.score, snap2.score);
  assert.deepEqual(snap1.shades, snap2.shades);
});

test('GameState - Góc quay camera yaw chuẩn hóa vector di chuyển', () => {
  const game = new GameState({ seed: 1 });
  // Di chuyển thẳng về phía trước (z = 1) với cam_yaw_deg = 90 độ (quay sang phải)
  // x' = x*cos(90) + z*sin(90) = 1
  // z' = -x*sin(90) + z*cos(90) = 0
  game.step({ x: 0, z: 1, cam_yaw_deg: 90 });
  
  assert.ok(game.player.pos[0] > 0, 'Nhân vật phải di chuyển theo trục X dương');
  assert.ok(Math.abs(game.player.pos[2]) < 0.0001, 'Tọa độ Z phải xấp xỉ 0');
});

test('GameState - Nhặt đom đóm tăng carried và điểm, tối đa 6', () => {
  const scenario = {
    player: { pos: [0, 0, 0], flames: 3, carried: 0 },
    motes: [
      { id: 'M1', pos: [0.5, 0, 0] },
      { id: 'M2', pos: [0.8, 0, 0] },
      { id: 'M3', pos: [1.0, 0, 0] },
      { id: 'M4', pos: [1.2, 0, 0] },
      { id: 'M5', pos: [1.3, 0, 0] },
      { id: 'M6', pos: [1.4, 0, 0] },
      { id: 'M7', pos: [1.45, 0, 0] }
    ]
  };

  const game = new GameState({ scenario });
  const events = game.step({ x: 0, z: 0 });

  assert.equal(game.player.carried, 6, 'Chỉ mang tối đa 6 đom đóm');
  assert.equal(game.score, 60, 'Mỗi đom đóm nhặt được cộng 10 điểm');
  assert.equal(events.filter(e => e.name === 'mote_picked').length, 6);
});

test('GameState - Nạp đom đóm vào lồng đèn và thắp sáng khi đủ 6', () => {
  const scenario = {
    player: { pos: [0, 0, 0], flames: 3, carried: 6 },
    lanterns: [
      { id: 'L1', pos: [1.5, 0, 0], lit: false, deposited: 0 }
    ],
    shades: []
  };

  const game = new GameState({ scenario });
  // Tick 1: trigger interact (false -> true)
  const events = game.step({ interact: true });

  const l1 = game.lanterns.find(l => l.id === 'L1');
  assert.equal(l1.deposited, 6, 'Đèn L1 phải nhận đủ 6 đom đóm');
  assert.equal(l1.lit, true, 'Đèn L1 phải được thắp sáng');
  assert.equal(game.player.carried, 0, 'Người chơi đã nạp hết đom đóm');
  assert.ok(events.some(e => e.name === 'deposit'));
  assert.ok(events.some(e => e.name === 'lantern_lit'));
});

test('GameState - Thắp đủ 5 đèn kích hoạt Win game và tính điểm', () => {
  const scenario = {
    player: { pos: [0, 0, 0], flames: 3, carried: 6 },
    lanterns: [
      { id: 'L1', pos: [1, 0, 0], lit: true, deposited: 6 },
      { id: 'L2', pos: [2, 0, 0], lit: true, deposited: 6 },
      { id: 'L3', pos: [3, 0, 0], lit: true, deposited: 6 },
      { id: 'L4', pos: [4, 0, 0], lit: true, deposited: 6 },
      { id: 'L5', pos: [1, 0, 0], lit: false, deposited: 0 }
    ],
    shades: []
  };

  const game = new GameState({ scenario });
  const events = game.step({ interact: true });

  assert.equal(game.state, 'won');
  const winEvent = events.find(e => e.name === 'game_over');
  assert.ok(winEvent);
  assert.equal(winEvent.data.result, 'won');
  assert.equal(winEvent.data.reason, 'all_lit');
  assert.ok(game.score > 500, 'Điểm phải bao gồm thưởng thời gian và ngọn lửa');
});

test('GameState - Bóng Mực tấn công làm giảm ngọn lửa và rơi đom đóm', () => {
  const scenario = {
    player: { pos: [0, 0, 0], flames: 3, carried: 4 },
    lanterns: [],
    shades: [
      { id: 'S1', pos: [1.0, 0, 0], state: 'chase' }
    ]
  };

  const game = new GameState({ scenario });
  const events = game.step({ x: 0, z: 0 });

  const hitEvent = events.find(e => e.name === 'player_hit');
  assert.ok(hitEvent, 'Phải có sự kiện player_hit');
  assert.equal(game.player.flames, 2, 'Ngọn lửa giảm còn 2');
  assert.equal(hitEvent.data.dropped, 2, 'Rơi 50% số đom đóm (4 * 0.5 = 2)');
  assert.equal(game.player.carried, 2, 'Người chơi còn 2 đom đóm');
  assert.ok(game.invuln_timer > 0, 'Phải được kích hoạt bất tử tạm thời');
});

test('GameState - Kỹ năng Tỏa sáng (Pulse) làm choáng và đẩy lùi Bóng Mực', () => {
  const scenario = {
    player: { pos: [0, 0, 0], flames: 3, carried: 3 },
    lanterns: [],
    shades: [
      { id: 'S1', pos: [3.0, 0, 0], state: 'chase' }
    ]
  };

  const game = new GameState({ scenario });
  const events = game.step({ pulse: true });

  const pulseEvent = events.find(e => e.name === 'pulse');
  assert.ok(pulseEvent, 'Phải phát ra sự kiện pulse');
  assert.deepEqual(pulseEvent.data.stunned_ids, ['S1']);
  assert.equal(game.player.carried, 1, 'Tốn 2 đom đóm (3 - 2 = 1)');
  
  const shade = game.shades.find(s => s.id === 'S1');
  assert.equal(shade.state, 'stunned');
  assert.ok(shade.pos[0] >= 7.0, 'Bóng mực phải bị đẩy lùi ra xa ít nhất 4.5m');
  assert.equal(game.score, 5, 'Được cộng 5 điểm khi làm choáng bóng mực');
});

test('GameState - Vùng an toàn 8m quanh lồng đèn sáng bảo vệ người chơi', () => {
  const scenario = {
    player: { pos: [0, 0, 0], flames: 3, carried: 0 },
    lanterns: [
      { id: 'L1', pos: [2, 0, 0], lit: true, deposited: 6 }
    ],
    shades: [
      { id: 'S1', pos: [6, 0, 0], state: 'wander' }
    ]
  };

  const game = new GameState({ scenario });
  assert.equal(game.isPlayerInSafeZone(), true);

  game.step({ x: 0, z: 0 });
  const shade = game.shades.find(s => s.id === 'S1');
  // Khi người chơi trong vùng an toàn, shade không được chuyển sang trạng thái chase
  assert.notEqual(shade.state, 'chase');
});
