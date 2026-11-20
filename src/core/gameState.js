/**
 * Đảo Đèn Lồng - Core Game State & Simulation Logic
 * Test Contract v1.1 Compliant (Phase 2 - Ba Hòn Đảo)
 * 
 * Strict Separation: Pure JavaScript, NO Three.js or DOM references.
 */

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
  player_speed: 6.0,
  player_charm_speed: 7.2,
  jump_velocity: 7.0,
  gravity: -20.0,
  dash_speed: 14.0,
  dash_duration_s: 0.2,
  dash_cooldown_s: 1.5,
  carry_capacity: 10,
  pickup_radius_xz: 1.0,
  pickup_height_y: 1.5,
  lantern_cost: 10,
  interact_radius: 2.0,
  safe_radius: 6.0,
  pulse_cost: 3,
  pulse_radius: 5.0,
  pulse_cooldown_s: 3.0,
  pulse_stun_ticks: 120,
  pulse_push_m: 4.0,
  shade_speed: 4.0,
  shade_speed_night3: 4.5,
  shade_detect_radius: 12.0,
  shade_lose_radius: 18.0,
  shade_hit_radius_xz: 1.0,
  shade_hit_height_y: 1.5,
  shade_recoil_m: 2.0,
  shade_recoil_ticks: 60,
  invuln_ticks: 90,
  hit_drop_ratio: 0.5,
  dropped_mote_ttl_ticks: 480,
  fall_respawn_delay_ticks: 60,
  flames: 3,
  night1_duration_s: 300,
  night2_duration_s: 330,
  night3_duration_s: 360,
  drifter_speed: 7.0,
  drifter_idle_speed: 2.0,
  drifter_steal_max: 3,
  charm_duration_ticks: 600,
  charm_respawn_ticks: 2700,
  wind_interval_s: 30,
  wind_duration_s: 5,
  wind_push_speed: 2.0,
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
    this.night = Number(options.night || 1);

    this.sim_ticks = 0;
    this.total_ticks = 0; // increments even during pause
    this.state = "playing"; // "playing" | "paused" | "won" | "lost"
    this.prev_state = "playing";
    this.score = 0;
    this.win_reason = null;
    this.lost_reason = null;

    // Wind system
    this.wind = {
      active: false,
      dir_deg: 0,
      timer_ticks: 0,
      warn_ticks: 0
    };

    // Previous input state for edge detection
    this.prev_input = {
      interact: false,
      pulse: false,
      jump: false,
      dash: false,
      pause: false
    };

    // Timers (in ticks)
    this.invuln_ticks = 0;
    this.pulse_cd_ticks = 0;
    this.dash_cd_ticks = 0;
    this.dash_ticks_left = 0;
    this.dash_dir = [0, 1]; // [dx, dz]
    this.charm_ticks = 0;
    this.fall_wait_ticks = 0;

    // Player State
    this.player = {
      pos: [0, 0, 0],
      vel: [0, 0, 0],
      flames: this.tuning.flames,
      carried: 0,
      grounded: true,
      facing: [0, 1], // unit vector on XZ
      in_pad_flight: false,
      pad_vel: [0, 0]
    };

    // Entities
    this.lanterns = [];
    this.shades = [];
    this.motes = [];
    this.drifters = [];
    this.charms = [];
    this.jump_pads = [];

    // Pending events emitted during setup or steps
    this.pending_events = [];

    // Schedule counters
    this.next_mote_id = 1;
    this.next_shade_id = 1;
    this.next_drifter_id = 1;

    // Emit night_start
    this.pending_events.push({
      type: "event",
      tick: 0,
      name: "night_start",
      data: { night: this.night }
    });

    if (options.scenario) {
      this._loadScenario(options.scenario);
    } else {
      this._initMapForNight(this.night);
    }
  }

  getDurationSeconds() {
    if (this.night === 2) return this.tuning.night2_duration_s;
    if (this.night === 3) return this.tuning.night3_duration_s;
    return this.tuning.night1_duration_s;
  }

  getTimeLeft() {
    const elapsed_s = this.sim_ticks / 60.0;
    return Math.max(0, this.getDurationSeconds() - elapsed_s);
  }

  _initMapForNight(night) {
    if (night === 2) {
      this._initNight2();
    } else if (night === 3) {
      this._initNight3();
    } else {
      this._initNight1();
    }
  }

  _initNight1() {
    this.player.pos = [0, 0, 0];
    this.player.facing = [0, 1];

    // 5 Lanterns
    this.lanterns = [
      { id: "L1", pos: [0, 0, 25], lit: false, deposited: 0, repel_timer: 0 },
      { id: "L2", pos: [23.8, 0, 7.7], lit: false, deposited: 0, repel_timer: 0 },
      { id: "L3", pos: [14.7, 0, -20.2], lit: false, deposited: 0, repel_timer: 0 },
      { id: "L4", pos: [-14.7, 0, -20.2], lit: false, deposited: 0, repel_timer: 0 },
      { id: "L5", pos: [-23.8, 0, 7.7], lit: false, deposited: 0, repel_timer: 0 }
    ];

    // Mote spawn points: 8 at R=12m, 16 at R=33m
    this.mote_spawn_points = [];
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      this.mote_spawn_points.push([
        Math.round(Math.cos(a) * 12 * 10) / 10,
        0,
        Math.round(Math.sin(a) * 12 * 10) / 10
      ]);
    }
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8;
      this.mote_spawn_points.push([
        Math.round(Math.cos(a) * 33 * 10) / 10,
        0,
        Math.round(Math.sin(a) * 33 * 10) / 10
      ]);
    }

    // Initial 20 motes
    this.motes = [];
    for (let i = 0; i < 20; i++) {
      const pt = this.mote_spawn_points[i];
      this.motes.push({
        id: `M${this.next_mote_id++}`,
        pos: [pt[0], 0, pt[2]],
        kind: "random",
        ttl_ticks: -1,
        active: true
      });
    }

    // Shade spawn points: 12 at R=37m
    this.shade_spawn_points = [];
    for (let i = 0; i < 12; i++) {
      const a = ((15 + i * 30) * Math.PI) / 180;
      this.shade_spawn_points.push([
        Math.round(Math.cos(a) * 37 * 10) / 10,
        0,
        Math.round(Math.sin(a) * 37 * 10) / 10
      ]);
    }
    this.shades = [];
    this.drifters = [];
    this.charms = [];
  }

  _initNight2() {
    this.player.pos = [0, 0, 0];
    this.player.facing = [0, 1];

    // 6 Lanterns
    this.lanterns = [
      { id: "L1", pos: [0, 0, 20], lit: false, deposited: 0, repel_timer: 0 },
      { id: "L2", pos: [17, 0, -10], lit: false, deposited: 0, repel_timer: 0 },
      { id: "L3", pos: [-17, 0, -10], lit: false, deposited: 0, repel_timer: 0 },
      { id: "L4", pos: [70, 0, 20], lit: false, deposited: 0, repel_timer: 0 },
      { id: "L5", pos: [87, 0, -10], lit: false, deposited: 0, repel_timer: 0 },
      { id: "L6", pos: [53, 0, -10], lit: false, deposited: 0, repel_timer: 0 }
    ];

    // Jump pads
    this.jump_pads = [
      {
        pos: [20, 0, 18],
        radius: 1.0,
        vy: 14.0,
        target_center: [70, 0, 0],
        v_horiz: 24.0
      },
      {
        pos: [50, 0, -18],
        radius: 1.0,
        vy: 14.0,
        target_center: [0, 0, 0],
        v_horiz: 24.0
      }
    ];

    // Charm C1 at (35,0,0)
    this.charms = [
      { id: "C1", pos: [35, 0, 0], available: true, respawn_ticks: 0 }
    ];

    // Mote spawn points: 4 at R=10m, 8 at R=22m for each island
    this.mote_spawn_points = [];
    const centers = [[0, 0, 0], [70, 0, 0]];
    for (const c of centers) {
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        this.mote_spawn_points.push([
          Math.round((c[0] + Math.cos(a) * 10) * 10) / 10,
          0,
          Math.round((c[2] + Math.sin(a) * 10) * 10) / 10
        ]);
      }
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        this.mote_spawn_points.push([
          Math.round((c[0] + Math.cos(a) * 22) * 10) / 10,
          0,
          Math.round((c[2] + Math.sin(a) * 22) * 10) / 10
        ]);
      }
    }

    // Initial 20 motes
    this.motes = [];
    for (let i = 0; i < 20; i++) {
      const pt = this.mote_spawn_points[i];
      this.motes.push({
        id: `M${this.next_mote_id++}`,
        pos: [pt[0], 0, pt[2]],
        kind: "random",
        ttl_ticks: -1,
        active: true
      });
    }

    // Shade spawn points: 8 at R=26m on each island
    this.shade_spawn_points = [];
    for (const c of centers) {
      for (let i = 0; i < 8; i++) {
        const a = ((22.5 + i * 45) * Math.PI) / 180;
        this.shade_spawn_points.push([
          Math.round((c[0] + Math.cos(a) * 26) * 10) / 10,
          0,
          Math.round((c[2] + Math.sin(a) * 26) * 10) / 10
        ]);
      }
    }

    this.shades = [];
    this.drifters = [];
  }

  _initNight3() {
    this.player.pos = [0, 0, 0];
    this.player.facing = [0, 1];

    // 7 Lanterns
    this.lanterns = [
      { id: "L1", pos: [0, 6, 6], lit: false, deposited: 0, repel_timer: 0 },
      { id: "L2", pos: [18, 3, 10], lit: false, deposited: 0, repel_timer: 0 },
      { id: "L3", pos: [-18, 3, 10], lit: false, deposited: 0, repel_timer: 0 },
      { id: "L4", pos: [35, 0, -10], lit: false, deposited: 0, repel_timer: 0 },
      { id: "L5", pos: [-35, 0, -10], lit: false, deposited: 0, repel_timer: 0 },
      { id: "L6", pos: [20, 0, -35], lit: false, deposited: 0, repel_timer: 0 },
      { id: "L7", pos: [-20, 0, -35], lit: false, deposited: 0, repel_timer: 0 }
    ];

    // Jump pad at (0, 3, 13) to land on tier 2 (Y=6)
    this.jump_pads = [
      {
        pos: [0, 3, 13],
        radius: 1.0,
        vy: 12.0,
        vx: 0,
        vz: -8.0,
        fixed_vel: true
      }
    ];

    // Charms C1 (30,0,25) and C2 (-30,0,25)
    this.charms = [
      { id: "C1", pos: [30, 0, 25], available: true, respawn_ticks: 0 },
      { id: "C2", pos: [-30, 0, 25], available: true, respawn_ticks: 0 }
    ];

    // 30 Mote points: 18 at tier 0 (R=34m), 8 at tier 1 (R=18m), 4 at tier 2 (R=5m)
    this.mote_spawn_points = [];
    for (let i = 0; i < 18; i++) {
      const a = (i * 20 * Math.PI) / 180;
      this.mote_spawn_points.push([
        Math.round(Math.cos(a) * 34 * 10) / 10,
        0,
        Math.round(Math.sin(a) * 34 * 10) / 10
      ]);
    }
    for (let i = 0; i < 8; i++) {
      const a = ((20 + i * 20) * Math.PI) / 180;
      this.mote_spawn_points.push([
        Math.round(Math.cos(a) * 18 * 10) / 10,
        3,
        Math.round(Math.sin(a) * 18 * 10) / 10
      ]);
    }
    for (let i = 0; i < 4; i++) {
      const a = ((45 + i * 90) * Math.PI) / 180;
      this.mote_spawn_points.push([
        Math.round(Math.cos(a) * 5 * 10) / 10,
        6,
        Math.round(Math.sin(a) * 5 * 10) / 10
      ]);
    }

    this.motes = [];
    for (let i = 0; i < 20; i++) {
      const pt = this.mote_spawn_points[i];
      this.motes.push({
        id: `M${this.next_mote_id++}`,
        pos: [pt[0], pt[1], pt[2]],
        kind: "random",
        ttl_ticks: -1,
        active: true
      });
    }

    // 16 Shade spawn points at R=43m
    this.shade_spawn_points = [];
    for (let i = 0; i < 16; i++) {
      const a = (i * 22.5 * Math.PI) / 180;
      this.shade_spawn_points.push([
        Math.round(Math.cos(a) * 43 * 10) / 10,
        0,
        Math.round(Math.sin(a) * 43 * 10) / 10
      ]);
    }

    this.shades = [];
    this.drifters = [];
  }

  _loadScenario(scenario) {
    if (scenario.player) {
      if (scenario.player.pos) this.player.pos = [...scenario.player.pos];
      if (scenario.player.vel) this.player.vel = [...scenario.player.vel];
      if (scenario.player.flames !== undefined) this.player.flames = scenario.player.flames;
      if (scenario.player.carried !== undefined) this.player.carried = scenario.player.carried;
      if (scenario.player.grounded !== undefined) this.player.grounded = !!scenario.player.grounded;
      if (scenario.player.invuln_ticks !== undefined) this.invuln_ticks = scenario.player.invuln_ticks;
      if (scenario.player.dash_cd_ticks !== undefined) this.dash_cd_ticks = scenario.player.dash_cd_ticks;
      if (scenario.player.pulse_cd_ticks !== undefined) this.pulse_cd_ticks = scenario.player.pulse_cd_ticks;
      if (scenario.player.charm_ticks !== undefined) this.charm_ticks = scenario.player.charm_ticks;
    }

    if (Array.isArray(scenario.lanterns)) {
      this.lanterns = scenario.lanterns.map(l => ({
        id: l.id,
        pos: [...l.pos],
        lit: !!l.lit,
        deposited: l.deposited || 0,
        repel_timer: 0
      }));
    }

    if (Array.isArray(scenario.shades)) {
      this.shades = scenario.shades.map(s => ({
        id: s.id,
        pos: [...s.pos],
        state: s.state || "wander", // "spawning" | "wander" | "chase" | "recoil" | "stunned"
        state_ticks_left: s.state_ticks_left || (s.stun_timer ? Math.round(s.stun_timer * 60) : 0),
        recoil_dir: [0, 0],
        push_ticks_left: 0,
        push_dir: [0, 0],
        target_pos: [...s.pos]
      }));
    }

    if (Array.isArray(scenario.motes)) {
      this.motes = scenario.motes.map((m, idx) => ({
        id: m.id || `M${idx + 1}`,
        pos: [...m.pos],
        kind: m.kind || "random",
        ttl_ticks: m.ttl_s !== undefined ? Math.round(m.ttl_s * 60) : (m.ttl_ticks || -1),
        active: m.active !== false
      }));
    }

    if (Array.isArray(scenario.drifters)) {
      this.drifters = scenario.drifters.map(d => ({
        id: d.id,
        pos: [...d.pos],
        state: d.state || "idle", // "idle" | "chase" | "flee" | "removed"
        stolen: d.stolen || 0,
        flee_ticks_left: d.flee_ticks_left || (d.state === "flee" ? 240 : 0)
      }));
    }

    if (Array.isArray(scenario.charms)) {
      this.charms = scenario.charms.map(c => ({
        id: c.id,
        pos: c.pos ? [...c.pos] : [0, 0, 0],
        available: c.available !== false,
        respawn_ticks: c.respawn_s !== undefined ? Math.round(c.respawn_s * 60) : (c.respawn_ticks || 0)
      }));
    }
  }

  getGroundHeight(x, z) {
    if (this.night === 1) {
      const dist = Math.sqrt(x * x + z * z);
      return dist <= 40.0 ? 0 : null;
    } else if (this.night === 2) {
      // Island A centered at (0,0) R=28
      const distA = Math.sqrt(x * x + z * z);
      if (distA <= 28.0) return 0;
      // Island B centered at (70,0) R=28
      const distB = Math.sqrt((x - 70) * (x - 70) + z * z);
      if (distB <= 28.0) return 0;
      // Bridge: x in [26, 44], z in [-2, 2]
      if (x >= 26.0 && x <= 44.0 && z >= -2.0 && z <= 2.0) return 0;
      return null;
    } else if (this.night === 3) {
      const dist = Math.sqrt(x * x + z * z);
      if (dist > 45.0) return null;

      // Tier 2: disc R <= 8 at center Y=6 (exclude bell tower R<=2 if checked for walking)
      if (dist <= 8.0) return 6.0;

      // Tier 1: ring R in [12, 24] at z > 0 Y=3
      if (dist >= 12.0 && dist <= 24.0 && z > 0) return 3.0;

      // Ramps at 30 deg and 150 deg (width 3m, connecting R=30 Y=0 to R=24 Y=3)
      const angleDeg = (Math.atan2(z, x) * 180) / Math.PI;
      const checkRamp = (targetAngle) => {
        const diff = Math.abs(angleDeg - targetAngle);
        if (diff <= 6.0 && dist >= 24.0 && dist <= 30.0) {
          const t = (30.0 - dist) / 6.0;
          return t * 3.0;
        }
        return null;
      };
      const r1 = checkRamp(30);
      if (r1 !== null) return r1;
      const r2 = checkRamp(150);
      if (r2 !== null) return r2;

      // Tier 0: Y=0
      return 0.0;
    }
    return 0;
  }

  isPlayerInSafeZone() {
    for (const l of this.lanterns) {
      if (l.lit) {
        const dx = this.player.pos[0] - l.pos[0];
        const dz = this.player.pos[2] - l.pos[2];
        if (Math.sqrt(dx * dx + dz * dz) <= this.tuning.safe_radius) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Advance simulation by 1 tick (1/60s).
   * Strict 12-step execution order per Test Contract v1.1.
   */
  step(input = {}) {
    const events = [];
    const dt = 1 / 60.0;
    const currentTick = this.total_ticks + 1;

    // Edge triggers
    const currInteract = !!input.interact;
    const currPulse = !!input.pulse;
    const currJump = !!input.jump;
    const currDash = !!input.dash;
    const currPause = !!input.pause;

    const trigInteract = currInteract && !this.prev_input.interact;
    const trigPulse = currPulse && !this.prev_input.pulse;
    const trigJump = currJump && !this.prev_input.jump;
    const trigDash = currDash && !this.prev_input.dash;
    const trigPause = currPause && !this.prev_input.pause;

    this.prev_input = {
      interact: currInteract,
      pulse: currPulse,
      jump: currJump,
      dash: currDash,
      pause: currPause
    };

    // STEP 1: Process Pause input
    if (trigPause) {
      if (this.state === "paused") {
        this.state = this.prev_state;
        events.push({ type: "event", tick: currentTick, name: "resumed", data: {} });
      } else if (this.state === "playing") {
        this.prev_state = this.state;
        this.state = "paused";
        events.push({ type: "event", tick: currentTick, name: "paused", data: {} });
        this.total_ticks += 1;
        return events;
      }
    }

    if (this.state === "paused") {
      this.total_ticks += 1;
      return events;
    }

    if (this.state !== "playing") {
      this.total_ticks += 1;
      this.sim_ticks += 1;
      return events;
    }

    // STEP 2: Decrement counters
    if (this.invuln_ticks > 0) this.invuln_ticks--;
    if (this.pulse_cd_ticks > 0) this.pulse_cd_ticks--;
    if (this.dash_cd_ticks > 0) this.dash_cd_ticks--;
    if (this.charm_ticks > 0) this.charm_ticks--;

    // Update charms respawn
    for (const c of this.charms) {
      if (!c.available && c.respawn_ticks > 0) {
        c.respawn_ticks--;
        if (c.respawn_ticks === 0) c.available = true;
      }
    }

    // Update motes TTL
    for (const m of this.motes) {
      if (m.active && m.ttl_ticks > 0) {
        m.ttl_ticks--;
        if (m.ttl_ticks === 0) m.active = false;
      }
    }

    // Lantern safe zone repel timers
    for (const l of this.lanterns) {
      if (l.repel_timer > 0) l.repel_timer--;
    }

    // Wind logic for Night 3
    if (this.night === 3) {
      const windPeriod = this.tuning.wind_interval_s * 60;
      const windCycle = this.sim_ticks % windPeriod;
      if (windCycle === windPeriod - 120) {
        this.wind.warn_ticks = 120;
      }
      if (windCycle === 0) {
        this.wind.active = true;
        this.wind.timer_ticks = this.tuning.wind_duration_s * 60;
        this.wind.dir_deg = Math.floor(this.rng() * 360);
      } else if (this.wind.active) {
        this.wind.timer_ticks--;
        if (this.wind.timer_ticks <= 0) {
          this.wind.active = false;
        }
      }
    }

    // STEP 3: Move Player (Jump, Dash, Jump pads, Wind, Fall check)
    if (this.fall_wait_ticks > 0) {
      this.fall_wait_ticks--;
      if (this.fall_wait_ticks === 0) {
        // Respawn at origin
        this.player.pos = [0, 0, 0];
        this.player.vel = [0, 0, 0];
        this.player.grounded = true;
        this.invuln_ticks = this.tuning.invuln_ticks; // 90 ticks
      }
    } else {
      // 3.1 Dash Initiation
      if (trigDash && this.dash_ticks_left <= 0) {
        const canDash = this.charm_ticks > 0 || this.dash_cd_ticks <= 0;
        if (canDash) {
          this.dash_ticks_left = Math.round(this.tuning.dash_duration_s * 60); // 12 ticks
          this.dash_cd_ticks = this.charm_ticks > 0 ? 0 : Math.round(this.tuning.dash_cooldown_s * 60); // 90 ticks

          // Determine dash direction
          const rx = Number(input.x || 0);
          const rz = Number(input.z || 0);
          const yaw = Number(input.cam_yaw_deg || 0);
          const rad = (yaw * Math.PI) / 180.0;
          let wx = rx * Math.cos(rad) + rz * Math.sin(rad);
          let wz = -rx * Math.sin(rad) + rz * Math.cos(rad);
          const len = Math.sqrt(wx * wx + wz * wz);
          if (len > 0.1) {
            this.dash_dir = [wx / len, wz / len];
          } else {
            this.dash_dir = [...this.player.facing];
          }

          events.push({ type: "event", tick: currentTick, name: "dash", data: {} });
        }
      }

      // 3.2 Jump Initiation
      if (trigJump && this.player.grounded) {
        this.player.vel[1] = this.tuning.jump_velocity;
        this.player.grounded = false;
        this.player.in_pad_flight = false;
      }

      // 3.3 Movement Calculation
      if (this.dash_ticks_left > 0) {
        this.dash_ticks_left--;
        // Dash moves at 14 m/s horizontally, Y remains locked
        this.player.pos[0] += this.dash_dir[0] * this.tuning.dash_speed * dt;
        this.player.pos[2] += this.dash_dir[1] * this.tuning.dash_speed * dt;
        this.player.facing = [...this.dash_dir];
      } else if (this.player.in_pad_flight) {
        // In pad flight: keep horizontal pad velocity, gravity applies
        this.player.pos[0] += this.player.pad_vel[0] * dt;
        this.player.pos[2] += this.player.pad_vel[1] * dt;
        this.player.vel[1] += this.tuning.gravity * dt;
        this.player.pos[1] += this.player.vel[1] * dt;
      } else {
        // Normal horizontal movement
        const rx = Number(input.x || 0);
        const rz = Number(input.z || 0);
        const yaw = Number(input.cam_yaw_deg || 0);
        const rad = (yaw * Math.PI) / 180.0;
        let wx = rx * Math.cos(rad) + rz * Math.sin(rad);
        let wz = -rx * Math.sin(rad) + rz * Math.cos(rad);
        const len = Math.sqrt(wx * wx + wz * wz);
        if (len > 1.0) {
          wx /= len;
          wz /= len;
        }

        const currentSpeed = this.charm_ticks > 0 ? this.tuning.player_charm_speed : this.tuning.player_speed;
        this.player.pos[0] += wx * currentSpeed * dt;
        this.player.pos[2] += wz * currentSpeed * dt;

        if (len > 0.05) {
          this.player.facing = [wx / len, wz / len];
        }

        // Apply wind if active
        if (this.wind.active) {
          const windRad = (this.wind.dir_deg * Math.PI) / 180.0;
          this.player.pos[0] += Math.cos(windRad) * this.tuning.wind_push_speed * dt;
          this.player.pos[2] += Math.sin(windRad) * this.tuning.wind_push_speed * dt;
        }

        // Apply gravity if not grounded
        if (!this.player.grounded) {
          this.player.vel[1] += this.tuning.gravity * dt;
          this.player.pos[1] += this.player.vel[1] * dt;
        }
      }

      // Check jump pads trigger
      if (this.player.grounded) {
        for (const pad of this.jump_pads) {
          const pdx = this.player.pos[0] - pad.pos[0];
          const pdz = this.player.pos[2] - pad.pos[2];
          if (Math.sqrt(pdx * pdx + pdz * pdz) <= pad.radius && Math.abs(this.player.pos[1] - pad.pos[1]) <= 0.5) {
            this.player.grounded = false;
            this.player.in_pad_flight = true;
            this.player.vel[1] = pad.vy;
            if (pad.fixed_vel) {
              this.player.pad_vel = [pad.vx, pad.vz];
            } else {
              const tdx = pad.target_center[0] - pad.pos[0];
              const tdz = pad.target_center[2] - pad.pos[2];
              const tlen = Math.sqrt(tdx * tdx + tdz * tdz);
              this.player.pad_vel = [(tdx / tlen) * pad.v_horiz, (tdz / tlen) * pad.v_horiz];
            }
            // Advance initial movement on pad launch
            this.player.pos[0] += this.player.pad_vel[0] * dt;
            this.player.pos[2] += this.player.pad_vel[1] * dt;
            this.player.pos[1] += this.player.vel[1] * dt;
            break;
          }
        }
      }

      // Ground resolution (only snap to ground when falling downwards: vel[1] <= 0)
      const groundY = this.getGroundHeight(this.player.pos[0], this.player.pos[2]);
      if (groundY !== null) {
        if (this.player.pos[1] <= groundY && this.player.vel[1] <= 0) {
          this.player.pos[1] = groundY;
          this.player.vel[1] = 0;
          this.player.grounded = true;
          this.player.in_pad_flight = false;
        } else {
          this.player.grounded = false;
        }
      } else {
        this.player.grounded = false;
      }

      // Check fall off island
      if (this.player.pos[1] < -10.0 && this.fall_wait_ticks === 0) {
        this.player.flames -= 1;
        const lostMotes = this.player.carried;
        this.player.carried = 0;
        this.fall_wait_ticks = this.tuning.fall_respawn_delay_ticks; // 60 ticks

        events.push({
          type: "event",
          tick: currentTick,
          name: "player_hit",
          data: {
            by: "fall",
            flames: this.player.flames,
            dropped: lostMotes,
            lost: true
          }
        });

        if (this.player.flames <= 0) {
          this.state = "lost";
          this.lost_reason = "no_flames";
          events.push({
            type: "event",
            tick: currentTick,
            name: "game_over",
            data: { result: "lost", reason: "no_flames" }
          });
        }
      }
    }

    // STEP 4: Pickup Motes & Charms
    if (this.fall_wait_ticks === 0) {
      // Motes
      for (const mote of this.motes) {
        if (mote.active && this.player.carried < this.tuning.carry_capacity) {
          const dx = mote.pos[0] - this.player.pos[0];
          const dz = mote.pos[2] - this.player.pos[2];
          const distXZ = Math.sqrt(dx * dx + dz * dz);
          const distY = Math.abs(this.player.pos[1] - mote.pos[1]);

          if (distXZ <= this.tuning.pickup_radius_xz && distY <= this.tuning.pickup_height_y) {
            mote.active = false;
            this.player.carried += 1;
            this.score += this.tuning.score.per_mote;

            events.push({
              type: "event",
              tick: currentTick,
              name: "mote_picked",
              data: { carried: this.player.carried }
            });
          }
        }
      }

      // Charms
      for (const charm of this.charms) {
        if (charm.available) {
          const dx = charm.pos[0] - this.player.pos[0];
          const dz = charm.pos[2] - this.player.pos[2];
          const distXZ = Math.sqrt(dx * dx + dz * dz);
          const distY = Math.abs(this.player.pos[1] - charm.pos[1]);

          if (distXZ <= this.tuning.pickup_radius_xz && distY <= this.tuning.pickup_height_y) {
            charm.available = false;
            charm.respawn_ticks = this.tuning.charm_respawn_ticks; // 2700 ticks
            this.charm_ticks = this.tuning.charm_duration_ticks; // 600 ticks

            events.push({
              type: "event",
              tick: currentTick,
              name: "charm_picked",
              data: {
                charm_id: charm.id,
                charm_ticks: this.charm_ticks
              }
            });
          }
        }
      }
    }

    // STEP 5: Lantern Deposit
    if (trigInteract && this.player.carried > 0 && this.fall_wait_ticks === 0) {
      let nearest = null;
      let minDist = Infinity;

      for (const l of this.lanterns) {
        if (!l.lit) {
          const dx = l.pos[0] - this.player.pos[0];
          const dz = l.pos[2] - this.player.pos[2];
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist <= this.tuning.interact_radius) {
            if (dist < minDist) {
              minDist = dist;
              nearest = l;
            } else if (Math.abs(dist - minDist) < 0.001) {
              if (l.id < nearest.id) nearest = l;
            }
          }
        }
      }

      if (nearest) {
        const needed = this.tuning.lantern_cost - nearest.deposited;
        const depositAmount = Math.min(this.player.carried, needed);

        if (depositAmount > 0) {
          this.player.carried -= depositAmount;
          nearest.deposited += depositAmount;

          events.push({
            type: "event",
            tick: currentTick,
            name: "deposit",
            data: {
              lantern_id: nearest.id,
              amount: depositAmount,
              deposited: nearest.deposited
            }
          });

          if (nearest.deposited >= this.tuning.lantern_cost) {
            nearest.lit = true;
            nearest.repel_timer = 30; // Push shades out for 30 ticks
            this.score += this.tuning.score.per_lantern;

            events.push({
              type: "event",
              tick: currentTick,
              name: "lantern_lit",
              data: { lantern_id: nearest.id }
            });

            // Check win
            if (this.lanterns.every(l => l.lit)) {
              this.state = "won";
              this.win_reason = "all_lit";
              const timeLeft = Math.floor(this.getTimeLeft());
              this.score += timeLeft * this.tuning.score.per_second_left;
              this.score += this.player.flames * this.tuning.score.per_flame_left;

              events.push({
                type: "event",
                tick: currentTick,
                name: "game_over",
                data: { result: "won", reason: "all_lit" }
              });
            }
          }
        }
      }
    }

    // STEP 6: Safe Zone update (push shades outside 6m)
    for (const l of this.lanterns) {
      if (l.lit) {
        for (const shade of this.shades) {
          const sdx = shade.pos[0] - l.pos[0];
          const sdz = shade.pos[2] - l.pos[2];
          const sdist = Math.sqrt(sdx * sdx + sdz * sdz);
          if (sdist < this.tuning.safe_radius && sdist > 0.001) {
            const pushOut = this.tuning.safe_radius - sdist;
            shade.pos[0] += (sdx / sdist) * pushOut;
            shade.pos[2] += (sdz / sdist) * pushOut;
          }
        }
      }
    }

    // STEP 7: Pulse Action
    if (trigPulse && this.fall_wait_ticks === 0) {
      if (this.player.carried >= this.tuning.pulse_cost && this.pulse_cd_ticks <= 0) {
        this.player.carried -= this.tuning.pulse_cost;
        this.pulse_cd_ticks = Math.round(this.tuning.pulse_cooldown_s * 60); // 180 ticks

        const stunned_ids = [];
        const pulseCenter = [
          this.player.pos[0],
          this.player.pos[1] + 0.8,
          this.player.pos[2]
        ];

        // Hit Shades
        for (const shade of this.shades) {
          const dx = shade.pos[0] - pulseCenter[0];
          const dy = shade.pos[1] - pulseCenter[1];
          const dz = shade.pos[2] - pulseCenter[2];
          const dist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist3D <= this.tuning.pulse_radius) {
            shade.state = "stunned";
            shade.state_ticks_left = this.tuning.pulse_stun_ticks; // 120 ticks
            shade.push_ticks_left = 15; // push across 15 ticks

            const horizLen = Math.sqrt(dx * dx + dz * dz);
            if (horizLen > 0.001) {
              shade.push_dir = [dx / horizLen, dz / horizLen];
            } else {
              shade.push_dir = [1, 0];
            }

            stunned_ids.push(shade.id);
            this.score += this.tuning.score.per_stun;
          }
        }

        // Hit Drifters
        for (const drifter of this.drifters) {
          if (drifter.state !== "removed") {
            const dx = drifter.pos[0] - pulseCenter[0];
            const dy = drifter.pos[1] - pulseCenter[1];
            const dz = drifter.pos[2] - pulseCenter[2];
            const dist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist3D <= this.tuning.pulse_radius) {
              if (drifter.state === "chase") {
                drifter.state = "flee";
                drifter.flee_ticks_left = 240;
              } else if (drifter.state === "flee" && drifter.stolen > 0) {
                // Drop stolen motes
                for (let k = 0; k < drifter.stolen; k++) {
                  this.motes.push({
                    id: `M${this.next_mote_id++}`,
                    pos: [drifter.pos[0], drifter.pos[1], drifter.pos[2]],
                    kind: "dropped",
                    ttl_ticks: this.tuning.dropped_mote_ttl_ticks,
                    active: true
                  });
                }
                events.push({
                  type: "event",
                  tick: currentTick,
                  name: "drifter_drop",
                  data: {
                    drifter_id: drifter.id,
                    amount: drifter.stolen
                  }
                });
                drifter.stolen = 0;
                drifter.flee_ticks_left = 120; // disappears after 120 ticks
              }
            }
          }
        }

        events.push({
          type: "event",
          tick: currentTick,
          name: "pulse",
          data: { stunned_ids }
        });
      }
    }

    // STEP 8: Move Shades & Drifters
    const playerInSafeZone = this.isPlayerInSafeZone();
    const shadeSpeed = (this.night === 3 ? this.tuning.shade_speed_night3 : this.tuning.shade_speed);

    for (const shade of this.shades) {
      // Apply pulse push
      if (shade.push_ticks_left > 0) {
        shade.push_ticks_left--;
        const pushStep = (this.tuning.pulse_push_m / 15.0);
        shade.pos[0] += shade.push_dir[0] * pushStep;
        shade.pos[2] += shade.push_dir[1] * pushStep;
      }

      if (shade.state === "stunned") {
        if (shade.state_ticks_left > 0) {
          shade.state_ticks_left--;
          if (shade.state_ticks_left === 0) {
            shade.state = "wander";
          }
        }
      } else if (shade.state === "recoil") {
        if (shade.state_ticks_left > 0) {
          shade.state_ticks_left--;
          const recoilStep = (this.tuning.shade_recoil_m / this.tuning.shade_recoil_ticks);
          shade.pos[0] += shade.recoil_dir[0] * recoilStep;
          shade.pos[2] += shade.recoil_dir[1] * recoilStep;
          if (shade.state_ticks_left === 0) {
            shade.state = "chase";
          }
        }
      } else if (shade.state === "wander" || shade.state === "chase") {
        const dx = this.player.pos[0] - shade.pos[0];
        const dz = this.player.pos[2] - shade.pos[2];
        const distXZ = Math.sqrt(dx * dx + dz * dz);

        if (!playerInSafeZone && this.fall_wait_ticks === 0) {
          if (distXZ <= this.tuning.shade_detect_radius) {
            shade.state = "chase";
          } else if (distXZ > this.tuning.shade_lose_radius && shade.state === "chase") {
            shade.state = "wander";
          }
        } else {
          shade.state = "wander";
        }

        if (shade.state === "chase") {
          if (distXZ > 0.01) {
            shade.pos[0] += (dx / distXZ) * shadeSpeed * dt;
            shade.pos[2] += (dz / distXZ) * shadeSpeed * dt;
          }
        } else {
          // Wander
          const tdx = shade.target_pos[0] - shade.pos[0];
          const tdz = shade.target_pos[2] - shade.pos[2];
          const tdist = Math.sqrt(tdx * tdx + tdz * tdz);
          if (tdist < 0.5) {
            const angle = this.rng() * 2 * Math.PI;
            const dist = 5.0 + this.rng() * 10.0;
            shade.target_pos = [
              shade.pos[0] + Math.cos(angle) * dist,
              0,
              shade.pos[2] + Math.sin(angle) * dist
            ];
          } else {
            shade.pos[0] += (tdx / tdist) * (shadeSpeed * 0.5) * dt;
            shade.pos[2] += (tdz / tdist) * (shadeSpeed * 0.5) * dt;
          }
        }
      }
    }

    // Move Drifters
    for (const drifter of this.drifters) {
      if (drifter.state === "idle") {
        const dx = this.player.pos[0] - drifter.pos[0];
        const dz = this.player.pos[2] - drifter.pos[2];
        const distXZ = Math.sqrt(dx * dx + dz * dz);
        if (this.player.carried >= 5 && distXZ <= 15.0 && this.fall_wait_ticks === 0) {
          drifter.state = "chase";
        } else {
          // Hover slowly
          drifter.pos[0] += Math.sin(this.sim_ticks * 0.05) * this.tuning.drifter_idle_speed * dt;
        }
      } else if (drifter.state === "chase") {
        const dx = this.player.pos[0] - drifter.pos[0];
        const dz = this.player.pos[2] - drifter.pos[2];
        const distXZ = Math.sqrt(dx * dx + dz * dz);
        if (this.player.carried < 5 || distXZ > 20.0 || this.fall_wait_ticks > 0) {
          drifter.state = "idle";
        } else if (distXZ > 0.01) {
          drifter.pos[0] += (dx / distXZ) * this.tuning.drifter_speed * dt;
          drifter.pos[2] += (dz / distXZ) * this.tuning.drifter_speed * dt;
        }
      } else if (drifter.state === "flee") {
        drifter.flee_ticks_left--;
        // Fly away from player
        const dx = drifter.pos[0] - this.player.pos[0];
        const dz = drifter.pos[2] - this.player.pos[2];
        const distXZ = Math.sqrt(dx * dx + dz * dz);
        if (distXZ > 0.01) {
          drifter.pos[0] += (dx / distXZ) * this.tuning.drifter_speed * dt;
          drifter.pos[2] += (dz / distXZ) * this.tuning.drifter_speed * dt;
        }
        if (drifter.flee_ticks_left <= 0) {
          drifter.state = "removed";
        }
      }
    }

    // STEP 9: Collisions (Drifter steal first, then Shades damage)
    // 9.1 Drifter steal
    for (const drifter of this.drifters) {
      if (drifter.state === "chase") {
        const dx = drifter.pos[0] - this.player.pos[0];
        const dz = drifter.pos[2] - this.player.pos[2];
        if (Math.sqrt(dx * dx + dz * dz) <= 1.2) {
          const stealAmount = Math.min(this.tuning.drifter_steal_max, this.player.carried);
          this.player.carried -= stealAmount;
          drifter.stolen = stealAmount;
          drifter.state = "flee";
          drifter.flee_ticks_left = 240;

          events.push({
            type: "event",
            tick: currentTick,
            name: "drifter_steal",
            data: {
              drifter_id: drifter.id,
              amount: stealAmount,
              carried: this.player.carried
            }
          });
        }
      }
    }

    // 9.2 Shade hit (maximum 1 flame loss per tick, sorted by id)
    let playerHitThisTick = false;
    const sortedShades = [...this.shades].sort((a, b) => a.id.localeCompare(b.id));

    for (const shade of sortedShades) {
      if (shade.state !== "stunned" && shade.state !== "recoil" && shade.state !== "spawning") {
        const dx = shade.pos[0] - this.player.pos[0];
        const dz = shade.pos[2] - this.player.pos[2];
        const distXZ = Math.sqrt(dx * dx + dz * dz);
        const distY = Math.abs(shade.pos[1] - this.player.pos[1]);

        if (distXZ <= this.tuning.shade_hit_radius_xz && distY <= this.tuning.shade_hit_height_y) {
          if (this.invuln_ticks <= 0 && this.fall_wait_ticks === 0 && !playerHitThisTick) {
            playerHitThisTick = true;
            this.player.flames -= 1;
            const dropped = Math.floor(this.player.carried * this.tuning.hit_drop_ratio);
            this.player.carried -= dropped;
            this.invuln_ticks = this.tuning.invuln_ticks; // 90 ticks

            // Spawn dropped motes in 1.5 - 2.5m ring
            for (let k = 0; k < dropped; k++) {
              const a = (k * 2 * Math.PI) / dropped + this.rng();
              const r = 1.5 + this.rng() * 1.0;
              this.motes.push({
                id: `M${this.next_mote_id++}`,
                pos: [this.player.pos[0] + Math.cos(a) * r, this.player.pos[1], this.player.pos[2] + Math.sin(a) * r],
                kind: "dropped",
                ttl_ticks: this.tuning.dropped_mote_ttl_ticks,
                active: true
              });
            }

            // Shade recoil 2m over 60 ticks
            shade.state = "recoil";
            shade.state_ticks_left = this.tuning.shade_recoil_ticks; // 60 ticks
            const rLen = Math.sqrt(dx * dx + dz * dz);
            shade.recoil_dir = rLen > 0.001 ? [dx / rLen, dz / rLen] : [1, 0];

            events.push({
              type: "event",
              tick: currentTick,
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
              events.push({
                type: "event",
                tick: currentTick,
                name: "game_over",
                data: { result: "lost", reason: "no_flames" }
              });
            }
          }
        }
      }
    }

    // STEP 10: Spawning Entities on Schedule
    // 10.1 Motes: every 240 ticks if < 30
    if (this.mote_spawn_points && this.sim_ticks > 0 && this.sim_ticks % 240 === 0) {
      const activeCount = this.motes.filter(m => m.active).length;
      if (activeCount < 30) {
        // Find empty point
        const emptyPoints = this.mote_spawn_points.filter(pt => {
          return !this.motes.some(m => m.active && Math.hypot(m.pos[0] - pt[0], m.pos[2] - pt[2]) < 1.0);
        });
        if (emptyPoints.length > 0) {
          const pt = emptyPoints[Math.floor(this.rng() * emptyPoints.length)];
          this.motes.push({
            id: `M${this.next_mote_id++}`,
            pos: [pt[0], pt[1], pt[2]],
            kind: "random",
            ttl_ticks: -1,
            active: true
          });
        }
      }
    }

    // 10.2 Shades: Night 1: 2 at tick 300, then 1 every 480 ticks. Max 6.
    // Night 2: every 420 ticks, max 8. Night 3: every 360 ticks, max 10.
    if (this.shade_spawn_points) {
      let spawnNow = false;
      let spawnCount = 1;
      const maxShades = (this.night === 1 ? 6 : (this.night === 2 ? 8 : 10));

      if (this.night === 1) {
        if (this.sim_ticks === 300) {
          spawnNow = true;
          spawnCount = 2;
        } else if (this.sim_ticks > 300 && (this.sim_ticks - 300) % 480 === 0) {
          spawnNow = true;
          spawnCount = 1;
        }
      } else if (this.night === 2) {
        if (this.sim_ticks > 0 && this.sim_ticks % 420 === 0) {
          spawnNow = true;
          spawnCount = 1;
        }
      } else if (this.night === 3) {
        if (this.sim_ticks > 0 && this.sim_ticks % 360 === 0) {
          spawnNow = true;
          spawnCount = 1;
        }
      }

      if (spawnNow) {
        for (let s = 0; s < spawnCount; s++) {
          if (this.shades.length < maxShades) {
            // Find valid point >= 15m from player
            const validPoints = this.shade_spawn_points.filter(pt => {
              return Math.hypot(pt[0] - this.player.pos[0], pt[2] - this.player.pos[2]) >= 15.0;
            });
            if (validPoints.length > 0) {
              const pt = validPoints[Math.floor(this.rng() * validPoints.length)];
              const shadeId = `S${this.next_shade_id++}`;
              this.shades.push({
                id: shadeId,
                pos: [pt[0], pt[1], pt[2]],
                state: "wander",
                state_ticks_left: 0,
                recoil_dir: [0, 0],
                push_ticks_left: 0,
                push_dir: [0, 0],
                target_pos: [pt[0], pt[1], pt[2]]
              });
              events.push({
                type: "event",
                tick: currentTick,
                name: "shade_spawned",
                data: { id: shadeId }
              });
            }
          }
        }
      }
    }

    // 10.3 Drifters: Nights 2 & 3 at tick 1200, 2400... max 2
    if ((this.night === 2 || this.night === 3) && this.sim_ticks > 0 && this.sim_ticks % 1200 === 0) {
      const activeDrifters = this.drifters.filter(d => d.state !== "removed");
      if (activeDrifters.length < 2) {
        const dId = `D${this.next_drifter_id++}`;
        const spawnX = this.night === 2 ? 35 : 0;
        const spawnZ = this.night === 2 ? 0 : 20;
        this.drifters.push({
          id: dId,
          pos: [spawnX, 1.5, spawnZ],
          state: "idle",
          stolen: 0,
          flee_ticks_left: 0
        });
      }
    }

    // STEP 11: Check Win / Loss
    this.sim_ticks += 1;
    this.total_ticks += 1;

    if (this.getTimeLeft() <= 0 && this.state === "playing") {
      this.state = "lost";
      this.lost_reason = "dawn";
      events.push({
        type: "event",
        tick: currentTick,
        name: "game_over",
        data: { result: "lost", reason: "dawn" }
      });
    }

    return events;
  }

  getSnapshot(tickIndex = this.total_ticks) {
    const round2 = (num) => Math.round(num * 100) / 100;
    return {
      type: "snapshot",
      tick: tickIndex,
      sim_tick: this.sim_ticks,
      night: this.night,
      state: this.state,
      time_left_s: round2(this.getTimeLeft()),
      score: this.score,
      wind: {
        active: this.wind.active,
        dir_deg: this.wind.dir_deg
      },
      player: {
        pos: [
          round2(this.player.pos[0]),
          round2(this.player.pos[1]),
          round2(this.player.pos[2])
        ],
        vel: [
          round2(this.player.vel[0]),
          round2(this.player.vel[1]),
          round2(this.player.vel[2])
        ],
        flames: this.player.flames,
        carried: this.player.carried,
        grounded: this.player.grounded,
        invuln: this.invuln_ticks > 0,
        dash_cd_s: round2(this.dash_cd_ticks / 60.0),
        pulse_cd_s: round2(this.pulse_cd_ticks / 60.0),
        charm_s: round2(this.charm_ticks / 60.0)
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
      drifters: this.drifters.map(d => ({
        id: d.id,
        pos: [round2(d.pos[0]), round2(d.pos[1]), round2(d.pos[2])],
        state: d.state,
        stolen: d.stolen
      })),
      charms: this.charms.map(c => ({
        id: c.id,
        available: c.available,
        respawn_s: round2(c.respawn_ticks / 60.0)
      })),
      motes: this.motes.filter(m => m.active).map(m => ({
        id: m.id,
        pos: [round2(m.pos[0]), round2(m.pos[1]), round2(m.pos[2])],
        kind: m.kind,
        ttl_s: m.ttl_ticks > 0 ? round2(m.ttl_ticks / 60.0) : -1
      })),
      motes_active: this.motes.filter(m => m.active).length
    };
  }
}
