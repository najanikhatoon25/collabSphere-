import { LogOut, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Account() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setError("");
    setLoading(true);
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Unable to log out.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack narrow-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">ACCOUNT</span>
          <h1>Your account</h1>
          <p>View the profile information provided by your account.</p>
        </div>
      </section>
      <section className="content-card account-card">
        <div className="account-avatar">{user?.name?.[0]?.toUpperCase() || "U"}</div>
        <div className="account-details">
          <div><UserRound size={17} /><span><small>Name</small><strong>{user?.name || "—"}</strong></span></div>
          <div><Mail size={17} /><span><small>Email</small><strong>{user?.email || "—"}</strong></span></div>
        </div>
        <p className="field-hint">Profile editing is not available in the current backend API.</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-secondary" onClick={handleLogout} disabled={loading}>
          <LogOut size={17} /> {loading ? "Logging out..." : "Log out"}
        </button>
      </section>
    </div>
  );
}

export default Account;
