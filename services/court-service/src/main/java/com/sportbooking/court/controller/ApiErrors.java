package com.sportbooking.court.controller;

import jakarta.validation.ConstraintViolationException;
import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiErrors {
  @ExceptionHandler(ResponseStatusException.class)
  ResponseEntity<Map<String, Object>> status(ResponseStatusException ex) {
    return ResponseEntity.status(ex.getStatusCode())
        .body(
            Map.of(
                "status",
                ex.getStatusCode().value(),
                "message",
                ex.getReason() == null ? "Request failed" : ex.getReason()));
  }

  @ExceptionHandler({
    MethodArgumentNotValidException.class,
    HttpMessageNotReadableException.class,
    MethodArgumentTypeMismatchException.class,
    ConstraintViolationException.class
  })
  ResponseEntity<Map<String, Object>> invalid(Exception ex) {
    String message =
        ex instanceof MethodArgumentNotValidException validation
            ? validation.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .sorted()
                .findFirst()
                .orElse("Invalid input")
            : "Invalid request. Check required fields, dates and number formats.";
    return ResponseEntity.badRequest().body(Map.of("status", 400, "message", message));
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  ResponseEntity<Map<String, Object>> conflict() {
    return ResponseEntity.status(409)
        .body(Map.of("status", 409, "message", "Dữ liệu bị trùng hoặc không hợp lệ."));
  }
}
