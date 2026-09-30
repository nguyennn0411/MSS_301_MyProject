import { useEffect, useRef, useState } from "react";
import {
  courts,
  money,
  vietnamDate,
  bookingError,
  clockTime,
  startsAt,
  readSaved,
  validBooking,
} from "./data";
import "./App.css";

function Icon({ name, size = 20 }) {
  const shapes = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M8 3v4m8-4v4M3 11h18m-13 5h3" />
      </>
    ),
    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    ),
    search: (
      <>
        <circle cx="10" cy="10" r="6" />
        <path d="m15 15 6 6" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    signal: <path d="M5 16v4m7-10v10m7-17v17" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    ball: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m9 8 6 0 2 6-5 4-5-4Zm-6 6h4m10 0h4M9 8 6 5m9 3 3-3m-6 13v3" />
      </>
    ),
    leaf: (
      <>
        <path d="M20 3C6 1 1 8 6 16c7 6 15-1 14-13Z" />
        <path d="M3 21 15 9" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {shapes[name]}
    </svg>
  );
}
function CourtArt({ type, tone, hero = false }) {
  return (
    <div
      className={"court-art " + tone + (hero ? " hero-art" : "")}
      aria-hidden="true"
    >
      <div className="court-shadow" />
      <svg viewBox="0 0 400 240" className="court-drawing">
        <rect
          x="40"
          y="25"
          width="320"
          height="190"
          rx="2"
          fill="currentColor"
          fillOpacity=".08"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        {type === "football" ? (
          <>
            <path
              d="M200 25v190M40 70h55v100H40m320-100h-55v100h55M40 95h20v50H40m320-50h-20v50h20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle
              cx="200"
              cy="120"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </>
        ) : (
          <>
            <path
              d="M40 52h320M40 188h320M120 25v190m160-190v190M120 120h160M200 25v190"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path d="M198 18v204" stroke="currentColor" strokeWidth="5" />
          </>
        )}
        <circle cx="107" cy="160" r="6" fill="#edeea4" />
        <circle cx="288" cy="78" r="6" fill="#fff" />
      </svg>
      <span className="art-number">
        {type === "football" ? "07" : type === "tennis" ? "03" : "01"}
      </span>
    </div>
  );
}
function BookingDialog({ court, initialDate, bookings, onClose, onBook }) {
  const ref = useRef(null);
  const [date, setDate] = useState(initialDate);
  const [hour, setHour] = useState(null);
  const [duration, setDuration] = useState(1);
  const [error, setError] = useState("");
  useEffect(() => {
    ref.current.showModal();
  }, []);
  function submit(e) {
    e.preventDefault();
    const issue = bookingError(bookings, court.id, date, hour, duration);
    if (issue) {
      setError(issue);
      return;
    }
    onBook({
      id: crypto.randomUUID(),
      courtId: court.id,
      date,
      hour,
      duration,
      total: court.price * duration,
      status: "CONFIRMED",
    });
  }
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="booking-title"
    >
      <form onSubmit={submit}>
        <div className="dialog-top">
          <span className="eyebrow">LÊN LỊCH VẬN ĐỘNG</span>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Đóng"
          >
            <Icon name="close" />
          </button>
        </div>
        <h2 id="booking-title">{court.name}</h2>
        <p className="muted">
          {court.location} · {money(court.price)}/giờ
        </p>
        <div className="demo-note">
          Đặt thử bằng dữ liệu demo, lưu trên trình duyệt này.
        </div>
        <div className="form-row">
          <label>
            Ngày chơi
            <input
              required
              type="date"
              min={vietnamDate()}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setHour(null);
                setError("");
              }}
            />
          </label>
          <label>
            Thời lượng
            <select
              value={duration}
              onChange={(e) => {
                setDuration(Number(e.target.value));
                setHour(null);
                setError("");
              }}
            >
              <option value="1">1 giờ</option>
              <option value="1.5">1 giờ 30 phút</option>
              <option value="2">2 giờ</option>
            </select>
          </label>
        </div>
        <fieldset>
          <legend>
            Chọn giờ bắt đầu <small>· Giờ Việt Nam</small>
          </legend>
          <div className="time-grid">
            {Array.from({ length: 16 }, (_, i) => i + 6).map((h) => {
              const issue = bookingError(bookings, court.id, date, h, duration);
              return (
                <button
                  type="button"
                  key={h}
                  disabled={!!issue}
                  title={issue || "Chọn " + clockTime(h)}
                  aria-pressed={hour === h}
                  className={hour === h ? "time selected" : "time"}
                  onClick={() => {
                    setHour(h);
                    setError("");
                  }}
                >
                  {clockTime(h)}
                </button>
              );
            })}
          </div>
        </fieldset>
        <p className="small muted">
          Giờ bị mờ: đã qua, trùng lịch hoặc vượt giờ đóng cửa 22:00.
        </p>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="booking-total">
          <span>
            Tổng tiền dự kiến<strong>{money(court.price * duration)}</strong>
          </span>
          <button className="primary" disabled={hour === null} type="submit">
            Xác nhận đặt thử <Icon name="arrow" />
          </button>
        </div>
      </form>
    </dialog>
  );
}
function Connection() {
  const [results, setResults] = useState(null),
    [loading, setLoading] = useState(false);
  async function check() {
    setLoading(true);
    setResults(
      await Promise.all(
        ["users", "courts", "bookings"].map(async (name) => {
          try {
            const response = await fetch("/api/" + name + "/status", {
              signal: AbortSignal.timeout(6000),
            });
            if (!response.ok) throw new Error();
            const data = await response.json();
            if (
              data.status !== "UP" ||
              data.service !==
                {
                  users: "user-service",
                  courts: "court-service",
                  bookings: "booking-service",
                }[name]
            )
              throw new Error();
            return { name, ok: true };
          } catch {
            return { name, ok: false };
          }
        }),
      ),
    );
    setLoading(false);
  }
  return (
    <section className="connection-panel">
      <div className="connection-icon">
        <Icon name="signal" size={32} />
      </div>
      <span className="eyebrow">KẾT NỐI HỆ THỐNG</span>
      <h2>Mọi dịch vụ, một điểm đến.</h2>
      <p>
        Kiểm tra ba service qua API Gateway. Chức năng đặt sân hiện dùng dữ liệu
        demo; kết nối thành công không chuyển sang đặt sân thật.
      </p>
      <button className="primary" onClick={check} disabled={loading}>
        {loading ? "Đang kiểm tra…" : "Kiểm tra kết nối"}
        <Icon name="arrow" />
      </button>
      <div className="connection-results" aria-live="polite">
        {results?.map((r) => (
          <div key={r.name}>
            <span>{r.name}</span>
            <span className={r.ok ? "status-ok" : "error"}>
              {r.ok ? "Đang hoạt động" : "Chưa kết nối được"}
            </span>
          </div>
        ))}
      </div>
      <p className="small muted">
        Cần khởi chạy Eureka, Gateway và các service. Vite chuyển tiếp /api đến
        localhost:8080.
      </p>
    </section>
  );
}
export default function App() {
  const [page, setPage] = useState("explore"),
    [sport, setSport] = useState("Tất cả"),
    [query, setQuery] = useState(""),
    [date, setDate] = useState(vietnamDate(1)),
    [sort, setSort] = useState("featured"),
    [selected, setSelected] = useState(null),
    [toast, setToast] = useState("");
  const [bookings, setBookings] = useState(() =>
    readSaved("sportbooking.bookings.v1", [], validBooking),
  );
  const [favorites, setFavorites] = useState(() =>
    readSaved("sportbooking.favorites.v1", [], (id) =>
      courts.some((c) => c.id === id),
    ),
  );
  const [storageError, setStorageError] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(
        "sportbooking.bookings.v1",
        JSON.stringify(bookings),
      );
      localStorage.setItem(
        "sportbooking.favorites.v1",
        JSON.stringify(favorites),
      );
    } catch {
      queueMicrotask(() => setStorageError(true));
    }
  }, [bookings, favorites]);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  const nav = [
    { id: "explore", icon: "grid", label: "Khám phá sân" },
    { id: "bookings", icon: "calendar", label: "Lịch đặt của tôi" },
    { id: "favorites", icon: "heart", label: "Sân yêu thích" },
    { id: "connection", icon: "signal", label: "Kết nối hệ thống" },
  ];
  const filtered = courts
    .filter(
      (c) =>
        (page !== "favorites" || favorites.includes(c.id)) &&
        (sport === "Tất cả" || sport === c.sport) &&
        (c.name + " " + c.location)
          .toLocaleLowerCase("vi")
          .includes(query.toLocaleLowerCase("vi")),
    )
    .sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "high"
          ? b.price - a.price
          : 0,
    );
  const upcoming = bookings.filter(
    (b) => b.status === "CONFIRMED" && startsAt(b) > now,
  ).length;
  function toggleFavorite(id) {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }
  function addBooking(b) {
    const error = bookingError(bookings, b.courtId, b.date, b.hour, b.duration);
    if (error) {
      setToast(error);
      return;
    }
    setBookings((prev) => [b, ...prev]);
    setSelected(null);
    setToast("Đã lưu lịch đặt demo. Hẹn bạn trên sân!");
    setPage("bookings");
  }
  return (
    <div className="app">
      <aside className="sidebar">
        <a
          href="#explore"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            setPage("explore");
          }}
        >
          <span className="brand-mark">
            <Icon name="ball" size={25} />
          </span>
          sportbooking<span className="brand-dot">.</span>
        </a>
        <div className="workspace-label">KHÔNG GIAN CỦA BẠN</div>
        <nav aria-label="Điều hướng chính">
          {nav.map((n) => (
            <button
              key={n.id}
              className={"nav-item " + (page === n.id ? "active" : "")}
              aria-current={page === n.id ? "page" : undefined}
              onClick={() => {
                setPage(n.id);
                setSport("Tất cả");
                setQuery("");
              }}
            >
              <Icon name={n.icon} />
              {n.label}
              {n.id === "bookings" && upcoming > 0 && (
                <span className="nav-count">{upcoming}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="side-message">
            <Icon name="leaf" size={26} />
            <h3>
              Một giờ trên sân.
              <br />
              Một ngày nhiều năng lượng.
            </h3>
            <p>
              Dành thời gian cho điều
              <br />
              khiến bạn khỏe hơn.
            </p>
          </div>
          <div className="profile">
            <span className="avatar">PN</span>
            <div>
              <strong>Cao Phúc Nguyên</strong>
              <small>HE191659 · Tài khoản demo</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            SportBooking <span>/</span>
            <strong>{nav.find((n) => n.id === page).label}</strong>
          </div>
          <span className="demo-badge">
            <span />
            Chế độ demo
          </span>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <span className="eyebrow">MOVE MORE. FEEL BETTER.</span>
              <h1>
                {page === "explore"
                  ? "Tìm sân. Rủ bạn. Ra chơi."
                  : page === "bookings"
                    ? "Cuộc hẹn tiếp theo trên sân."
                    : page === "favorites"
                      ? "Những sân bạn yêu thích."
                      : "Trạng thái kết nối."}
              </h1>
              <p>
                {page === "explore"
                  ? "Một trận đấu hay bắt đầu từ một sân chơi phù hợp."
                  : page === "bookings"
                    ? "Mọi lịch hẹn vận động của bạn, gọn gàng ở đây."
                    : page === "favorites"
                      ? "Lưu lại sân quen, sẵn sàng cho buổi chơi tiếp theo."
                      : "Kiểm tra đường kết nối đến các dịch vụ SportBooking."}
              </p>
            </div>
            <div className="heading-label">
              <Icon name="pin" size={16} />
              Hà Nội, Việt Nam
            </div>
          </div>
          {storageError && (
            <div className="error-banner" role="alert">
              Trình duyệt không cho phép lưu dữ liệu. Lịch đặt chỉ được giữ
              trong phiên hiện tại.
            </div>
          )}
          {page === "explore" && (
            <section className="hero">
              <div className="hero-copy">
                <span className="hero-tag">
                  <span />
                  THÊM VẬN ĐỘNG, THÊM NIỀM VUI
                </span>
                <h2>
                  Tắt màn hình.
                  <br />
                  Bật năng lượng<span>.</span>
                </h2>
                <p>
                  Sân đẹp đã sẵn sàng.
                  <br />
                  Chỉ còn thiếu bạn và những người đồng đội.
                </p>
                <button
                  className="hero-button"
                  onClick={() =>
                    document
                      .getElementById("court-list")
                      .scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Tìm sân hôm nay
                  <Icon name="arrow" />
                </button>
                <div className="hero-foot">
                  <span className="mini-avatars">
                    <i>PN</i>
                    <i>HA</i>
                    <i>MT</i>
                  </span>
                  <span>Hẹn nhau một trận thật vui!</span>
                </div>
              </div>
              <div className="hero-visual">
                <CourtArt type="tennis" tone="hero-green" hero />
                <div className="floating-note">
                  <span className="note-icon">
                    <Icon name="check" />
                  </span>
                  <div>
                    <strong>Your next good move.</strong>
                    <small>Bắt đầu từ một giờ chơi.</small>
                  </div>
                </div>
                <span className="hero-vertical">PLAY • CONNECT • REPEAT</span>
              </div>
            </section>
          )}
          {(page === "explore" || page === "favorites") && (
            <section id="court-list">
              <div className="section-title">
                <div>
                  <h2>
                    {page === "favorites"
                      ? "Bộ sưu tập của bạn"
                      : "Khám phá sân chơi"}
                  </h2>
                  <p>Chọn môn thể thao yêu thích và tìm sân dành cho bạn.</p>
                </div>
                <span className="subtle-badge">06 sân mẫu</span>
              </div>
              <div className="filter-bar">
                <div className="search-field">
                  <Icon name="search" />
                  <input
                    aria-label="Tìm sân hoặc khu vực"
                    placeholder="Tìm sân, khu vực…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <label className="date-field">
                  <Icon name="calendar" />
                  <input
                    aria-label="Ngày chơi"
                    type="date"
                    min={vietnamDate()}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </label>
                <select
                  aria-label="Sắp xếp sân"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="featured">Sắp xếp: Đề xuất</option>
                  <option value="low">Giá: Thấp đến cao</option>
                  <option value="high">Giá: Cao đến thấp</option>
                </select>
              </div>
              <div className="filter-bottom">
                <div className="sport-tabs" aria-label="Lọc môn thể thao">
                  {["Tất cả", "Cầu lông", "Bóng đá", "Tennis"].map((s) => (
                    <button
                      key={s}
                      className={sport === s ? "selected" : ""}
                      aria-pressed={sport === s}
                      onClick={() => setSport(s)}
                    >
                      {s === "Tất cả" && <Icon name="grid" size={15} />} {s}
                    </button>
                  ))}
                </div>
                <span className="small muted">
                  {filtered.length} sân phù hợp
                </span>
              </div>
              <div className="court-grid">
                {filtered.map((c) => (
                  <article className="court-card" key={c.id}>
                    <div className="card-image">
                      <CourtArt type={c.type} tone={c.tone} />
                      <span className="court-label">{c.label}</span>
                      <button
                        aria-label={
                          (favorites.includes(c.id)
                            ? "Bỏ yêu thích "
                            : "Yêu thích ") + c.name
                        }
                        aria-pressed={favorites.includes(c.id)}
                        onClick={() => toggleFavorite(c.id)}
                        className={
                          "favorite-button " +
                          (favorites.includes(c.id) ? "saved" : "")
                        }
                      >
                        <Icon name="heart" size={18} />
                      </button>
                      <span className="sport-label">{c.sport}</span>
                    </div>
                    <div className="card-body">
                      <div className="card-title">
                        <h3>{c.name}</h3>
                        <span className="rating">
                          ★ <b>{c.rating}</b>
                        </span>
                      </div>
                      <p className="court-location">
                        <Icon name="pin" size={14} />
                        {c.location}
                      </p>
                      <div className="features">
                        {c.features.slice(0, 2).map((f) => (
                          <span key={f}>{f}</span>
                        ))}
                      </div>
                      <div className="card-bottom">
                        <div>
                          <strong>{money(c.price)}</strong>
                          <span> / giờ</span>
                        </div>
                        <button onClick={() => setSelected(c)}>
                          Đặt sân <Icon name="arrow" size={16} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              {!filtered.length && (
                <div className="empty-state">
                  <Icon
                    name={page === "favorites" ? "heart" : "search"}
                    size={36}
                  />
                  <h3>
                    {page === "favorites" && !favorites.length
                      ? "Chưa có sân yêu thích"
                      : "Chưa tìm thấy sân phù hợp"}
                  </h3>
                  <p>
                    Thử tìm kiếm khác hoặc lưu sân bằng biểu tượng trái tim.
                  </p>
                  <button
                    className="primary"
                    onClick={() => {
                      setQuery("");
                      setSport("Tất cả");
                      setPage("explore");
                    }}
                  >
                    Khám phá tất cả sân
                  </button>
                </div>
              )}
              <p className="data-caption">
                Thông tin sân, giá và đánh giá là dữ liệu minh họa. Lịch trống
                được kiểm tra khi chọn giờ đặt.
              </p>
            </section>
          )}
          {page === "bookings" && (
            <section>
              <div className="section-title">
                <h2>
                  Lịch đặt của tôi{" "}
                  <span className="subtle-badge">{bookings.length}</span>
                </h2>
                <button
                  className="text-button"
                  onClick={() => setPage("explore")}
                >
                  Đặt thêm sân
                  <Icon name="arrow" size={16} />
                </button>
              </div>
              <div className="demo-note">
                Lịch đặt demo chỉ lưu trên trình duyệt này, chưa gửi đến
                backend.
              </div>
              {!bookings.length ? (
                <div className="empty-state">
                  <Icon name="calendar" size={40} />
                  <h3>Lịch trống, cơ hội đầy!</h3>
                  <p>Chọn sân yêu thích và lên lịch buổi chơi đầu tiên.</p>
                  <button
                    className="primary"
                    onClick={() => setPage("explore")}
                  >
                    Tìm sân ngay
                    <Icon name="arrow" />
                  </button>
                </div>
              ) : (
                <div className="booking-list">
                  {bookings.map((b) => {
                    const c = courts.find((c) => c.id === b.courtId),
                      past = startsAt(b) <= now;
                    return (
                      <article className="booking-card" key={b.id}>
                        <div className="booking-art">
                          <CourtArt type={c.type} tone={c.tone} />
                        </div>
                        <div className="booking-info">
                          <span className="eyebrow">{c.sport}</span>
                          <h3>{c.name}</h3>
                          <p>
                            <Icon name="calendar" size={15} />
                            {b.date.split("-").reverse().join("/")} ·{" "}
                            {clockTime(b.hour)}–{clockTime(b.hour + b.duration)}
                          </p>
                          <small className="muted">
                            Mã demo: {b.id.slice(0, 8).toUpperCase()}
                          </small>
                        </div>
                        <div className="booking-actions">
                          <span
                            className={
                              "booking-status " +
                              (b.status === "CANCELLED" ? "cancelled" : "")
                            }
                          >
                            {b.status === "CANCELLED"
                              ? "Đã hủy"
                              : past
                                ? "Đã bắt đầu"
                                : "Sắp diễn ra"}
                          </span>
                          <strong>{money(b.total)}</strong>
                          {b.status === "CONFIRMED" && !past && (
                            <button
                              className="cancel-button"
                              onClick={() => {
                                if (startsAt(b) <= Date.now()) {
                                  setToast("Không thể hủy lượt đã bắt đầu.");
                                  return;
                                }
                                if (
                                  window.confirm(
                                    "Hủy lịch đặt demo tại " + c.name + "?",
                                  )
                                ) {
                                  setBookings((prev) =>
                                    prev.map((x) =>
                                      x.id === b.id
                                        ? { ...x, status: "CANCELLED" }
                                        : x,
                                    ),
                                  );
                                  setToast("Đã hủy lịch đặt demo.");
                                }
                              }}
                            >
                              Hủy lịch đặt
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}
          {page === "connection" && <Connection />}
          <footer>
            <span>© {new Date(now).getFullYear()} SportBooking</span>
            <span>Đặt sân dễ dàng. Kết nối đam mê.</span>
            <span>MSS301 · Cao Phúc Nguyên</span>
          </footer>
        </main>
      </div>
      {selected && (
        <BookingDialog
          court={selected}
          initialDate={date || vietnamDate(1)}
          bookings={bookings}
          onClose={() => setSelected(null)}
          onBook={addBooking}
        />
      )}{" "}
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" />
          {toast}
          <button
            className="icon-button"
            onClick={() => setToast("")}
            aria-label="Đóng thông báo"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
