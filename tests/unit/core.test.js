import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../../src/core/gameState.js';

// ============================================================================
// PHASE 1 & 2 REGRESSION TESTS (Đã cập nhật theo Breaking Changes Contract v1.2)
// ============================================================================

test('Phase 1 Regression - Khởi tạo mặc định Đêm 1 theo chuẩn v1.2', () => {
  const game = new GameState({ seed: 42, night: 1 });
  const snapshot = game.getSnapshot(0);

  assert.equal(snapshot.night, 1);
  assert.equal(snapshot.state, 'playing');
  assert.equal(snapshot.player.flames, 3);
  assert.equal(snapshot.player.carried, 0);
  assert.equal(snapshot.player.capacity, 10, 'Sức chứa ban đầu là 10');
  assert.equal(snapshot.lanterns.length, 5, 'Đêm 1 có đúng 5 lồng đèn L1..L5');
  assert.equal(snapshot.lanterns.every(l => !l.lit), true);
  // [LÝ DO CẬP NHẬT TICKET-03]: Thời gian Đêm 1 được rút ngắn từ 300s xuống 240s
  assert.equal(game.getTimeLeft(), 240, 'Thời gian đêm 1 theo chuẩn v1.2 là 240 giây');
});

test('Phase 1 Regression - Determinism cùng seed cho kết quả giống hệt nhau', () => {
  const game1 = new GameState({ seed: 100, night: 1 });
  const game2 = new GameState({ seed: 100, night: 1 });

  for (let i = 0; i < 60; i++) {
    const input = { x: 0.5, z: 0.5, cam_yaw_deg: 45, interact: false, pulse: false, dash: false, jump: false };
    game1.step(input);
    game2.step(input);
  }

  const snap1 = game1.getSnapshot();
  const snap2 = game2.getSnapshot();

  assert.deepEqual(snap1.player.pos, snap2.player.pos);
  assert.equal(snap1.score, snap2.score);
  assert.deepEqual(snap1.player.vel, snap2.player.vel);
});

test('Phase 2 Regression - Cơ chế Nhảy (Jump) và Trọng Lực (Gravity)', () => {
  const game = new GameState({ seed: 1 });
  assert.equal(game.player.grounded, true);

  game.step({ jump: true });
  assert.equal(game.player.grounded, false);
  assert.ok(game.player.vel[1] > 0);
  assert.ok(game.player.pos[1] > 0);

  for (let i = 0; i < 30; i++) {
    game.step({ jump: false });
  }
  assert.ok(game.player.vel[1] < 7.0);
});

test('Phase 2 Regression - Kỹ năng Lướt (Dash) đạt 14 m/s trong 12 ticks và hồi chiêu 1.5s', () => {
  const game = new GameState({ seed: 1 });
  const events = game.step({ z: 1, dash: true });

  const dashEvent = events.find(e => e.name === 'dash');
  assert.ok(dashEvent);
  assert.ok(game.dash_ticks_left > 0);

  for (let i = 0; i < 11; i++) {
    game.step({ z: 1, dash: false });
  }

  assert.ok(game.player.pos[2] >= 2.7);
  assert.equal(game.dash_ticks_left, 0);
  assert.ok(game.dash_cd_ticks > 0);
});

test('Phase 2 Regression - Bùa Gió (Charms) tăng tốc và miễn hồi chiêu Lướt', () => {
  const scenario = {
    player: { pos: [0, 0, 0], flames: 3, carried: 0 },
    charms: [{ id: 'C1', pos: [0.5, 0, 0], available: true }]
  };

  const game = new GameState({ scenario });
  const events = game.step({});

  assert.ok(events.some(e => e.name === 'charm_picked'));
  assert.equal(game.charm_ticks, 600);

  game.step({ z: 1, dash: true });
  assert.equal(game.dash_cd_ticks, 0);
});

test('Phase 2 Regression - Gió Lạc (Drifter) cướp đom đóm và nhả lại khi trúng Pulse', () => {
  const scenario = {
    player: { pos: [0, 0, 0], flames: 3, carried: 6 },
    drifters: [{ id: 'D1', pos: [1.0, 0, 0], state: 'chase', stolen: 0 }]
  };

  const game = new GameState({ scenario });
  const events = game.step({});

  const stealEvent = events.find(e => e.name === 'drifter_steal');
  assert.ok(stealEvent);
  assert.equal(stealEvent.data.amount, 3);
  assert.equal(game.player.carried, 3);

  const pulseEvents = game.step({ pulse: true });
  const dropEvent = pulseEvents.find(e => e.name === 'drifter_drop');
  assert.ok(dropEvent);
  assert.equal(dropEvent.data.amount, 3);
});

