package com.sportbooking.user.repository;

import com.sportbooking.user.model.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {
  private final JdbcTemplate jdbc;
  private final RowMapper<User> mapper =
      (r, n) ->
          new User(
              r.getString("id"),
              r.getString("full_name"),
              r.getString("email"),
              r.getString("phone"),
              r.getBoolean("active"));

  public UserRepository(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  public List<User> list() {
    return jdbc.query("SELECT * FROM app_users ORDER BY full_name", mapper);
  }

  public Optional<User> find(String id) {
    return jdbc.query("SELECT * FROM app_users WHERE id=?", mapper, id).stream().findFirst();
  }

  public void insert(User u) {
    jdbc.update(
        "INSERT INTO app_users VALUES (?,?,?,?,?)",
        u.id(),
        u.fullName(),
        u.email(),
        u.phone(),
        u.active());
  }

  public boolean update(User u) {
    return jdbc.update(
            "UPDATE app_users SET full_name=?,email=?,phone=?,active=? WHERE id=?",
            u.fullName(),
            u.email(),
            u.phone(),
            u.active(),
            u.id())
        == 1;
  }
}
