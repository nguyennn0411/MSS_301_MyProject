export const courts = [
  {
    id: "court-01",
    name: "Sân cầu lông Sunrise",
    sport: "Cầu lông",
    location: "Hòa Lạc, Hà Nội",
    price: 80000,
    rating: "4.9",
    label: "ĐƯỢC YÊU THÍCH",
    tone: "sage",
    type: "badminton",
    features: ["Trong nhà", "Thảm thi đấu", "Có chỗ đỗ xe"],
  },
  {
    id: "court-02",
    name: "Sân bóng Green Field",
    sport: "Bóng đá",
    location: "Thạch Thất, Hà Nội",
    price: 300000,
    rating: "4.8",
    label: "SÂN 7 NGƯỜI",
    tone: "forest",
    type: "football",
    features: ["Ngoài trời", "Cỏ nhân tạo", "Đèn chiếu sáng"],
  },
  {
    id: "court-03",
    name: "Sân tennis Riverside",
    sport: "Tennis",
    location: "Hòa Lạc, Hà Nội",
    price: 150000,
    rating: "4.9",
    label: "KHÔNG GIAN THOÁNG",
    tone: "clay",
    type: "tennis",
    features: ["Ngoài trời", "Sân tiêu chuẩn", "Phòng thay đồ"],
  },
  {
    id: "court-04",
    name: "Sân cầu lông The Club",
    sport: "Cầu lông",
    location: "Thạch Thất, Hà Nội",
    price: 100000,
    rating: "4.7",
    label: "CHO HỘI BẠN",
    tone: "blue",
    type: "badminton",
    features: ["Trong nhà", "Có thuê vợt", "Nước uống"],
  },
  {
    id: "court-05",
    name: "Sân bóng Campus",
    sport: "Bóng đá",
    location: "Hòa Lạc, Hà Nội",
    price: 250000,
    rating: "4.8",
    label: "SÂN 5 NGƯỜI",
    tone: "olive",
    type: "football",
    features: ["Ngoài trời", "Cỏ nhân tạo", "Có chỗ đỗ xe"],
  },
  {
    id: "court-06",
    name: "Sân tennis West Court",
    sport: "Tennis",
    location: "Thạch Thất, Hà Nội",
    price: 180000,
    rating: "4.8",
    label: "SẴN SÀNG THI ĐẤU",
    tone: "sand",
    type: "tennis",
    features: ["Ngoài trời", "Đèn chiếu sáng", "Phòng thay đồ"],
  },
];
export const money = (value) =>
  new Intl.NumberFormat("vi-VN").format(value) + " ₫";
export function vietnamDate(offset = 0) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
export function bookingError(
  bookings,
  courtId,
  date,
  hour,
  duration,
  now = Date.now(),
) {
  if (!courts.some((court) => court.id === courtId))
    return "Sân không tồn tại.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)))
    return "Vui lòng chọn ngày hợp lệ.";
  if (
    ![1, 1.5, 2].includes(duration) ||
    !Number.isInteger(hour) ||
    hour < 6 ||
    hour + duration > 22
  )
    return "Vui lòng chọn giờ trong khoảng 06:00–22:00.";
  if (
    new Date(
      date + "T" + String(hour).padStart(2, "0") + ":00:00+07:00",
    ).getTime() <= now
  )
    return "Khung giờ này đã qua. Hãy chọn thời gian khác.";
  if (
    bookings.some(
      (b) =>
        b.courtId === courtId &&
        b.date === date &&
        b.status === "CONFIRMED" &&
        hour < b.hour + b.duration &&
        hour + duration > b.hour,
    )
  )
    return "Khung giờ này đã được đặt. Hãy chọn giờ khác.";
  return "";
}
export const clockTime = (hour) =>
  String(Math.floor(hour)).padStart(2, "0") + ":" + (hour % 1 ? "30" : "00");
export const startsAt = (booking) =>
  new Date(
    booking.date + "T" + clockTime(booking.hour) + ":00+07:00",
  ).getTime();
export function readSaved(key, fallback, validate) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) && value.every(validate) ? value : fallback;
  } catch {
    return fallback;
  }
}
export const validBooking = (b) =>
  b &&
  typeof b.id === "string" &&
  courts.some((c) => c.id === b.courtId) &&
  typeof b.date === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(b.date) &&
  Number.isFinite(Date.parse(b.date)) &&
  Number.isInteger(b.hour) &&
  b.hour >= 6 &&
  [1, 1.5, 2].includes(b.duration) &&
  b.hour + b.duration <= 22 &&
  Number.isFinite(b.total) &&
  b.total >= 0 &&
  ["CONFIRMED", "CANCELLED"].includes(b.status);
