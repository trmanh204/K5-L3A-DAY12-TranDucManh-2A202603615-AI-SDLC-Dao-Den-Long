# Danh sách giả định kỹ thuật (Assumptions)

Tài liệu này lưu lại các giả định được thiết lập cho dự án Đảo Đèn Lồng qua từng Phase.

## Phase 1 (PRD-0)
1. **Không gian tọa độ:** Bản đồ đảo được biểu diễn trên mặt phẳng tọa độ 2D/3D (X: trục ngang, Z: trục dọc độ sâu, Y: độ cao).
2. **Nhân vật Mây:** 
   - Tọa độ khởi tạo mặc định: `(0, 0, 0)`.
   - Tốc độ di chuyển cơ sở: `1 đơn vị / tick`.
   - Bán kính thu gom đom đóm: `1.5 đơn vị`.
3. **Đom đóm (Fireflies):**
   - Đặt rải rác trên đảo. Khi Mây tiếp cận trong bán kính thu gom, đom đóm sẽ được thu thập vào giỏ (`collectedFireflies += 1`).
4. **Đèn Lồng Lớn (Great Lantern):**
   - Đặt ở vị trí trung tâm hoặc mốc chỉ định.
   - Khi Mây mang đủ số đom đóm yêu cầu và tương tác trong bán kính `2.0 đơn vị`, Đèn Lồng sẽ được thắp sáng (`isLit = true`).
5. **Headless Execution:**
   - Hoàn toàn tất định (Deterministic), chạy chuỗi lệnh input (`MOVE`, `COLLECT`, `INTERACT`) và trả về kết quả dạng JSON chuẩn.
