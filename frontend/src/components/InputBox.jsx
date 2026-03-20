export default function InputBox({ value, onChange, onSubmit, loading }) {
  return (
    <form onSubmit={onSubmit} style={styles.form}>
      <label htmlFor="text-input" style={styles.label}>
        Input Text
      </label>
      <textarea
        id="text-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={6}
        style={styles.textarea}
        placeholder="Enter text"
        required
      />
      <button type="submit" style={styles.button} disabled={loading}>
        {loading ? "Processing..." : "Submit"}
      </button>
    </form>
  );
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  label: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#111827",
  },
  textarea: {
    width: "100%",
    resize: "vertical",
    padding: "0.75rem",
    borderRadius: "0.5rem",
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: "0.95rem",
    lineHeight: 1.5,
    boxSizing: "border-box",
  },
  button: {
    alignSelf: "flex-start",
    border: "none",
    borderRadius: "0.5rem",
    padding: "0.6rem 1rem",
    fontSize: "0.95rem",
    fontWeight: 600,
    backgroundColor: "#111827",
    color: "#ffffff",
    cursor: "pointer",
  },
};
