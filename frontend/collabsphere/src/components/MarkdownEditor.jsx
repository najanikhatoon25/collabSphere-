function MarkdownEditor({ value, onChange, label = "Note content" }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={10}
        placeholder="Write your notes here. Markdown syntax is saved as plain text."
      />
      <span className="field-hint">Markdown source is stored exactly as written.</span>
    </label>
  );
}

export default MarkdownEditor;