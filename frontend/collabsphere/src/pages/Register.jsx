import { useState } from "react";
import { ArrowLeft, LockKeyhole, Mail, Sparkles, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authService";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await register({ name, email, password });
      navigate("/login", {
        replace: true,
        state: { message: data.message || "Your account has been created." },
      });
    } catch (requestError) {
      setError(requestError.message || "Unable to create your account.");
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
          <span className="eyebrow">YOUR TEAM WORKSPACE</span>
          <h1>Create your account</h1>
          <p>Bring your projects, notes, and team together.</p>
        </div>

        <form className="form-stack" onSubmit={handleRegister}>
          <label className="field">
            <span>Full name</span>
            <span className="input-wrap">
              <UserRound size={18} />
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                placeholder="Your name"
                required
              />
            </span>
          </label>
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
                autoComplete="new-password"
                placeholder="Create a password"
                required
              />
            </span>
          </label>

          {error && <p className="form-error" role="alert">{error}</p>}

          <button className="button button-primary button-wide" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-footnote">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;
