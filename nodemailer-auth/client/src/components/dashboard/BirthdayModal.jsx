import { useState } from "react";

const categories = ["Family", "Friends", "Work"];

export default function BirthdayModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    date: "",
    category: "Family",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (key) => (event) => {
    setForm({ ...form, [key]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <form className="birthday-modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <div>
            <h2>Add birthday</h2>
            <p>Create a reminder for someone special.</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose}>
            x
          </button>
        </div>

        <label>
          Name
          <input
            value={form.name}
            onChange={update("name")}
            placeholder="Amina Hassan"
            required
          />
        </label>

        <label>
          Birthday
          <input type="date" value={form.date} onChange={update("date")} required />
        </label>

        <label>
          Category
          <select value={form.category} onChange={update("category")}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label>
          Notes
          <textarea
            value={form.notes}
            onChange={update("notes")}
            placeholder="Gift idea, phone number, or reminder notes"
            rows="3"
          />
        </label>

        {error && <div className="error-banner">{error}</div>}

        <div className="modal-actions">
          <button className="secondary-button" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? "Saving..." : "+ Add birthday"}
          </button>
        </div>
      </form>
    </div>
  );
}
