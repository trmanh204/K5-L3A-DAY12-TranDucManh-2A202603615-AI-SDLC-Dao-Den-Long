# Tài Liệu Đặc Tả Kỹ Thuật & Acceptance Criteria - Phase 2 (Ticket-02)

Dự án: **Đảo Đèn Lồng (Lantern Island)** - Day 12 AI SDLC  
Sinh viên: **Trần Đức Mạnh - 2A202603615**  
Phiên bản Contract: **Test Contract v1.1**

---

## Danh Mục Tiêu Chí Chấp Nhận (Acceptance Criteria) Cho Các Tính Năng Mới

### 1. Gió Lạc (Drifter) - Đêm 2 & 3
- [x] **AC-1.1:** Xuất hiện dưới dạng dải lụa xám xanh `#8FA3B8`, tốc độ lướt chậm `2.0 m/s` khi `idle`, tốc độ truy đuổi `7.0 m/s`.
- [x] **AC-1.2:** Tối đa 2 con trên bản đồ, xuất hiện tại tick 1200, 2400...
- [x] **AC-1.3:** Khi Mây mang $\ge 5$ đom đóm và cách Gió Lạc $\le 15\text{m}$, Gió Lạc chuyển từ `idle` sang `chase`.
- [x] **AC-1.4:** Khi chạm Mây (khoảng cách mặt phẳng $XZ \le 1.2\text{m}$), cướp ngay $\min(3, \text{carried})$ đom đóm, phát sự kiện `drifter_steal`, chuyển sang trạng thái `flee` và bay xa trong 240 ticks rồi biến mất.
- [x] **AC-1.5:** Khi trúng chiêu Tỏa Sáng (Pulse):
  - Nếu đang `chase`: chuyển ngay sang `flee` mà không cướp được gì.
  - Nếu đang `flee` và đang giữ đom đóm: nhả toàn bộ số đom đóm đã cướp ra mặt đất thành đom đóm rơi (dropped motes), phát sự kiện `drifter_drop` và biến mất sau 120 ticks.
- [x] **AC-1.6:** Gió Lạc không làm mất Ngọn Lửa sinh mệnh của Mây; vùng an toàn của đèn sáng không cản được Gió Lạc; trạng thái bất tử tạm thời của Mây không ngăn được việc bị cướp.

### 2. Bùa Gió (Charms)
- [x] **AC-2.1:** Xuất hiện dưới hình dáng lá bùa đỏ `#C8102E` viền vàng `#F2C14E`. Vị trí: Đêm 2 tại $(35, 0, 0)$; Đêm 3 tại $(30, 0, 25)$ và $(-30, 0, 25)$.
- [x] **AC-2.2:** Người chơi nhặt được khi $XZ \le 1.0\text{m}$ và chênh lệch độ cao $Y \le 1.5\text{m}$. Phát sự kiện `charm_picked`.
- [x] **AC-2.3:** Hiệu lực kéo dài 600 ticks:
  - Tốc độ chạy tăng lên `7.2 m/s` (thay vì 6.0 m/s).
  - Lướt (Dash) không có thời gian hồi chiêu (`dash_cooldown_ticks = 0`).
- [x] **AC-2.4:** Bùa Gió tự động tái sinh sau 2700 ticks kể từ khi được nhặt.

### 3. Chuỗi 3 Đêm (3 Nights Campaign)
- [x] **AC-3.1:** Hỗ trợ điều hướng mượt mà: Menu chọn đêm / thanh chuyển đêm (Đêm 1: Đảo Bến, Đêm 2: Đảo Cau, Đêm 3: Đảo Chuông).
- [x] **AC-3.2:** Khi thắng một đêm, hiển thị bảng tổng kết điểm và cho phép tiến tới đêm tiếp theo.
- [x] **AC-3.3:** Khi hoàn thành thắng Đêm 3, hiển thị màn hình **Bình Minh Rạng Rỡ** với tổng điểm cả 3 Đêm.
- [x] **AC-3.4:** Khi thất bại ở một đêm, cho phép người chơi bấm chơi lại chính đêm đó với đầy đủ 3 Ngọn Lửa.

