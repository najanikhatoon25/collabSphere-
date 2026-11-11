import { useState } from "react";
import { ArrowLeft, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn({ email, password });
      navigate(location.state?.from?.pathname || "/dashboard", {
        replace: true,
      });
    } catch (requestError) {
      setError(requestError.message || "Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <Link to="/" className="auth-back">
        <ArrowLeft size={17} /> Back to home
      </Link>
      <section className="auth-card">
        <Link to="/" className="brand-lockup auth-brand">
          <span className="brand-mark"><Sparkles size={20} /></span>
          <span>Collab<span>Sphere</span></span>
        </Link>
        <div className="auth-heading">
          <span className="eyebrow">WELCOME BACK</span>
          <h1>Sign in to your workspace</h1>
          <p>Pick up where your team left off.</p>
        </div>

        <form className="form-stack" onSubmit={handleLogin}>
          {location.state?.message && (
            <p className="form-success" role="status">{location.state.message}</p>
          )}
          <label className="field">
            <span>Email address</span>
            <span className="input-wrap">
              <Mail size={18} />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="you@company.com"
                required
              />
            </span>
          </label>
          <label className="field">
            <span>Password</span>
            <span className="input-wrap">
              <LockKeyhole size={18} />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Enter your password"
                required
              />
            </span>
          </label>

          {error && <p className="form-error" role="alert">{error}</p>}

          <button className="button button-primary button-wide" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-footnote">
          New to CollabSphere? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
