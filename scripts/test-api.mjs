import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
const base = process.env.API_BASE || "http://localhost:8080";
const report = [];
async function api(path, method = "GET", body, status = 200) {
  const response = await fetch(base + "/api" + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20000),
  });
  const data = await response.json();
  assert.equal(
    response.status,
    status,
    method + " " + path + " " + JSON.stringify(data),
  );
  return data;
}
function pass(text) {
  report.push("PASS " + text);
  console.log("PASS " + text);
}
const date = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
let user,
  court,
  created = [];
try {
  for (const name of ["users", "courts", "bookings"])
    assert.equal((await api("/" + name + "/status")).milestone, "2");
  pass("Gateway routes to all 3 services");
  const suffix = crypto.randomUUID().slice(0, 8);
  user = await api(
    "/users",
    "POST",
    {
      fullName: "API Test " + suffix,
      email: suffix + "@example.test",
      phone: "0901234567",
      active: true,
    },
    201,
  );
  assert.equal((await api("/users/" + user.id)).id, user.id);
  await api("/users/" + user.id, "PUT", { ...user, fullName: "API Updated" });
  await api(
    "/users",
    "POST",
    { fullName: "", email: "invalid", phone: "x", active: true },
    400,
  );
  await api("/users", "POST", { ...user }, 409);
  pass("User create/read/update, validation and duplicate email");
  court = await api(
    "/courts",
    "POST",
    {
      name: "API Test " + suffix,
      sportType: "TENNIS",
      location: "Local test",
      hourlyRate: 150000,
      active: true,
    },
    201,
  );
  await api("/courts/" + court.id, "PUT", { ...court, hourlyRate: 160000 });
  await api("/courts", "POST", { ...court, hourlyRate: -1 }, 400);
  pass("Court create/read/update and price validation");
  const payload = {
    userId: user.id,
    courtId: court.id,
    startTime: date + "T18:00:00+07:00",
    endTime: date + "T19:30:00+07:00",
  };
  const b = await api("/bookings", "POST", payload, 201);
  created.push(b);
  assert.equal(b.totalPrice, 240000);
  assert.equal(b.hourlyRateSnapshot, 160000);
  assert.equal((await api("/bookings/" + b.id)).id, b.id);
  await api("/courts/" + court.id, "PUT", { ...court, hourlyRate: 200000 });
  assert.equal((await api("/bookings/" + b.id)).hourlyRateSnapshot, 160000);
  assert.equal((await api("/bookings?userId=" + user.id)).length, 1);
  assert.equal(
    (await api("/bookings/availability?courtId=" + court.id + "&date=" + date))
      .length,
    1,
  );
  pass(
    "REST user/court validation, price calculation/snapshot, list/detail/availability",
  );
  await api("/bookings", "POST", payload, 409);
  await api(
    "/bookings",
    "POST",
    {
      ...payload,
      startTime: date + "T19:00:00+07:00",
      endTime: date + "T20:00:00+07:00",
    },
    409,
  );
  await api("/bookings", "POST", { ...payload, userId: "does-not-exist" }, 404);
  await api(
    "/bookings",
    "POST",
    { ...payload, startTime: "2020-01-01T10:00:00+07:00" },
    400,
  );
  await api(
    "/bookings",
    "POST",
    {
      ...payload,
      startTime: date + "T21:30:00+07:00",
      endTime: date + "T23:00:00+07:00",
    },
    400,
  );
  pass("Conflict, missing user, past time and closing time rejected");
  const adjacent = await api(
    "/bookings",
    "POST",
    {
      ...payload,
      startTime: date + "T19:30:00+07:00",
      endTime: date + "T20:30:00+07:00",
    },
    201,
  );
  created.push(adjacent);
  pass("Adjacent half-open intervals accepted");
  await api("/bookings/" + b.id + "/cancel", "PATCH");
  assert.equal(
    (await api("/bookings/" + b.id + "/cancel", "PATCH")).status,
    "CANCELLED",
  );
  const retry = await api("/bookings", "POST", payload, 201);
  created.push(retry);
  await api("/bookings/" + retry.id + "/cancel", "PATCH");
  const responses = await Promise.all(
    Array.from({ length: 8 }, () =>
      fetch(base + "/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20000),
      }),
    ),
  );
  assert.equal(responses.filter((r) => r.status === 201).length, 1);
  assert.equal(responses.filter((r) => r.status === 409).length, 7);
  for (const response of responses) {
    const value = await response.json();
    if (response.status === 201) created.push(value);
  }
  assert.equal(
    (await api("/bookings?userId=" + user.id)).filter(
      (b) => b.status === "CONFIRMED",
    ).length,
    2,
  );
  pass(
    "Cancel idempotency, release slots, 8 concurrent requests produce exactly 1 booking and 7 conflicts",
  );
  await api("/users/" + user.id, "PUT", { ...user, active: false });
  await api(
    "/bookings",
    "POST",
    {
      ...payload,
      startTime: date + "T10:00:00+07:00",
      endTime: date + "T11:00:00+07:00",
    },
    409,
  );
  pass("Inactive user rejected");
} finally {
  for (const b of created) await api("/bookings/" + b.id + "/cancel", "PATCH");
  if (user) await api("/users/" + user.id, "PUT", { ...user, active: false });
  if (court)
    await api("/courts/" + court.id, "PUT", { ...court, active: false });
}
writeFileSync(".run/api-test-results.txt", report.join("\n") + "\n");
console.log(
  "All API checks passed; test records retained inactive/cancelled for audit.",
);
