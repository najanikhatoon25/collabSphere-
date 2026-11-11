import {
  ArrowDown,
  ArrowRight,
  Bot,
  FileText,
  FolderKanban,
  Code2,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const workspaceFeatures = [
  {
    icon: FolderKanban,
    title: "Projects with context",
    description: "Keep project details, notes, and shared files together in one place.",
  },
  {
    icon: UsersRound,
    title: "Bring your team in",
    description: "Invite collaborators and manage project access from your workspace.",
  },
  {
    icon: FileText,
    title: "Notes and files",
    description: "Capture decisions and keep the documents your team needs close at hand.",
  },
];

const aiFeatures = [
  { icon: Sparkles, title: "Explain content", description: "Turn complex code and technical text into clear explanations." },
  { icon: Bot, title: "Review code", description: "Get a structured review of code you provide." },
  { icon: Code2, title: "Understand a repository", description: "Explore a public GitHub repository through a guided overview." },
  { icon: FileText, title: "Generate a README", description: "Create a project README from the details you supply." },
];

function Home() {
  return (
    <div className="landing-page">
      <Navbar />
      <main>
        <section className="hero-section" id="how-it-works">
          <div className="hero-orb hero-orb-one" aria-hidden="true" />
          <div className="hero-orb hero-orb-two" aria-hidden="true" />
          <div className="hero-content">
            <div className="hero-badge"><span /> A calmer way to build together</div>
            <h1>One shared space for<br /><span>work that moves forward.</span></h1>
            <p>
              Keep your projects, team notes, files, and developer tools connected.
              Less context switching, more room to make progress.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="button button-primary button-large">
                Create your workspace <ArrowRight size={17} />
              </Link>
              <a href="#features" className="button button-secondary button-large">
                Explore the workspace <ArrowDown size={16} />
              </a>
            </div>
            <div className="hero-caption">
              <span className="caption-line" />
              Projects · notes · files · AI tools
            </div>
          </div>
          <div className="hero-preview" aria-label="Illustration of a project workspace">
            <div className="preview-window">
              <div className="preview-window-bar"><i /><i /><i /><span>CollabSphere workspace</span></div>
              <div className="preview-body">
                <div className="preview-sidebar">
                  <div className="preview-brand"><span className="preview-brand-mark"><Sparkles size={13} /></span> CollabSphere</div>
                  <div className="preview-nav-item preview-nav-active"><FolderKanban size={14} /> Projects</div>
                  <div className="preview-nav-item"><FileText size={14} /> Notes</div>
                  <div className="preview-nav-item"><UsersRound size={14} /> Team</div>
                </div>
                <div className="preview-main">
                  <span className="preview-kicker">PROJECT WORKSPACE</span>
                  <h3>Project overview</h3>
                  <p>Your team’s shared project space</p>
                  <div className="preview-stat-row">
                    <div className="preview-stat"><FolderKanban size={15} /><span>Project details</span></div>
                    <div className="preview-stat"><FileText size={15} /><span>Team notes</span></div>
                  </div>
                  <div className="preview-note">
                    <span className="preview-note-icon"><Sparkles size={14} /></span>
                    <div><strong>Everything in context</strong><small>Notes and files stay with the project</small></div>
                  </div>
                  <div className="preview-members"><span>Team access</span><div><i><UsersRound size={10} /></i></div></div>
                </div>
              </div>
            </div>
            <div className="floating-label floating-label-top"><span className="floating-dot" /> Shared project space</div>
            <div className="floating-label floating-label-bottom"><Sparkles size={15} /> Built for developer teams</div>
          </div>
        </section>

        <section className="trust-strip">
          <span>Everything your project needs</span>
          <div><FolderKanban size={15} /> Projects</div>
          <div><UsersRound size={15} /> Teammates</div>
          <div><FileText size={15} /> Notes & files</div>
          <div><Bot size={15} /> AI tools</div>
        </section>

        <section className="landing-section" id="features">
          <div className="section-intro">
            <span className="eyebrow">A SHARED WORKSPACE</span>
            <h2>Stay in sync without<br /><span>adding more noise.</span></h2>
            <p>Bring the everyday parts of project work into one clear, connected space.</p>
          </div>
          <div className="feature-grid">
            {workspaceFeatures.map(({ icon: Icon, title, description }, index) => (
              <article className="feature-card" key={title}>
                <span className={`feature-icon feature-icon-${index}`}><Icon size={20} /></span>
                <h3>{title}</h3>
                <p>{description}</p>
                <span className="feature-index">0{index + 1}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="ai-section" id="ai-tools">
          <div className="ai-section-inner">
            <div className="section-intro">
              <span className="eyebrow">THOUGHTFUL DEVELOPER TOOLS</span>
              <h2>A little help for<br /><span>the hard parts.</span></h2>
              <p>Use the project-focused AI tools available in your workspace when you need another perspective.</p>
              <Link className="text-link" to="/register">Explore your workspace <ArrowRight size={16} /></Link>
            </div>
            <div className="ai-feature-list">
              {aiFeatures.map(({ icon: Icon, title, description }) => (
                <article className="ai-feature-row" key={title}>
                  <span className="ai-feature-icon"><Icon size={19} /></span>
                  <div><h3>{title}</h3><p>{description}</p></div>
                  <ArrowRight size={17} />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="closing-cta">
          <span className="eyebrow">START WITH YOUR NEXT PROJECT</span>
          <h2>Make room for good work.</h2>
          <p>Give your team one place to share progress and keep the details close.</p>
          <Link to="/register" className="button button-primary button-large">
            Get started <ArrowRight size={17} />
          </Link>
        </section>
      </main>
      <footer className="landing-footer">
        <Link to="/" className="brand-lockup">
          <span className="brand-mark"><Sparkles size={18} /></span>
          <span>Collab<span>Sphere</span></span>
        </Link>
        <span>Build together, one project at a time.</span>
      </footer>
    </div>
  );
}

export default Home;
