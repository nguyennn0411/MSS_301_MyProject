# SportBooking Frontend

Giao diện React JS + Vite cho đề tài SportBooking, MSS301.
Sinh viên: Cao Phúc Nguyên — HE191659.

## Chạy

Cần Node.js 22.12+ hoặc Node.js 24 (đã kiểm tra với 24.11.0).

```powershell
cd frontend
npm ci
npm run dev
```

Mở http://127.0.0.1:5173. Không cần chạy backend để dùng chức năng demo.

```powershell
npm run lint
npm test
npm run build
npm run preview
```

## Chức năng

- Xem 6 sân mẫu với minh họa SVG nội bộ, không phụ thuộc ảnh ngoài.
- Tìm tên/khu vực, lọc môn thể thao, sắp xếp giá.
- Yêu thích sân, lưu trên localStorage.
- Chọn ngày, giờ và thời lượng 1/1,5/2 giờ; tính tiền.
- Chặn giờ quá khứ, giờ vượt 22:00 và khoảng thời gian trùng lịch CONFIRMED.
- Xem lịch đã đặt, hủy lượt chưa bắt đầu; lượt hủy không chiếm giờ.
- Lưu lịch đặt khi tải lại; phản hồi trạng thái rỗng, lỗi lưu trữ và lỗi kết nối.
- Responsive desktop/mobile, dialog hỗ trợ Escape và giới hạn focus.
- Kiểm tra /api/users/status, /api/courts/status, /api/bookings/status qua Gateway.

## Giới hạn demo

Danh sách sân, giá và đánh giá là dữ liệu mẫu. Đặt/hủy chỉ cập nhật trình duyệt,
chưa gọi API nghiệp vụ, chưa xác thực, không phải giao dịch đặt sân thật.
Không dùng localStorage để đảm bảo đồng thời giữa nhiều tab hoặc nhiều người dùng.
Backend sẽ phải kiểm tra lại toàn bộ nghiệp vụ và bảo vệ trùng lịch bằng database ở mốc 2.

Hai key dữ liệu: sportbooking.bookings.v1 và sportbooking.favorites.v1.
Thời gian đặt dùng múi giờ UTC+7, độc lập timezone của máy.
Font Be Vietnam Pro tải từ Google Fonts; có font sans-serif dự phòng nếu offline.

## Kết nối backend

Vite dev proxy chuyển /api đến http://localhost:8080, tránh cần bật CORS rộng ở backend.
Chạy Eureka, ba service và Gateway theo README gốc, rồi mở mục Kết nối hệ thống.
Nếu các ứng dụng chưa chạy, giao diện báo Chưa kết nối được.

Build production ra dist. Dev proxy không tồn tại trong bản static production:
khi triển khai cần reverse proxy /api đến Gateway trên cùng origin.
npm run preview chỉ dùng xem bản build; kiểm tra backend qua npm run dev.

## Source

- src/App.jsx: điều hướng, danh sách sân, booking dialog, lịch đặt và trạng thái hệ thống.
- src/data.js: dữ liệu mẫu và các hàm kiểm tra lịch.
- src/data.test.js: kiểm tra biên giờ, trùng lịch và dữ liệu đầu vào.
- src/App.css, src/index.css: bố cục và responsive.
- vite.config.js: dev server/proxy.

## Kiểm tra đã thực hiện

Build và lint thành công. Kiểm tra Edge headless ở 1440px và 390px:
lọc, tìm kiếm rỗng, yêu thích, đặt, tải lại, khóa giờ trùng, hủy,
mở lại giờ đã hủy, Escape đóng dialog, phản hồi backend offline.
Không có JavaScript runtime error trong các luồng trên.
Ảnh minh họa: ../docs/images/frontend-desktop.png và frontend-mobile.png.
