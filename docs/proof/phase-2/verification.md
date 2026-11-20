# Báo cáo Kiểm chứng Toàn Diện Phase 2 (Ticket-02) - Đảo Đèn Lồng

- **Sinh viên:** Trần Đức Mạnh - 2A202603615
- **Phiên bản Contract:** Test Contract v1.1
- **Ticket:** TICKET-02 — "Ba hòn đảo"
- **Ngày kiểm chứng:** 20/11/2026
- **Trạng thái:** PASS (100% - 11/11 tests passed)

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

✔ Phase 1 Regression - Khởi tạo mặc định Đêm 1 theo chuẩn v1.1 (1.4837ms)
✔ Phase 1 Regression - Determinism cùng seed cho kết quả giống hệt nhau (4.2718ms)
✔ Phase 2 - Cơ chế Nhảy (Jump) và Trọng Lực (Gravity) (0.5166ms)
✔ Phase 2 - Kỹ năng Lướt (Dash) đạt tốc độ 14 m/s trong 12 ticks và hồi chiêu 1.5s (0.3482ms)
✔ Phase 2 - Bùa Gió (Charms) tăng tốc lên 7.2 m/s và miễn hồi chiêu Lướt (0.3913ms)
✔ Phase 2 - Gió Lạc (Drifter) cướp đom đóm và nhả lại khi trúng Pulse (0.3337ms)
✔ Phase 2 - Bục Nhảy (Jump pads) Đêm 2 phóng người chơi sang đảo đối diện (0.3731ms)
✔ Phase 2 - Rơi khỏi đảo (Y < -10) trừ 1 lửa, mất sạch đom đóm và hồi sinh sau 60 ticks (0.3151ms)
✔ Phase 2 - Tạm dừng (Pause) đóng băng logic game và snapshot có state: paused (0.2856ms)
✔ Phase 2 - Đêm 2 có 6 lồng đèn và Đêm 3 có 7 lồng đèn (0.5002ms)
✔ Phase 2 - Headless Scenarios cho các tính năng mới nạp và chạy thành công (2.0441ms)

ℹ tests 11
ℹ suites 0
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 100.1235ms
```

---

## 2. Danh Sách Headless Scenarios Cho Từng Tính Năng Mới
Theo yêu cầu Definition of Done (DoD), hệ thống đã xây dựng các kịch bản riêng biệt:
1. `src/headless/scenarios/scenario_jump_dash.json`: Kiểm tra tương tác vật lý Nhảy & Lướt.
2. `src/headless/scenarios/scenario_drifter.json`: Kiểm tra AI săn mồi của Gió Lạc và rơi đom đóm khi trúng Pulse.
3. `src/headless/scenarios/scenario_charm.json`: Kiểm tra Bùa Gió tăng tốc lên 7.2 m/s và miễn hồi chiêu Lướt.
4. `src/headless/scenarios/scenario_jump_pad.json`: Kiểm tra bục nhảy phóng bay qua đảo đối diện.
5. `src/headless/scenarios/scenario_fall.json`: Kiểm tra cơ chế rơi khỏi đảo $Y < -10$, trừ 1 lửa và hồi sinh sau 60 ticks.
6. `src/headless/scenarios/phase2_night2_scenario.json`: Kiểm tra toàn diện Đêm 2.

---

## 3. Kiểm Thử Hiệu Năng Headless (21.600 Ticks)
Lệnh thực thi:
```powershell
Measure-Command { node src/headless/runner.js --seed 42 --night 3 --ticks 21600 --out docs/proof/phase-2/run_night3_full.jsonl --snapshot-every 300 }
```
- Thời gian thực tế: **0.168 giây (168ms)**.
- So với tiêu chuẩn DoD ($\le 30$ giây), hiệu năng chạy nhanh hơn gấp **~178 lần**.

---

## 4. Kiểm Thử Giao Diện & Tính Năng Đồ Họa 3D
- Hỗ trợ đầy đủ chuỗi 3 Đêm (Đêm 1: Đảo Bến, Đêm 2: Đảo Cau, Đêm 3: Đảo Chuông).
- Tuân thủ bảng màu chuẩn HEX 100%.
- Tích hợp bộ tổng hợp âm thanh Web Audio API Synthesizer (nhặt, nhảy, lướt, tỏa sáng, bị đánh, thắp đèn).
- HUD trực quan: Giỏ đom đóm 10 ô, hồi chiêu kỹ năng, bảng đếm ngược đỏ nhấp nháy $\le 30\text{s}$, thông báo nạp đèn, và **Mũi tên định hướng** trỏ tới đèn chưa sáng gần nhất.
- Bảng Cài đặt (Settings) lưu trữ âm lượng và độ nhạy bền vững trong `localStorage`.
