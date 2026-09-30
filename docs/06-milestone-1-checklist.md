# 06. Checklist bàn giao mốc 1

## Nội dung trong repository

- [x] Chủ đề SportBooking và mục tiêu.
- [x] Thành viên Cao Phúc Nguyên — HE191659.
- [x] Phân công nhóm 1 người.
- [x] Phân tích bài toán, microservices và trách nhiệm.
- [x] So sánh Monolithic/Microservices và lý do lựa chọn.
- [x] Sơ đồ kiến trúc có Gateway, Eureka, ba service.
- [x] Skeleton Spring Boot Discovery Server.
- [x] Skeleton Spring Boot API Gateway.
- [x] Skeleton User Service, Court Service, Booking Service.
- [x] README và hướng dẫn chạy local.
- [x] Maven Wrapper, .gitignore.
- [ ] Repository đã được đưa lên GitHub và có URL nộp bài.
- [ ] Đã xác nhận với giảng viên hạn commit và phân biệt đề tài Project/Assignment.

Kết quả build/chạy thực tế được ghi riêng tại [biên bản kiểm tra](07-validation.md).
Không đánh dấu hoàn thành mốc 2 hoặc Docker chỉ vì đã có skeleton.

## Đưa repository lên GitHub

Repository remote chưa được cung cấp khi khởi tạo bộ bài.
Tạo một repository trống trên GitHub (không tạo trước README/.gitignore để tránh lịch sử không liên quan).
Sau khi đã có commit local, chạy các lệnh sau tại root và thay URL mẫu bằng URL thật:

```powershell
git remote add origin https://github.com/YOUR_ACCOUNT/sportbooking.git
git push -u origin main
```

Không chạy nguyên URL mẫu. Nếu đã có origin, xem `git remote -v` trước khi sửa.
Nếu chưa có commit local, kiểm tra source bằng `git status`, sau đó:

```powershell
git add .
git commit -m "chore: initialize SportBooking milestone 1 architecture and skeleton"
```

Xác minh trên GitHub thấy README, docs, discovery-server, api-gateway và services.
Sau khi push thành công, đánh dấu checklist GitHub phía trên và thêm link repository vào README.
