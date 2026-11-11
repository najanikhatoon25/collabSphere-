import { useState } from "react";
import {
  ArrowUpRight,
  Bot,
  FileText,
  Code2,
  Lightbulb,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import {
  explainContent,
  explainRepository,
  generateReadme,
  reviewCode,
} from "../services/aiService";

const tools = [
  { id: "explain", title: "Explain content", description: "Get a clear explanation of code or technical text.", icon: Lightbulb },
  { id: "review", title: "Review code", description: "Explore logic, potential issues, and improvements.", icon: Bot },
  { id: "repository", title: "Explain a repository", description: "Analyze a public GitHub repository structure.", icon: Code2 },
  { id: "readme", title: "Generate a README", description: "Draft project documentation from your details.", icon: FileText },
];

function AITools() {
  const [activeTool, setActiveTool] = useState("explain");
  const [content, setContent] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [readmeDetails, setReadmeDetails] = useState({
    projectName: "",
    description: "",
    techStack: "",
    features: "",
    installation: "",
    usage: "",
    additionalInfo: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectTool = (toolId) => {
    setActiveTool(toolId);
    setResult(null);
    setError("");
  };

  const updateReadmeDetail = (field, value) => {
    setReadmeDetails((details) => ({ ...details, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      if (activeTool === "explain") {
        const data = await explainContent(content);
        setResult({ title: "Explanation", text: data.explanation });
      } else if (activeTool === "review") {
        const data = await reviewCode(code, language);
        setResult({ title: "Code review", text: data.review });
      } else if (activeTool === "repository") {
        const data = await explainRepository(repositoryUrl);
        setResult({
          title: data.repository.fullName,
          text: data.analysis,
          detail: `${data.analyzedFiles} source files analyzed`,
        });
      } else {
        const data = await generateReadme(readmeDetails);
        setResult({ title: "Generated README", text: data.readme });
      }
    } catch (requestError) {
      setError(requestError.message || "The AI request could not be completed.");
    } finally {
      setLoading(false);
    }
  };

  const activeToolDetails = tools.find((tool) => tool.id === activeTool);

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <span className="eyebrow">AI-ASSISTED WORKFLOWS</span>
          <h1>Developer tools</h1>
          <p>Send the details you choose to the configured AI service and review its response.</p>
        </div>
        <span className="ai-service-badge"><Sparkles size={16} /> Gemini-powered</span>
      </section>

      <div className="ai-tools-grid">
        <aside className="ai-tool-picker" aria-label="Choose an AI tool">
          {tools.map(({ id, title, description, icon: Icon }) => (
            <button
              className={`ai-tool-option ${activeTool === id ? "ai-tool-option-active" : ""}`}
              key={id}
              onClick={() => selectTool(id)}
              aria-pressed={activeTool === id}
            >
              <span className="ai-tool-option-icon"><Icon size={18} /></span>
              <span><strong>{title}</strong><small>{description}</small></span>
              <ArrowUpRight size={16} />
            </button>
          ))}
          <p className="field-hint">Only use content you have permission to share with the configured AI service.</p>
        </aside>

        <section className="content-card ai-form-card">
          <div className="card-heading">
            <span className="card-heading-icon"><activeToolDetails.icon size={19} /></span>
            <div><h2>{activeToolDetails.title}</h2><p>{activeToolDetails.description}</p></div>
          </div>

          <form className="form-stack" onSubmit={handleSubmit}>
            {activeTool === "explain" && (
              <label className="field">
                <span>Content to explain</span>
                <textarea rows={9} value={content} onChange={(event) => setContent(event.target.value)} placeholder="Paste code or technical content" required />
              </label>
            )}

            {activeTool === "review" && (
              <>
                <label className="field">
                  <span>Programming language <small>(optional)</small></span>
                  <input value={language} onChange={(event) => setLanguage(event.target.value)} placeholder="e.g. JavaScript" />
                </label>
                <label className="field">
                  <span>Code to review</span>
                  <textarea className="code-input" rows={12} value={code} onChange={(event) => setCode(event.target.value)} placeholder="Paste a code snippet" required />
                </label>
              </>
            )}

            {activeTool === "repository" && (
              <label className="field">
                <span>Public GitHub repository URL</span>
                <input type="url" value={repositoryUrl} onChange={(event) => setRepositoryUrl(event.target.value)} placeholder="https://github.com/owner/repository" required />
                <span className="field-hint">Only public repositories are supported by this endpoint.</span>
              </label>
            )}

            {activeTool === "readme" && (
              <>
                <label className="field">
                  <span>Project name</span>
                  <input value={readmeDetails.projectName} onChange={(event) => updateReadmeDetail("projectName", event.target.value)} required />
                </label>
                <label className="field">
                  <span>Description</span>
                  <textarea rows={3} value={readmeDetails.description} onChange={(event) => updateReadmeDetail("description", event.target.value)} required />
                </label>
                {[
                  ["techStack", "Tech stack"],
                  ["features", "Features"],
                  ["installation", "Installation"],
                  ["usage", "Usage"],
                  ["additionalInfo", "Additional information"],
                ].map(([field, label]) => (
                  <label className="field" key={field}>
                    <span>{label} <small>(optional)</small></span>
                    <textarea rows={2} value={readmeDetails[field]} onChange={(event) => updateReadmeDetail(field, event.target.value)} />
                  </label>
                ))}
              </>
            )}

            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-primary" disabled={loading}>
              {loading ? <><LoaderCircle className="spin-icon" size={17} /> Working...</> : <><Sparkles size={17} /> Run tool</>}
            </button>
          </form>

          {result && (
            <section className="ai-result" aria-live="polite">
              <div className="ai-result-heading">
                <div><span className="eyebrow">RESULT</span><h3>{result.title}</h3></div>
                {result.detail && <span className="subtle-count">{result.detail}</span>}
              </div>
              <pre>{result.text}</pre>
            </section>
          )}
        </section>
      </div>
    </div>
  );
}

export default AITools;