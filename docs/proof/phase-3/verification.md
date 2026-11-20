# Báo cáo Kiểm chứng Toàn Diện Phase 3 (Ticket-03) - Đảo Đèn Lồng

- **Sinh viên:** Trần Đức Mạnh - 2A202603615
- **Phiên bản Contract:** Test Contract v1.2
- **Ticket:** TICKET-03 — "Đèn cạn dầu"
- **Ngày kiểm chứng:** 20/11/2026
- **Trạng thái:** PASS (100% - 16/16 tests passed, Contract v1.2 compliant)

---

## 1. Kết quả Unit Tests (Automated Test Suite v1.2)

Lệnh thực thi:
```bash
npm test
```

Kết quả:
```text
> dao-den-long@1.0.0 test
> node --test tests/**/*.test.js

✔ Phase 1 Regression - Khởi tạo mặc định Đêm 1 theo chuẩn v1.2 (1.3741ms)
✔ Phase 1 Regression - Determinism cùng seed cho kết quả giống hệt nhau (4.2912ms)
✔ Phase 2 Regression - Cơ chế Nhảy (Jump) và Trọng Lực (Gravity) (0.4332ms)
✔ Phase 2 Regression - Kỹ năng Lướt (Dash) đạt 14 m/s trong 12 ticks và hồi chiêu 1.5s (0.2806ms)
✔ Phase 2 Regression - Bùa Gió (Charms) tăng tốc và miễn hồi chiêu Lướt (0.3845ms)
✔ Phase 2 Regression - Gió Lạc (Drifter) cướp đom đóm và nhả lại khi trúng Pulse (0.26ms)
✔ Phase 2 Regression - Bục Nhảy (Jump pads) Đêm 2 phóng người chơi sang đảo đối diện (0.338ms)
✔ Phase 2 Regression - Rơi khỏi đảo (Y < -10) trừ 1 lửa, mất sạch đom đóm và hồi sinh (0.2758ms)
✔ Phase 2 Regression - Tạm dừng (Pause) đóng băng logic game (0.2413ms)
✔ Phase 3 - Nhiên liệu đèn: Tự tiêu hao 1.0/s và tắt khi fuel <= 0 (lantern_out) (0.3779ms)
✔ Phase 3 - Châm dầu (Refuel): Nạp đom đóm vào đèn đang sáng chưa đầy dầu (0.1974ms)
✔ Phase 3 - Thắp lại (Relight): Đèn đã từng sáng thắp lại chỉ tốn 5 đom đóm (0.1789ms)
✔ Phase 3 - Sức chứa tăng dần (Capacity Progression): 10 + 2 * successful_lights (max 20) (0.178ms)
✔ Phase 3 - Bóng Mực hút dầu (Drain) khi fuel < 30 và thưởng +15 điểm khi bị Tỏa Sáng (0.2732ms)
✔ Phase 3 - Luật thắng mới: Sống sót tới bình minh (dawn_survived) với >= 60% đèn sáng (0.1961ms)
✔ Phase 3 - Headless Scenarios nạp và chạy thành công không crash (2.1383ms)

ℹ tests 16
ℹ suites 0
ℹ pass 16
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 93.0632ms
```

---

## 2. Kiểm chứng Headless Run (Contract v1.2)

Hệ thống Headless Runner mô phỏng đầy đủ chuỗi vòng đời game theo chuẩn Contract v1.2:
- **Đêm 1 (240s = 14,400 ticks):** Đạt 14,400 ticks trong ~0.11s. File lưu tại `docs/proof/phase-3/run_night1.jsonl`.
- **Đêm 2 (270s = 16,200 ticks):** Đạt 16,200 ticks trong ~0.13s. File lưu tại `docs/proof/phase-3/run_night2.jsonl`.
- **Đêm 3 (300s = 18,000 ticks):** Đạt 18,000 ticks trong ~0.15s. File lưu tại `docs/proof/phase-3/run_night3.jsonl`.
- **Kịch bản kiểm thử hành vi Châm dầu & Hút dầu:**
  `src/headless/scenarios/phase3_fuel_drain_scenario.json` chạy thành công không lỗi, xuất log đầy đủ các sự kiện `refuel`, `fuel_drain`, `lantern_out` và `dawn_survived`.

---

## 3. Danh Sách Tài Liệu Thiết Kế Kèm Theo
1. **Kiến trúc & Quyết định thiết kế (ADR):** `docs/notes/adr-001-fuel-and-win-conditions.md`
   - Phân tích chi tiết mô hình trạng thái đèn (`unlit` -> `lit` -> `extinguished` -> `relit`).
   - Lý do loại bỏ `all_lit` và áp dụng cơ chế phòng thủ sống sót tới bình minh (`dawn_survived`).
2. **Changelog Breaking Changes:** `docs/notes/changelog-phase-3.md`
   - Liệt kê tường minh mọi thay đổi phá vỡ tương thích giữa Contract v1.1 và v1.2.
3. **Cập nhật Contract v1.2:** `game.contract.json`
   - Bổ sung toàn bộ trường tuning và snapshot spec mới.
