package com.sportbooking.court.repository;

import com.sportbooking.court.model.Court;
import java.util.*;
import org.springframework.jdbc.core.*;
import org.springframework.stereotype.Repository;

@Repository
public class CourtRepository {
  private final JdbcTemplate jdbc;
  private final RowMapper<Court> mapper =
      (r, n) ->
          new Court(
              r.getString("id"),
              r.getString("name"),
              r.getString("sport_type"),
              r.getString("location"),
              r.getBigDecimal("hourly_rate"),
              r.getBoolean("active"));

  public CourtRepository(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  public List<Court> list() {
    return jdbc.query("SELECT * FROM courts ORDER BY id", mapper);
  }

  public Optional<Court> find(String id) {
    return jdbc.query("SELECT * FROM courts WHERE id=?", mapper, id).stream().findFirst();
  }

  public void insert(Court c) {
    jdbc.update(
        "INSERT INTO courts VALUES (?,?,?,?,?,?)",
        c.id(),
        c.name(),
        c.sportType(),
        c.location(),
        c.hourlyRate(),
        c.active());
  }

  public boolean update(Court c) {
    return jdbc.update(
            "UPDATE courts SET name=?,sport_type=?,location=?,hourly_rate=?,active=? WHERE id=?",
            c.name(),
            c.sportType(),
            c.location(),
            c.hourlyRate(),
            c.active(),
            c.id())
        == 1;
  }
}
