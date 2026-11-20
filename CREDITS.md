# CREDITS & TÀI NGUYÊN DỰ ÁN (Asset Attribution)

Dự án: **Đảo Đèn Lồng (Lantern Island)** - Day 12 AI SDLC  
Sinh viên: **Trần Đức Mạnh** (MSSV: `2A202603615`)

---

## 1. Bản quyền Ý tưởng & Bối cảnh
- Kịch bản "Đảo Đèn Lồng", nhân vật "Mây", "Bóng Mực", "Gió Lạc", "Lồng Đèn Lớn" thuộc bản gốc bài thực hành VinUni AI SDLC Lab Day 12.

## 2. Công nghệ & Thư viện Mã Nguồn Mở
- **Three.js** (r170 / r187) - Giấy phép MIT: Công cụ kết xuất đồ họa 3D WebGL trên trình duyệt.
- **Vite** (v8) - Giấy phép MIT: Công cụ đóng gói tĩnh và máy chủ thử nghiệm web client.
- **Node.js** (v24): Môi trường thực thi headless runner, benchmark, soak test và unit tests.

## 3. Đồ Họa & Âm Thanh (Assets & Audio)
- **Đồ họa 3D:** Toàn bộ mô hình nhân vật Mây, 3 Hòn đảo, Lồng đèn, Đom đóm, Gió Lạc và Bùa Gió được dựng bằng hình học tham số (Three.js Primitive Geometries) kết hợp shader chiếu sáng, không sử dụng mô hình 3D thương mại từ bên ngoài.
- **Âm thanh (Audio FX):** Hệ thống âm thanh độc quyền sử dụng bộ tổng hợp âm thời gian thực **Web Audio API Synthesizer** (chế tạo âm thanh nhặt đom đóm, lướt gió, tỏa sáng, thắp đèn, va chạm bằng OscillatorNode và GainNode), không dùng tệp âm thanh bên thứ ba.

## 4. Công cụ Hỗ trợ AI (AI Assisted Development)
- **Antigravity (DeepMind Gemini CLI Agent):** Hỗ trợ xây dựng kiến trúc phân tách concerns, thiết kế giải thuật vật lý tất định, viết kiểm thử tự động Test Contract v1.0 - v1.3 và tối ưu hóa hiệu năng benchmark/soak test.
