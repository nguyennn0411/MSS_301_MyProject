package com.sportbooking.user.model;

import jakarta.validation.constraints.*;

public record UserInput(
    @NotBlank @Size(max = 120) String fullName,
    @NotBlank @Email @Size(max = 200) String email,
    @NotBlank @Pattern(regexp = "[+0-9 ()-]{8,20}") String phone,
    @NotNull Boolean active) {}
