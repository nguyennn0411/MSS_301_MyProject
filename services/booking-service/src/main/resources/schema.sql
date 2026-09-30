CREATE TABLE IF NOT EXISTS bookings (
 id VARCHAR(64) PRIMARY KEY,
 user_id VARCHAR(64) NOT NULL,
 court_id VARCHAR(64) NOT NULL,
 court_name VARCHAR(120) NOT NULL,
 start_ms BIGINT NOT NULL,
 end_ms BIGINT NOT NULL CHECK(end_ms > start_ms),
 hourly_rate DECIMAL(12,0) NOT NULL,
 total_price DECIMAL(12,0) NOT NULL,
 status VARCHAR(20) NOT NULL CHECK(status IN ('CONFIRMED','CANCELLED')),
 created_ms BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id, start_ms);
CREATE INDEX IF NOT EXISTS idx_bookings_court ON bookings(court_id, start_ms);
-- Each half-hour slot can belong to only one active booking.
-- The insert and all slot reservations share one transaction.
CREATE TABLE IF NOT EXISTS booking_slots (
 court_id VARCHAR(64) NOT NULL,
 slot_ms BIGINT NOT NULL,
 booking_id VARCHAR(64) NOT NULL REFERENCES bookings(id),
 PRIMARY KEY(court_id,slot_ms)
);
