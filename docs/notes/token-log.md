# Nhật Ký Tiêu Thụ Token & Hoạt Động (Token Log)

Dự án: **Đảo Đèn Lồng (AI SDLC Day 12)**  
Sinh viên: **Trần Đức Mạnh - 2A202603615**

---

## Bảng Theo Dõi Các Phiên Làm Việc

| Ngày & Giờ | Giai đoạn | Thao tác chính | Ước tính Tokens (Input / Output) | Kết quả / Đánh giá |
|:---|:---|:---|:---|:---|
| 20/11/2026 14:30 | Setup Môi trường | Audit công cụ: Node v24, npm v11, git, python. Cài đặt Three.js, Vite. | ~12,000 / ~1,800 | Hoàn tất scaffolding, commit khởi tạo `bfdeb62`. |
| 20/11/2026 15:10 | Bước 1 -> Bước 2 (Phase 1) | Brainstorming PRD-0, phân tích Test Contract v1.0, bóc tách requirement. | ~18,000 / ~3,500 | Xác định 9 yêu cầu cốt lõi, chuẩn hóa contract tuning. |
| 20/11/2026 15:15 | Thực thi Phase 1 | Viết `game.contract.json`, refactor `src/core/gameState.js`, viết `src/headless/runner.js`, 9 unit tests, `src/render/scene.js`, chạy kiểm chứng JSONL. | ~25,000 / ~6,200 | 9/9 Unit test Pass, Headless runner chạy chính xác, Build Vite thành công. Gắn tag `phase-1`. |
| 20/11/2026 16:00 | Thực thi Phase 2 (Ticket-02) | Tiếp nhận Ticket-02 "Ba hòn đảo". Nâng cấp Test Contract v1.1, hỗ trợ 3 Đêm (Night 1, 2, 3), Nhảy, Lướt, Gió Lạc, Bùa Gió, Bục Nhảy, Pause, Web Audio Synthesizer, 11/11 tests pass, stress test 21.600 ticks trong 168ms. | ~28,000 / ~7,500 | 11/11 Test Pass, Không lỗi hồi quy, Chạy headless siêu tốc 0.17s, Build thành công, gắn tag `phase-2`. |
| 20/11/2026 16:45 | Thực thi Phase 3 (Ticket-03) | Tiếp nhận Change Request TICKET-03 "Đèn cạn dầu". Nâng cấp Test Contract v1.2, cơ chế tiêu hao nhiên liệu (fuel decay), châm dầu (refuel), thắp lại (relight), sức chứa tăng dần (capacity progression), Bóng Mực hút dầu (drain), luật thắng bình minh (dawn_survived >= 60%), Colorblind mode, viết ADR-001 và Changelog. 16/16 unit tests pass, headless simulations cho cả 3 đêm. | ~32,000 / ~8,500 | 16/16 Test Pass, Không lỗi hồi quy, Headless pass, Build thành công, gắn tag `phase-3`. |

---

## Tổng kết tiêu thụ đến Phase 3
- **Tổng Tokens ước tính:** ~142,500 tokens
- **Đạt chỉ tiêu:** Hoàn thành 100% tiêu chí DoD của Phase 3 (Ticket-03), tài liệu ADR và Changelog đầy đủ, sẵn sàng cho demo & grading.
