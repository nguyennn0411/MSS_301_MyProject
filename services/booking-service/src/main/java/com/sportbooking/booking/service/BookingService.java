package com.sportbooking.booking.service;

import static org.springframework.http.HttpStatus.*;

import com.sportbooking.booking.model.*;
import com.sportbooking.booking.repository.BookingRepository;
import java.math.*;
import java.time.*;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BookingService {
  private static final ZoneOffset ZONE = ZoneOffset.ofHours(7);
  private final BookingRepository repository;
  private final CatalogClient catalog;

  public BookingService(BookingRepository repository, CatalogClient catalog) {
    this.repository = repository;
    this.catalog = catalog;
  }

  public List<Booking> list(String userId) {
    return repository.list(userId);
  }

  public Booking get(String id) {
    return find(id, false);
  }

  private Booking find(String id, boolean lock) {
    return repository
        .find(id, lock)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Không tìm thấy lượt đặt."));
  }

  public record BusyPeriod(OffsetDateTime startTime, OffsetDateTime endTime) {}

  public List<BusyPeriod> availability(String courtId, LocalDate date) {
    catalog.court(courtId);
    long from = date.atStartOfDay().toInstant(ZONE).toEpochMilli();
    long to = date.plusDays(1).atStartOfDay().toInstant(ZONE).toEpochMilli();
    return repository.occupied(courtId, from, to).stream()
        .map(b -> new BusyPeriod(b.startTime(), b.endTime()))
        .toList();
  }

  @Transactional
  public Booking create(BookingInput input) {
    var start = input.startTime().withOffsetSameInstant(ZONE);
    var end = input.endTime().withOffsetSameInstant(ZONE);
    long minutes = Duration.between(start, end).toMinutes();
    if (!start.toInstant().isAfter(Instant.now())
        || !end.isAfter(start)
        || !start.toLocalDate().equals(end.toLocalDate())
        || start.getHour() < 6
        || end.toLocalTime().isAfter(LocalTime.of(22, 0))
        || start.getMinute() % 30 != 0
        || end.getMinute() % 30 != 0
        || start.getSecond() != 0
        || end.getSecond() != 0
        || start.getNano() != 0
        || end.getNano() != 0
        || (minutes != 60 && minutes != 90 && minutes != 120)) {
      throw new ResponseStatusException(
          BAD_REQUEST,
          "Chọn lịch tương lai cùng ngày, từ 06:00 đến 22:00, bước 30 phút và thời lượng 60/90/120"
              + " phút.");
    }
    var user = catalog.user(input.userId());
    var court = catalog.court(input.courtId());
    if (!user.active() || !court.active())
      throw new ResponseStatusException(CONFLICT, "Người dùng hoặc sân đã ngừng hoạt động.");
    var total =
        court
            .hourlyRate()
            .multiply(BigDecimal.valueOf(minutes))
            .divide(BigDecimal.valueOf(60), 0, RoundingMode.HALF_UP);
    var booking =
        new Booking(
            UUID.randomUUID().toString(),
            input.userId(),
            input.courtId(),
            court.name(),
            start,
            end,
            court.hourlyRate(),
            total,
            "CONFIRMED",
            OffsetDateTime.now(ZONE));
    // A unique database slot prevents races; a conflict rolls back the entire transaction.
    repository.insert(booking);
    return booking;
  }

  @Transactional
  public Booking cancel(String id) {
    var booking = find(id, true);
    if (booking.status().equals("CANCELLED")) return booking;
    if (!booking.startTime().toInstant().isAfter(Instant.now()))
      throw new ResponseStatusException(CONFLICT, "Không thể hủy lượt đã bắt đầu.");
    repository.cancel(id);
    return find(id, false);
  }
}
