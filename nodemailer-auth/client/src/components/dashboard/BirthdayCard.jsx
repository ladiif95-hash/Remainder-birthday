import {
  daysUntilBirthday,
  formatFullBirthday,
  turningAge,
} from "../../utils/date.js";

export default function BirthdayCard({ birthday, onDelete }) {
  const daysLeft = daysUntilBirthday(birthday.date);

  return (
    <article className="birthday-card">
      <div className="birthday-avatar">{birthday.name.slice(0, 1).toUpperCase()}</div>
      <div className="birthday-details">
        <div className="birthday-title-row">
          <h3>{birthday.name}</h3>
          <span className="category-pill">{birthday.category}</span>
        </div>
        <p>{formatFullBirthday(birthday.date)}</p>
        <small>
          In {daysLeft} days <span>•</span> Turning {turningAge(birthday.date)}
        </small>
      </div>
      <button
        className="delete-button"
        type="button"
        onClick={() => onDelete(birthday.id)}
        aria-label={`Delete ${birthday.name}`}
      >
        Delete
      </button>
    </article>
  );
}
