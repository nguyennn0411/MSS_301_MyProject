import { test } from "node:test";
import assert from "node:assert/strict";
import { bookingError, clockTime, validBooking, startsAt } from "./data.js";
const now = Date.parse("2026-09-30T10:00:00+07:00");
const sample = {
  id: "test",
  courtId: "court-01",
  date: "2026-10-01",
  hour: 18,
  duration: 1,
  total: 80000,
  status: "CONFIRMED",
};
test("conflicts reject overlap but accept adjacent intervals", () => {
  assert.notEqual(
    bookingError([sample], "court-01", sample.date, 17, 2, now),
    "",
  );
  assert.notEqual(
    bookingError([sample], "court-01", sample.date, 18, 1, now),
    "",
  );
  assert.equal(bookingError([sample], "court-01", sample.date, 19, 1, now), "");
  assert.equal(bookingError([sample], "court-01", sample.date, 17, 1, now), "");
});
test("cancelled bookings and different courts do not block the slot", () => {
  assert.equal(
    bookingError(
      [{ ...sample, status: "CANCELLED" }],
      "court-01",
      sample.date,
      18,
      1,
      now,
    ),
    "",
  );
  assert.equal(bookingError([sample], "court-02", sample.date, 18, 1, now), "");
});
test("past time, invalid date, unselected hour and closing boundary rejected", () => {
  for (const [date, hour, duration] of [
    ["2026-09-30", 9, 1],
    ["bad-date", 18, 1],
    ["2026-10-01", null, 1],
    ["2026-10-01", 21, 2],
    ["2026-10-01", 18, 0],
  ]) {
    assert.notEqual(
      bookingError([], "court-01", date, hour, duration, now),
      "",
    );
  }
  assert.equal(bookingError([], "court-01", "2026-10-01", 21, 1, now), "");
});
test("half hours and timezone remain correct", () => {
  assert.equal(clockTime(19.5), "19:30");
  assert.equal(startsAt(sample), Date.parse("2026-10-01T11:00:00Z"));
});
test("invalid stored data does not become a booking", () => {
  assert.equal(validBooking(sample), true);
  assert.equal(validBooking({ ...sample, courtId: "missing" }), false);
  assert.equal(validBooking({ ...sample, duration: -1 }), false);
  assert.equal(validBooking({ ...sample, total: "80000" }), false);
});
