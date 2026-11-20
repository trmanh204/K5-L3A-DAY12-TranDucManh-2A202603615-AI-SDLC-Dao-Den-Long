# Nhật Ký Thay Đổi - Phase 3 (Changelog & Breaking Changes)

Dự án: **Đảo Đèn Lồng**  
Sinh viên: **Trần Đức Mạnh - 2A202603615**  
Phiên bản: **Contract v1.2 (TICKET-03 Change Request)**

---

## 🚨 Danh Sách Thay Đổi Phá Vỡ Tương Thích (Breaking Changes)

### 1. Luật Thắng & Kết Thúc Trò Chơi
- ❌ **Xóa bỏ:** Không còn điều kiện kết thúc game sớm khi thắp đủ 100% lồng đèn (`all_lit`).
- ✨ **Mới:** Game chỉ kết thúc khi:
  - Hết Ngọn Lửa sinh mệnh $\to$ Thua ngay (`no_flames`).
  - Hết giờ (Bình minh) $\to$ Xét tỉ lệ đèn sáng $\ge 60\%$: Đạt $\to$ Thắng (`dawn_survived`); Không đạt $\to$ Thua (`dawn`).
- ⏱️ **Thời lượng Đêm được điều chỉnh:**
  - Đêm 1: từ $300\text{s} \to 240\text{s}$.
  - Đêm 2: từ $330\text{s} \to 270\text{s}$.
  - Đêm 3: từ $360\text{s} \to 300\text{s}$.

### 2. Trạng Thái & Nhiên Liệu Lồng Đèn
- ❌ **Thay thế:** Luật "đèn đã sáng không nhận thêm đom đóm".
- ✨ **Mới:** Đèn có thanh nhiên liệu $0 \dots 100$:
  - Hao hụt tự nhiên $1.0\text{ fuel/s}$.
  - Khi $fuel \le 0 \to$ Đèn tắt (`lit = false`), phát sự kiện `lantern_out`.
  - Có thể tương tác để **châm dầu (refuel)**: nạp đom đóm với tỉ lệ $1\text{ đom đóm} = 10\text{ fuel}$, phát sự kiện `refuel`.
  - Đèn đã từng sáng (`ever_lit = true`) thắp lại chỉ tốn **5 đom đóm** (thay vì 10). Sự kiện `lantern_lit` bổ sung trường `relight: true | false`.

### 3. Vùng An Toàn & Bóng Mực Hút Dầu
- ❌ **Thay thế:** Luật "Bóng Mực không bao giờ vào vùng an toàn".
- ✨ **Mới:** Đèn có $fuel < 30$ **mất hoàn toàn vùng an toàn 6m**.
- ✨ **Mới:** Bóng Mực có thêm trạng thái `drain` khi tiếp cận đèn yếu $\le 2\text{m}$, hút $5\text{ fuel/s}$ liên tục. Phát sự kiện `fuel_drain` mỗi 60 ticks.

### 4. Hệ Thống Tính Điểm Hoàn Toàn Mới
- ❌ **Bỏ:** Thưởng thời gian còn lại (`per_second_left` không còn được tính).
- ❌ **Thay đổi:** Điểm nạp đom đóm đổi thành `+5` điểm mỗi đom đóm nạp (trước đây nhặt đom đóm là +10).
- ✨ **Bổ sung:**
  - Thắp đèn lần đầu: `+100` điểm.
  - Thắp lại đèn bị tắt: `+40` điểm.
  - Làm choáng Bóng Mực thường: `+5` điểm; Làm choáng Bóng Mực đang hút dầu (`drain`): `+15` điểm.
  - Khi thắng tại bình minh: Mỗi đèn đang sáng được `+50 + floor(fuel)` điểm; Mỗi Ngọn Lửa còn lại được `+50` điểm.

### 5. Sức Chứa Nâng Cấp Tự Động
- ✨ **Mới:** Sức chứa giỏ đom đóm tăng dần: $\text{Capacity} = 10 + 2 \times \text{successful\_lights}$ (tối đa 20).
- Snapshot player bổ sung trường `capacity`.

### 6. Cập Nhật Test Suite (Ảnh hưởng & Khắc phục)
- Các bài unit test kiểm tra cơ chế thắng sớm `all_lit` được nâng cấp sang kiểm tra điều kiện sống sót qua bình minh `dawn_survived`.
- Cập nhật các assertion điểm số và thời lượng đêm theo công thức mới.
