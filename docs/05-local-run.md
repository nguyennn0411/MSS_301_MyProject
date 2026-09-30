# 05. Hướng dẫn chạy skeleton local

## 1. Chuẩn bị

- JDK 21 và biến JAVA_HOME đúng đường dẫn JDK.
- Internet ở lần build đầu để Maven Wrapper tải Maven/dependency.
- Các cổng 8761, 8080, 8081, 8082, 8083 chưa bị chiếm.
- Chưa cần database hoặc Docker cho mốc 1.

Kiểm tra trên PowerShell:

```powershell
java -version
$env:JAVA_HOME
.\mvnw.cmd --version
.\mvnw.cmd clean verify
```

Lệnh verify ở mốc 1 kiểm tra compile và đóng gói; chưa có bộ kiểm thử nghiệp vụ vì chưa triển khai nghiệp vụ.

## 2. Khởi chạy

Sau khi build, mở 5 terminal tại root repository. Giữ terminal mở trong lúc demo.

| Thứ tự | Thành phần | Lệnh |
|---|---|---|
| 1 | Eureka | java -jar discovery-server/target/discovery-server-0.0.1-SNAPSHOT.jar |
| 2 | User | java -jar services/user-service/target/user-service-0.0.1-SNAPSHOT.jar |
| 3 | Court | java -jar services/court-service/target/court-service-0.0.1-SNAPSHOT.jar |
| 4 | Booking | java -jar services/booking-service/target/booking-service-0.0.1-SNAPSHOT.jar |
| 5 | Gateway | java -jar api-gateway/target/api-gateway-0.0.1-SNAPSHOT.jar |

Chờ Eureka sẵn sàng trước khi chạy các ứng dụng còn lại.
Mở http://localhost:8761 và kiểm tra các tên API-GATEWAY, USER-SERVICE, COURT-SERVICE, BOOKING-SERVICE.

Mỗi module cũng có thể chạy riêng bằng Maven:
` .\mvnw.cmd -f services/user-service/pom.xml spring-boot:run `
(chạy từ root; bỏ khoảng trắng đầu/cuối khi dùng).

## 3. Kiểm tra trực tiếp và qua Gateway

```powershell
# Health của từng ứng dụng
Invoke-RestMethod http://localhost:8761/actuator/health
Invoke-RestMethod http://localhost:8080/actuator/health
Invoke-RestMethod http://localhost:8081/actuator/health
Invoke-RestMethod http://localhost:8082/actuator/health
Invoke-RestMethod http://localhost:8083/actuator/health

# Gọi trực tiếp từng service
Invoke-RestMethod http://localhost:8081/api/users/status
Invoke-RestMethod http://localhost:8082/api/courts/status
Invoke-RestMethod http://localhost:8083/api/bookings/status

# Gọi qua Gateway
Invoke-RestMethod http://localhost:8080/api/users/status
Invoke-RestMethod http://localhost:8080/api/courts/status
Invoke-RestMethod http://localhost:8080/api/bookings/status
```

Ví dụ kết quả từ /api/bookings/status (thứ tự thuộc tính có thể khác):

```json
{"service":"booking-service","status":"UP","milestone":"1"}
```

Đây là status API thật của skeleton, không phải API tạo hoặc đọc lượt đặt.
Các đường dẫn nghiệp vụ trong tài liệu phân tích chưa tồn tại.

## 4. Cấu hình môi trường

Mỗi ứng dụng nhận:

| Biến | Mặc định | Công dụng |
|---|---|---|
| SERVER_PORT | Theo bảng cổng | Đổi cổng ứng dụng |
| EUREKA_SERVER_URL | http://localhost:8761/eureka/ | Địa chỉ discovery |

Ví dụ đổi User Service sang cổng 8091 trong terminal riêng:

```powershell
$env:SERVER_PORT = '8091'
java -jar services/user-service/target/user-service-0.0.1-SNAPSHOT.jar
```

Gateway vẫn route theo tên user-service khi instance mới đã đăng ký.
Xóa biến sau khi dùng: `Remove-Item Env:SERVER_PORT`.
Không dùng chung SERVER_PORT=8091 cho tất cả ứng dụng.

## 5. Xử lý lỗi thường gặp

- **JAVA_HOME sai:** trỏ đến thư mục JDK 21, không phải thư mục bin.
- **Tải dependency lỗi:** kiểm tra Internet/proxy và cấu hình Maven của máy; không bỏ kiểm tra TLS.
- **Port already in use:** dừng đúng ứng dụng đang chiếm cổng hoặc đổi SERVER_PORT.
- **Gateway trả 503 lúc mới chạy:** kiểm tra service đã đăng ký Eureka; chờ khoảng 30–90 giây cho registry/cache cập nhật.
- **404:** kiểm tra URL; mốc 1 chỉ có /api/users/status, /api/courts/status, /api/bookings/status.
- **Connection refused từ Eureka client:** kiểm tra Discovery Server và EUREKA_SERVER_URL.

Dừng ứng dụng bằng Ctrl+C trong từng terminal.
