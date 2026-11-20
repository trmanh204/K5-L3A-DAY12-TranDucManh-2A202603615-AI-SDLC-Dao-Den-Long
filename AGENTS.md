# Agent Harness & Instructions - Đảo Đèn Lồng (AI SDLC)

Tài liệu hướng dẫn dành cho AI Agent khi phát triển và bảo trì dự án Đảo Đèn Lồng.

## 1. Lệnh thực thi cơ bản
- **Chạy game giao diện 3D:** `npm run dev` (mở trình duyệt xem Web 3D)
- **Build bản phát hành:** `npm run build`
- **Chạy toàn bộ unit test:** `npm test`
- **Chạy chế độ Headless Test Contract:** `node src/headless/runner.js [path/to/scenario.json]`

## 2. Nguyên tắc kiến trúc & Quy chuẩn mã nguồn
- **Phân tách Logic và Hiển thị (Strict Separation of Concerns):**
  - Mọi logic tính toán (tọa độ nhân vật Mây, nhặt đom đóm, thắp đèn, va chạm, tick update) **BẮT BUỘC** nằm trong `src/core/`.
  - Không import thư viện DOM, Window hay Three.js vào trong `src/core/`. `src/core/` phải chạy độc lập trên môi trường Node.js headless.
  - `src/render/` chỉ phụ trách nhận state từ `src/core/` để render đồ họa Three.js (mesh, lighting, camera, fog).
- **Tính tất định (Determinism):**
  - Cùng một seed, cùng chuỗi thao tác input (tick/di chuyển) phải cho ra cùng một trạng thái state chính xác 100%.

## 3. Quy trình làm việc mỗi Phase
1. Đọc yêu cầu Ticket, bóc tách yêu cầu bắt buộc và ghi giả định vào `docs/notes/assumptions.md`.
2. Lập kế hoạch kiểm chứng (Test cases) trước khi viết code logic.
3. Code bước nhỏ, chạy test xanh (`npm test`), chạy headless kiểm chứng.
4. Lưu bằng chứng vào `docs/proof/phase-X/`.
5. Cập nhật nhật ký token vào `docs/notes/token-log.md`.
6. Commit rõ ràng, gắn tag `phase-X`.
