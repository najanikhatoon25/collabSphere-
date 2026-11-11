import { useEffect, useState } from "react";
import { FilePlus2, Plus, Save } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Loader from "../components/Loader";
import MarkdownEditor from "../components/MarkdownEditor";
import NotesList from "../components/NotesList";
import { useAuth } from "../hooks/useAuth";
import { getProjects } from "../services/projectService";
import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
} from "../services/noteService";

function NotesPage() {
  const [searchParams] = useSearchParams();
  const requestedProjectId = searchParams.get("project");
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(requestedProjectId || "");
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(Boolean(requestedProjectId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    getProjects()
      .then((data) => {
        if (isMounted) {
          setProjects(data.projects);
          const hasRequestedProject = data.projects.some(
            (project) => project._id === requestedProjectId,
          );
          const initialProjectId = hasRequestedProject
            ? requestedProjectId
            : data.projects[0]?._id || "";
          setLoadingNotes(Boolean(initialProjectId));
          setProjectId(initialProjectId);
        }
      })
      .catch((requestError) => {
        if (isMounted) {
          setError(requestError.message || "Unable to load your projects.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingProjects(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [requestedProjectId]);

  useEffect(() => {
    if (!projectId) return undefined;

    let isMounted = true;
    getNotes(projectId)
      .then((data) => {
        if (isMounted) {
          setError("");
          setNotes(data.notes);
          setSelectedNoteId("");
          setTitle("");
          setContent("");
        }
      })
      .catch((requestError) => {
        if (isMounted) {
          setError(requestError.message || "Unable to load project notes.");
          setNotes([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingNotes(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const startNewNote = () => {
    setSelectedNoteId("");
    setTitle("");
    setContent("");
    setError("");
    setMessage("");
  };

  const chooseNote = (note) => {
    setSelectedNoteId(note._id);
    setTitle(note.title);
    setContent(note.content || "");
    setError("");
    setMessage("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!projectId) return;
    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (selectedNoteId) {
        const data = await updateNote(projectId, selectedNoteId, { title, content });
        setNotes((currentNotes) =>
          currentNotes.map((note) => note._id === selectedNoteId ? data.note : note),
        );
        setMessage(data.message || "Note updated.");
      } else {
        const data = await createNote(projectId, { title, content });
        setNotes((currentNotes) => [data.note, ...currentNotes]);
        setSelectedNoteId(data.note._id);
        setMessage(data.message || "Note created.");
      }
    } catch (requestError) {
      setError(requestError.message || "Unable to save this note.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (note) => {
    if (!window.confirm(`Delete "${note.title}"?`)) return;
    setError("");
    setMessage("");
    try {
      const data = await deleteNote(projectId, note._id);
      setNotes((currentNotes) => currentNotes.filter((item) => item._id !== note._id));
      if (selectedNoteId === note._id) startNewNote();
      setMessage(data.message || "Note deleted.");
    } catch (requestError) {
      setError(requestError.message || "Unable to delete this note.");
    }
  };

  const activeProject = projects.find((project) => project._id === projectId);
  const projectOwnerId =
    typeof activeProject?.owner === "string"
      ? activeProject.owner
      : activeProject?.owner?._id;
  const currentUserId = user?._id || user?.id;
  const isProjectOwner = projectOwnerId === currentUserId;
  const canDeleteNote = (note) => {
    const creatorId =
      typeof note.createdBy === "string" ? note.createdBy : note.createdBy?._id;
    return isProjectOwner || creatorId === currentUserId;
  };

  if (loadingProjects) return <Loader label="Loading your projects..." />;

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <span className="eyebrow">PROJECT KNOWLEDGE</span>
          <h1>Notes</h1>
          <p>Keep decisions and context close to the work.</p>
        </div>
        <label className="field project-picker">
          <span>Project</span>
          <select
            value={projectId}
            onChange={(event) => {
              setLoadingNotes(true);
              setProjectId(event.target.value);
            }}
            disabled={!projects.length}
          >
            {projects.map((project) => (
              <option key={project._id} value={project._id}>{project.name}</option>
            ))}
          </select>
        </label>
      </section>

      {error && <div className="notice notice-error" role="alert">{error}</div>}
      {message && <div className="notice notice-success" role="status">{message}</div>}

      {!projects.length ? (
        <div className="empty-state">
          <FilePlus2 size={26} />
          <h2>Create a project first</h2>
          <p>Notes belong to a project workspace.</p>
        </div>
      ) : (
        <div className="notes-workspace">
          <section className="content-card notes-sidebar">
            <div className="notes-sidebar-heading">
              <div><h2>All notes</h2><span>{notes.length} notes</span></div>
              <button className="button button-secondary button-small" onClick={startNewNote}>
                <Plus size={16} /> New
              </button>
            </div>
            {loadingNotes ? (
              <Loader label="Loading notes..." />
            ) : (
              <NotesList
                notes={notes}
                selectedNoteId={selectedNoteId}
                onSelect={chooseNote}
                onEdit={chooseNote}
                onDelete={handleDelete}
                canDelete={canDeleteNote}
              />
            )}
          </section>

          <section className="content-card note-editor-card">
            <div className="card-heading">
              <span className="card-heading-icon"><FilePlus2 size={19} /></span>
              <div>
                <h2>{selectedNoteId ? "Edit note" : "Create a note"}</h2>
                <p>{user?.name ? `Saved in ${projects.find((item) => item._id === projectId)?.name || "your project"}` : "Project note"}</p>
              </div>
            </div>
            <form className="form-stack" onSubmit={handleSave}>
              <label className="field">
                <span>Title</span>
                <input value={title} onChange={(event) => setTitle(event.target.value)} required placeholder="Give this note a title" />
              </label>
              <MarkdownEditor value={content} onChange={setContent} />
              <button className="button button-primary" disabled={saving || loadingNotes}>
                <Save size={17} /> {saving ? "Saving..." : selectedNoteId ? "Save changes" : "Create note"}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default NotesPage;