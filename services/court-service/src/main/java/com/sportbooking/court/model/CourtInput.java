package com.sportbooking.court.model;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record CourtInput(
    @NotBlank @Size(max = 120) String name,
    @NotBlank @Pattern(regexp = "BADMINTON|FOOTBALL|TENNIS") String sportType,
    @NotBlank @Size(max = 200) String location,
    @NotNull @DecimalMin("1") @Digits(integer = 9, fraction = 0) BigDecimal hourlyRate,
    @NotNull Boolean active) {}
