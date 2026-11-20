# Báo cáo Kiểm chứng Phase 1 - Đảo Đèn Lồng

- **Sinh viên:** Trần Đức Mạnh - 2A202603615
- **Phiên bản Contract:** Test Contract v1.0 (PRD-0)
- **Ngày kiểm chứng:** 20/11/2026
- **Trạng thái:** PASS (100%)

---

## 1. Kết quả Unit Tests (Automated Test Suite)

Lệnh thực thi:
```bash
npm test
```

Kết quả:
```text
> dao-den-long@1.0.0 test
> node --test tests/**/*.test.js

✔ GameState - Khởi tạo mặc định đúng contract Phase 1 (2.4108ms)
✔ GameState - Determinism: Cùng seed và input cho kết quả giống hệt nhau (3.7485ms)
✔ GameState - Góc quay camera yaw chuẩn hóa vector di chuyển (0.2513ms)
✔ GameState - Nhặt đom đóm tăng carried và điểm, tối đa 6 (0.2923ms)
✔ GameState - Nạp đom đóm vào lồng đèn và thắp sáng khi đủ 6 (0.4959ms)
✔ GameState - Thắp đủ 5 đèn kích hoạt Win game và tính điểm (0.2126ms)
✔ GameState - Bóng Mực tấn công làm giảm ngọn lửa và rơi đom đóm (0.2485ms)
✔ GameState - Kỹ năng Tỏa sáng (Pulse) làm choáng và đẩy lùi Bóng Mực (0.2541ms)
✔ GameState - Vùng an toàn 8m quanh lồng đèn sáng bảo vệ người chơi (0.2571ms)

ℹ tests 9
ℹ suites 0
ℹ pass 9
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 98.1773ms
```

---

## 2. Kết quả Chạy Headless Test Contract Runner v1.0

### Test 1: Chạy mô phỏng kịch bản Smoke Test (kèm tương tác và sự kiện)
Lệnh:
```bash
node src/headless/runner.js --seed 42 --night 1 --scenario src/headless/scenarios/smoke_scenario.json --inputs src/headless/scenarios/smoke_inputs.json --ticks 60 --out docs/proof/phase-1/run_smoke.jsonl
```
- Trạng thái: Exit code `0`
- Bằng chứng file JSONL: `docs/proof/phase-1/run_smoke.jsonl`
- Các sự kiện được ghi nhận chính xác:
  - `mote_picked` (tick 1)
  - `deposit` (tick 6)
  - `lantern_lit` (tick 6)
  - Snapshot định kỳ mỗi 10 tick
  - `end` record kết thúc mô phỏng.

### Test 2: Chạy mô phỏng 300 ticks ngẫu nhiên
Lệnh:
```bash
node src/headless/runner.js --seed 42 --night 1 --ticks 300 --out docs/proof/phase-1/run_seed42.jsonl
```
- Trạng thái: Exit code `0`
- Bằng chứng file JSONL: `docs/proof/phase-1/run_seed42.jsonl`
- 3 Bóng Mực xuất hiện (`shade_spawned`), di chuyển theo thuật toán tuần tra/lang thang (wander) một cách tất định (deterministic).

### Test 3: Kiểm tra xử lý lỗi đầu vào (Exit code 2)
Lệnh:
```powershell
node src/headless/runner.js --seed 1 --night 1 --ticks -5 --out test.jsonl; $LASTEXITCODE
```
- Trạng thái: Trả về mã lỗi `2` đúng quy định Test Contract v1.0 khi dữ liệu đầu vào không hợp lệ.

---

## 3. Kiểm tra Build Web 3D
Lệnh:
```bash
npm run build
```
- Kết quả: Build thành công qua Vite trong ~290ms, xuất bản phẩm nằm trong thư mục `dist/`.
