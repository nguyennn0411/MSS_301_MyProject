package com.sportbooking.court.service;

import static org.springframework.http.HttpStatus.NOT_FOUND;

import com.sportbooking.court.model.*;
import com.sportbooking.court.repository.CourtRepository;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CourtService {
  private final CourtRepository repository;

  public CourtService(CourtRepository repository) {
    this.repository = repository;
  }

  public List<Court> list() {
    return repository.list();
  }

  public Court get(String id) {
    return repository
        .find(id)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Không tìm thấy sân."));
  }

  public Court create(CourtInput input) {
    var c = from(UUID.randomUUID().toString(), input);
    repository.insert(c);
    return c;
  }

  public Court update(String id, CourtInput input) {
    var c = from(id, input);
    if (!repository.update(c)) throw new ResponseStatusException(NOT_FOUND, "Không tìm thấy sân.");
    return c;
  }

  private Court from(String id, CourtInput i) {
    return new Court(
        id, i.name().trim(), i.sportType(), i.location().trim(), i.hourlyRate(), i.active());
  }
}
