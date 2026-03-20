import React from "react";

export default function InputBox({ value, onChange, onSubmit, loading }) {
  return (
    <form onSubmit={onSubmit} style={styles.form}>
      <label htmlFor="text-input" style={styles.label}>
        Input
      </label>
      <textarea
        id="text-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        style={styles.textarea}
        placeholder="Enter request text"
        required
      />
      <button type="submit" style={styles.button} disabled={loading}>
        {loading ? "Running agents..." : "Run"}
      </button>
    </form>
  );
}

const styles = {
  form: {
    display: "grid",
    gap: "0.7rem",
  },
  label: {
    fontSize: "0.88rem",
    fontWeight: 600,
    color: "#cbd5e1",
  },
  textarea: {
    width: "100%",
    resize: "vertical",
    padding: "0.75rem",
    borderRadius: "0.6rem",
    border: "1px solid rgba(148, 163, 184, 0.35)",
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    color: "#e2e8f0",
    fontSize: "0.95rem",
    lineHeight: 1.5,
    boxSizing: "border-box",
    outline: "none",
  },
  button: {
    justifySelf: "start",
    border: "1px solid rgba(147, 197, 253, 0.35)",
    borderRadius: "0.55rem",
    padding: "0.55rem 0.95rem",
    fontSize: "0.9rem",
    fontWeight: 700,
    background: "rgba(30, 64, 175, 0.45)",
    color: "#dbeafe",
    cursor: "pointer",
  },
};
