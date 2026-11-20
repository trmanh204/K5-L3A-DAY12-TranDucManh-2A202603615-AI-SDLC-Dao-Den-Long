# Đảo Đèn Lồng (Lantern Island) — Bản Phát Hành v1.0.0

> **Dự án thực hành AI SDLC Day 12**  
> **Sinh viên:** Trần Đức Mạnh — **MSSV:** 2A202603615  
> **Repository:** [https://github.com/trmanh204/K5-L3A-DAY12-TranDucManh-2A202603615-AI-SDLC-Dao-Den-Long](https://github.com/trmanh204/K5-L3A-DAY12-TranDucManh-2A202603615-AI-SDLC-Dao-Den-Long)  
> **Test Contract:** Version 1.3

---

## ⚡ Hướng Dẫn Cài Đặt & Chơi Game Nhanh (Tối đa 3 lệnh)

Clone repo về máy tính sạch và thực thi 3 lệnh sau:

```bash
# Lệnh 1: Cài đặt các gói phụ thuộc
npm install

# Lệnh 2: Chạy toàn bộ 19 unit test kiểm chứng tự động
npm test

# Lệnh 3: Khởi chạy máy chủ Web 3D và mở trình duyệt trải nghiệm
npm run dev
```

---

## 🎮 Hệ Thống Điều Khiển & Phím Tắt

| Thao tác | Phím mặc định | Mô tả |
|:---|:---:|:---|
| **Di chuyển** | `W, A, S, D` / `Mũi tên` | Điều khiển nhân vật Mây chạy khắp các hòn đảo |
| **Nhảy** | `Phím cách (Space)` | Nhảy qua địa hình gồ ghề và nhảy lên Bục Nhảy |
| **Lướt gió** | `Shift` / `K` | Lướt nhanh tốc độ 14 m/s (hồi chiêu 1.5s, miễn phí khi có Bùa Gió) |
| **Nạp / Châm dầu** | `E` | Nạp đom đóm thắp đèn hoặc châm dầu (+10 fuel/đom đóm) |
| **Tỏa Sáng** | `Q` / `F` | Tiêu hao 3 đom đóm làm choáng Bóng Mực trong bán kính 5m |
| **Tạm dừng** | `P` / `Escape` | Mở menu tạm dừng và đóng băng thời gian |

> **Accessibility:** Bạn có thể vào menu `⚙️ Cài đặt` trong game để tùy biến lại mọi phím bấm (Keybindings), bật chế độ mù màu (Colorblind Mode), bật chữ lớn (x1.25) hoặc giảm chuyển động (tắt rung camera).

---

## 🛠️ Lệnh Kiểm Thử & Công Cụ Test Contract v1.3

### 1. Chạy Automated Unit Test Suite
```bash
npm test
```
*Kết quả:* Vượt qua 19/19 bài kiểm thử hồi quy Phase 1, Phase 2, Phase 3 và Phase 4 trong ~150ms.

### 2. Chạy Benchmark Cảnh Chuẩn (Contract v1.3)
```bash
node src/headless/benchmark.js --seed 42 --duration 30 --out bench.json
```
*Quy chuẩn:* Mô phỏng Đêm 1 với 200 Bóng Mực, 100 đom đóm, 3 đèn sáng đầy dầu; Camera bay tròn 30 giây; xuất kết quả `bench.json` đo `avg_fps`, `p1_low_fps`, `load_ms` và `peak_mem_mb`.

### 3. Chạy Soak Test Kiểm Tra Rò Rỉ Bộ Nhớ (10 Đêm)
```bash
node src/headless/soak.js --seed 7 --nights 10 --out soak.json
```
*Quy chuẩn:* Chạy headless 10 Đêm liên tiếp trong cùng một tiến trình; kiểm tra `mem_end_mb <= 1.2 * mem_start_mb` và `crashes = 0`.

### 4. Xuất Bảng Xếp Hạng Cục Bộ (Leaderboard)
```bash
node src/headless/runner.js --export-leaderboard out.json
```
*Kết quả:* Xuất danh sách Top 10 kỷ lục điểm số ra tệp JSON theo thứ tự giảm dần.

### 5. Chạy Headless Runner Mô Phỏng Từng Đêm
```bash
# Mô phỏng Đêm 1 (14,400 ticks = 240s)
node src/headless/runner.js --seed 42 --night 1 --ticks 14400 --out run_n1.jsonl

# Mô phỏng Đêm 2 (16,200 ticks = 270s)
node src/headless/runner.js --seed 42 --night 2 --ticks 16200 --out run_n2.jsonl

# Mô phỏng Đêm 3 (18,000 ticks = 300s)
node src/headless/runner.js --seed 42 --night 3 --ticks 18000 --out run_n3.jsonl
```

---

## 📦 Đóng Gói Bản Phát Hành (Production Build)
```bash
npm run build
```
Toàn bộ mã nguồn web 3D được tối ưu hóa và xuất bản sẵn sàng triển khai tại thư mục `dist/`.

---

## 📚 Danh Mục Tài Liệu Kèm Theo
- [CHANGELOG.md](CHANGELOG.md): Lịch sử chi tiết 4 giai đoạn phát triển.
- [CREDITS.md](CREDITS.md): Bảng quyền tác giả và nguồn gốc tài nguyên.
- [LICENSE](LICENSE): Giấy phép phân phối mã nguồn mở.
- [RETRO (Tổng kết)](docs/notes/retro-all-phases.md): Báo cáo hồi cứu phương pháp SDLC kết hợp AI Agent qua 4 phase.
- [Báo cáo Kiểm chứng Phase 4](docs/proof/phase-4/verification.md): Bằng chứng benchmark và soak test.
- [ADR-001 (Thiết kế Phase 3)](docs/notes/adr-001-fuel-and-win-conditions.md): Quyết định kiến trúc hệ thống nhiên liệu và luật thắng bình minh.
