# 07. Kết quả kiểm tra mốc 1

Ngày kiểm tra: 30/09/2026 (Asia/Ho_Chi_Minh).
Môi trường: Windows, Java 21.0.11, Maven Wrapper 3.9.11.

## Build

Chạy Maven Wrapper với `clean verify` thành công cho parent và cả 5 module.
Dependency cache được đặt trong `.m2/repository` tại workspace khi kiểm tra;
người dùng có thể chạy `./mvnw clean verify` hoặc `.\mvnw.cmd clean verify` với cache mặc định.

| Module | Kết quả |
|---|---|
| sportbooking (parent) | SUCCESS |
| discovery-server | SUCCESS |
| api-gateway | SUCCESS |
| user-service | SUCCESS |
| court-service | SUCCESS |
| booking-service | SUCCESS |

Chưa có unit test nghiệp vụ ở mốc skeleton. Build thành công không thay thế kiểm thử chức năng mốc 2.

## Chạy tích hợp thực tế

Khởi chạy 5 JAR trong các tiến trình riêng, đợi đăng ký discovery rồi gọi HTTP.

| Kiểm tra | Kết quả quan sát |
|---|---|
| GET /actuator/health trên 8761, 8080, 8081, 8082, 8083 | Tất cả trả status=UP |
| GET /eureka/apps | Có API-GATEWAY, USER-SERVICE, COURT-SERVICE, BOOKING-SERVICE |
| GET :8081/api/users/status | service=user-service, status=UP, milestone=1 |
| GET :8082/api/courts/status | service=court-service, status=UP, milestone=1 |
| GET :8083/api/bookings/status | service=booking-service, status=UP, milestone=1 |
| GET :8080/api/users/status | Đúng phản hồi user-service |
| GET :8080/api/courts/status | Đúng phản hồi court-service |
| GET :8080/api/bookings/status | Đúng phản hồi booking-service |

Các tiến trình kiểm tra đã được dừng sau khi hoàn thành. Chạy lại theo [hướng dẫn local](05-local-run.md).
Log/cache/JAR chỉ là dữ liệu local và không được commit.

## Giới hạn của lần kiểm tra

Chưa kiểm tra CRUD, database, đặt sân, xử lý đồng thời, REST nghiệp vụ giữa các service hoặc Docker
vì các chức năng này chưa được triển khai. Chưa có screenshot/video demo và chưa push GitHub.
Biên bản này ghi nhận kiểm tra kỹ thuật mốc 1, không thay thế minh chứng demo phải nộp ở các mốc sau.
