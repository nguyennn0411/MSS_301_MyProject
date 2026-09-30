package com.sportbooking.booking.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.sportbooking.booking.model.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.NONE,
    properties = {
      "spring.datasource.url=jdbc:h2:mem:booking-test;DB_CLOSE_DELAY=-1",
      "eureka.client.enabled=false",
      "spring.cloud.discovery.enabled=false"
    })
class BookingPersistenceTest {
  @Autowired BookingService service;
  @Autowired JdbcTemplate jdbc;
  @MockitoBean CatalogClient catalog;
  private BookingInput request;

  @BeforeEach
  void setup() {
    jdbc.update("DELETE FROM booking_slots");
    jdbc.update("DELETE FROM bookings");
    when(catalog.user("u")).thenReturn(new CatalogClient.UserInfo("u", true));
    when(catalog.court("c"))
        .thenReturn(new CatalogClient.CourtInfo("c", "Court", new BigDecimal("80000"), true));
    var start = LocalDate.now().plusDays(5).atTime(18, 0).atOffset(ZoneOffset.ofHours(7));
    request = new BookingInput("u", "c", start, start.plusHours(1));
  }

  @Test
  void conflictRollsBackAndCancellationReleasesSlots() {
    var booking = service.create(request);
    assertThrows(DataIntegrityViolationException.class, () -> service.create(request));
    assertEquals(1, service.list("u").size());
    assertEquals(2, jdbc.queryForObject("SELECT COUNT(*) FROM booking_slots", Integer.class));
    service.cancel(booking.id());
    service.create(request);
    assertEquals(2, service.list("u").size());
    assertEquals(2, jdbc.queryForObject("SELECT COUNT(*) FROM booking_slots", Integer.class));
  }

  @Test
  void concurrentTransactionsCannotDoubleBook() throws Exception {
    try (var pool = Executors.newFixedThreadPool(8)) {
      var gate = new CountDownLatch(1);
      List<Future<Boolean>> futures = new ArrayList<>();
      for (int i = 0; i < 8; i++)
        futures.add(
            pool.submit(
                () -> {
                  gate.await();
                  try {
                    service.create(request);
                    return true;
                  } catch (DataIntegrityViolationException expected) {
                    return false;
                  }
                }));
      gate.countDown();
      int success = 0;
      for (var f : futures) if (f.get(15, TimeUnit.SECONDS)) success++;
      assertEquals(1, success);
      assertEquals(1, service.list("u").size());
      assertEquals(2, jdbc.queryForObject("SELECT COUNT(*) FROM booking_slots", Integer.class));
    }
  }
}
