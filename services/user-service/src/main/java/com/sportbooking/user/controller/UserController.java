package com.sportbooking.user.controller;

import com.sportbooking.user.model.*;
import com.sportbooking.user.service.UserService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
  private final UserService service;

  public UserController(UserService service) {
    this.service = service;
  }

  @GetMapping
  public List<User> list() {
    return service.list();
  }

  @GetMapping("/{id}")
  public User get(@PathVariable String id) {
    return service.get(id);
  }

  @PostMapping
  public ResponseEntity<User> create(@Valid @RequestBody UserInput input) {
    var user = service.create(input);
    return ResponseEntity.created(URI.create("/api/users/" + user.id())).body(user);
  }

  @PutMapping("/{id}")
  public User update(@PathVariable String id, @Valid @RequestBody UserInput input) {
    return service.update(id, input);
  }
}
