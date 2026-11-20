# Nhật Ký Thay Đổi (Changelog) - Đảo Đèn Lồng

Mọi mốc cập nhật và phát hành của dự án "Đảo Đèn Lồng" tuân thủ chuẩn Semantic Versioning và Test Contract.

---

## [v1.0.0] - Phase 4: Phát hành v1.0.0 "Bình minh" (2026-11-20)
### Thêm mới (Added)
- **Chế độ Benchmark (`node src/headless/benchmark.js`):** Cảnh chuẩn Đêm 1 với 200 Bóng Mực, 100 Đom đóm, 3 đèn sáng đầy dầu; Camera bay tròn R=30m, Y=15m quanh tâm trong 30 giây; xuất số liệu `bench.json` chuẩn Test Contract v1.3.
- **Soak Test Runner (`node src/headless/soak.js`):** Kiểm thử độ ổn định và phát hiện rò rỉ bộ nhớ qua 10 Đêm liên tiếp trong cùng một tiến trình, kiểm tra giới hạn `mem_end_mb <= 1.2 * mem_start_mb` và không có sự cố crash.
- **Bảng xếp hạng cục bộ (Local Leaderboard):**
  - Giao diện tra cứu Top 10 kỷ lục từ menu chính.
  - Cho phép người chơi nhập tên (3–12 ký tự) lưu điểm sau khi Thất bại hoặc Thắng Đêm 3.
  - Lệnh CLI xuất bảng xếp hạng: `node src/headless/runner.js --export-leaderboard <path>`.
- **Khả năng tiếp cận (Accessibility):**
  - Tùy biến đổi phím điều khiển (Keybindings) với kiểm tra trùng phím và nút khôi phục mặc định.
  - Phụ đề thông báo sự kiện (Gió thổi, Đếm ngược 10s, Cạn dầu) và mũi tên chỉ hướng mép màn hình khi Bóng Mực áp sát.
  - Tùy chọn Giảm chuyển động (tắt rung lắc camera).
  - Tùy chọn Phóng to chữ giao diện (x1.25, font tối thiểu 18px).
- **Test Contract v1.3:** Bổ sung các lệnh benchmark, soak test và export leaderboard vào `game.contract.json`.

---

## [v0.3.0] - Phase 3: Change Request "Đèn cạn dầu" (2026-11-20)
### Thêm mới & Thay đổi (Breaking Changes)
- **Cơ chế Tiêu hao Nhiên liệu:** Mỗi ngọn đèn sáng có bình dầu 100 fuel, tiêu hao 1.0 fuel/s; đèn tắt ngấm khi hết dầu (`lantern_out`).
- **Châm dầu & Thắp lại:** Người chơi có thể châm thêm dầu vào đèn đang sáng (+10 fuel / đom đóm, +5 điểm); đèn tắt thắp lại chỉ tốn 5 đom đóm (+40 điểm).
- **Bóng Mực hút dầu:** Đèn có `fuel < 30` bị mất vùng an toàn; Bóng Mực bị thu hút tới hút 5 fuel/s; làm choáng kẻ đang hút dầu nhận +15 điểm.
- **Quy tắc Thắng mới (Dawn Survival):** Bãi bỏ luật thắng sớm `all_lit`. Người chơi phải phòng thủ và sống sót tới bình minh khi hết thời gian với ít nhất 60% số đèn trên đảo đang sáng.
- **Sức chứa giỏ tăng dần:** Khởi đầu 10 đom đóm, tăng +2 sức chứa sau mỗi lần thắp sáng thành công (tối đa 20).
- **Chế độ Mù màu (Colorblind Mode):** Bảng màu dạ quang Cyan cho Bóng Mực và đèn tắt bị ép dẹt 20%.

---

## [v0.2.0] - Phase 2: "Ba hòn đảo" (2026-11-20)
### Thêm mới (Added)
- Mở rộng 3 Đêm: Đêm 1 (Đảo Bến), Đêm 2 (Đảo Cau 2 đảo + cầu tre + bục nhảy), Đêm 3 (Đảo Chuông 3 tầng + gió mạnh).
- Cơ chế vận động mới: Nhảy (`jump`), Lướt tốc độ cao (`dash`), Bục nhảy phóng qua đảo (`jump pad`).
- Thực thể mới: Gió Lạc (`drifter`) cướp đom đóm; Bùa Gió (`charm`) tăng tốc độ và miễn hồi chiêu lướt.
- Tính năng Tạm dừng (`pause`) đóng băng toàn bộ tiến trình.
- Web Audio Synthesizer: Tổng hợp hiệu ứng âm thanh thời gian thực.
- Test Contract v1.1 với quy trình xử lý 12 bước trong 1 tick.

---

## [v0.1.0] - Phase 1: Nền tảng cốt lõi PRD-0 (2026-11-20)
### Thêm mới (Added)
- Trình mô phỏng GameState thuần JS không phụ thuộc DOM hay engine đồ họa.
- Nhân vật Mây di chuyển, nhặt đom đóm, thắp đèn, kỹ năng Tỏa Sáng (`pulse`).
- AI Bóng Mực (`wander`, `chase`, `stunned`, `recoil`).
- Headless Runner xuất log JSONL và snapshot kiểm chứng tính tất định (determinism).
- Giao diện 3D Three.js ban đầu.
