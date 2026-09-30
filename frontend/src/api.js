import { courts as samples } from "./data";
export const USER_ID = "user-nguyen";
export async function request(path, options = {}) {
  let response;
  try {
    response = await fetch("/api" + path, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      signal: options.signal
        ? AbortSignal.any([options.signal, AbortSignal.timeout(15000)])
        : AbortSignal.timeout(15000),
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new Error(
      "Không kết nối được hệ thống. Nếu vừa đặt sân, hãy tải lại lịch trước khi thử lại.",
    );
  }
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(
      data?.message ||
        "Yêu cầu thất bại (" + response.status + "). Vui lòng thử lại.",
    );
  if (data === null) throw new Error("Phản hồi hệ thống không hợp lệ.");
  return data;
}
export function courtView(c) {
  const sample = samples.find((s) => s.id === c.id);
  const type = {
    BADMINTON: "badminton",
    FOOTBALL: "football",
    TENNIS: "tennis",
  }[c.sportType];
  return {
    ...c,
    sport: { BADMINTON: "Cầu lông", FOOTBALL: "Bóng đá", TENNIS: "Tennis" }[
      c.sportType
    ],
    price: Number(c.hourlyRate),
    type,
    tone:
      sample?.tone ||
      { badminton: "sage", football: "forest", tennis: "clay" }[type],
    label: c.active ? "ĐANG HOẠT ĐỘNG" : "TẠM NGỪNG",
    features: [c.sportType === "BADMINTON" ? "Trong nhà" : "Ngoài trời"],
  };
}
export function bookingView(b) {
  const shifted = new Date(Date.parse(b.startTime) + 7 * 3600000).toISOString();
  return {
    ...b,
    date: shifted.slice(0, 10),
    hour: Number(shifted.slice(11, 13)) + Number(shifted.slice(14, 16)) / 60,
    duration: (Date.parse(b.endTime) - Date.parse(b.startTime)) / 3600000,
    total: Number(b.totalPrice),
    status: b.status || "CONFIRMED",
  };
}
export function bookingPayload(b) {
  const start =
    b.date +
    "T" +
    String(Math.floor(b.hour)).padStart(2, "0") +
    ":" +
    (b.hour % 1 ? "30" : "00") +
    ":00+07:00";
  return {
    userId: USER_ID,
    courtId: b.courtId,
    startTime: start,
    endTime: new Date(Date.parse(start) + b.duration * 3600000).toISOString(),
  };
}
