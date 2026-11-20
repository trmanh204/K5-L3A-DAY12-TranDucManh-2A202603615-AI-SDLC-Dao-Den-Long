import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../../src/core/gameState.js';

test('Phase 1 Regression - Khởi tạo mặc định Đêm 1 theo chuẩn v1.1', () => {
  const game = new GameState({ seed: 42, night: 1 });
  const snapshot = game.getSnapshot(0);

  assert.equal(snapshot.night, 1);
  assert.equal(snapshot.state, 'playing');
  assert.equal(snapshot.player.flames, 3);
  assert.equal(snapshot.player.carried, 0);
  assert.equal(snapshot.lanterns.length, 5, 'Đêm 1 có đúng 5 lồng đèn L1..L5');
  assert.equal(snapshot.lanterns.every(l => !l.lit), true);
  assert.equal(game.getTimeLeft(), 300, 'Thời gian đêm 1 là 300 giây');
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

test('Phase 2 - Cơ chế Nhảy (Jump) và Trọng Lực (Gravity)', () => {
  const game = new GameState({ seed: 1 });
  assert.equal(game.player.grounded, true);

  // Kích hoạt nhảy ở tick 1
  game.step({ jump: true });
  assert.equal(game.player.grounded, false, 'Khi nhảy nhân vật rời mặt đất');
  assert.ok(game.player.vel[1] > 0, 'Vận tốc Y dương (vy = 7.0)');
  assert.ok(game.player.pos[1] > 0, 'Độ cao Y tăng lên');

  // Cho mô phỏng rơi tự do qua đỉnh điểm
  for (let i = 0; i < 30; i++) {
    game.step({ jump: false });
  }
  // Vận tốc phải giảm dần do trọng lực -20 m/s²
  assert.ok(game.player.vel[1] < 7.0);
});

test('Phase 2 - Kỹ năng Lướt (Dash) đạt tốc độ 14 m/s trong 12 ticks và hồi chiêu 1.5s', () => {
  const game = new GameState({ seed: 1 });
  // Kích hoạt lướt theo hướng tiến (+Z)
  const events = game.step({ z: 1, dash: true });

  const dashEvent = events.find(e => e.name === 'dash');
  assert.ok(dashEvent, 'Phải phát ra sự kiện dash');
  assert.ok(game.dash_ticks_left > 0, 'Đang trong trạng thái lướt');

  // Lướt thêm 11 ticks để hết 12 ticks lướt
  for (let i = 0; i < 11; i++) {
    game.step({ z: 1, dash: false });
  }

  // Quãng đường lướt 12 ticks (0.2s) ở 14m/s = 2.8m
  assert.ok(game.player.pos[2] >= 2.7, 'Lướt được khoảng 2.8m');
  assert.equal(game.dash_ticks_left, 0, 'Hết thời gian lướt');
  assert.ok(game.dash_cd_ticks > 0, 'Bắt đầu đếm hồi chiêu 90 ticks');
});

test('Phase 2 - Bùa Gió (Charms) tăng tốc lên 7.2 m/s và miễn hồi chiêu Lướt', () => {
  const scenario = {
    player: { pos: [0, 0, 0], flames: 3, carried: 0 },
    charms: [
      { id: 'C1', pos: [0.5, 0, 0], available: true }
    ]
  };

  const game = new GameState({ scenario });
  const events = game.step({});

  const charmEvent = events.find(e => e.name === 'charm_picked');
  assert.ok(charmEvent, 'Phải nhặt được bùa gió');
  assert.equal(game.charm_ticks, 600, 'Hiệu lực 600 ticks');

  // Thử lướt khi có bùa gió
  game.step({ z: 1, dash: true });
  assert.equal(game.dash_cd_ticks, 0, 'Không bị thời gian hồi chiêu khi có bùa');
});

test('Phase 2 - Gió Lạc (Drifter) cướp đom đóm và nhả lại khi trúng Pulse', () => {
  const scenario = {
    player: { pos: [0, 0, 0], flames: 3, carried: 6 },
    drifters: [
      { id: 'D1', pos: [1.0, 0, 0], state: 'chase', stolen: 0 }
    ]
  };

  const game = new GameState({ scenario });
  const events = game.step({});

  // Drifter cướp 3 đom đóm
  const stealEvent = events.find(e => e.name === 'drifter_steal');
  assert.ok(stealEvent, 'Phải có sự kiện drifter_steal');
  assert.equal(stealEvent.data.amount, 3);
  assert.equal(game.player.carried, 3, 'Người chơi còn 3 đom đóm');

  const drifter = game.drifters.find(d => d.id === 'D1');
  assert.equal(drifter.state, 'flee', 'Sau khi cướp chuyển sang flee');
  assert.equal(drifter.stolen, 3);

  // Kích hoạt Pulse trúng drifter đang flee có mang đồ
  const pulseEvents = game.step({ pulse: true });
  const dropEvent = pulseEvents.find(e => e.name === 'drifter_drop');
  assert.ok(dropEvent, 'Gió Lạc phải thả đom đóm rơi khi bị Pulse');
  assert.equal(dropEvent.data.amount, 3);
  assert.equal(drifter.stolen, 0);
});

test('Phase 2 - Bục Nhảy (Jump pads) Đêm 2 phóng người chơi sang đảo đối diện', () => {
  const game = new GameState({ seed: 1, night: 2 });
  // Đặt người chơi tại bục nhảy 1: [20, 0, 18]
  game.player.pos = [20, 0, 18];
  game.player.grounded = true;

  game.step({});

  assert.equal(game.player.in_pad_flight, true, 'Kích hoạt trạng thái bay trên bục nhảy');
  assert.equal(game.player.grounded, false);
  assert.equal(game.player.vel[1], 14.0, 'Vận tốc thẳng đứng 14 m/s');
  assert.ok(game.player.pad_vel[0] > 0, 'Vận tốc ngang hướng về đảo B (X dương)');
});

test('Phase 2 - Rơi khỏi đảo (Y < -10) trừ 1 lửa, mất sạch đom đóm và hồi sinh sau 60 ticks', () => {
  const scenario = {
    player: { pos: [100, -11, 100], flames: 3, carried: 8 }, // Ngoài đảo và rơi sâu Y < -10
    lanterns: []
  };

  const game = new GameState({ scenario });
  const events = game.step({});

  const hitEvent = events.find(e => e.name === 'player_hit' && e.data.by === 'fall');
  assert.ok(hitEvent, 'Phải phát ra sự kiện player_hit do rơi');
  assert.equal(hitEvent.data.dropped, 8, 'Mất toàn bộ đom đóm đang mang');
  assert.equal(hitEvent.data.lost, true);
  assert.equal(game.player.flames, 2, 'Ngọn lửa giảm còn 2');
  assert.equal(game.fall_wait_ticks, 60, 'Chờ 60 ticks hồi sinh');

  // Chờ 60 ticks
  for (let i = 0; i < 60; i++) {
    game.step({});
  }

  assert.deepEqual(game.player.pos, [0, 0, 0], 'Đã hồi sinh tại điểm xuất phát (0,0,0)');
  assert.ok(game.invuln_ticks > 0, 'Nhận bất tử 90 ticks sau khi hồi sinh');
});

test('Phase 2 - Tạm dừng (Pause) đóng băng logic game và snapshot có state: paused', () => {
  const game = new GameState({ seed: 1 });
  const events = game.step({ pause: true });

  const pausedEvent = events.find(e => e.name === 'paused');
  assert.ok(pausedEvent, 'Phải phát ra sự kiện paused');
  assert.equal(game.state, 'paused');

  const snap = game.getSnapshot();
  assert.equal(snap.state, 'paused');

  // Trong lúc pause, sim_ticks không đổi
  const simBefore = game.sim_ticks;
  game.step({ x: 1, z: 1 });
  assert.equal(game.sim_ticks, simBefore, 'sim_ticks không được tăng khi pause');
  assert.deepEqual(game.player.pos, [0, 0, 0], 'Nhân vật không di chuyển khi pause');

  // Resume lại
  const resumeEvents = game.step({ pause: true });
  assert.ok(resumeEvents.some(e => e.name === 'resumed'));
  assert.equal(game.state, 'playing');
});

test('Phase 2 - Đêm 2 có 6 lồng đèn và Đêm 3 có 7 lồng đèn', () => {
  const g2 = new GameState({ night: 2 });
  assert.equal(g2.lanterns.length, 6);
  assert.equal(g2.getTimeLeft(), 330);

  const g3 = new GameState({ night: 3 });
  assert.equal(g3.lanterns.length, 7);
  assert.equal(g3.getTimeLeft(), 360);
});
