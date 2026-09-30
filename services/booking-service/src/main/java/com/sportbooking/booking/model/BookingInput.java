package com.sportbooking.booking.model;

import jakarta.validation.constraints.*;
import java.time.OffsetDateTime;

public record BookingInput(
    @NotBlank @Size(max = 64) String userId,
    @NotBlank @Size(max = 64) String courtId,
    @NotNull OffsetDateTime startTime,
    @NotNull OffsetDateTime endTime) {}
