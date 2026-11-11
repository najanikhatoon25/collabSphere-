import { useState } from "react";
import { ArrowRight, LogOut, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Navbar() {
  const { user, signOut } = useAuth();
  const [logoutError, setLogoutError] = useState("");
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLogoutError("");
    try {
      await signOut();
      navigate("/", { replace: true });
    } catch (error) {
      setLogoutError(error.message || "Unable to log out.");
    }
  };

  return (
    <header className="public-header">
      <nav className="public-nav" aria-label="Main navigation">
        <Link to="/" className="brand-lockup">
          <span className="brand-mark"><Sparkles size={19} /></span>
          <span>Collab<span>Sphere</span></span>
        </Link>
        <div className="public-nav-links">
          <a href="#features">Workspace</a>
          <a href="#ai-tools">AI tools</a>
          <a href="#how-it-works">How it works</a>
        </div>
        <div className="public-nav-actions">
          {user ? (
            <>
              <Link to="/dashboard" className="button button-secondary">Go to workspace</Link>
              <button className="button button-quiet" onClick={handleLogout} aria-label="Log out">
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-login">Log in</Link>
              <Link to="/register" className="button button-primary">
                Get started <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </nav>
      {logoutError && <p className="nav-error" role="alert">{logoutError}</p>}
    </header>
  );
}

export default Navbar;
