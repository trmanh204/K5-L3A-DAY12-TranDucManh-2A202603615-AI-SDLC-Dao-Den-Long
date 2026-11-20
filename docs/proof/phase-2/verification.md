# Báo cáo Kiểm chứng Phase 2 (Ticket-02) - Đảo Đèn Lồng

- **Sinh viên:** Trần Đức Mạnh - 2A202603615
- **Phiên bản Contract:** Test Contract v1.1
- **Ticket:** TICKET-02 — "Ba hòn đảo"
- **Ngày kiểm chứng:** 20/11/2026
- **Trạng thái:** PASS (100%)

---

## 1. Kết quả Unit Tests (Automated Test Suite v1.1)

Lệnh thực thi:
```bash
npm test
```

Kết quả:
```text
> dao-den-long@1.0.0 test
> node --test tests/**/*.test.js

✔ Phase 1 Regression - Khởi tạo mặc định Đêm 1 theo chuẩn v1.1 (1.2921ms)
✔ Phase 1 Regression - Determinism cùng seed cho kết quả giống hệt nhau (4.1517ms)
✔ Phase 2 - Cơ chế Nhảy (Jump) và Trọng Lực (Gravity) (0.4587ms)
✔ Phase 2 - Kỹ năng Lướt (Dash) đạt tốc độ 14 m/s trong 12 ticks và hồi chiêu 1.5s (0.3075ms)
✔ Phase 2 - Bùa Gió (Charms) tăng tốc lên 7.2 m/s và miễn hồi chiêu Lướt (0.3795ms)
✔ Phase 2 - Gió Lạc (Drifter) cướp đom đóm và nhả lại khi trúng Pulse (0.2787ms)
✔ Phase 2 - Bục Nhảy (Jump pads) Đêm 2 phóng người chơi sang đảo đối diện (0.3645ms)
✔ Phase 2 - Rơi khỏi đảo (Y < -10) trừ 1 lửa, mất sạch đom đóm và hồi sinh sau 60 ticks (0.3449ms)
✔ Phase 2 - Tạm dừng (Pause) đóng băng logic game và snapshot có state: paused (0.3056ms)
✔ Phase 2 - Đêm 2 có 6 lồng đèn và Đêm 3 có 7 lồng đèn (0.4256ms)

ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 90.9111ms
```

---

## 2. Kết quả Headless Test Contract Runner v1.1

### Test 1: Chạy mô phỏng Đêm 2 với thực thể Gió Lạc & Bùa Gió
Lệnh:
```bash
node src/headless/runner.js --seed 42 --night 2 --scenario src/headless/scenarios/phase2_night2_scenario.json --ticks 300 --out docs/proof/phase-2/run_night2.jsonl
```
- Trạng thái: Exit code `0`
- Bằng chứng file JSONL: `docs/proof/phase-2/run_night2.jsonl`
- Sự kiện ghi nhận chính xác:
  - `night_start` (tick 0, night 2)
  - `drifter_steal` (tick 52, Gió Lạc cướp 3 đom đóm khi Mây mang 5 đom đóm)
  - Snapshot định kỳ chứa đầy đủ cấu trúc v1.1 (`night`, `wind`, `vel`, `grounded`, `invuln`, `dash_cd_s`, `pulse_cd_s`, `charm_s`, `motes`, `shades`, `drifters`, `charms`).

### Test 2: Kiểm thử hiệu năng (Stress test 21.600 ticks Đêm 3)
Lệnh:
```powershell
Measure-Command { node src/headless/runner.js --seed 42 --night 3 --ticks 21600 --out docs/proof/phase-2/run_night3_full.jsonl --snapshot-every 300 }
```
- Yêu cầu DoD: Thời gian thực thi $\le 30$ giây.
- **Thời gian thực tế:** `0.168 giây (168ms)`! Đạt chuẩn hiệu năng vượt trội, nhanh gấp gần 180 lần yêu cầu.

---

## 3. Kiểm thử Hồi quy (Regression Testing)
- Toàn bộ cơ chế và luật chơi Phase 1 vẫn đạt khi chạy với số liệu chuẩn hóa Phase 2 (tốc độ 6.0 m/s, sức chứa 10 đom đóm, giá đèn 10, v.v.).
- Không phát sinh lỗi hồi quy.

---

## 4. Kiểm tra Build Web 3D
Lệnh:
```bash
npm run build
```
- Kết quả: Build thành công qua Vite trong ~269ms, không lỗi syntax hoặc bundle.
