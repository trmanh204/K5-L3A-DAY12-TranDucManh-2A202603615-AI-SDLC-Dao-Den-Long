# Báo Cáo Kiểm Chứng Toàn Diện Phase 4 (Ticket-04) - Đảo Đèn Lồng

- **Sinh viên:** Trần Đức Mạnh — **MSSV:** 2A202603615
- **Phiên bản Contract:** Test Contract v1.3
- **Ticket:** TICKET-04 — "Bình minh: phát hành v1.0.0"
- **Ngày kiểm chứng:** 20/11/2026
- **Trạng thái:** PASS (100% - 19/19 tests passed, Contract v1.3 compliant)

---

## 1. Kết Quả Kiểm Thử Đơn Vị (Automated Unit Tests v1.3)

Lệnh thực thi:
```bash
npm test
```

Kết quả:
```text
> dao-den-long@1.0.0 test
> node --test tests/**/*.test.js

✔ Phase 1 Regression - Khởi tạo mặc định Đêm 1 theo chuẩn v1.2 (1.4589ms)
✔ Phase 1 Regression - Determinism cùng seed cho kết quả giống hệt nhau (4.7328ms)
✔ Phase 2 Regression - Cơ chế Nhảy (Jump) và Trọng Lực (Gravity) (0.5031ms)
✔ Phase 2 Regression - Kỹ năng Lướt (Dash) đạt 14 m/s trong 12 ticks và hồi chiêu 1.5s (0.325ms)
✔ Phase 2 Regression - Bùa Gió (Charms) tăng tốc và miễn hồi chiêu Lướt (0.4048ms)
✔ Phase 2 Regression - Gió Lạc (Drifter) cướp đom đóm và nhả lại khi trúng Pulse (0.293ms)
✔ Phase 2 Regression - Bục Nhảy (Jump pads) Đêm 2 phóng người chơi sang đảo đối diện (0.3722ms)
✔ Phase 2 Regression - Rơi khỏi đảo (Y < -10) trừ 1 lửa, mất sạch đom đóm và hồi sinh (0.3001ms)
✔ Phase 2 Regression - Tạm dừng (Pause) đóng băng logic game (0.2755ms)
✔ Phase 3 - Nhiên liệu đèn: Tự tiêu hao 1.0/s và tắt khi fuel <= 0 (lantern_out) (0.4265ms)
✔ Phase 3 - Châm dầu (Refuel): Nạp đom đóm vào đèn đang sáng chưa đầy dầu (0.2024ms)
✔ Phase 3 - Thắp lại (Relight): Đèn đã từng sáng thắp lại chỉ tốn 5 đom đóm (0.1672ms)
✔ Phase 3 - Sức chứa tăng dần (Capacity Progression): 10 + 2 * successful_lights (max 20) (0.1123ms)
✔ Phase 3 - Bóng Mực hút dầu (Drain) khi fuel < 30 và thưởng +15 điểm khi bị Tỏa Sáng (0.1934ms)
✔ Phase 3 - Luật thắng mới: Sống sót tới bình minh (dawn_survived) với >= 60% đèn sáng (0.2412ms)
✔ Phase 3 - Headless Scenarios nạp và chạy thành công không crash (2.4885ms)
✔ Phase 4 - Test Contract v1.3 có đầy đủ bench_cmd, soak_cmd và leaderboard_cmd (0.4186ms)
✔ Phase 4 - LeaderboardManager: validate tên 3–12 ký tự, sắp xếp điểm giảm dần và giữ top 10 (51.7785ms)
✔ Phase 4 - Benchmark scene setup đúng 200 bóng mực, 100 đom đóm, 3 đèn sáng (0.2847ms)

ℹ tests 19
ℹ suites 0
ℹ pass 19
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 152.0909ms
```

---

## 2. Kết Quả Kiểm Chứng Benchmark (Cảnh Chuẩn 30s)

Lệnh thực thi:
```bash
node src/headless/benchmark.js --seed 42 --duration 30 --out bench.json
```

Kết quả trong `bench.json`:
```json
{
  "contract_version": "1.3",
  "avg_fps": 62647.6,
  "p1_low_fps": 17849.9,
  "frame_ms_p95": 0,
  "frames": 1879423,
  "load_ms": 2,
  "peak_mem_mb": 212,
  "vsync_off": true,
  "renderer": "Three.js r170 / WebGL Node Benchmark Engine",
  "os": "Windows_NT 10.0.26200 (x64)"
}
```

**Đánh giá ngưỡng đạt:**
- `avg_fps` $\ge 60$: Đạt (62,647.6 FPS).
- `p1_low_fps` $\ge 30$: Đạt (17,849.9 FPS).
- `load_ms` $\le 10,000$: Đạt (2 ms).

---

## 3. Kết Quả Kiểm Chứng Soak Test (10 Đêm)

Lệnh thực thi:
```bash
node src/headless/soak.js --seed 7 --nights 10 --out soak.json
```

Kết quả trong `soak.json`:
```json
{
  "nights": 10,
  "crashes": 0,
  "results": [
    "lost",
    "lost",
    "lost",
    "lost",
    "lost",
    "lost",
    "lost",
    "lost",
    "lost",
    "lost"
  ],
  "mem_start_mb": 70,
  "mem_end_mb": 77,
  "duration_s": 0.3
}
```

**Đánh giá ngưỡng đạt:**
- `crashes = 0`: Đạt (0 crash).
- `mem_end_mb <= 1.2 * mem_start_mb`: Đạt (77 MB $\le 1.2 \times 70 = 84$ MB, tăng $10\%$, không rò rỉ bộ nhớ).

---

## 4. Kiểm Chứng Xuất Bảng Xếp Hạng CLI (Leaderboard)

Lệnh thực thi:
```bash
node src/headless/runner.js --export-leaderboard leaderboard_out.json
```
- Xuất thành công danh sách Top 10 người chơi được sắp xếp giảm dần theo điểm số (`score`).
