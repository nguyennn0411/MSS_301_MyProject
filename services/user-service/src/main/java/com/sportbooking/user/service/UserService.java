package com.sportbooking.user.service;

import static org.springframework.http.HttpStatus.NOT_FOUND;

import com.sportbooking.user.model.*;
import com.sportbooking.user.repository.UserRepository;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {
  private final UserRepository repository;

  public UserService(UserRepository repository) {
    this.repository = repository;
  }

  public List<User> list() {
    return repository.list();
  }

  public User get(String id) {
    return repository
        .find(id)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Không tìm thấy người dùng."));
  }

  public User create(UserInput input) {
    var u = from(UUID.randomUUID().toString(), input);
    repository.insert(u);
    return u;
  }

  public User update(String id, UserInput input) {
    var u = from(id, input);
    if (!repository.update(u))
      throw new ResponseStatusException(NOT_FOUND, "Không tìm thấy người dùng.");
    return u;
  }

  private User from(String id, UserInput i) {
    return new User(
        id,
        i.fullName().trim(),
        i.email().trim().toLowerCase(Locale.ROOT),
        i.phone().trim(),
        i.active());
  }
}
