> Tài liệu thiết kế ban đầu ở mốc 1. Hiện trạng mốc 2, điều chỉnh H2 file và API đã triển khai: [bàn giao mốc 2](08-milestone-2.md), [luồng request](09-request-flow.md).

# 03. Thiết kế kiến trúc hệ thống

## 1. Sơ đồ tổng thể

```mermaid
flowchart TB
    Client[Client / Postman] -->|HTTP :8080| Gateway[API Gateway]
    Gateway -->|lb://user-service| Users[User Service :8081]
    Gateway -->|lb://court-service| Courts[Court Service :8082]
    Gateway -->|lb://booking-service| Bookings[Booking Service :8083]
    Gateway -. đăng ký và tra cứu .-> Eureka[Eureka Server :8761]
    Users -. đăng ký .-> Eureka
    Courts -. đăng ký .-> Eureka
    Bookings -. đăng ký và tra cứu .-> Eureka
    Bookings -. REST mốc 2 .-> Users
    Bookings -. REST mốc 2 .-> Courts
    Users -. mốc 2 .-> UDB[(user_db)]
    Courts -. mốc 2 .-> CDB[(court_db)]
    Bookings -. mốc 2 .-> BDB[(booking_db)]
```

Database và REST giữa các service nghiệp vụ là thiết kế mốc 2.
Gateway, Eureka và các endpoint status đã có cấu hình/source trong mốc 1.

## 2. Vai trò các thành phần

- **API Gateway:** cổng vào tập trung, ánh xạ URL đến service, dùng Spring Cloud LoadBalancer với URI lb://.
  Gateway dùng WebFlux; không đặt logic đặt sân hoặc repository ở đây.
- **Eureka Server:** lưu danh sách instance và địa chỉ service. Eureka không chuyển tiếp request nghiệp vụ.
- **User Service:** sở hữu hồ sơ khách.
- **Court Service:** sở hữu danh mục sân, giá và trạng thái hoạt động.
- **Booking Service:** sở hữu lịch đặt và quyết định xung đột thời gian.
- **Database riêng:** mỗi service chỉ truy cập dữ liệu mình sở hữu; userId/courtId trong Booking là tham chiếu logic,
  không phải foreign key xuyên database.

## 3. Ánh xạ route đang cấu hình

| Gateway nhận | Đích discovery | Cổng mặc định |
|---|---|---|
| /api/users/** | lb://user-service | 8081 |
| /api/courts/** | lb://court-service | 8082 |
| /api/bookings/** | lb://booking-service | 8083 |

Giữ nguyên đường dẫn khi chuyển tiếp, vì controller của từng service cũng có tiền tố /api tương ứng.
Gateway không chứa URL cố định localhost:8081/8082/8083 trong route.
Địa chỉ Eureka mặc định là http://localhost:8761/eureka/ và có thể đổi bằng EUREKA_SERVER_URL.

## 4. Luồng request đang có ở mốc 1

1. Client gọi GET http://localhost:8080/api/courts/status.
2. Gateway khớp route court-service.
3. LoadBalancer chọn một instance từ danh sách do Eureka cung cấp.
4. Court Service trả JSON với service=court-service, status=UP, milestone=1.
5. Gateway trả response cho client.

Endpoint status chỉ kiểm tra ứng dụng và đường đi request; không chứng minh nghiệp vụ đặt sân hoặc database hoạt động.

## 5. Luồng đặt sân dự kiến mốc 2

```mermaid
sequenceDiagram
    actor Client
    participant G as API Gateway
    participant B as Booking Service
    participant U as User Service
    participant C as Court Service
    participant DB as Booking DB
    Client->>G: POST /api/bookings
    G->>B: Chuyển tiếp yêu cầu
    B->>U: GET /api/users/{userId}
    U-->>B: Hồ sơ và trạng thái khách
    B->>C: GET /api/courts/{courtId}
    C-->>B: Sân, giá thuê, trạng thái
    B->>DB: Transaction kiểm tra và ghi lượt đặt
    alt Khoảng thời gian hợp lệ
        DB-->>B: Lượt đặt đã lưu
        B-->>G: 201 Created
    else Trùng lịch
        DB-->>B: Từ chối xung đột
        B-->>G: 409 Conflict
    end
    G-->>Client: Kết quả
```

Nếu khách/sân không tồn tại hoặc không hoạt động, dừng trước bước ghi dữ liệu.
Nếu User/Court không sẵn sàng, trả 503 và không tạo lượt đặt.
REST nội bộ dự kiến dùng tên service qua discovery; không cần quay lại Gateway cho mỗi lời gọi nội bộ.

## 6. Thiết kế dữ liệu dự kiến

```mermaid
erDiagram
    USER {
        uuid id PK
        string fullName
        string email
        string phone
        boolean active
    }
    COURT {
        uuid id PK
        string name
        string sportType
        string location
        decimal hourlyRate
        boolean active
    }
    BOOKING {
        uuid id PK
        uuid userId
        uuid courtId
        timestamptz startTime
        timestamptz endTime
        decimal hourlyRateSnapshot
        decimal totalPrice
        string status
        timestamptz createdAt
    }
```

Ba thực thể thuộc ba database. Không vẽ liên kết khóa ngoại giữa các database để tránh hiểu nhầm rằng service dùng chung schema.

## 7. Định hướng Docker ở mốc 3

Mỗi ứng dụng có Dockerfile; Compose khởi chạy Eureka, Gateway, ba service và PostgreSQL.
Trong container, EUREKA_SERVER_URL sẽ dùng hostname discovery-server thay vì localhost.
Các service truy cập database qua hostname trong Docker network, có volume lưu dữ liệu.
Cần healthcheck và chờ dependency sẵn sàng; chỉ depends_on không tự bảo đảm ứng dụng đã sẵn sàng.
