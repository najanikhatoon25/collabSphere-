import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, KeyRound } from "lucide-react";
import { acceptInvitation } from "../services/projectService";

function SharedProjects() {
  const location = useLocation();
  const navigate = useNavigate();
  const [projectId, setProjectId] = useState(location.state?.projectId || "");
  const [token, setToken] = useState(location.state?.token || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAccept = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await acceptInvitation(projectId.trim(), token.trim());
      navigate(`/projects/${projectId.trim()}`, {
        replace: true,
        state: { invitationAccepted: true },
      });
    } catch (requestError) {
      setError(requestError.message || "Unable to accept this invitation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack narrow-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">TEAM ACCESS</span>
          <h1>Accept an invitation</h1>
          <p>Use the project ID and invitation token shared by the project owner.</p>
        </div>
      </section>

      <section className="content-card">
        <div className="card-heading">
          <span className="card-heading-icon"><KeyRound size={19} /></span>
          <div>
            <h2>Join a project</h2>
            <p>Sign in with the email address the owner invited.</p>
          </div>
        </div>
        <form className="form-stack" onSubmit={handleAccept}>
          <label className="field">
            <span>Project ID</span>
            <input value={projectId} onChange={(event) => setProjectId(event.target.value)} required />
          </label>
          <label className="field">
            <span>Invitation token</span>
            <textarea rows={3} value={token} onChange={(event) => setToken(event.target.value)} required />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary" disabled={loading}>
            <CheckCircle2 size={17} /> {loading ? "Accepting..." : "Accept invitation"}
          </button>
        </form>
      </section>
      <p className="muted-copy">Invitations are created by a project owner. The backend does not send invitation emails or provide a list of pending invitations.</p>
      <Link to="/projects" className="text-link">Back to projects</Link>
    </div>
  );
}

export default SharedProjects;