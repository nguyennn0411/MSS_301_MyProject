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
- [x] Repository đã được đưa lên GitHub và có URL nộp bài: https://github.com/nguyennn0411/MSS_301_MyProject.
- [ ] Đã xác nhận với giảng viên hạn commit và phân biệt đề tài Project/Assignment.

Kết quả build/chạy thực tế được ghi riêng tại [biên bản kiểm tra](07-validation.md).
Không đánh dấu hoàn thành mốc 2 hoặc Docker chỉ vì đã có skeleton.

## Đưa repository lên GitHub

Đã push source backend và frontend lên nhánh main ngày 30/09/2026.
Remote origin đã được cấu hình thành https://github.com/nguyennn0411/MSS_301_MyProject.git.
Các lần cập nhật tiếp theo, sau khi tạo commit local, chạy:

```powershell
git push -u origin main
```

Kiểm tra source bằng `git status`, sau đó tạo commit cho thay đổi mới:

```powershell
git add .
git commit -m "docs: update project documentation"
```

Xác minh trên GitHub thấy README, docs, discovery-server, api-gateway và services.
Link repository đã được thêm vào README.
