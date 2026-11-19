# TRẠNG THÁI PHÁT TRIỂN – HỌC VIỆN HÌNH HỌC SMART (OFFLINE-FIRST)

## 1. Hoàn thành & Đã kiểm thử tự động

| Nhóm chức năng | Trạng thái | Chi tiết |
| --- | --- | --- |
| Dynamic Geometry Engine (DAG) | Hoàn thành | `src/geometry/math.ts`, `engine.ts`, `tools.ts`, `types.ts` |
| Anti-Guessing Validator & Thử lửa | Hoàn thành | Kiểm tra 24 cấu hình biến động, chấm L/E và 3 sao |
| 18 Cấp độ – 180 Thử thách (540 sao) | Hoàn thành | 180/180 lời giải chuẩn vượt qua Vitest |
| Phòng thực hành tự do (36 công cụ) | Hoàn thành | Kéo điểm, kéo nhãn, đổi kiểu nét, lưu IndexedDB, xuất PNG/SVG |
| Thước & Compa ảo trực quan | Hoàn thành | Bật/tắt linh hoạt ngay trên thanh công cụ |
| Học theo Lớp 6–12 & Phân loại chương trình | Hoàn thành | Lọc theo Lớp, Chính khóa/Mở rộng/HSG/Olympic, Độ khó, Nhận thức |
| Thư viện kiến thức động & Lịch sử | Hoàn thành | 18 chuyên đề có bảng vẽ động + 10 thẻ lịch sử Toán học |
| Đấu trường Toán học & Trình chiếu LED | Hoàn thành | 6 chế độ, mã phòng 6 ký tự, QR thực, đồng hồ, bảng xếp hạng LED |
| Góc Giáo Viên | Hoàn thành | Xem trước 180 bài, Tạo thử thách trực quan + Bàn phím công thức, Lớp học CSV, Trình chiếu |
| Thành tích & Giấy chứng nhận A4 | Hoàn thành | 8 danh hiệu, 12 huy hiệu thực, xuất PNG/PDF khổ A4 |
| Lưu trữ cục bộ & Sao lưu JSON | Hoàn thành | IndexedDB + LocalStorage + Export/Restore (Merge / Replace) |
| PWA & Offline Service Worker | Hoàn thành | `manifest.webmanifest`, `sw.js`, bộ icon đầy đủ, cài đặt ngoại tuyến |
| Âm thanh Web Audio & Giao diện Sáng/Tối | Hoàn thành | SFX + nhạc nền nhẹ, Dark Mode, Chế độ trình chiếu 20–28px |

## 2. Giai đoạn mở rộng sau (Tạm hoãn theo yêu cầu ưu tiên Offline-First)

- Tích hợp **Firebase Authentication** & **Cloud Firestore** đồng bộ đa thiết bị theo thời gian thực (`src/services/storageService.ts` và `src/services/authService.ts` đã được thiết kế cấu trúc sạch để sẵn sàng cắm lớp đồng bộ khi người dùng yêu cầu).
