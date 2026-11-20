# Nhật Ký Giả Định & Quyết Định Thiết Kế (Assumptions & Design Decisions)

Dự án: **Đảo Đèn Lồng (Lantern Island)** - Day 12 AI SDLC
Sinh viên: **Trần Đức Mạnh - 2A202603615**

---

## Phase 1: Test Contract v1.0 & Cơ Chế Cốt Lõi (Core Gameplay)

### 1. Kiến Trúc Tách Biệt Tuyệt Đối (Headless Separation)
- **Quy tắc:** Thư mục `src/core/` hoàn toàn độc lập, không import Three.js, không sử dụng DOM (`window`, `document`).
- **Ý nghĩa:** Cho phép chạy giả lập headless bằng Node.js cực nhanh, hỗ trợ chạy hàng nghìn test cases mà không cần mở trình duyệt hay dựng môi trường đồ họa nặng nề.

### 2. Thuật Toán Sinh Số Ngẫu Nhiên Tất Định (RNG Determinism)
- **Quyết định:** Sử dụng thuật toán **Mulberry32** với 32-bit integer arithmetic.
- **Lý do:** Đảm bảo với cùng một `--seed` và cùng một chuỗi thao tác phím (inputs), toàn bộ trạng thái game (tọa độ Mây, Bóng Mực, Đom đóm, sự kiện) là giống hệt nhau 100% giữa các lần chạy và trên các hệ điều hành khác nhau.

### 3. Vận Động & Camera Yaw
- **Quyết định:** Áp dụng công thức chuyển đổi góc quay camera chuẩn từ Test Contract v1.0:
  $$\theta = \text{cam\_yaw\_deg} \times \pi / 180$$
  $$x' = x \cdot \cos\theta + z \cdot \sin\theta$$
  $$z' = -x \cdot \sin\theta + z \cdot \cos\theta$$
- Chuẩn hóa vector (Normalize) nếu độ dài vượt quá 1.0 để tránh hiện tượng đi chéo nhanh hơn đi thẳng.

### 4. Cơ Chế Vùng An Toàn (Safe Zone)
- Mỗi lồng đèn khi được thắp sáng (`lit: true`) tạo ra một bán kính an toàn `safe_radius: 8.0` m.
- Khi người chơi đứng trong vùng an toàn, Bóng Mực (Shades) mất dấu mục tiêu và chuyển sang trạng thái tuần tra (`wander`). Đồng thời, Bóng Mực bị đẩy lùi nếu cố gắng tiếp cận lồng đèn sáng.

### 5. Kỹ Năng Tỏa Sáng (Pulse)
- Tốn 2 đom đóm mang theo (`pulse_cost: 2`).
- Thời gian hồi chiêu `2.8s` (`pulse_cooldown_s: 2.8`).
- Bán kính ảnh hưởng `6.5m` (`pulse_radius: 6.5`).
- Khi kích hoạt: làm choáng quái vật trong `2.6s` (`pulse_stun_s: 2.6`) và đẩy lùi quái `4.5m` (`pulse_push_m: 4.5`), cộng 5 điểm cho mỗi quái bị làm choáng.

### 6. Quản Lý File JSONL & Mã Thoát (Exit Codes)
- Định dạng xuất dữ liệu: JSON Lines (`.jsonl`), mỗi dòng là một object JSON độc lập đại diện cho `snapshot`, `event`, hoặc `end`.
- Mã thoát:
  - `0`: Thành công hoàn tất simulation.
  - `2`: Lỗi định dạng kịch bản (scenario) hoặc file inputs không hợp lệ theo quy định Contract.
  - Khác `0`: Lỗi ngoại lệ hệ thống.
