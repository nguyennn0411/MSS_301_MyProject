> Tài liệu thiết kế ban đầu ở mốc 1. Hiện trạng mốc 2, điều chỉnh H2 file và API đã triển khai: [bàn giao mốc 2](08-milestone-2.md), [luồng request](09-request-flow.md).

# 01. Phân tích bài toán

## 1. Bối cảnh và mục tiêu

Việc nhận đặt sân bằng điện thoại hoặc tin nhắn khiến người quản lý khó tổng hợp lịch, dễ nhận trùng giờ và khó tra cứu lịch sử.
SportBooking tập trung quản lý thông tin khách, danh mục sân và lượt đặt tại một cơ sở có nhiều sân.

Mục tiêu là cung cấp REST API để quản lý dữ liệu và đặt sân, đồng thời minh họa phân tách trách nhiệm, Service Discovery, API Gateway và triển khai độc lập.

## 2. Tác nhân và chức năng dự kiến

| Tác nhân | Nhu cầu |
|---|---|
| Khách hàng | Xem sân, chọn giờ, đặt sân, xem lịch sử, hủy lượt đặt chưa bắt đầu |
| Quản trị viên | Quản lý sân, cập nhật giá và trạng thái sân, theo dõi lượt đặt |

Đây là các vai trò nghiệp vụ. Skeleton mốc 1 chưa triển khai xác thực hoặc phân quyền.
Việc nhập userId ở bản demo không chứng minh danh tính người gọi; xác thực cần được bổ sung trước khi mở hệ thống cho người dùng thật.

## 3. Phân rã microservices

| Service | Dữ liệu sở hữu | Trách nhiệm | Ngoài trách nhiệm |
|---|---|---|---|
| User Service | User: id, fullName, email, phone, active | Tạo, đọc, cập nhật hồ sơ khách | Không lưu lịch đặt hoặc dữ liệu sân |
| Court Service | Court: id, name, sportType, location, hourlyRate, active | Quản lý danh mục, giá và trạng thái hoạt động của sân | Không quyết định giờ còn trống |
| Booking Service | Booking: id, userId, courtId, startTime, endTime, hourlyRateSnapshot, totalPrice, status, createdAt | Kiểm tra lịch, tạo/hủy đặt và lưu lịch sử | Không sửa hồ sơ khách hoặc giá gốc của sân |

Booking Service là nơi duy nhất quản lý khoảng thời gian đã được đặt.
Thông tin sân còn hoạt động thuộc Court Service; thông tin sân còn trống theo giờ thuộc Booking Service.

## 4. Quy tắc nghiệp vụ dự kiến mốc 2

- Người dùng phải tồn tại và còn hoạt động; sân phải tồn tại và đang hoạt động.
- Giờ bắt đầu ở tương lai; giờ kết thúc sau giờ bắt đầu. Dùng thời gian có offset, hiển thị theo Asia/Ho_Chi_Minh.
- Hai khoảng thời gian dùng quy ước [bắt đầu, kết thúc): lượt kết thúc 19:00 không trùng lượt bắt đầu 19:00.
- Một lượt mới trùng lượt CONFIRMED khi newStart < existingEnd và newEnd > existingStart cho cùng sân.
- Kiểm tra rồi lưu phải được bảo vệ tại database trong transaction; chỉ kiểm tra ở Java không ngăn được hai request đồng thời.
- Với PostgreSQL, dự kiến dùng exclusion constraint trên courtId và khoảng thời gian cho các lượt CONFIRMED; chuyển vi phạm thành HTTP 409.
- Lưu giá thuê tại thời điểm đặt, sử dụng BigDecimal; totalPrice = hourlyRateSnapshot × số phút / 60, làm tròn đến đồng theo HALF_UP.
- Chỉ hủy lượt chưa bắt đầu; trạng thái chuyển CONFIRMED → CANCELLED. Hủy lại lượt đã hủy trả trạng thái hiện tại.
- Sân hoặc khách đã có lịch sử đặt được ngừng hoạt động thay vì xóa dữ liệu lịch sử.
- Nếu không xác minh được khách hoặc sân do service phụ thuộc lỗi, không tạo lượt đặt; trả lỗi tạm thời.

Giá và trạng thái sân được đọc tại thời điểm xác minh; chưa bảo đảm transaction xuyên các service.
Mốc tiếp theo cần quy định rõ hành vi khi quản trị viên thay đổi sân trong lúc có yêu cầu đặt.

## 5. API dự kiến

Các API trong bảng là thiết kế, **chưa được triển khai ở mốc 1**.

| Service | Method và đường dẫn | Mục đích |
|---|---|---|
| User | POST /api/users | Tạo khách |
| User | GET /api/users/{id} | Lấy thông tin khách |
| User | PUT /api/users/{id} | Cập nhật hồ sơ |
| Court | GET /api/courts | Danh sách sân |
| Court | GET /api/courts/{id} | Chi tiết và giá sân |
| Court | POST /api/courts | Tạo sân |
| Court | PUT /api/courts/{id} | Cập nhật sân |
| Booking | POST /api/bookings | Đặt sân |
| Booking | GET /api/bookings?userId={id} | Lịch sử đặt |
| Booking | GET /api/bookings/{id} | Chi tiết lượt đặt |
| Booking | GET /api/bookings/availability?courtId={id}&date={yyyy-MM-dd} | Tra cứu lịch sân |
| Booking | PATCH /api/bookings/{id}/cancel | Hủy lượt đặt |

Dự kiến dùng 201 cho tạo thành công, 200 cho đọc/cập nhật, 400 cho đầu vào sai, 404 cho dữ liệu không tồn tại,
409 cho trùng lịch hoặc chuyển trạng thái không hợp lệ và 503 khi service phụ thuộc không sẵn sàng.

## 6. Phạm vi theo giai đoạn

- Mốc 1: tài liệu, cấu trúc source, Eureka, Gateway, ứng dụng skeleton và endpoint kiểm tra.
- Mốc 2: Controller–Service–Repository thực tế, database, CRUD, REST giữa các service, kiểm tra trùng lịch và demo local.
- Mốc 3: Dockerfile từng ứng dụng, Docker Compose, network, database volume, hướng dẫn và minh chứng demo.
- Ngoài phạm vi tối thiểu: thanh toán thật, voucher, chat, gửi SMS, nhiều cơ sở và ứng dụng di động.

## 7. Tiêu chí nghiệm thu cuối kỳ

Hệ thống khởi chạy bằng Compose; request đi qua Gateway; Eureka nhận diện các service;
tạo đặt sân gọi User/Court qua REST; đặt trùng bị từ chối kể cả khi đồng thời; hủy hợp lệ cho phép đặt lại;
dữ liệu tồn tại sau khi khởi động lại ứng dụng. Đây là mục tiêu cuối kỳ, không phải trạng thái hoàn thành của mốc 1.