test('Phase 2 Regression - Bục Nhảy (Jump pads) Đêm 2 phóng người chơi sang đảo đối diện', () => {
  const game = new GameState({ seed: 1, night: 2 });
  game.player.pos = [20, 0, 18];
  game.player.grounded = true;

  game.step({});

  assert.equal(game.player.in_pad_flight, true);
  assert.equal(game.player.grounded, false);
  assert.equal(game.player.vel[1], 14.0);
  assert.ok(game.player.pad_vel[0] > 0);
});

test('Phase 2 Regression - Rơi khỏi đảo (Y < -10) trừ 1 lửa, mất sạch đom đóm và hồi sinh', () => {
  const scenario = {
    player: { pos: [100, -11, 100], flames: 3, carried: 8 },
    lanterns: []
  };

  const game = new GameState({ scenario });
  const events = game.step({});

  const hitEvent = events.find(e => e.name === 'player_hit' && e.data.by === 'fall');
  assert.ok(hitEvent);
  assert.equal(hitEvent.data.dropped, 8);
  assert.equal(hitEvent.data.lost, true);
  assert.equal(game.player.flames, 2);
  assert.equal(game.fall_wait_ticks, 60);

  for (let i = 0; i < 60; i++) {
    game.step({});
  }

  assert.deepEqual(game.player.pos, [0, 0, 0]);
  assert.ok(game.invuln_ticks > 0);
});

test('Phase 2 Regression - Tạm dừng (Pause) đóng băng logic game', () => {
  const game = new GameState({ seed: 1 });
  const events = game.step({ pause: true });

  assert.ok(events.some(e => e.name === 'paused'));
  assert.equal(game.state, 'paused');

  const simBefore = game.sim_ticks;
  game.step({ x: 1, z: 1 });
  assert.equal(game.sim_ticks, simBefore);
  assert.deepEqual(game.player.pos, [0, 0, 0]);

  const resumeEvents = game.step({ pause: true });
  assert.ok(resumeEvents.some(e => e.name === 'resumed'));
  assert.equal(game.state, 'playing');
});

// ============================================================================
// PHASE 3 (TICKET-03) NEW TESTS - FUEL & DAWN SURVIVAL RULES
// ============================================================================

test('Phase 3 - Nhiên liệu đèn: Tự tiêu hao 1.0/s và tắt khi fuel <= 0 (lantern_out)', () => {
  const scenario = {
    player: { pos: [10, 0, 0], flames: 3, carried: 0 },
    lanterns: [
      // Đèn đang sáng với fuel = 0.5 (chỉ còn tồn tại 30 ticks)
      { id: 'L1', pos: [0, 0, 0], lit: true, fuel: 0.5 }
    ]
  };

  const game = new GameState({ scenario });
  assert.equal(game.lanterns[0].lit, true);

  // Chạy 35 ticks (vượt quá 30 ticks = 0.5s)
  let outEvent = null;
  for (let i = 0; i < 35; i++) {
    const evs = game.step({});
    const found = evs.find(e => e.name === 'lantern_out');
    if (found) outEvent = found;
  }

  assert.ok(outEvent, 'Phải phát ra sự kiện lantern_out khi hết dầu');
  assert.equal(outEvent.data.lantern_id, 'L1');
  assert.equal(game.lanterns[0].lit, false, 'Đèn phải tắt');
  assert.equal(game.lanterns[0].ever_lit, true, 'Đèn phải nhớ trạng thái ever_lit = true');
  assert.equal(game.lanterns[0].fuel, 0);
});

test('Phase 3 - Châm dầu (Refuel): Nạp đom đóm vào đèn đang sáng chưa đầy dầu', () => {
  const scenario = {
    player: { pos: [1.0, 0, 0], flames: 3, carried: 4 }, // trong bán kính 2.0m
    lanterns: [
      { id: 'L1', pos: [0, 0, 0], lit: true, fuel: 75 } // thiếu 25 fuel -> cần ceil(25/10) = 3 đom đóm
    ]
  };

  const game = new GameState({ scenario });
  const events = game.step({ interact: true });

  const refuelEvent = events.find(e => e.name === 'refuel');
  assert.ok(refuelEvent, 'Phải phát ra sự kiện refuel');
  assert.equal(refuelEvent.data.amount, 3, 'Châm 3 đom đóm (3 * 10 = 30 fuel)');
  assert.equal(game.player.carried, 1, 'Người chơi còn 1 đom đóm (4 - 3 = 1)');
  assert.equal(game.lanterns[0].fuel, 100, 'Đèn được làm đầy lên 100');
  assert.equal(game.score, 15, 'Mỗi đom đóm nạp được +5 điểm (3 * 5 = 15)');
});

