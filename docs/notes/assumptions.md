# Nhật Ký Giả Định & Quyết Định Thiết Kế (Assumptions & Design Decisions)

Dự án: **Đảo Đèn Lồng (Lantern Island)** - Day 12 AI SDLC
Sinh viên: **Trần Đức Mạnh - 2A202603615**

---

## Phase 2: Ticket-02 — "Ba hòn đảo" & Test Contract v1.1

### 1. Đồng bộ Số Liệu Chuẩn (Thay thế các giá trị tự chọn ở Phase 1)
- **Tốc độ di chuyển:** Chuẩn hóa `6.0 m/s` (tăng lên `7.2 m/s` khi nhận Bùa Gió). Tăng/giảm tốc `<= 0.1s`.
- **Nhảy & Trọng lực:** Vận tốc nhảy `7.0 m/s`, trọng lực `g = -20 m/s²`. Chỉ cho phép nhảy khi chân chạm đất (`grounded = true`).
- **Lướt (Dash - Mới):** Tốc độ `14.0 m/s`, thời gian tồn tại `0.2s` (12 ticks), thời gian hồi chiêu `1.5s` (90 ticks). Khi có hiệu lực Bùa Gió: hồi chiêu = 0 (vẫn cần ấn phím để kích hoạt lần kế, không được kích hoạt khi đang trong 12 ticks lướt). Lướt trên không giữ nguyên độ cao Y.
- **Đom đóm (Motes):** Sức chứa nâng lên `10`. Điều kiện nhặt: khoảng cách mặt phẳng $XZ \le 1.0\text{m}$ VÀ $|Y_{\text{chân}} - Y_{\text{đom đóm}}| \le 1.5\text{m}$.
- **Lồng đèn:** Chi phí thắp chuẩn là `10` đom đóm. Bán kính tương tác nạp đom đóm là `2.0m`. Bán kính vùng an toàn của đèn sáng là `6.0m`.
- **Tỏa Sáng (Pulse):** Tốn `3` đom đóm, bán kính `5.0m`, hồi chiêu `3.0s`. Bóng Mực trúng chiêu bị choáng `120 ticks`, bị đẩy lùi tổng `4.0m` trong 15 ticks đầu.
- **Bóng Mực (Shades):** Tốc độ `4.0 m/s` (Đêm 3: `4.5 m/s`). Tầm phát hiện `12.0m`, tầm mất dấu `18.0m`. Trạng thái chuẩn: `spawning`, `wander`, `chase`, `recoil`, `stunned`. Khi gây hit: lùi `2.0m` trong `60 ticks` (`recoil`).
- **Bị đánh:** Mất 1 Ngọn Lửa, rơi $\lfloor \text{carried} / 2 \rfloor$ đom đóm ra vành 1.5–2.5m quanh Mây (tồn tại 480 ticks), bất tử 90 ticks.
- **Rơi khỏi đảo ($Y < -10$):** Bỏ qua bất tử, mất 1 Ngọn Lửa, mất sạch đom đóm đang mang. Đợi 60 ticks không tương tác rồi hồi sinh tại điểm xuất phát với vận tốc 0, bất tử 90 ticks.
- **Thời lượng Đêm:** Đêm 1: `300s`, Đêm 2: `330s`, Đêm 3: `360s`.

### 2. Thiết Kế Màn Chơi (3 Bản Đồ Đêm)
- **Đêm 1 (Đảo Bến):** Đảo tròn $R = 40\text{m}$. 5 lồng đèn $L_1 \dots L_5$. 24 điểm sinh đom đóm (8 điểm $R=12\text{m}$, 16 điểm $R=33\text{m}$). 12 điểm sinh Bóng Mực $R=37\text{m}$.
- **Đêm 2 (Đảo Cau):** 2 đảo tròn $R = 28\text{m}$ (tâm $(0,0,0)$ và $(70,0,0)$), nối bằng cầu tre $X \in [26, 44]$, $Z \in [-2, 2]$.
  - 2 bục nhảy $R=1\text{m}$ tại $(20,0,18)$ và $(50,0,-18)$ phóng $v_y = 14\text{ m/s}, v_{\text{ngang}} = 24\text{ m/s}$ về tâm đảo đối diện.
  - 6 lồng đèn $L_1 \dots L_6$. Bùa Gió $C_1$ tại $(35,0,0)$. Gió Lạc (Drifter) xuất hiện.
- **Đêm 3 (Đảo Chuông):** Đảo $R = 45\text{m}$ gồm 3 tầng ($Y=0, Y=3, Y=6$).
  - Bục nhảy $(0,3,13)$ phóng $v_y = 12\text{ m/s}, v_z = -8\text{ m/s}$ đáp lên tầng 2.
  - Tháp chuông tâm tầng 2 bán kính $2\text{m}$ cao $8\text{m}$. 7 lồng đèn $L_1 \dots L_7$.
  - 2 Bùa Gió $C_1, C_2$ tại $(30,0,25)$ và $(-30,0,25)$.
  - Gió mạnh định kỳ mỗi 30s thổi 5s với vận tốc $2\text{ m/s}$.

### 3. Thực Thể Mới: Gió Lạc (Drifter) & Bùa Gió (Charm)
- **Gió Lạc:** Tốc độ lượn $2\text{ m/s}$, tốc độ săn/chạy trốn $7\text{ m/s}$. Khi người chơi mang $\ge 5$ đom đóm và cách $\le 15\text{m}$, chuyển sang `chase`. Chạm $XZ \le 1.2\text{m}$ cướp $\min(3, \text{carried})$ và chuyển sang `flee`. Trúng Pulse khi mang đồ sẽ thả lại đom đóm rơi.
- **Bùa Gió:** Hiệu lực 600 ticks, hồi sinh sau 2700 ticks.

### 4. Thứ Tự Xử Lý Tick Chuẩn 12 Bước
1. Đọc input (xử lý Pause).
2. Giảm các bộ đếm (cooldown, invuln, stun, charm, TTL đom đóm rơi...).
3. Di chuyển Mây (nhảy, lướt, bục nhảy, gió) và kiểm tra rơi khỏi đảo.
4. Nhặt đom đóm và bùa.
5. Tương tác nạp đèn.
6. Cập nhật vùng an toàn.
7. Kỹ năng Tỏa Sáng.
8. Di chuyển Bóng Mực và Gió Lạc.
9. Xử lý va chạm (Gió Lạc cướp trước, rồi Bóng Mực gây hit).
10. Sinh thực thể theo lịch.
11. Xét điều kiện Thắng/Thua.
12. Xuất Snapshot/Event.
