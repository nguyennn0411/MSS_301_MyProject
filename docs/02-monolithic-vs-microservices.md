# 02. Monolithic và Microservices

| Tiêu chí | Monolithic | Microservices |
|---|---|---|
| Cấu trúc | Các module nghiệp vụ nằm trong một ứng dụng | Mỗi miền nghiệp vụ là một service riêng |
| Build, triển khai | Build và triển khai toàn ứng dụng | Mỗi service có artifact và tiến trình riêng |
| Giao tiếp | Gọi hàm nội bộ | Gọi REST qua mạng trong bài này |
| Dữ liệu | Thường chung database, dễ tạo transaction | Mỗi service sở hữu dữ liệu; khó bảo đảm nhất quán xuyên service |
| Mở rộng | Thường nhân bản toàn ứng dụng | Có thể nhân bản riêng service có tải cao |
| Sự cố | Lỗi nghiêm trọng có thể ảnh hưởng toàn ứng dụng | Có thể cô lập lỗi, nhưng lỗi vẫn lan qua các lời gọi phụ thuộc |
| Kiểm thử | Chạy và debug đơn giản hơn | Cần kiểm thử tích hợp, mạng, discovery và lỗi phụ thuộc |
| Vận hành | Ít cấu hình và tiến trình | Cần discovery, gateway, log, giám sát và cấu hình triển khai |
| Nhóm nhỏ | Thường đơn giản, chi phí thấp | Chi phí phối hợp và vận hành cao hơn |

## Lý do lựa chọn cho SportBooking

Ba miền người dùng, sân và đặt sân có trách nhiệm rõ ràng. Tách chúng giúp minh họa ownership dữ liệu
và thay đổi từng service độc lập. Booking Service có luồng gọi User Service và Court Service phù hợp
để thực hành giao tiếp REST, discovery và xử lý lỗi mạng.

Microservices đáp ứng trực tiếp mục tiêu học phần về Spring Cloud và Docker.
Với quy mô sản phẩm thực tế nhỏ, một monolith có thể tiết kiệm hơn; lựa chọn ở đây ưu tiên mục tiêu học tập
và khả năng giải thích kiến trúc, không khẳng định microservices luôn tốt hơn.

## Chi phí và cách giới hạn độ phức tạp

Dùng đúng 3 service nghiệp vụ, một Eureka và một Gateway; chưa thêm message broker hoặc Config Server.
Tập trung một luồng đặt sân hoàn chỉnh trước khi mở rộng chức năng.
Chỉ Booking Service ghi dữ liệu lượt đặt để có một nơi kiểm soát trùng lịch.
Các mốc sau cần timeout cho lời gọi REST và không tự retry thao tác ghi nếu chưa có cơ chế chống tạo trùng.
