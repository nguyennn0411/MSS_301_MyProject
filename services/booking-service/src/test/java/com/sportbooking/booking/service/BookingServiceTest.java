package com.sportbooking.booking.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.sportbooking.booking.model.*;
import com.sportbooking.booking.repository.BookingRepository;
import java.math.BigDecimal;
import java.time.*;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class BookingServiceTest {
  private BookingRepository repository;
  private CatalogClient catalog;
  private BookingService service;
  private OffsetDateTime start;

  @BeforeEach
  void setup() {
    repository = mock(BookingRepository.class);
    catalog = mock(CatalogClient.class);
    service = new BookingService(repository, catalog);
    start =
        LocalDate.now(ZoneOffset.ofHours(7))
            .plusDays(3)
            .atTime(18, 0)
            .atOffset(ZoneOffset.ofHours(7));
  }

  private BookingInput request(OffsetDateTime from, OffsetDateTime to) {
    return new BookingInput("user", "court", from, to);
  }

  @Test
  void calculatesNinetyMinutesUsingRemotePrice() {
    when(catalog.user("user")).thenReturn(new CatalogClient.UserInfo("user", true));
    when(catalog.court("court"))
        .thenReturn(new CatalogClient.CourtInfo("court", "Court", new BigDecimal("150001"), true));
    var result = service.create(request(start, start.plusMinutes(90)));
    assertEquals(new BigDecimal("225002"), result.totalPrice());
    assertEquals(new BigDecimal("150001"), result.hourlyRateSnapshot());
    verify(repository).insert(result);
  }

  @Test
  void validatesBeforeMakingNetworkCalls() {
    for (var bad :
        new BookingInput[] {
          request(start.withHour(5), start.withHour(6)),
          request(start.withHour(21), start.withHour(23)),
          request(start.plusMinutes(1), start.plusMinutes(61)),
          request(start, start.plusMinutes(30)),
          request(start.minusDays(20), start.minusDays(20).plusHours(1))
        }) {
      assertEquals(
          400,
          assertThrows(ResponseStatusException.class, () -> service.create(bad))
              .getStatusCode()
              .value());
    }
    verifyNoInteractions(catalog, repository);
  }

  @Test
  void inactiveUserDoesNotCreateBooking() {
    when(catalog.user("user")).thenReturn(new CatalogClient.UserInfo("user", false));
    when(catalog.court("court"))
        .thenReturn(new CatalogClient.CourtInfo("court", "Court", new BigDecimal("80000"), true));
    assertEquals(
        409,
        assertThrows(
                ResponseStatusException.class,
                () -> service.create(request(start, start.plusHours(1))))
            .getStatusCode()
            .value());
    verifyNoInteractions(repository);
  }

  @Test
  void cancellationIsIdempotentAndRejectsStartedBookings() {
    var cancelled =
        new Booking(
            "id",
            "u",
            "c",
            "Court",
            start,
            start.plusHours(1),
            BigDecimal.ONE,
            BigDecimal.ONE,
            "CANCELLED",
            start.minusDays(1));
    when(repository.find("id", true)).thenReturn(Optional.of(cancelled));
    assertEquals(cancelled, service.cancel("id"));
    verify(repository, never()).cancel(anyString());
    var past =
        new Booking(
            "past",
            "u",
            "c",
            "Court",
            start.minusDays(20),
            start.minusDays(20).plusHours(1),
            BigDecimal.ONE,
            BigDecimal.ONE,
            "CONFIRMED",
            start.minusDays(21));
    when(repository.find("past", true)).thenReturn(Optional.of(past));
    assertEquals(
        409,
        assertThrows(ResponseStatusException.class, () -> service.cancel("past"))
            .getStatusCode()
            .value());
    verify(repository, never()).cancel(anyString());
  }
}
