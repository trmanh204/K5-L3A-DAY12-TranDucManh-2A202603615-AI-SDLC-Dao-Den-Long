# Nhật Ký Tiêu Thụ Token & Hoạt Động (Token Log)

Dự án: **Đảo Đèn Lồng (AI SDLC Day 12)**  
Sinh viên: **Trần Đức Mạnh - 2A202603615**

---

## Bảng Theo Dõi Các Phiên Làm Việc

| Ngày & Giờ | Giai đoạn | Thao tác chính | Ước tính Tokens (Input / Output) | Kết quả / Đánh giá |
|:---|:---|:---|:---|:---|
| 20/11/2026 14:30 | Setup Môi trường | Audit công cụ: Node v24, npm v11, git, python. Cài đặt Three.js, Vite. | ~12,000 / ~1,800 | Hoàn tất scaffolding, commit khởi tạo `bfdeb62`. |
| 20/11/2026 15:10 | Bước 1 -> Bước 2 (Phase 1) | Brainstorming PRD-0, phân tích Test Contract v1.0, bóc tách requirement. | ~18,000 / ~3,500 | Xác định 9 yêu cầu cốt lõi, chuẩn hóa contract tuning. |
| 20/11/2026 15:15 | Thực thi Bước 2 (Phase 1) | Viết `game.contract.json`, refactor `src/core/gameState.js`, viết `src/headless/runner.js`, 9 unit tests, `src/render/scene.js`, chạy kiểm chứng JSONL. | ~25,000 / ~6,200 | 9/9 Unit test Pass, Headless runner chạy chính xác, Build Vite thành công. |

---

## Tổng kết tiêu thụ Phase 1
- **Tổng Tokens ước tính:** ~66,500 tokens
- **Đạt chỉ tiêu:** Hoàn thành 100% tiêu chí Test Contract v1.0, không phát sinh lỗi vòng lặp hay tiêu tốn token vô ích.
