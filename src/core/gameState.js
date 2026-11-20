/**
 * Đảo Đèn Lồng - Core Game State & Simulation Logic
 * Test Contract v1.0 Compliant
 * 
 * Strict Separation: Pure JavaScript, NO Three.js or DOM references.
 */

// Deterministic Pseudo-Random Number Generator (Mulberry32)
export function createRNG(seed = 1) {
  let s = Math.floor(seed) >>> 0;
  return function next() {
    s |= 0;
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const DEFAULT_TUNING = {
  player_speed: 5.8,
  carry_capacity: 6,
  lantern_cost: 6,
  lantern_count_night1: 5,
  pickup_radius: 1.5,
  interact_radius: 3.0,
  pulse_cost: 2,
  pulse_radius: 6.5,
  night1_duration_s: 420,
  flames: 3,
  invuln_s: 1.6,
  hit_drop_ratio: 0.5,
  pulse_stun_s: 2.6,
  pulse_push_m: 4.5,
  pulse_cooldown_s: 2.8,
  safe_radius: 8.0,
  shade_speed: 3.4,
  shade_hit_radius: 1.4,
  fall_enabled: false,
  score: {
    per_mote: 10,
    per_lantern: 100,
    per_stun: 5,
    per_second_left: 2,
    per_flame_left: 50
  }
};

export class GameState {
  constructor(options = {}) {
    this.seed = options.seed !== undefined ? options.seed : 1;
    this.rng = createRNG(this.seed);
    this.tuning = { ...DEFAULT_TUNING, ...(options.tuning || {}) };

    this.sim_ticks = 0;
    this.state = "playing"; // "playing" | "won" | "lost"
    this.score = 0;
    this.win_reason = null;
    this.lost_reason = null;

    // Previous input state for edge detection (false -> true)
    this.prev_input = {
      interact: false,
      pulse: false,
      jump: false
    };

    // Cooldown and invulnerability timers (in seconds)
    this.invuln_timer = 0;
    this.pulse_cooldown_timer = 0;

    // Player State
    this.player = {
      pos: [0, 0, 0],
      flames: this.tuning.flames,
      carried: 0
    };

    // Entities
    this.lanterns = [];
    this.shades = [];
    this.motes = [];

    // Pending events emitted during the last step
    this.pending_events = [];

    // Initialize scenario or default procedural layout
    if (options.scenario) {
      this._loadScenario(options.scenario);
    } else {
      this._initDefaultNight1();
    }
  }

  _loadScenario(scenario) {
    if (scenario.player) {
      if (scenario.player.pos) this.player.pos = [...scenario.player.pos];
      if (scenario.player.flames !== undefined) this.player.flames = scenario.player.flames;
      if (scenario.player.carried !== undefined) this.player.carried = scenario.player.carried;
    }

    if (Array.isArray(scenario.lanterns)) {
      this.lanterns = scenario.lanterns.map(l => ({
        id: l.id,
        pos: [...l.pos],
        lit: !!l.lit,
        deposited: l.deposited || 0
      }));
    } else {
      this._initLanterns(this.tuning.lantern_count_night1);
    }

    if (Array.isArray(scenario.shades)) {
      this.shades = scenario.shades.map(s => ({
        id: s.id,
        pos: [...s.pos],
        state: s.state || "wander", // "chase" | "stunned" | "wander"
        stun_timer: s.stun_timer || 0,
        target_pos: s.target_pos || [...s.pos]
      }));
    } else {
      this._initShades(3);
    }

    if (Array.isArray(scenario.motes)) {
      this.motes = scenario.motes.map((m, idx) => ({
        id: m.id || `M${idx + 1}`,
        pos: [...m.pos],
        active: m.active !== false
      }));
    } else {
      this._initMotes(25);
    }
  }

  _initDefaultNight1() {
    this._initLanterns(this.tuning.lantern_count_night1);
    this._initShades(3);
    this._initMotes(30);
  }

  _initLanterns(count) {
    this.lanterns = [];
    const radius = 24.0;
    for (let i = 0; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count;
      const x = Math.round(Math.cos(angle) * radius * 10) / 10;
      const z = Math.round(Math.sin(angle) * radius * 10) / 10;
      this.lanterns.push({
        id: `L${i + 1}`,
        pos: [x, 0, z],
        lit: false,
        deposited: 0
      });
    }
  }

  _initShades(count) {
    this.shades = [];
    for (let i = 0; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count + Math.PI / 4;
      const dist = 18.0 + this.rng() * 10.0;
      const x = Math.round(Math.cos(angle) * dist * 10) / 10;
      const z = Math.round(Math.sin(angle) * dist * 10) / 10;
      const id = `S${i + 1}`;
      this.shades.push({
        id,
        pos: [x, 0, z],
        state: "wander",
        stun_timer: 0,
        target_pos: [x, 0, z]
      });
      this.pending_events.push({
        type: "event",
        tick: 0,
        name: "shade_spawned",
        data: { id }
      });
    }
  }

  _initMotes(count) {
    this.motes = [];
    for (let i = 0; i < count; i++) {
      const r = 5.0 + this.rng() * 26.0;
      const theta = this.rng() * 2 * Math.PI;
      const x = Math.round(Math.cos(theta) * r * 10) / 10;
      const z = Math.round(Math.sin(theta) * r * 10) / 10;
      this.motes.push({
        id: `M${i + 1}`,
        pos: [x, 0.5, z],
        active: true
      });
    }
  }

  getTimeLeft() {
    const elapsed_s = this.sim_ticks / 60.0;
    return Math.max(0, this.tuning.night1_duration_s - elapsed_s);
  }

  isPlayerInSafeZone() {
    for (const l of this.lanterns) {
      if (l.lit) {
        const dx = this.player.pos[0] - l.pos[0];
        const dz = this.player.pos[2] - l.pos[2];
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist <= this.tuning.safe_radius) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Advance simulation by 1 tick (1/60s).
   * @param {Object} input - tick input: {x, z, cam_yaw_deg, interact, pulse, jump}
   * @returns {Array} events produced during this tick (with tick = this.sim_ticks)
   */
  step(input = {}) {
    if (this.state !== "playing") {
      this.sim_ticks += 1;
      return [];
    }

    const currentTickEvents = [];
    const dt = 1 / 60.0;

    // Update timers
    if (this.invuln_timer > 0) {
      this.invuln_timer = Math.max(0, this.invuln_timer - dt);
    }
    if (this.pulse_cooldown_timer > 0) {
      this.pulse_cooldown_timer = Math.max(0, this.pulse_cooldown_timer - dt);
    }

    // 1. Movement Processing
    const rawX = Number(input.x || 0);
    const rawZ = Number(input.z || 0);
    const yawDeg = Number(input.cam_yaw_deg || 0);
    const theta = (yawDeg * Math.PI) / 180.0;

    let worldX = rawX * Math.cos(theta) + rawZ * Math.sin(theta);
    let worldZ = -rawX * Math.sin(theta) + rawZ * Math.cos(theta);

    const len = Math.sqrt(worldX * worldX + worldZ * worldZ);
    if (len > 1.0) {
      worldX /= len;
      worldZ /= len;
    }

    const moveStep = this.tuning.player_speed * dt;
    this.player.pos[0] += worldX * moveStep;
    this.player.pos[2] += worldZ * moveStep;

    // Edge-triggering inputs
    const currInteract = !!input.interact;
    const currPulse = !!input.pulse;
    const trigInteract = currInteract && !this.prev_input.interact;
    const trigPulse = currPulse && !this.prev_input.pulse;

    this.prev_input.interact = currInteract;
    this.prev_input.pulse = currPulse;
    this.prev_input.jump = !!input.jump;

    // 2. Pulse Skill Action
    if (trigPulse) {
      if (this.player.carried >= this.tuning.pulse_cost && this.pulse_cooldown_timer <= 0) {
        this.player.carried -= this.tuning.pulse_cost;
        this.pulse_cooldown_timer = this.tuning.pulse_cooldown_s;

        const stunned_ids = [];
        for (const shade of this.shades) {
          const dx = shade.pos[0] - this.player.pos[0];
          const dz = shade.pos[2] - this.player.pos[2];
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist <= this.tuning.pulse_radius) {
            shade.state = "stunned";
            shade.stun_timer = this.tuning.pulse_stun_s;
            stunned_ids.push(shade.id);
            this.score += this.tuning.score.per_stun;

            // Push shade away
            const pushDirX = dist > 0.001 ? dx / dist : 1.0;
            const pushDirZ = dist > 0.001 ? dz / dist : 0.0;
            shade.pos[0] += pushDirX * this.tuning.pulse_push_m;
            shade.pos[2] += pushDirZ * this.tuning.pulse_push_m;
          }
        }

        currentTickEvents.push({
          type: "event",
          tick: this.sim_ticks + 1,
          name: "pulse",
          data: { stunned_ids }
        });
      }
    }

    // 3. Mote Collection
    for (const mote of this.motes) {
      if (mote.active && this.player.carried < this.tuning.carry_capacity) {
        const dx = mote.pos[0] - this.player.pos[0];
        const dz = mote.pos[2] - this.player.pos[2];
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist <= this.tuning.pickup_radius) {
          mote.active = false;
          this.player.carried += 1;
          this.score += this.tuning.score.per_mote;

          currentTickEvents.push({
            type: "event",
            tick: this.sim_ticks + 1,
            name: "mote_picked",
            data: { carried: this.player.carried }
          });
        }
      }
    }

    // 4. Lantern Interaction (Deposit)
    if (trigInteract && this.player.carried > 0) {
      // Find nearest unlit lantern in range
      let nearestLantern = null;
      let minDist = Infinity;
      for (const lantern of this.lanterns) {
        if (!lantern.lit) {
          const dx = lantern.pos[0] - this.player.pos[0];
          const dz = lantern.pos[2] - this.player.pos[2];
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist <= this.tuning.interact_radius && dist < minDist) {
            minDist = dist;
            nearestLantern = lantern;
          }
        }
      }

      if (nearestLantern) {
        const needed = this.tuning.lantern_cost - nearestLantern.deposited;
        const depositAmount = Math.min(this.player.carried, needed);

        if (depositAmount > 0) {
          this.player.carried -= depositAmount;
          nearestLantern.deposited += depositAmount;

          currentTickEvents.push({
            type: "event",
            tick: this.sim_ticks + 1,
            name: "deposit",
            data: {
              lantern_id: nearestLantern.id,
              amount: depositAmount,
              deposited: nearestLantern.deposited
            }
          });

          if (nearestLantern.deposited >= this.tuning.lantern_cost) {
            nearestLantern.lit = true;
            this.score += this.tuning.score.per_lantern;

            currentTickEvents.push({
              type: "event",
              tick: this.sim_ticks + 1,
              name: "lantern_lit",
              data: { lantern_id: nearestLantern.id }
            });

            // Check Win Condition: All lanterns lit
            const allLit = this.lanterns.every(l => l.lit);
            if (allLit) {
              this.state = "won";
              this.win_reason = "all_lit";
              const timeLeft = Math.floor(this.getTimeLeft());
              this.score += timeLeft * this.tuning.score.per_second_left;
              this.score += this.player.flames * this.tuning.score.per_flame_left;

              currentTickEvents.push({
                type: "event",
                tick: this.sim_ticks + 1,
                name: "game_over",
                data: { result: "won", reason: "all_lit" }
              });
            }
          }
        }
      }
    }

    // 5. Shades AI & Collision
    const playerInSafeZone = this.isPlayerInSafeZone();
    for (const shade of this.shades) {
      if (shade.stun_timer > 0) {
        shade.stun_timer = Math.max(0, shade.stun_timer - dt);
        if (shade.stun_timer === 0) {
          shade.state = "wander";
        }
      } else {
        // AI State: Chase or Wander
        const dx = this.player.pos[0] - shade.pos[0];
        const dz = this.player.pos[2] - shade.pos[2];
        const distToPlayer = Math.sqrt(dx * dx + dz * dz);

        if (!playerInSafeZone && distToPlayer <= 16.0) {
          shade.state = "chase";
          // Move towards player
          if (distToPlayer > 0.001) {
            const stepM = this.tuning.shade_speed * dt;
            shade.pos[0] += (dx / distToPlayer) * stepM;
            shade.pos[2] += (dz / distToPlayer) * stepM;
          }
        } else {
          shade.state = "wander";
          // Wander randomly
          const tdx = shade.target_pos[0] - shade.pos[0];
          const tdz = shade.target_pos[2] - shade.pos[2];
          const tdist = Math.sqrt(tdx * tdx + tdz * tdz);
          if (tdist < 0.5) {
            // Pick new wander target
            const angle = this.rng() * 2 * Math.PI;
            const dist = 5.0 + this.rng() * 10.0;
            shade.target_pos = [
              shade.pos[0] + Math.cos(angle) * dist,
              0,
              shade.pos[2] + Math.sin(angle) * dist
            ];
          } else {
            const stepM = (this.tuning.shade_speed * 0.5) * dt;
            shade.pos[0] += (tdx / tdist) * stepM;
            shade.pos[2] += (tdz / tdist) * stepM;
          }
        }

        // Repel shades away from lit lanterns (Safe Zone enforcement)
        for (const l of this.lanterns) {
          if (l.lit) {
            const ldx = shade.pos[0] - l.pos[0];
            const ldz = shade.pos[2] - l.pos[2];
            const ldist = Math.sqrt(ldx * ldx + ldz * ldz);
            if (ldist < this.tuning.safe_radius && ldist > 0.001) {
              const repel = (this.tuning.safe_radius - ldist);
              shade.pos[0] += (ldx / ldist) * repel;
              shade.pos[2] += (ldz / ldist) * repel;
            }
          }
        }

        // Collision with player
        const hitDist = Math.sqrt(
          (shade.pos[0] - this.player.pos[0]) ** 2 +
          (shade.pos[2] - this.player.pos[2]) ** 2
        );

        if (hitDist <= this.tuning.shade_hit_radius && this.invuln_timer <= 0 && this.state === "playing") {
          this.player.flames -= 1;
          const dropped = Math.floor(this.player.carried * this.tuning.hit_drop_ratio);
          this.player.carried -= dropped;
          this.invuln_timer = this.tuning.invuln_s;

          currentTickEvents.push({
            type: "event",
            tick: this.sim_ticks + 1,
            name: "player_hit",
            data: {
              by: "shade",
              flames: this.player.flames,
              dropped
            }
          });

          if (this.player.flames <= 0) {
            this.state = "lost";
            this.lost_reason = "no_flames";

            currentTickEvents.push({
              type: "event",
              tick: this.sim_ticks + 1,
              name: "game_over",
              data: { result: "lost", reason: "no_flames" }
            });
          }
        }
      }
    }

    // 6. Time and Dawn Loss Condition
    this.sim_ticks += 1;
    if (this.getTimeLeft() <= 0 && this.state === "playing") {
      this.state = "lost";
      this.lost_reason = "dawn";

      currentTickEvents.push({
        type: "event",
        tick: this.sim_ticks,
        name: "game_over",
        data: { result: "lost", reason: "dawn" }
      });
    }

    return currentTickEvents;
  }

  getSnapshot(tickIndex = this.sim_ticks) {
    const round2 = (num) => Math.round(num * 100) / 100;
    return {
      type: "snapshot",
      tick: tickIndex,
      sim_tick: this.sim_ticks,
      state: this.state,
      time_left_s: round2(this.getTimeLeft()),
      score: this.score,
      player: {
        pos: [
          round2(this.player.pos[0]),
          round2(this.player.pos[1]),
          round2(this.player.pos[2])
        ],
        flames: this.player.flames,
        carried: this.player.carried
      },
      lanterns: this.lanterns.map(l => ({
        id: l.id,
        pos: [round2(l.pos[0]), round2(l.pos[1]), round2(l.pos[2])],
        lit: l.lit,
        deposited: l.deposited
      })),
      shades: this.shades.map(s => ({
        id: s.id,
        pos: [round2(s.pos[0]), round2(s.pos[1]), round2(s.pos[2])],
        state: s.state
      })),
      motes_active: this.motes.filter(m => m.active).length
    };
  }
}
