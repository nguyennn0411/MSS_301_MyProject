# 08. Bàn giao Asm 1.2 — Microservices với Spring Cloud

Thành viên: Cao Phúc Nguyên — HE191659. Ngày thực hiện: 30/09/2026.

## Phạm vi

Ba service nghiệp vụ có Controller–Service–Repository và REST API.
Eureka đăng ký/tra cứu service; Gateway dùng lb:// để định tuyến.
Booking gọi REST đến User và Court bằng RestClient + Spring Cloud LoadBalancer.
Mỗi service có H2 file độc lập; frontend đã nối API, không còn tạo booking ở localStorage.

H2 file được chọn để chạy local thuận tiện. Đây là điều chỉnh so với thiết kế PostgreSQL dự kiến:
schema booking_slots có khóa chính (court_id,slot_ms), mỗi slot 30 phút chỉ được một lượt CONFIRMED sở hữu.
Transaction bao gồm bản ghi booking và toàn bộ slots; trùng khóa rollback toàn bộ, trả 409.
Không dùng riêng một phép SELECT rồi INSERT để chống trùng.

## REST API

Tất cả URL dưới đây đi qua http://localhost:8080.

| Method | Path | Kết quả |
|---|---|---|
| GET | /api/users | Danh sách user |
| POST | /api/users | Tạo user, 201 và Location |
| GET | /api/users/{id} | Chi tiết user |
| PUT | /api/users/{id} | Cập nhật hồ sơ/active |
| GET | /api/courts | Danh sách sân, kể cả sân inactive |
| POST | /api/courts | Tạo sân, 201 và Location |
| GET | /api/courts/{id} | Chi tiết sân |
| PUT | /api/courts/{id} | Cập nhật thông tin, giá và active |
| POST | /api/bookings | Xác minh qua REST, tính giá, đặt sân, 201 |
| GET | /api/bookings?userId={id} | Lịch sử của user |
| GET | /api/bookings/{id} | Chi tiết |
| GET | /api/bookings/availability?courtId={id}&date=YYYY-MM-DD | Các khoảng bận, không lộ hồ sơ người đặt |
| PATCH | /api/bookings/{id}/cancel | Hủy; hủy lại trả trạng thái hiện tại |
| GET | /api/{users,courts,bookings}/status | Tình trạng service, milestone=2 |

Không xóa cứng user/sân; dùng active=false để giữ lịch sử.

Ví dụ tạo user:

```json
{"fullName":"Nguyễn Văn An","email":"an@example.test","phone":"0901234567","active":true}
```

Ví dụ tạo sân:

```json
{"name":"Sân mới","sportType":"BADMINTON","location":"Hòa Lạc","hourlyRate":80000,"active":true}
```

sportType nhận BADMINTON, FOOTBALL, TENNIS; hourlyRate là số nguyên VND dương.

Ví dụ đặt sân (thay ngày bằng ngày tương lai):

```json
{"userId":"user-nguyen","courtId":"court-01","startTime":"2026-10-10T18:00:00+07:00","endTime":"2026-10-10T19:30:00+07:00"}
```

Chỉ gửi userId/courtId/startTime/endTime. Backend tự lấy giá từ Court Service;
không tin tổng tiền gửi từ trình duyệt. Múi giờ nghiệp vụ UTC+7.
Giờ mở cửa 06:00–22:00, cùng ngày, bước 30 phút, thời lượng 60/90/120 phút.
Khoảng thời gian là [start,end): hai lượt tiếp giáp được chấp nhận.

Response booking có id, userId, courtId, courtName, startTime, endTime, hourlyRateSnapshot,
totalPrice, status, createdAt. Tên sân và giá được lưu tại thời điểm đặt.

| HTTP | Ý nghĩa |
|---|---|
| 400 | Thiếu/sai dữ liệu, giờ ngoài phạm vi |
| 404 | User, sân hoặc booking không tồn tại |
| 409 | Email trùng, trùng lịch, inactive hoặc không được hủy |
| 503 | Service phụ thuộc không sẵn sàng |

## Kiểm thử tái hiện

```powershell
.\mvnw.cmd clean verify
.\scripts\start-local.ps1
node scripts/test-api.mjs
npm --prefix frontend test
npm --prefix frontend run lint
npm --prefix frontend run build
```

6 test Java (4 unit + 2 tích hợp database) bao phủ tính tiền/làm tròn, thời gian, inactive và hủy.
Script test-api tạo riêng user/sân để không đụng lịch người dùng:
CRUD, validation, duplicate email, REST liên service, giá snapshot, availability,
trùng/tiếp giáp, hủy idempotent và 8 request đồng thời.
Script giữ lịch hủy và record inactive phục vụ kiểm tra lịch sử.

## Minh chứng demo local

- [Eureka với bốn client](images/milestone-2-eureka.png)
- [Giao diện đặt sân nối backend](images/milestone-2-booking.png)
- [Lịch đặt đọc từ database](images/milestone-2-history.png)
- [Kết quả kiểm tra API](milestone-2-test-results.txt)

## Giới hạn

- Chưa có đăng nhập, phân quyền, thanh toán, Docker hoặc Compose.
- Tài khoản UI cố định user-nguyen; không phải cơ chế xác thực.
- H2 file chỉ dùng một instance/service. Chưa thử nhiều replica; mốc Docker cần quyết định database/network/volume.
- Không có transaction xuyên User/Court/Booking; xác minh theo trạng thái tại thời điểm gọi REST.
- Chưa có idempotency key cho POST. Frontend khóa nút trong lúc gửi; nếu mạng lỗi sau khi server commit,
  cần tải lại lịch trước khi gửi lại. Database vẫn chặn đặt trùng khung giờ.
- Các list chưa phân trang; phạm vi dữ liệu demo học phần.
- Favorites vẫn lưu trình duyệt; booking lưu server. Dữ liệu booking demo mốc 1 không tự nhập vào database.
