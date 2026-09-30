# 09. Luồng request đã triển khai

## Đặt sân

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant F as React / Vite
    participant G as API Gateway
    participant B as Booking Service
    participant US as User Service
    participant CS as Court Service
    participant DB as booking-db
    U->>F: Chọn sân, ngày, giờ
    F->>G: GET /api/bookings/availability
    G->>B: lb://booking-service
    B->>CS: REST kiểm tra courtId
    B->>DB: Đọc các khoảng CONFIRMED
    DB-->>F: Khoảng bận qua Booking/Gateway
    U->>F: Xác nhận
    F->>G: POST /api/bookings
    G->>B: Chuyển tiếp
    B->>B: Validate giờ và thời lượng
    B->>US: GET /api/users/id
    US-->>B: active
    B->>CS: GET /api/courts/id
    CS-->>B: active, name, hourlyRate
    B->>B: Tính tiền, lưu snapshot giá
    B->>DB: INSERT booking và slots trong transaction
    alt Slots chưa bị chiếm
        DB-->>B: Commit
        B-->>F: 201 qua Gateway
        F-->>U: Hiển thị lịch đặt
    else Slots bị request khác chiếm
        DB-->>B: Unique violation / rollback
        B-->>F: 409 qua Gateway
        F-->>U: Hiển thị lỗi chọn giờ khác
    end
```

Eureka không truyền request nghiệp vụ. Gateway và Booking dùng registry đã cache để tìm instance.
RestClient có connect timeout 3s/read timeout 5s, không retry POST.
Eureka dùng RestClient.Builder thường; REST nghiệp vụ dùng builder @LoadBalanced riêng để tránh
nhầm hostname localhost của Eureka thành tên service.

## Hủy và lưu bền

PATCH /api/bookings/id/cancel → Gateway → Booking:
SELECT FOR UPDATE khóa dòng booking; kiểm tra trạng thái và giờ bắt đầu;
UPDATE CANCELLED và DELETE slots trong cùng transaction.
Hủy lặp trả booking đã hủy; lượt đã bắt đầu trả 409.
Lượt mới có thể đặt giờ đã hủy sau khi transaction hoàn tất.

H2 ghi dữ liệu vào file riêng mỗi service. Restart đọc lại cùng file.
schema.sql chỉ CREATE IF NOT EXISTS, seed dùng INSERT ... WHERE NOT EXISTS, không reset dữ liệu đã sửa.

## Khi phụ thuộc lỗi

User/Court trả 404 → Booking trả 404, không ghi booking.
User/Court ngừng hoạt động → 409.
Timeout, mất instance hoặc REST lỗi → 503, transaction không ghi lịch.
Frontend hiển thị lỗi, không tạo booking giả trong trình duyệt.