test('Phase 3 - Thắp lại (Relight): Đèn đã từng sáng thắp lại chỉ tốn 5 đom đóm', () => {
  const scenario = {
    player: { pos: [1.0, 0, 0], flames: 3, carried: 5 },
    lanterns: [
      { id: 'L1', pos: [0, 0, 0], lit: false, ever_lit: true, deposited: 0 }
    ]
  };

  const game = new GameState({ scenario });
  const events = game.step({ interact: true });

  const litEvent = events.find(e => e.name === 'lantern_lit');
  assert.ok(litEvent, 'Phải thắp sáng lại đèn');
  assert.equal(litEvent.data.relight, true, 'relight phải là true');
  assert.equal(game.player.carried, 0, 'Đã dùng đúng 5 đom đóm');
  assert.equal(game.lanterns[0].lit, true);
  assert.equal(game.lanterns[0].fuel, 100);
  assert.equal(game.lanterns[0].relit_count, 1);
  assert.equal(game.score, 65, '5 đom đóm nạp (+25) + thắp lại (+40) = 65 điểm');
});

test('Phase 3 - Sức chứa tăng dần (Capacity Progression): 10 + 2 * successful_lights (max 20)', () => {
  const game = new GameState({ seed: 1 });
  assert.equal(game.getPlayerCapacity(), 10, 'Sức chứa ban đầu là 10');

  game.successful_lights = 3;
  assert.equal(game.getPlayerCapacity(), 16, 'Thắp 3 lần sức chứa là 10 + 2*3 = 16');

  game.successful_lights = 8;
  assert.equal(game.getPlayerCapacity(), 20, 'Sức chứa đạt trần tối đa là 20');
});

test('Phase 3 - Bóng Mực hút dầu (Drain) khi fuel < 30 và thưởng +15 điểm khi bị Tỏa Sáng', () => {
  const scenario = {
    player: { pos: [2.0, 0, 0], flames: 3, carried: 3 },
    lanterns: [
      { id: 'L1', pos: [0, 0, 0], lit: true, fuel: 25 } // fuel < 30 mất safe zone
    ],
    shades: [
      { id: 'S1', pos: [1.0, 0, 0], state: 'drain', target_lantern_id: 'L1' }
    ]
  };

  const game = new GameState({ scenario });
  // Kiểm tra mất safe zone: người chơi ở (2,0,0) gần đèn fuel=25 nhưng không an toàn
  assert.equal(game.isPlayerInSafeZone(), false, 'Đèn fuel < 30 không có vùng an toàn');

  // Kích hoạt Pulse trúng Bóng Mực đang drain
  const events = game.step({ pulse: true });
  const shade = game.shades.find(s => s.id === 'S1');
  assert.equal(shade.state, 'stunned');
  assert.equal(game.score, 15, 'Làm choáng Bóng Mực đang drain được cộng +15 điểm');
});

test('Phase 3 - Luật thắng mới: Sống sót tới bình minh (dawn_survived) với >= 60% đèn sáng', () => {
  const scenario = {
    player: { pos: [0, 0, 0], flames: 3, carried: 0 },
    lanterns: [
      { id: 'L1', pos: [5, 0, 0], lit: true, fuel: 80 },
      { id: 'L2', pos: [10, 0, 0], lit: true, fuel: 60 },
      { id: 'L3', pos: [15, 0, 0], lit: true, fuel: 40 },
      { id: 'L4', pos: [20, 0, 0], lit: false, fuel: 0 },
      { id: 'L5', pos: [25, 0, 0], lit: false, fuel: 0 }
    ]
  };

  const game = new GameState({ night: 1, scenario });
  // Tua thời gian tới tick cuối cùng của Đêm 1 (240s = 14400 ticks)
  game.sim_ticks = 14399;

  const events = game.step({});
  assert.equal(game.state, 'won');
  assert.equal(game.win_reason, 'dawn_survived');

  const winEvent = events.find(e => e.name === 'game_over');
  assert.ok(winEvent);
  assert.equal(winEvent.data.result, 'won');
  assert.equal(winEvent.data.reason, 'dawn_survived');
  // Điểm tính tại bình minh (sau khi trừ 1/60 fuel decay ở tick cuối):
  // L1 fuel = 79.98 (floor = 79), L2 fuel = 59.98 (floor = 59), L3 fuel = 39.98 (floor = 39)
  // 3 đèn sáng (3*50 + 79 + 59 + 39 = 327) + 3 ngọn lửa (3*50 = 150) = 477 điểm
  assert.equal(game.score, 477);
});

test('Phase 3 - Headless Scenarios nạp và chạy thành công không crash', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');

  const scenarioFiles = [
    'scenario_jump_dash.json',
    'scenario_drifter.json',
    'scenario_charm.json',
    'scenario_jump_pad.json',
    'scenario_fall.json'
  ];

  for (const f of scenarioFiles) {
    const raw = fs.readFileSync(path.resolve(process.cwd(), 'src/headless/scenarios', f), 'utf8');
    const sc = JSON.parse(raw);
    const game = new GameState({ scenario: sc });
    const ev = game.step({});
    assert.ok(Array.isArray(ev));
  }
});
