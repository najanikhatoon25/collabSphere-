import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  FilePlus2,
  Link2,
  Save,
  Trash2,
  UsersRound,
} from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import { useAuth } from "../hooks/useAuth";
import {
  deleteProjectFile,
  downloadProjectFile,
  getProjectFiles,
  uploadProjectFile,
} from "../services/fileService";
import {
  deleteProject,
  getProject,
  inviteMember,
  removeMember,
  updateProject,
} from "../services/projectService";

const formatFileSize = (size) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [invitationToken, setInvitationToken] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(
    location.state?.invitationAccepted ? "Invitation accepted. You now have project access." : "",
  );

  const loadProject = async () => {
    setError("");
    try {
      const [projectData, fileData] = await Promise.all([
        getProject(projectId),
        getProjectFiles(projectId),
      ]);
      setProject(projectData.project);
      setName(projectData.project.name);
      setDescription(projectData.project.description || "");
      setFiles(fileData.files || []);
    } catch (requestError) {
      setError(requestError.message || "Unable to load this project.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([getProject(projectId), getProjectFiles(projectId)])
      .then(([projectData, fileData]) => {
        if (isMounted) {
          setProject(projectData.project);
          setName(projectData.project.name);
          setDescription(projectData.project.description || "");
          setFiles(fileData.files || []);
        }
      })
      .catch((requestError) => {
        if (isMounted) {
          setError(requestError.message || "Unable to load this project.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const ownerId =
    typeof project?.owner === "string" ? project.owner : project?.owner?._id;
  const currentUserId = user?._id || user?.id;
  const isOwner = ownerId === currentUserId;

  const handleUpdate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const data = await updateProject(projectId, { name, description });
      setProject(data.project);
      setMessage(data.message || "Project updated.");
    } catch (requestError) {
      setError(requestError.message || "Unable to update the project.");
    } finally {
      setSaving(false);
    }
  };

  const handleInvite = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    setInvitationToken("");
    try {
      const data = await inviteMember(projectId, {
        name: memberName,
        email: memberEmail,
      });
      setMemberName("");
      setMemberEmail("");
      setInvitationToken(data.invitationToken);
      setMessage(data.message || "Invitation created.");
      await loadProject();
    } catch (requestError) {
      setError(requestError.message || "Unable to create the invitation.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (member) => {
    if (!window.confirm(`Remove ${member.name} from this project?`)) return;
    setError("");
    try {
      const data = await removeMember(projectId, member._id);
      setProject(data.project);
      setMessage(data.message || "Member removed.");
    } catch (requestError) {
      setError(requestError.message || "Unable to remove this member.");
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    setError("");
    try {
      await deleteProject(projectId);
      navigate("/projects", { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Unable to delete this project.");
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!selectedFile) return;
    const uploadForm = event.currentTarget;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const data = await uploadProjectFile(projectId, selectedFile);
      setFiles((currentFiles) => [data.file, ...currentFiles]);
      setSelectedFile(null);
      uploadForm.reset();
      setMessage(data.message || "File uploaded.");
    } catch (requestError) {
      setError(requestError.message || "Unable to upload this file.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async (file) => {
    setError("");
    try {
      const blob = await downloadProjectFile(projectId, file._id);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = file.originalName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 1000);
    } catch (requestError) {
      setError(requestError.message || "Unable to download this file.");
    }
  };

  const handleDeleteFile = async (file) => {
    if (!window.confirm(`Delete "${file.originalName}"?`)) return;
    setError("");
    try {
      const data = await deleteProjectFile(projectId, file._id);
      setFiles((currentFiles) => currentFiles.filter((item) => item._id !== file._id));
      setMessage(data.message || "File deleted.");
    } catch (requestError) {
      setError(requestError.message || "Unable to delete this file.");
    }
  };

  if (loading) return <Loader label="Loading project..." />;

  if (error && !project) {
    return (
      <div className="notice notice-error" role="alert">
        <span>{error}</span>
        <button className="button button-secondary" onClick={loadProject}>Try again</button>
      </div>
    );
  }

  if (!project) {
    return <div className="empty-state"><h2>Project unavailable</h2><Link to="/projects">Back to projects</Link></div>;
  }

  return (
    <div className="page-stack">
      <div className="breadcrumb"><Link to="/projects">Projects</Link><span>/</span>{project.name}</div>
      <section className="page-heading">
        <div>
          <span className="eyebrow">{isOwner ? "PROJECT OWNER" : "SHARED PROJECT"}</span>
          <h1>{project.name}</h1>
          <p>{project.description || "A shared place for your project work."}</p>
        </div>
        <Link className="button button-secondary" to={`/notes?project=${project._id}`}>
          Open project notes
        </Link>
      </section>

      {error && <div className="notice notice-error" role="alert">{error}</div>}
      {message && <div className="notice notice-success" role="status">{message}</div>}

      <section className="content-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">PROJECT DETAILS</span>
            <h2>About this project</h2>
          </div>
        </div>
        {isOwner ? (
          <form className="form-grid" onSubmit={handleUpdate}>
            <label className="field">
              <span>Project name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
            <label className="field">
              <span>Description</span>
              <textarea
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>
            <button className="button button-primary form-action" disabled={saving}>
              <Save size={17} /> {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        ) : (
          <p className="body-copy">{project.description || "No description provided."}</p>
        )}
      </section>

      <div className="detail-grid">
        <section className="content-card">
          <div className="card-heading">
            <span className="card-heading-icon"><UsersRound size={19} /></span>
            <div>
              <h2>Team members</h2>
              <p>Accepted collaborators and pending invitations.</p>
            </div>
          </div>
          {project.members?.length ? (
            <div className="member-list">
              {project.members.map((member) => (
                <div className="member-row" key={member._id}>
                  <span className="avatar">{member.name?.[0]?.toUpperCase() || "T"}</span>
                  <span className="member-info"><strong>{member.name}</strong><small>{member.email}</small></span>
                  <span className={`status-pill status-${member.status}`}>{member.status}</span>
                  {isOwner && (
                    <button className="icon-button icon-danger" onClick={() => handleRemoveMember(member)} aria-label={`Remove ${member.name}`}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-copy">No team members have been invited yet.</p>
          )}
          {isOwner && (
            <form className="invite-form" onSubmit={handleInvite}>
              <h3>Invite a teammate</h3>
              <label className="field">
                <span>Name</span>
                <input value={memberName} onChange={(event) => setMemberName(event.target.value)} required />
              </label>
              <label className="field">
                <span>Email address</span>
                <input type="email" value={memberEmail} onChange={(event) => setMemberEmail(event.target.value)} required />
              </label>
              <button className="button button-primary" disabled={saving}>{saving ? "Creating..." : "Create invitation"}</button>
              <p className="field-hint">The backend returns an invitation token. Share it and this project ID with the teammate; no email is sent by this API.</p>
              {invitationToken && (
                <div className="token-box">
                  <strong>Invitation token</strong>
                  <code>{invitationToken}</code>
                  <Link to="/invitations" state={{ projectId: project._id, token: invitationToken }}>
                    <Link2 size={15} /> Invitation acceptance details
                  </Link>
                </div>
              )}
            </form>
          )}
        </section>

        <section className="content-card">
          <div className="card-heading">
            <span className="card-heading-icon"><FilePlus2 size={19} /></span>
            <div>
              <h2>Project files</h2>
              <p>PDF, images, text, and Word files up to 5 MB.</p>
            </div>
          </div>
          <form className="upload-form" onSubmit={handleUpload}>
            <label className="field">
              <span>Select a file</span>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.txt,.doc,.docx"
                onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
              />
            </label>
            <button className="button button-primary" disabled={!selectedFile || saving}>
              <FilePlus2 size={17} /> {saving ? "Uploading..." : "Upload"}
            </button>
          </form>
          {files.length ? (
            <div className="file-list">
              {files.map((file) => {
                const uploaderId =
                  typeof file.uploadedBy === "string" ? file.uploadedBy : file.uploadedBy?._id;
                const canDeleteFile = isOwner || uploaderId === currentUserId;
                return (
                  <div className="file-row" key={file._id}>
                    <div className="file-badge">{file.originalName.split(".").pop()?.toUpperCase()}</div>
                    <span className="file-info"><strong>{file.originalName}</strong><small>{formatFileSize(file.size)}</small></span>
                    <button className="icon-button" onClick={() => handleDownload(file)} aria-label={`Download ${file.originalName}`}>
                      <ArrowDownToLine size={17} />
                    </button>
                    {canDeleteFile && (
                      <button className="icon-button icon-danger" onClick={() => handleDeleteFile(file)} aria-label={`Delete ${file.originalName}`}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="muted-copy">No files have been uploaded to this project.</p>
          )}
        </section>
      </div>

      {isOwner && (
        <section className="danger-zone">
          <div><h2>Delete project</h2><p>Deleting a project cannot be undone.</p></div>
          <button className="button button-danger" onClick={handleDeleteProject}>Delete project</button>
        </section>
      )}
    </div>
  );
}

export default ProjectDetails;