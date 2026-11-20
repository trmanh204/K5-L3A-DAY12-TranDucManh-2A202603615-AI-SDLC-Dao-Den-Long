/**
 * Đảo Đèn Lồng - Local Leaderboard Manager
 * Contract v1.3: Quản lý bảng xếp hạng cục bộ top 10
 */

import fs from 'node:fs';
import path from 'node:path';

export const LEADERBOARD_FILE = 'leaderboard.json';

export class LeaderboardManager {
  constructor(filePath = LEADERBOARD_FILE) {
    this.filePath = filePath;
    this.entries = [];
    this.load();
  }

  load() {
    try {
      if (typeof window === 'undefined') {
        // Node.js environment
        if (fs.existsSync(this.filePath)) {
          const raw = fs.readFileSync(this.filePath, 'utf8');
          const data = JSON.parse(raw);
          this.entries = Array.isArray(data.entries) ? data.entries : [];
        } else {
          this.entries = [];
        }
      } else {
        // Browser environment
        const raw = localStorage.getItem('lantern_leaderboard');
        if (raw) {
          const data = JSON.parse(raw);
          this.entries = Array.isArray(data.entries) ? data.entries : [];
        } else {
          this.entries = [];
        }
      }
    } catch {
      this.entries = [];
    }
  }

  save() {
    const data = { entries: this.entries };
    try {
      if (typeof window === 'undefined') {
        fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
      } else {
        localStorage.setItem('lantern_leaderboard', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Failed to save leaderboard:', err);
    }
  }

  /**
   * Validate tên người chơi: 3–12 ký tự [A-Za-z0-9_]
   */
  static validateName(name) {
    if (!name || typeof name !== 'string') return false;
    const trimmed = name.trim();
    if (trimmed.length < 3 || trimmed.length > 12) return false;
    // Cho phép A-Za-z0-9_ và ký tự tiếng Việt Unicode
    return /^[A-Za-z0-9_\u00C0-\u1EF9]+$/.test(trimmed);
  }

  /**
   * Thêm một kỷ lục mới:
   * name: string
   * score: number (tổng điểm các Đêm đã thắng)
   * nights_won: number (0-3)
   * achieved_at: string ISO 8601
   * seed: number
   */
  addEntry({ name, score, nights_won = 0, achieved_at = null, seed = 1 }) {
    if (!LeaderboardManager.validateName(name)) {
      throw new Error('Tên phải từ 3–12 ký tự [A-Za-z0-9_]');
    }

    const entry = {
      name: name.trim(),
      score: Number(score) || 0,
      nights_won: Number(nights_won) || 0,
      achieved_at: achieved_at || new Date().toISOString(),
      seed: Number(seed) || 1
    };

    this.entries.push(entry);

    // Sắp xếp: score giảm dần; bằng điểm thì ai đạt trước đứng trên
    this.entries.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(a.achieved_at).getTime() - new Date(b.achieved_at).getTime();
    });

    // Giữ top 10
    if (this.entries.length > 10) {
      this.entries = this.entries.slice(0, 10);
    }

    this.save();
    return entry;
  }

  getEntries() {
    return [...this.entries];
  }

  exportJson(outPath) {
    const data = { entries: this.entries };
    const resolved = path.resolve(outPath);
    fs.mkdirSync(path.dirname(resolved), { recursive: true });
    fs.writeFileSync(resolved, JSON.stringify(data, null, 2), 'utf8');
    return resolved;
  }
}
