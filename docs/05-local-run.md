# 05. Chạy local — mốc 2

## Yêu cầu

JDK 21, JAVA_HOME đúng thư mục JDK; Node.js 22.12+ hoặc 24 cho frontend.
Cổng 8761, 8080–8083, 5173 còn trống. Không cần Docker hoặc database cài ngoài.
Chạy các lệnh từ root repository để vị trí file dữ liệu thống nhất.

## Build và khởi động

```powershell
java -version
.\mvnw.cmd clean verify
.\scripts\start-local.ps1
```

Script PowerShell dùng JAVA_HOME/bin/java.exe trực tiếp, chạy cửa sổ ẩn,
lưu PID và thời gian khởi tạo trong .run/backend-processes.json.
Dừng bằng .\scripts\stop-local.ps1 (chỉ dừng PID và thời gian khớp).
Nếu thay source Java: dừng backend trước khi build để Windows không khóa file JAR.

Frontend:

```powershell
cd frontend
npm ci
npm run dev
```

Mở http://127.0.0.1:5173 và đợi badge API đang kết nối.
Nếu frontend được mở trước backend, bấm Tải lại dữ liệu sau khi backend sẵn sàng.

## Chạy thủ công từng service

Có thể mở 5 terminal tại root, chạy theo thứ tự dưới đây.
Linux/macOS dùng ./mvnw thay cho mvnw.cmd và các lệnh java giữ nguyên.

```text
java -jar discovery-server/target/discovery-server-0.0.1-SNAPSHOT.jar
java -jar services/user-service/target/user-service-0.0.1-SNAPSHOT.jar
java -jar services/court-service/target/court-service-0.0.1-SNAPSHOT.jar
java -jar services/booking-service/target/booking-service-0.0.1-SNAPSHOT.jar
java -jar api-gateway/target/api-gateway-0.0.1-SNAPSHOT.jar
```

Eureka cần sẵn sàng trước các client. Gateway/Booking cập nhật registry theo chu kỳ;
503 ngay sau khởi động có thể cần chờ 30–90 giây. Script chờ tối đa 180 giây.

## Kiểm tra và demo

```powershell
Invoke-RestMethod http://localhost:8080/api/users/user-nguyen
Invoke-RestMethod http://localhost:8080/api/courts
node scripts/test-api.mjs
```

Mở Eureka, kiểm tra USER-SERVICE, COURT-SERVICE, BOOKING-SERVICE, API-GATEWAY.
Trên frontend: chọn sân → ngày tương lai → giờ trống → Xác nhận đặt sân.
Tải lại trang, vào Lịch đặt của tôi: dữ liệu vẫn được đọc lại từ backend.
Hủy lịch, mở lại sân: giờ được giải phóng.

Kiểm tra lưu bền: dừng và khởi động backend, gọi lại GET /api/bookings?userId=user-nguyen.
Không xóa data/ nếu muốn giữ dữ liệu. Không commit database/log.

## Cấu hình

| Biến môi trường | Mặc định | Ý nghĩa |
|---|---|---|
| SERVER_PORT | 8761/8080/8081/8082/8083 tùy ứng dụng | Cổng ứng dụng |
| EUREKA_SERVER_URL | http://localhost:8761/eureka/ | Discovery |
| DB_URL | jdbc:h2:file:./data/{user,court,booking}-db;DB_CLOSE_ON_EXIT=FALSE | Database riêng của service |
| DB_USERNAME | sa | Tài khoản H2 local |
| DB_PASSWORD | rỗng | Mật khẩu H2 local |

Biến DB_* chỉ áp dụng ba service nghiệp vụ. Không dùng chung DB_URL cho cả ba.
Đường dẫn tương đối tính từ working directory. Chạy từ thư mục khác có thể tạo database khác.
Seed chỉ thêm record chưa tồn tại, không ghi đè record đã cập nhật.

## Xử lý lỗi

- Build không đổi tên được JAR: dừng đúng service trước khi build lại.
- H2 báo database đang mở: đang có tiến trình khác giữ cùng file; dùng stop-local hoặc dừng terminal cũ.
- Gateway 503: kiểm tra log .run và registry Eureka; đợi đồng bộ sau restart.
- POST booking 503: User/Court Service không sẵn sàng hoặc request REST timeout.
- POST booking 409: trùng giờ, user/sân ngừng hoạt động.
- POST booking 400: giờ không hợp lệ, thiếu trường hoặc sai kiểu.
- Frontend không tự chuyển sang demo khi backend lỗi; nó hiện lỗi và cho tải lại.

Các endpoint hiện chưa có xác thực/phân quyền. Dùng cho demo học phần local, không coi userId là bằng chứng danh tính.
