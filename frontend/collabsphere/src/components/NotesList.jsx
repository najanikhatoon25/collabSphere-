import { FileText, Pencil, Trash2 } from "lucide-react";

function NotesList({
  notes,
  selectedNoteId,
  onSelect,
  onEdit,
  onDelete,
  canDelete,
}) {
  if (!notes.length) {
    return (
      <div className="empty-state compact-empty">
        <FileText size={23} />
        <h3>No notes yet</h3>
        <p>Create a note to keep project decisions and context together.</p>
      </div>
    );
  }

  return (
    <div className="note-list">
      {notes.map((note) => (
        <article
          className={`note-row ${selectedNoteId === note._id ? "note-row-active" : ""}`}
          key={note._id}
        >
          <button className="note-row-main" onClick={() => onSelect(note)}>
            <FileText size={17} />
            <span>
              <strong>{note.title}</strong>
              <small>{new Date(note.updatedAt || note.createdAt).toLocaleDateString()}</small>
            </span>
          </button>
          <div className="note-row-actions">
            <button
              className="icon-button"
              onClick={() => onEdit(note)}
              aria-label={`Edit ${note.title}`}
            >
              <Pencil size={16} />
            </button>
            {canDelete(note) && (
              <button
                className="icon-button icon-danger"
                onClick={() => onDelete(note)}
                aria-label={`Delete ${note.title}`}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

export default NotesList;