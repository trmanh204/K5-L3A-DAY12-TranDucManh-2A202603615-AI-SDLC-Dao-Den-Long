# ADR 001: Chuyển Đổi Mô Hình Trạng Thái Lồng Đèn & Điều Kiện Thắng (Phase 3)

- **Trạng thái:** ACCEPTED
- **Ngày:** 20/11/2026
- **Tác giả:** Trần Đức Mạnh - 2A202603615
- **Phạm vi:** Core Simulation Engine (`src/core/gameState.js`) & Test Contract v1.2

---

## 1. Bối cảnh (Context)
Ở Phase 1 và Phase 2, trò chơi áp dụng quy tắc cổ điển:
- Mỗi lồng đèn khi được nạp đủ 10 đom đóm sẽ chuyển sang trạng thái thắp sáng vĩnh viễn (`lit: true`).
- Trò chơi kết thúc và người chơi giành chiến thắng ngay lập tức khi tất cả các đèn được thắp sáng (`all_lit`).

Tuy nhiên, qua thực tế chơi thử (Playtest), người chơi có kỹ năng cao hoàn thành thắp toàn bộ đèn chỉ sau 2 phút, dẫn đến việc nửa sau thời gian của Đêm bị bỏ trống, mất đi cảm giác căng thẳng và hồi hộp trong việc sinh tồn giữ lửa.

Do đó, Change Request **TICKET-03 ("Đèn cạn dầu")** yêu cầu thay đổi cốt lõi mô hình vận hành của lồng đèn và điều kiện thắng cuộc.

---

## 2. Các Quyết Định Thiết Kế (Design Decisions)

### 2.1. Vòng đời Nhiên Liệu Lồng Đèn (Lantern Fuel Lifecycle)
- **Cấu trúc trạng thái mới:**
  Mỗi lồng đèn bổ sung các thuộc tính:
  - `fuel`: Nhiên liệu hiện tại, giá trị trong đoạn $[0, 100]$.
  - `ever_lit`: Cờ đánh dấu đèn đã từng được thắp sáng ít nhất một lần.
  - `relit_count`: Số lần đèn được thắp sáng lại.
- **Quy tắc hao hụt:**
  - Đèn đang sáng tự tiêu hao $1.0\text{ fuel/giây}$ (tương đương $1/60\text{ fuel/tick}$).
  - Khi $fuel \le 0$, đèn tự động chuyển sang tắt (`lit = false`), `deposited = 0`, phát sự kiện `lantern_out`.
- **Cơ chế Châm Dầu (Refuel):**
  - Người chơi có thể tương tác với đèn đang sáng chưa đầy dầu để nạp thêm đom đóm:
    $$\text{used} = \min(\text{carried}, \lceil (100 - \text{fuel}) / 10 \rceil)$$
    $$\text{fuel} = \min(100, \text{fuel} + 10 \times \text{used})$$
  - Phát sự kiện `refuel`.
- **Cơ chế Thắp Lại (Relight):**
  - Đèn đã từng sáng (`ever_lit === true`) khi bị tắt chỉ cần **5 đom đóm** để thắp lại (thay vì 10 đom đóm như lần đầu).

### 2.2. Bóng Mực Hút Dầu (Shade Drain AI)
- Khi lồng đèn có $\text{fuel} < 30$, vùng an toàn $6\text{m}$ bị **vô hiệu hóa**.
- Bóng Mực ở trạng thái tuần tra (`wander`) sẽ bị thu hút và di chuyển về phía lồng đèn yếu nhất.
- Khi tiếp cận cách đèn $\le 2\text{m}$, Bóng Mực chuyển sang trạng thái mới `drain`, đứng yên và hút $5\text{ fuel/giây}$ liên tục ($5/60\text{ fuel/tick}$). Mỗi 60 ticks phát sự kiện `fuel_drain`.
- Đánh choáng Bóng Mực trong lúc `drain` thưởng lớn: **+15 điểm** (thay vì +5 điểm thông thường).

### 2.3. Điều Kiện Thắng Mới: Sống Sót Tới Bình Minh (`dawn_survived`)
- **Bỏ cơ chế Thắng Sớm:** Thắp đủ 100% đèn không còn kết thúc game sớm. Người chơi phải duy trì bảo vệ đảo cho tới giây cuối cùng.
- **Thời lượng Đêm được rút ngắn:** Đêm 1: 240s, Đêm 2: 270s, Đêm 3: 300s.
- **Điều kiện thắng:** Khi đồng hồ đếm ngược về 0 (Bình minh), người chơi còn sống VÀ số đèn đang sáng $\ge \lceil 0.6 \times \text{tổng đèn} \rceil$:
  - Đêm 1: Cần $\ge 3/5$ đèn sáng.
  - Đêm 2: Cần $\ge 4/6$ đèn sáng.
  - Đêm 3: Cần $\ge 5/7$ đèn sáng.
- Sự kiện kết thúc mang lý do `dawn_survived`.

### 2.4. Tiến Trình Nâng Sức Chứa (Capacity Progression)
- Sức chứa giỏ đom đóm tăng dần theo thành tích của Mây:
  $$\text{Capacity} = 10 + 2 \times \text{successful\_lights} \quad (\text{tối đa } 20)$$

---

## 3. Hậu quả & Đánh đổi (Consequences)
- **Breaking Changes:** Các test case Phase 1/Phase 2 dựa vào điều kiện thắng sớm `all_lit` hoặc điểm thưởng thời gian cũ phải được cập nhật lại theo `dawn_survived` và bảng điểm mới.
- **Tính hấp dẫn:** Tạo nhịp độ chơi liên tục, người chơi phải tính toán chiến thuật: vừa gom đom đóm thắp đèn mới, vừa phải đi tuần châm dầu bảo vệ các đèn cũ không bị Bóng Mực hút cạn.
