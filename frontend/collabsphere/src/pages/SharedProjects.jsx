import { useEffect, useState } from "react";
import { CheckCircle2, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiRequest } from "../services/api";
import { getCurrentUser } from "../services/authService";
import { acceptInvitation } from "../services/projectService";

const readInvitationLink = () => {
  const params = new URLSearchParams(window.location.hash.slice(1));
  return {
    projectId: params.get("projectId") || "",
    token: params.get("token") || "",
  };
};

function SharedProjects() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [invitation] = useState(readInvitationLink);
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState(() =>
    invitation.projectId && invitation.token
      ? ""
      : "This invitation link is incomplete or invalid."
  );
  const [loading, setLoading] = useState(
    Boolean(invitation.projectId && invitation.token)
  );
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);

    if (!invitation.projectId || !invitation.token) {
      return;
    }

    apiRequest(`/projects/${invitation.projectId}/invitation-preview`, {
      method: "POST",
      body: JSON.stringify({ token: invitation.token }),
    })
      .then((data) => setProjectName(data.project.name))
      .catch((requestError) => {
        setError(requestError.message || "Unable to verify this invitation.");
      })
      .finally(() => setLoading(false));
  }, [invitation]);

  const handleAccept = async () => {
    setError("");
    setAccepting(true);

    try {
      await acceptInvitation(invitation.projectId, invitation.token);
      const session = await getCurrentUser();
      setUser(session.user);
      navigate(`/projects/${invitation.projectId}`, { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Unable to accept this invitation.");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="page-stack narrow-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">TEAM ACCESS</span>
          <h1>Project invitation</h1>
          <p>Accept this invitation to open the shared project.</p>
        </div>
      </section>

      <section className="content-card">
        <div className="card-heading">
          <span className="card-heading-icon"><KeyRound size={19} /></span>
          <div>
            <h2>{loading ? "Checking invitation..." : projectName || "Invitation unavailable"}</h2>
            <p>No account or login is required for this invitation.</p>
          </div>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        {!loading && projectName && (
          <button className="button button-primary" onClick={handleAccept} disabled={accepting}>
            <CheckCircle2 size={17} /> {accepting ? "Accepting..." : "Accept invitation"}
          </button>
        )}
      </section>
    </div>
  );
}

export default SharedProjects;
