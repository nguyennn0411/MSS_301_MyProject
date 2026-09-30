package com.sportbooking.booking.repository;

import com.sportbooking.booking.model.Booking;
import java.time.*;
import java.util.*;
import org.springframework.jdbc.core.*;
import org.springframework.stereotype.Repository;

@Repository
public class BookingRepository {
  private final JdbcTemplate jdbc;

  private static OffsetDateTime time(long ms) {
    return Instant.ofEpochMilli(ms).atOffset(ZoneOffset.ofHours(7));
  }

  private final RowMapper<Booking> mapper =
      (r, n) ->
          new Booking(
              r.getString("id"),
              r.getString("user_id"),
              r.getString("court_id"),
              r.getString("court_name"),
              time(r.getLong("start_ms")),
              time(r.getLong("end_ms")),
              r.getBigDecimal("hourly_rate"),
              r.getBigDecimal("total_price"),
              r.getString("status"),
              time(r.getLong("created_ms")));

  public BookingRepository(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  public List<Booking> list(String userId) {
    return jdbc.query(
        "SELECT * FROM bookings WHERE user_id=? ORDER BY created_ms DESC", mapper, userId);
  }

  public Optional<Booking> find(String id, boolean lock) {
    return jdbc
        .query("SELECT * FROM bookings WHERE id=?" + (lock ? " FOR UPDATE" : ""), mapper, id)
        .stream()
        .findFirst();
  }

  public List<Booking> occupied(String courtId, long from, long to) {
    return jdbc.query(
        "SELECT * FROM bookings WHERE court_id=? AND status='CONFIRMED' AND start_ms < ? AND end_ms"
            + " > ? ORDER BY start_ms",
        mapper,
        courtId,
        to,
        from);
  }

  public void insert(Booking b) {
    long start = b.startTime().toInstant().toEpochMilli(),
        end = b.endTime().toInstant().toEpochMilli();
    jdbc.update(
        "INSERT INTO bookings"
            + " (id,user_id,court_id,court_name,start_ms,end_ms,hourly_rate,total_price,status,created_ms)"
            + " VALUES (?,?,?,?,?,?,?,?,?,?)",
        b.id(),
        b.userId(),
        b.courtId(),
        b.courtName(),
        start,
        end,
        b.hourlyRateSnapshot(),
        b.totalPrice(),
        b.status(),
        b.createdAt().toInstant().toEpochMilli());
    for (long slot = start; slot < end; slot += 1_800_000L) {
      jdbc.update(
          "INSERT INTO booking_slots(court_id,slot_ms,booking_id) VALUES (?,?,?)",
          b.courtId(),
          slot,
          b.id());
    }
  }

  public void cancel(String id) {
    jdbc.update("UPDATE bookings SET status='CANCELLED' WHERE id=?", id);
    jdbc.update("DELETE FROM booking_slots WHERE booking_id=?", id);
  }
}
