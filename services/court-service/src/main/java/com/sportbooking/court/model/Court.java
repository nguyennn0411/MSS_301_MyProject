package com.sportbooking.court.model;

import java.math.BigDecimal;

public record Court(
    String id,
    String name,
    String sportType,
    String location,
    BigDecimal hourlyRate,
    boolean active) {}
