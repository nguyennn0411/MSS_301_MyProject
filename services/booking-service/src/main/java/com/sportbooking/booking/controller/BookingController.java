package com.sportbooking.booking.controller;

import com.sportbooking.booking.model.*;
import com.sportbooking.booking.service.BookingService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@Validated
@RequestMapping("/api/bookings")
public class BookingController {
  private final BookingService service;

  public BookingController(BookingService service) {
    this.service = service;
  }

  @GetMapping
  public List<Booking> list(@RequestParam @NotBlank @Size(max = 64) String userId) {
    return service.list(userId);
  }

  @GetMapping("/{id}")
  public Booking get(@PathVariable String id) {
    return service.get(id);
  }

  @GetMapping("/availability")
  public List<BookingService.BusyPeriod> availability(
      @RequestParam @NotBlank @Size(max = 64) String courtId, @RequestParam LocalDate date) {
    return service.availability(courtId, date);
  }

  @PostMapping
  public ResponseEntity<Booking> create(@Valid @RequestBody BookingInput input) {
    var booking = service.create(input);
    return ResponseEntity.created(URI.create("/api/bookings/" + booking.id())).body(booking);
  }

  @PatchMapping("/{id}/cancel")
  public Booking cancel(@PathVariable String id) {
    return service.cancel(id);
  }
}
