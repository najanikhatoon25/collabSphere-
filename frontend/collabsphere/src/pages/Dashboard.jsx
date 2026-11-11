import { useEffect, useState } from "react";
import { ArrowRight, FolderKanban, Plus, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import ProjectCard from "../components/ProjectCard";
import { getProjects } from "../services/projectService";
import { useAuth } from "../hooks/useAuth";

function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProjects = async () => {
    setError("");
    setLoading(true);

    try {
      const data = await getProjects();
      setProjects(data.projects);
    } catch (requestError) {
      setError(requestError.message || "Unable to load your projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getProjects()
      .then((data) => {
        if (isMounted) {
          setProjects(data.projects);
        }
      })
      .catch((requestError) => {
        if (isMounted) {
          setError(requestError.message || "Unable to load your projects.");
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
  }, []);

  const acceptedMemberCount = projects.reduce(
    (total, project) =>
      total + (project.members?.filter((member) => member.status === "accepted").length || 0),
    0,
  );
  const recentProjects = [...projects]
    .sort(
      (first, second) =>
        new Date(second.updatedAt || second.createdAt) -
        new Date(first.updatedAt || first.createdAt),
    )
    .slice(0, 3);

  return (
    <div className="page-stack">
      <section className="welcome-panel">
        <div>
          <span className="eyebrow">YOUR COLLABORATION SPACE</span>
          <h1>Good to see you, {user?.name || "there"}.</h1>
          <p>Keep your team aligned and your project work moving forward.</p>
        </div>
        <Link className="button button-primary" to="/projects">
          <Plus size={18} /> New project
        </Link>
      </section>

      <section className="stats-grid" aria-label="Workspace overview">
        <div className="stat-card">
          <span className="stat-icon"><FolderKanban size={20} /></span>
          <span className="stat-label">Projects you can access</span>
          <strong>{loading ? "—" : projects.length}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-icon stat-icon-cyan"><UsersRound size={20} /></span>
          <span className="stat-label">Accepted team memberships</span>
          <strong>{loading ? "—" : acceptedMemberCount}</strong>
        </div>
      </section>

      <section className="section-heading">
        <div>
          <span className="eyebrow">RECENT WORK</span>
          <h2>Projects</h2>
        </div>
        <Link className="text-link" to="/projects">
          View all <ArrowRight size={16} />
        </Link>
      </section>

      {loading ? (
        <Loader label="Loading your projects..." />
      ) : error ? (
        <div className="notice notice-error" role="alert">
          <span>{error}</span>
          <button className="button button-secondary" onClick={loadProjects}>Try again</button>
        </div>
      ) : recentProjects.length ? (
        <div className="project-grid">
          {recentProjects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FolderKanban size={28} />
          <h3>Your workspace is ready</h3>
          <p>Create a project to start organizing notes, files, and teammates.</p>
          <Link className="button button-primary" to="/projects">
            Create a project
          </Link>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
