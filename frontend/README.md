# SportBooking Frontend — Asm 1.2

React JS + Vite, giao diện nối API backend qua Gateway.
Cao Phúc Nguyên — HE191659.

## Chạy

Từ root: build và chạy backend theo README, sau đó:

```powershell
cd frontend
npm ci
npm run dev
```

Mở http://127.0.0.1:5173. Cần Node.js 22.12+ hoặc 24.
Nếu backend chưa chạy, giao diện hiển thị lỗi, không tự dùng dữ liệu demo.
Sau khi backend sẵn sàng, bấm Tải lại dữ liệu.

## Chức năng

Tìm/lọc sân theo tên/khu vực/môn thể thao; sắp giá; yêu thích sân.
Danh sách sân và giá lấy từ Court Service.
Chọn ngày, giờ và thời lượng; tải lịch bận của tất cả user qua availability.
POST booking gửi userId, courtId, startTime, endTime; backend kiểm tra và tính tiền.
Hủy qua PATCH; tải lại trình duyệt vẫn đọc lịch từ Booking Service.

Tài khoản học tập mặc định user-nguyen được seed trong User Service.
Chưa có đăng nhập/phân quyền; đây là môi trường học phần, không phải cổng đặt sân công khai.
Sân seed là dữ liệu mẫu nhưng thao tác đặt/hủy được xử lý và lưu thật tại backend.
Favorites lưu localStorage; booking demo từ mốc 1 không được tự nhập vào server.

## Cấu trúc

- src/App.jsx: trang khám phá, lịch sử, dialog đặt, trạng thái kết nối.
- src/api.js: fetch, timeout, ánh xạ DTO và payload.
- src/data.js: metadata minh họa, định dạng tiền/thời gian, kiểm tra giờ ở UI.
- src/App.css, src/index.css: responsive desktop/mobile.
- vite.config.js: proxy /api → http://localhost:8080.
- src/data.test.js: kiểm tra logic giờ ở frontend.

Frontend không thay thế validation backend hoặc transaction chống trùng.
Hiển thị lỗi khi request thất bại; không thêm lịch giả vào UI.
Nếu POST gặp timeout sau khi server đã ghi, tải lại lịch trước khi đặt lại.

## Build và test

```powershell
npm test
npm run lint
npm run build
npm run preview
```

Bản static trong dist cần reverse proxy /api đến Gateway khi triển khai.
Dev proxy không có trong npm run preview; dùng npm run dev để demo tích hợp local.
Font Be Vietnam Pro từ Google Fonts, có font sans-serif dự phòng.
Ảnh minh họa sân là SVG do source tạo, không tải ảnh ngoài.

Minh chứng mốc 2: [tài liệu bàn giao](../docs/08-milestone-2.md).
