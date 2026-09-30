package com.sportbooking.court.controller;

import com.sportbooking.court.model.*;
import com.sportbooking.court.service.CourtService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courts")
public class CourtController {
  private final CourtService service;

  public CourtController(CourtService service) {
    this.service = service;
  }

  @GetMapping
  public List<Court> list() {
    return service.list();
  }

  @GetMapping("/{id}")
  public Court get(@PathVariable String id) {
    return service.get(id);
  }

  @PostMapping
  public ResponseEntity<Court> create(@Valid @RequestBody CourtInput input) {
    var court = service.create(input);
    return ResponseEntity.created(URI.create("/api/courts/" + court.id())).body(court);
  }

  @PutMapping("/{id}")
  public Court update(@PathVariable String id, @Valid @RequestBody CourtInput input) {
    return service.update(id, input);
  }
}
