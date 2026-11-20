/**
 * GameState: Core logic cho Đảo Đèn Lồng
 * Độc lập hoàn toàn với DOM / WebGL, hỗ trợ chạy Headless Test Contract
 */

export class GameState {
  constructor(config = {}) {
    this.tick = 0;
    this.player = {
      name: 'May',
      x: config.player?.x ?? 0,
      y: 0,
      z: config.player?.z ?? 0,
      speed: config.player?.speed ?? 1.0,
      firefliesInBasket: 0,
      collectionRadius: config.player?.collectionRadius ?? 1.8
    };

    this.fireflies = (config.fireflies ?? [
      { id: 'f1', x: 2, z: 2, collected: false },
      { id: 'f2', x: -3, z: 3, collected: false },
      { id: 'f3', x: 4, z: -2, collected: false },
      { id: 'f4', x: -4, z: -3, collected: false }
    ]).map(f => ({ ...f }));

    this.lanterns = (config.lanterns ?? [
      { id: 'L1', x: 0, z: 5, required: 2, isLit: false },
      { id: 'L2', x: 0, z: -5, required: 2, isLit: false }
    ]).map(l => ({ ...l }));

    this.islandRadius = config.islandRadius ?? 15;
    this.logs = [];
  }

  // Di chuyển nhân vật
  move(dx, dz) {
    const len = Math.hypot(dx, dz);
    let nextX = this.player.x;
    let nextZ = this.player.z;

    if (len > 0) {
      nextX += (dx / len) * this.player.speed;
      nextZ += (dz / len) * this.player.speed;
    }

    // Giới hạn trong bán kính đảo
    const distFromCenter = Math.hypot(nextX, nextZ);
    if (distFromCenter <= this.islandRadius) {
      this.player.x = Number(nextX.toFixed(3));
      this.player.z = Number(nextZ.toFixed(3));
    }
    
    // Tự động gom đom đóm lân cận khi di chuyển qua
    this.checkAutoCollect();
  }

  // Thu gom đom đóm xung quanh
  checkAutoCollect() {
    let collectedCount = 0;
    for (const f of this.fireflies) {
      if (!f.collected) {
        const d = Math.hypot(f.x - this.player.x, f.z - this.player.z);
        if (d <= this.player.collectionRadius) {
          f.collected = true;
          this.player.firefliesInBasket += 1;
          collectedCount++;
          this.logs.push(`[Tick ${this.tick}] May thu thap dom dom ${f.id}`);
        }
      }
    }
    return collectedCount;
  }

  // Thắp Đèn Lồng gần nhất
  lightLantern() {
    for (const lantern of this.lanterns) {
      if (!lantern.isLit) {
        const d = Math.hypot(lantern.x - this.player.x, lantern.z - this.player.z);
        if (d <= 2.5) {
          if (this.player.firefliesInBasket >= lantern.required) {
            this.player.firefliesInBasket -= lantern.required;
            lantern.isLit = true;
            this.logs.push(`[Tick ${this.tick}] May da thap sang Den Long ${lantern.id}`);
            return { success: true, lanternId: lantern.id };
          } else {
            return { success: false, reason: 'NOT_ENOUGH_FIREFLIES' };
          }
        }
      }
    }
    return { success: false, reason: 'NO_LANTERN_IN_RANGE' };
  }

  // Thực thi 1 bước hành động (Action Step)
  step(action = {}) {
    this.tick += 1;
    const { type, dx = 0, dz = 0 } = action;

    switch (type) {
      case 'MOVE':
        this.move(dx, dz);
        break;
      case 'LIGHT':
        this.lightLantern();
        break;
      case 'WAIT':
      default:
        break;
    }

    return this.getSnapshot();
  }

  // Chạy một chuỗi kịch bản hành động (Scenario Runner)
  runScenario(actions = []) {
    for (const act of actions) {
      this.step(act);
    }
    return this.getSnapshot();
  }

  // Trích xuất trạng thái hiện tại (Snapshot format cho Test Contract)
  getSnapshot() {
    return {
      tick: this.tick,
      player: {
        x: this.player.x,
        z: this.player.z,
        fireflies: this.player.firefliesInBasket
      },
      litLanternsCount: this.lanterns.filter(l => l.isLit).length,
      totalLanterns: this.lanterns.length,
      allLanternsLit: this.lanterns.every(l => l.isLit),
      remainingFireflies: this.fireflies.filter(f => !f.collected).length
    };
  }
}
