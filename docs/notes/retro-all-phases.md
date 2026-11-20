# Báo Cáo Hồi Cứu Toàn Diện 4 Phase (Retrospective) - Đảo Đèn Lồng

- **Dự án:** Đảo Đèn Lồng (AI SDLC Day 12)
- **Học viên:** Trần Đức Mạnh — **MSSV:** 2A202603615
- **Mục tiêu:** Đánh giá phương pháp luận AI SDLC, hiệu quả tương tác giữa kỹ sư và AI Agent qua 4 giai đoạn từ PRD-0 đến Release v1.0.0.

---

## 1. Tổng hợp Đánh Giá Qua 4 Phase (Phase Evaluation)

| Giai đoạn | Mục tiêu chính | Thách thức kỹ thuật | Kết quả đạt được | Đánh giá |
|:---|:---|:---|:---|:---:|
| **Phase 1** (PRD-0) | Thiết lập nền móng kiến trúc, tách biệt `src/core/` (logic không DOM/Three.js) và `src/render/` | Đảm bảo tính tất định (determinism) và Test Contract v1.0 | 9/9 unit tests pass, Headless runner mô phỏng chuẩn xác | Xuất sắc |
| **Phase 2** (Ticket-02) | Mở rộng 3 Đêm, thêm Nhảy, Lướt, Bục nhảy, Gió Lạc, Bùa Gió, Web Audio | Quy trình 12 bước trong 1 tick, bảo toàn tính tương thích ngược | 11/11 tests pass, chạy 21.600 ticks trong 168ms (vượt ngưỡng 30s) | Xuất sắc |
| **Phase 3** (Ticket-03) | Change Request: Tiêu hao nhiên liệu, Bóng mực hút dầu, luật thắng Bình Minh | Breaking Change loại bỏ `all_lit`, tính toán điểm suy giảm theo tick | 16/16 tests pass, hoàn thành ADR-001 và Changelog chi tiết | Xuất sắc |
| **Phase 4** (Ticket-04) | Non-functional & Release: Benchmark 30s, Soak test 10 đêm, BXH, Accessibility | Đo FPS cảnh chuẩn 200 shades, kiểm soát RSS không rò rỉ bộ nhớ | 19/19 tests pass, `bench.json` và `soak.json` đạt chuẩn Contract v1.3 | Xuất sắc |

---

## 2. Điều Gì Hiệu Quả và Không Hiệu Quả Khi Làm Việc Với AI?

### Điều hiệu quả:
1. **Phân tách trách nhiệm nghiêm ngặt (Strict Separation of Concerns):** Việc đưa toàn bộ logic vào `src/core/gameState.js` thuần JavaScript giúp AI viết unit test và headless runner cực kỳ nhanh chóng mà không gặp lỗi môi trường Three.js hay WebGL.
2. **Quy trình Test-Driven & Từng bước nhỏ (Incremental Iteration):** Trước khi viết logic phức tạp, AI luôn tạo file test hoặc kịch bản mẫu trước. Khi test chuyển xanh (`pass`), mới chuyển sang tính năng kế tiếp.
3. **Phân tích yêu cầu và tự động tài liệu hóa (Living Documentation):** AI tự động xuất sinh ADR (`adr-001`), tài liệu breaking changes (`changelog-phase-3`), và báo cáo kiểm chứng sau mỗi commit.

### Điều không hiệu quả:
1. **Ảo giác về API / hàm thư viện (Hallucination):** AI đôi khi giả định hàm sinh số ngẫu nhiên là `rng.next()` thay vì gọi hàm `rng()`.
2. **Cơ chế cấp phát bộ nhớ của Runtime:** Khi viết Soak test, AI ban đầu giả định RSS của Node.js phản ánh trực tiếp JS Heap, dẫn đến hiểu nhầm về memory leak do V8 heap chunks của Windows. Cần can thiệp cấu hình warmup runtime để đo RSS chuẩn xác.

---

## 3. Những Lần AI Sai Sót và Cách Phát Hiện & Khắc Phục

1. **Lỗi `Expected 480 strictly equal to 477` trong Phase 3:**
   - *Phát hiện:* Unit test báo đỏ khi kiểm tra điểm số tại bình minh.
   - *Nguyên nhân:* AI tính nhẩm ban đầu không tính đến việc ở tick cuối cùng (tick 14400), đèn sáng bị trừ $1/60$ fuel ở bước 2 trước khi kết thúc ván, khiến `Math.floor(80 - 0.0167) = 79` thay vì 80.
   - *Khắc phục:* Giữ nguyên logic chạy tuần tự nghiêm ngặt của Contract v1.2 và điều chỉnh test assertion giải thích rõ hành vi thực tế.
2. **Lỗi tên người chơi 13 ký tự trong Leaderboard:**
   - *Phát hiện:* Lệnh xuất leaderboard CLI ném ngoại lệ khi nhập `LanternMaster`.
   - *Nguyên nhân:* Yêu cầu đề bài giới hạn 3–12 ký tự, tên mẫu vượt quá 1 ký tự.
   - *Khắc phục:* Điều chỉnh tên mẫu thành `Lantern_Ace` (11 ký tự) và hoàn thiện regex validation `[A-Za-z0-9_]`.

---

## 4. Harness Nào Giúp Ích Nhiều Nhất?

1. **`AGENTS.md` (System Instructions for AI):** Là harness quan trọng số 1. Quy định rõ ràng quy tắc "Không import Three.js vào src/core/", thứ tự 12 bước xử lý tick và quy trình 6 bước mỗi phase giúp AI không bao giờ đi lệch hướng kiến trúc.
2. **Test Contract JSON Schema (`game.contract.json`):** Giúp chuẩn hóa các tham số tuning (`player_speed`, `fuel_decay`, `dash_speed`) tập trung tại một nơi duy nhất.
3. **Vite + Node Test Runner:** Cho tốc độ phản hồi tức thì (<150ms cho 19 unit test), giúp phát hiện lỗi hồi quy ngay lập tức.

---

## 5. Tổng Token Tiêu Thụ & Chiến Lược Tiết Kiệm Chi Phí

- **Tổng Tokens tiêu thụ (4 Phase):** Ước tính ~175,000 tokens (Input: ~135,000, Output: ~40,000).
- **Chiến lược tiết kiệm token đã áp dụng:**
  - Không truyền toàn bộ file lớn vào prompt; chỉ đọc các block code cần sửa bằng `read_file` theo dòng.
  - Sử dụng công cụ `edit_file` thay thế theo đoạn nhỏ thay vì ghi đè toàn bộ file lớn.
  - Sử dụng tóm tắt ngữ cảnh (`CONTEXT_SUMMARY`) giữa các lượt hội thoại để giảm độ dài context window.

---

## 6. Nếu Được Làm Lại Từ Đầu, Bạn Sẽ Thay Đổi Gì?

1. **Chuẩn bị môi trường headless đồ họa sớm hơn:** Xây dựng sẵn runner WebGL headless (dùng `gl` hoặc `puppeteer`) ngay từ Phase 1 để có thể chụp ảnh màn hình tự động làm bằng chứng cho mỗi phase.
2. **Tham số hóa toàn bộ hệ thống âm thanh:** Đóng gói bộ tổng hợp Web Audio Synthesizer thành một module độc lập có cấu hình tần số dạng JSON để dễ dàng mở rộng thêm nhiều nhạc cụ dân gian Việt Nam cho Đảo Đèn Lồng.
