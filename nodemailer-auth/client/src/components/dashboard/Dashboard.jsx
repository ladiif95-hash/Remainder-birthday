import { useEffect, useMemo, useState } from "react";
import {
  createBirthday,
  deleteBirthday,
  getBirthdays,
} from "../../services/api.js";
import {
  daysUntilBirthday,
  formatFullBirthday,
  isBirthdayThisMonth,
  turningAge,
} from "../../utils/date.js";
import BirthdayCard from "./BirthdayCard.jsx";
import BirthdayModal from "./BirthdayModal.jsx";

const filters = ["All", "Family", "Friends", "Work"];

export default function Dashboard({ user, onLogout }) {
  const [birthdays, setBirthdays] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    getBirthdays()
      .then((data) => setBirthdays(data.birthdays))
      .catch((err) => {
        if (err.message.toLowerCase().includes("auth token")) {
          onLogout();
          return;
        }

        setError(err.message);
      });
  }, [onLogout]);

  const stats = useMemo(() => {
    return {
      total: birthdays.length,
      thisMonth: birthdays.filter((item) => isBirthdayThisMonth(item.date)).length,
      withinWeek: birthdays.filter((item) => daysUntilBirthday(item.date) <= 7).length,
    };
  }, [birthdays]);

  const filteredBirthdays = birthdays
    .filter((birthday) => {
      if (activeFilter !== "All" && birthday.category !== activeFilter) {
        return false;
      }

      return birthday.name.toLowerCase().includes(search.toLowerCase().trim());
    })
    .sort((a, b) => daysUntilBirthday(a.date) - daysUntilBirthday(b.date));

  const upcomingBirthdays = useMemo(() => {
    return [...birthdays].sort(
      (a, b) => daysUntilBirthday(a.date) - daysUntilBirthday(b.date)
    );
  }, [birthdays]);

  useEffect(() => {
    setHeroIndex(0);
  }, [upcomingBirthdays.length]);

  useEffect(() => {
    if (upcomingBirthdays.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % upcomingBirthdays.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [upcomingBirthdays.length]);

  const nextBirthday = upcomingBirthdays[heroIndex];

  const handleCreate = async (payload) => {
    const data = await createBirthday(payload);
    setBirthdays((current) => [data.birthday, ...current]);
    setActiveFilter("All");
    setSearch("");
    setError("");
  };

  const handleDelete = async (id) => {
    await deleteBirthday(id);
    setBirthdays((current) => current.filter((birthday) => birthday.id !== id));
  };

  return (
    <main className="dashboard-page">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">BD</div>
          <div>
            <strong>Birthday Reminder</strong>
            <span>Never miss a celebration</span>
          </div>
        </div>
        <div className="topbar-actions">
          <span className="user-chip">{user?.name || user?.email}</span>
          <button className="secondary-button" type="button" onClick={onLogout}>
            Logout
          </button>
          <button className="primary-button" type="button" onClick={() => setShowModal(true)}>
            + Add birthday
          </button>
        </div>
      </header>

      <section className="dashboard-shell">
        {nextBirthday ? (
          <section className="upcoming-hero" key={nextBirthday.id}>
            <div className="upcoming-copy">
              <span className="upcoming-label">Upcoming Birthday</span>
              <h1>{nextBirthday.name}</h1>
              <p>
                Turning {turningAge(nextBirthday.date)} •{" "}
                {formatFullBirthday(nextBirthday.date)}
              </p>
              <span className="upcoming-category">
                <i />
                {nextBirthday.category}
              </span>
            </div>
            <div className="upcoming-days">
              <strong>{daysUntilBirthday(nextBirthday.date)}</strong>
              <span>DAYS</span>
            </div>
          </section>
        ) : (
          <section className="hero-panel">
            <div className="hero-icon">BD</div>
            <h1>No birthdays yet</h1>
            <p>
              Add your first birthday and we'll start the countdown for the next
              celebration.
            </p>
          </section>
        )}

        <section className="stats-grid">
          <StatCard icon="PE" value={stats.total} label="Total people" />
          <StatCard icon="MO" value={stats.thisMonth} label="This month" />
          <StatCard icon="WK" value={stats.withinWeek} label="Within a week" />
        </section>

        <section className="toolbar">
          <input
            className="search-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search names..."
          />
          <div className="filter-row">
            {filters.map((filter) => (
              <button
                key={filter}
                className={filter === activeFilter ? "filter active" : "filter"}
                type="button"
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {error && <div className="error-banner">{error}</div>}

        <section
          className={
            filteredBirthdays.length
              ? "birthday-list has-birthdays"
              : "birthday-list empty-list"
          }
        >
          {filteredBirthdays.length ? (
            filteredBirthdays.map((birthday) => (
              <BirthdayCard
                key={birthday.id}
                birthday={birthday}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">BD</div>
              <h2>No birthdays yet</h2>
              <p>Add your loved ones and we'll remind you when their special day approaches.</p>
              <button
                className="primary-button"
                type="button"
                onClick={() => setShowModal(true)}
              >
                + Add your first birthday
              </button>
            </div>
          )}
        </section>
      </section>

      {showModal && (
        <BirthdayModal onClose={() => setShowModal(false)} onSubmit={handleCreate} />
      )}
    </main>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <div className="stat-card">
      <span>{icon}</span>
      <div>
        <strong>{value}</strong>
        <p>{label}</p>
      </div>
    </div>
  );
}