### 4. Tạm Dừng (Pause Game)
- [x] **AC-4.1:** Nhấn phím `Esc` hoặc `P` để tạm dừng game bất cứ lúc nào.
- [x] **AC-4.2:** Khi tạm dừng, toàn bộ logic mô phỏng (tọa độ, vận tốc, AI, đồng hồ đếm ngược, hồi chiêu) đóng băng hoàn toàn.
- [x] **AC-4.3:** Phát sự kiện `paused` khi dừng và `resumed` khi tiếp tục. Snapshot trả về `state: "paused"`.

### 5. Cài Đặt (Settings Storage)
- [x] **AC-5.1:** Giao diện cho phép tinh chỉnh: Âm lượng hiệu ứng âm thanh (0% - 100%) và Độ nhạy chuột / camera.
- [x] **AC-5.2:** Giá trị cài đặt được lưu trữ bền vững trong `localStorage` của trình duyệt và tự động nạp lại khi mở lại game.

### 6. Âm Thanh (Web Audio API Synthesizer)
- [x] **AC-6.1:** Tích hợp bộ tổng hợp âm thanh đa dạng:
  - Nhặt đom đóm (Chime cao ngân nga)
  - Nhảy (Whoosh nảy)
  - Lướt (Gió lướt vút)
  - Tỏa Sáng (Chuông đồng ngân vang)
  - Thắp đèn (Hợp âm thăng hoa)
  - Bị đánh (Tiếng trầm cảnh báo)
  - Chiến thắng (Fanfare)
- [x] **AC-6.2:** Không phụ thuộc file mp3 ngoài, bảo đảm 100% không bao giờ gặp lỗi thiếu asset hay lỗi mạng.

### 7. Giao Diện Người Dùng Đầy Đủ (HUD Full Specification)
- [x] **AC-7.1:** Ngọn Lửa sinh mệnh hiển thị góc trên bên trái (`🔥🔥🔥`).
- [x] **AC-7.2:** Đồng hồ đếm ngược `mm:ss` góc trên ở giữa, tự động chuyển màu đỏ `#FF5A5F` và nhấp nháy khi thời gian $\le 30\text{s}$.
- [x] **AC-7.3:** Số lượng đèn đã thắp ($k/n$) và Điểm số hiển thị góc trên bên phải.
- [x] **AC-7.4:** Giỏ chứa đom đóm 10 ô trực quan ở giữa đáy màn hình, lấp đầy theo số đom đóm mang theo.
- [x] **AC-7.5:** Biểu tượng hồi chiêu Lướt và Tỏa Sáng hiển thị góc dưới bên phải, có màn che mờ tỉ lệ thời gian hồi.
- [x] **AC-7.6:** Hiện thông báo tương tác nổi bật *"E — Nạp ánh sáng (x/10)"* khi đứng trong bán kính 2.0m của đèn chưa thắp.
- [x] **AC-7.7:** Mũi tên định hướng chỉ đường tới vị trí đèn chưa sáng gần nhất khi người chơi ở xa hoặc đèn nằm ngoài tầm nhìn.

### 8. Bảng Màu Chuẩn (Color Palette Conformance)
- [x] **AC-8.1:** Đêm/Sương: `#0E1430`, `#1B2350`.
- [x] **AC-8.2:** Cỏ/Cát/Gỗ/Biển mây: `#2F5D50`, `#C9B48A`, `#6B4A2F`, `#12384A`.
- [x] **AC-8.3:** Đèn sáng/Lõi/Tắt: `#FFB347`, `#FFE9B0`, `#5B5F6E`.
- [x] **AC-8.4:** Đom đóm: `#FFF6C2`, `#FFE58A`.
- [x] **AC-8.5:** Bóng Mực: `#120A1A`, `#7A3CFF`, `#3A3450`.
- [x] **AC-8.6:** Áo Mây/Khăn & Bùa Gió: `#E8E2D0`, `#C8102E`.
- [x] **AC-8.7:** Ánh sáng môi trường tăng tuyến tính: $\text{Intensity} = 0.15 + 0.55 \times (\text{đèn sáng} / \text{tổng đèn})$.
