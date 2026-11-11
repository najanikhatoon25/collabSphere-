import { useEffect, useState } from "react";
import { FolderPlus, Plus } from "lucide-react";
import Loader from "../components/Loader";
import ProjectCard from "../components/ProjectCard";
import {
  createProject as createProjectRequest,
  getProjects,
} from "../services/projectService";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
          setError(requestError.message || "Unable to load projects.");
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

  const handleCreateProject = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const data = await createProjectRequest({ name, description });
      setProjects((currentProjects) => [data.project, ...currentProjects]);
      setName("");
      setDescription("");
      setMessage(data.message || "Project created.");
    } catch (requestError) {
      setError(requestError.message || "Unable to create the project.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <span className="eyebrow">YOUR WORKSPACE</span>
          <h1>Projects</h1>
          <p>Manage the workspaces you own or have joined.</p>
        </div>
      </section>

      <section className="content-card">
        <div className="card-heading">
          <span className="card-heading-icon"><FolderPlus size={19} /></span>
          <div>
            <h2>Create a project</h2>
            <p>Start a shared space for project notes and files.</p>
          </div>
        </div>
        <form className="project-create-form" onSubmit={handleCreateProject}>
          <label className="field">
            <span>Project name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Website redesign"
              required
            />
          </label>
          <label className="field">
            <span>Description <small>(optional)</small></span>
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this project about?"
            />
          </label>
          <button className="button button-primary" disabled={saving}>
            <Plus size={17} /> {saving ? "Creating..." : "Create project"}
          </button>
        </form>
        {error && <p className="form-error" role="alert">{error}</p>}
        {message && <p className="form-success" role="status">{message}</p>}
      </section>

      <section className="section-heading">
        <div>
          <span className="eyebrow">ALL WORKSPACES</span>
          <h2>Your projects</h2>
        </div>
        <span className="subtle-count">{projects.length} total</span>
      </section>

      {loading ? (
        <Loader label="Loading projects..." />
      ) : error && !projects.length ? (
        <div className="notice notice-error" role="alert">{error}</div>
      ) : projects.length ? (
        <div className="project-grid">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FolderPlus size={27} />
          <h3>No projects yet</h3>
          <p>Your new projects will appear here after you create them.</p>
        </div>
      )}
    </div>
  );
}

export default Projects;