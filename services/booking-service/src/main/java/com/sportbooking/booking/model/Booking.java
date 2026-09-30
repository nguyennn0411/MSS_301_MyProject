package com.sportbooking.booking.model;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record Booking(
    String id,
    String userId,
    String courtId,
    String courtName,
    OffsetDateTime startTime,
    OffsetDateTime endTime,
    BigDecimal hourlyRateSnapshot,
    BigDecimal totalPrice,
    String status,
    OffsetDateTime createdAt) {}
