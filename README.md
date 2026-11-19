# HỌC VIỆN HÌNH HỌC SMART (Geometry Smart Academy)

**Khám phá – Dựng hình – Chinh phục**

Ứng dụng Web giáo dục hình học động và trò chơi dựng hình bằng thước không chia độ và compa chuẩn Euclid, hoạt động độc lập **Offline-First** (IndexedDB + LocalStorage + PWA) mà không cần đăng nhập hay khóa API.

---

## Tính năng chính

1. **Bộ máy Hình học động DAG (`src/geometry/`)**:
   - Đánh giá đối tượng theo đồ thị phụ thuộc (điểm tự do, điểm trên đối tượng, giao điểm, đường thẳng, đoạn thẳng, tia, đường tròn, cung tròn, trung trực, vuông góc, song song, phân giác, tiếp tuyến, phép biến hình, đa giác, đo đạc).
   - Chế độ **Vẽ nhanh** và **Thước & Compa ảo** trực quan.
   - Bắt dính chính xác (Snapping), kéo thả điểm tự do, kéo nhãn điểm độc lập, phóng to/thu nhỏ, lưới/trục tọa độ, xuất ảnh PNG & SVG.
2. **Hệ thống Kiểm chứng chống vẽ mò & "Thử lửa" (`src/validators/`)**:
   - Kiểm tra 24 cấu hình biến động tự động mỗi lần nộp bài nhằm loại bỏ hoàn toàn tình trạng đặt điểm bằng mắt thường.
   - Hệ thống 3 sao chuẩn: 1★ (đúng hình học), 2★ (tối ưu số bước thao tác L), 3★ (tối ưu số bước sơ cấp Euclid E) — tối đa **540 sao**.
3. **18 Cấp độ – 180 Thử thách đầy đủ (`src/challenges/`)**:
   - Từ Khởi đầu Euclid, Trung trực, Phân giác, Song song, Tứ giác, Các tâm tam giác, Biến hình, Thales, Tỉ lệ vàng, Tiếp tuyến, Phương tích, Đa giác đều, Sangaku, Tuyệt kỹ Compa (Cấp XV – khóa thước), Tuyệt kỹ Thước thẳng (Cấp XVI – khóa compa), Hình học chuyên sâu đến Chinh phục Olympic (Cấp XVIII).
   - Gợi ý 3 cấp, Trình phát lời giải động từng bước và Chứng minh Toán học hiển thị bằng KaTeX.
4. **Phòng thực hành tự do, Học theo Lớp 6–12, Thư viện Kiến thức động & Lịch sử Toán học**:
   - 18 chuyên đề tương tác có bảng vẽ kéo thả trực tiếp + 10 thẻ danh nhân (Euclid, Pythagoras, Thales, Euler, Pascal, Napoleon, Fermat, Mohr, Mascheroni, Sangaku Nhật Bản).
5. **Đấu trường Toán học & Trình chiếu LED**:
   - 6 thể thức thi đấu, tạo phòng thi từ 1–10 bài, mã phòng 6 ký tự, mã QR thực (`qrcode`), đồng hồ đếm ngược, bảng xếp hạng chuẩn và chế độ chiếu toàn màn hình LED.
6. **Góc Giáo Viên (miễn phí hoàn toàn)**:
   - Chế độ Xem trước Giáo viên mở toàn bộ 180 bài không làm thay đổi sao học sinh.
   - Trình tạo thử thách mới trực quan kèm **Trình soạn công thức Toán học trực quan** (không cần gõ JSON/LaTeX).
   - Quản lý danh sách lớp học cục bộ + xuất CSV và Chế độ trình chiếu chữ lớn (20–28px).
7. **Thành tích, 8 Danh hiệu, 12 Huy hiệu & Giấy chứng nhận A4**:
   - Xuất ảnh PNG chất lượng cao khổ A4 hoặc in/lưu PDF kèm ghi chú học thuật minh bạch.
8. **Lưu trữ cục bộ & Sao lưu JSON + PWA**:
   - Lưu toàn bộ tiến độ, bản vẽ, thử thách tự tạo, phòng thi, lớp học bằng IndexedDB & LocalStorage.
   - Xuất/nhập tệp sao lưu JSON có kiểm tra hợp lệ và chọn chế độ Gộp (Merge) hoặc Thay thế (Replace).

---

## Cài đặt & Chạy cục bộ

```bash
npm install
npm run dev
```

Ứng dụng chạy mặc định tại `http://localhost:3000`.

### Kiểm thử tự động (Vitest)

```bash
npx vitest run
```

Bộ kiểm thử xác minh:
- Toán học lõi DAG, xử lý suy biến không NaN, xóa kéo theo phụ thuộc.
- Đủ 18 cấp độ – 180 thử thách – 540 sao tối đa.
- Khóa công cụ Cấp XV (Chỉ Compa) và Cấp XVI (Chỉ Thước).
- Toàn bộ 180 lời giải mẫu vượt qua kiểm chứng biến động và chống đặt điểm bằng mắt thường.

### Biên dịch sản phẩm (Build)

```bash
npm run build
```

Triển khai trực tiếp thư mục `dist/` lên Vercel hoặc mọi dịch vụ static hosting (`vercel.json` đã được cấu hình sẵn).

---

Copyright © 2026 – Phát triển bởi Thầy Hồ Nguyễn Đa Thiện.
