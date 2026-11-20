# Video Demo Hướng Dẫn - Đảo Đèn Lồng v1.0.0

- **Sinh viên:** Trần Đức Mạnh — **MSSV:** 2A202603615
- **Video Path:** `docs/demo/demo.mp4` (hoặc video đính kèm GitHub Release v1.0.0)

---

## Nội Dung Bản Demo (< 5 phút)
1. **00:00 - 00:30:** Giới thiệu bài thi và kiến trúc phân tách nghiêm ngặt giữa `src/core/` (Node.js/Test Contract) và `src/render/` (Three.js WebGL).
2. **00:30 - 01:30:** Trình diễn chơi trực tiếp trên trình duyệt Web 3D:
   - Đêm 1: Gom đom đóm, thắp đèn, né Bóng Mực.
   - Đêm 2: Nhảy qua Bục Nhảy phóng qua 2 hòn đảo, lướt nhanh với Bùa Gió.
   - Đêm 3: Châm dầu khi đèn yếu, dùng Tỏa Sáng làm choáng Bóng Mực đang hút dầu, sống sót tới bình minh.
3. **01:30 - 02:30:** Trình diễn các tính năng Tiếp Cận (Accessibility) & Bảng Xếp Hạng:
   - Đổi phím điều khiển (Keybindings).
   - Chế độ mù màu (Colorblind Mode).
   - Nhập tên lưu điểm vào Top 10 Bảng Xếp Hạng.
4. **02:30 - 03:30:** Kiểm chứng tự động Test Contract v1.3 trong terminal:
   - Chạy `npm test` (19/19 tests passed).
   - Chạy Benchmark 30s (`node src/headless/benchmark.js`).
   - Chạy Soak test 10 đêm (`node src/headless/soak.js`).
   - Xuất bảng xếp hạng CLI (`node src/headless/runner.js --export-leaderboard out.json`).
