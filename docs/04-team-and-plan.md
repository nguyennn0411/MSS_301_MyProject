# 04. Phân công và kế hoạch

## Thành viên hiện tại

| Họ tên | MSSV | Vai trò |
|---|---|---|
| Cao Phúc Nguyên | HE191659 | Phân tích, lập trình, tích hợp và kiểm thử |

Nhóm hiện có thông tin của 1 thành viên, phù hợp phạm vi nhóm 1–2 người.
Nếu bổ sung thành viên thứ hai, cập nhật bảng này và phân chia công việc trước khi nộp.

## Phân công theo đầu việc

| Đầu việc | Người phụ trách | Sản phẩm |
|---|---|---|
| Phân tích bài toán, so sánh kiến trúc | Cao Phúc Nguyên | docs/01, docs/02 |
| Thiết kế service, dữ liệu và luồng request | Cao Phúc Nguyên | docs/03 |
| Khởi tạo source, quản lý Git | Cao Phúc Nguyên | Maven modules, README và repository |
| Eureka và Gateway | Cao Phúc Nguyên | Discovery, cấu hình route |
| User Service và Court Service | Cao Phúc Nguyên | Skeleton mốc 1; nghiệp vụ mốc 2 |
| Booking Service và REST liên service | Cao Phúc Nguyên | Skeleton mốc 1; nghiệp vụ mốc 2 |
| Docker hóa, kiểm thử, chuẩn bị demo | Cao Phúc Nguyên | Mốc 3 và demo cuối kỳ |

## Kế hoạch bàn giao

| Giai đoạn | Nội dung | Hoàn thành khi |
|---|---|---|
| Mốc 1 / Asm 1.1 | Phân tích, sơ đồ, phân công, 5 skeleton | Source build được, tài liệu đầy đủ, commit có trên GitHub |
| Mốc 2 / Asm 1.2 | REST nghiệp vụ, database, giao tiếp service, demo local | Luồng đặt/hủy/kiểm tra trùng chạy qua Gateway; có minh chứng demo |
| Mốc 3 / Assignment 2 | Dockerfile, Compose, hướng dẫn | Khởi chạy bằng docker-compose up, service giao tiếp qua Docker network |
| Demo cuối kỳ | Ổn định sản phẩm, luyện vấn đáp | Demo trực tiếp và giải thích kiến trúc, Spring Cloud, Docker |

**Mốc thời gian cần xác nhận:** từng phần đề ghi cuối tuần 5, 7, 8; phần cuối ghi cuối tuần 3, 6, 9.
Demo cuối kỳ ghi tuần 10, slot 19. Chưa có lịch học để quy đổi thành ngày cụ thể.
Không sửa thời gian commit để giả lập tiến độ; nộp và commit theo tiến độ thực tế.

## Quy trình Git

- Nhánh main giữ phiên bản build được.
- Chức năng mới dùng nhánh ngắn, ví dụ feat/booking-api hoặc docs/docker-guide.
- Commit theo thay đổi có ý nghĩa; không đưa target, mật khẩu, log hoặc cache vào repository.
- Trước khi gộp: build, kiểm tra endpoint, cập nhật tài liệu.
- Nếu làm hai người: mỗi người dùng tài khoản Git riêng và review thay đổi của nhau.

Thông điệp commit đầu đề xuất:
`chore: initialize SportBooking milestone 1 architecture and skeleton`.

## Chuẩn bị vấn đáp

Giải thích được vì sao có ba service, database nào sở hữu dữ liệu nào, Eureka khác Gateway ra sao,
Gateway tìm instance bằng cách nào, Maven multi-module khác monolith thế nào,
và tại sao thao tác kiểm tra trùng rồi lưu cần bảo vệ ở database.
