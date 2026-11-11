import { ArrowUpRight, FolderKanban, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

function ProjectCard({ project }) {
  const memberCount = project.members?.filter(
    (member) => member.status === "accepted",
  ).length || 0;

  return (
    <Link
      to={`/projects/${project._id}`}
      className="project-card"
      aria-label={`Open project ${project.name}`}
    >
      <div className="project-card-top">
        <span className="project-icon"><FolderKanban size={20} /></span>
        <ArrowUpRight size={18} className="project-arrow" />
      </div>
      <h3>{project.name}</h3>
      <p>{project.description || "No description added yet."}</p>
      <div className="project-card-meta">
        <span><UsersRound size={15} /> {memberCount} team members</span>
        <span>
          Updated{" "}
          {new Date(project.updatedAt || project.createdAt).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
}

export default ProjectCard;