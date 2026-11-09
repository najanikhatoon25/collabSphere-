const workspaceFeatures = [
  {
    icon: "📁",
    title: "Project Management",
    description:
      "Create, update and manage projects in one centralized workspace.",
  },
  {
    icon: "👥",
    title: "Team Collaboration",
    description:
      "Add team members, manage project access and collaborate together.",
  },
  {
    icon: "📝",
    title: "Markdown Notes",
    description:
      "Create, edit, save and manage project notes with Markdown.",
  },
  {
    icon: "📂",
    title: "File Management",
    description:
      "Upload, access, download and manage your project files.",
  },
];

const aiTools = [
  {
    icon: "💡",
    title: "Explain Content",
    description:
      "Understand code, notes and other content through simple AI explanations.",
  },
  {
    icon: "🔍",
    title: "AI Code Review",
    description:
      "Review code snippets, identify potential issues and get suggestions.",
  },
  {
    icon: "🐙",
    title: "Repository Explainer",
    description:
      "Understand your GitHub repository, its structure and files.",
  },
  {
    icon: "📘",
    title: "README Generator",
    description:
      "Generate professional README documentation for your projects.",
  },
];

function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* Navbar */}
      <nav className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <a href="#" className="text-2xl font-bold text-blue-700">
            CollabSphere
          </a>

          <div className="hidden gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="hover:text-blue-700">Features</a>
            <a href="#ai-tools" className="hover:text-blue-700">AI Tools</a>
            <a href="#about" className="hover:text-blue-700">About</a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="rounded-lg px-4 py-2 font-medium text-slate-700 hover:text-blue-700"
            >
              Login
            </a>
            <a
              href="/register"
              className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Get Started
            </a>
          </div>

        </div>
      </nav>

      {/* Hero Section */}
      <section id="about" className="bg-blue-50">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center">

          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            AI-POWERED DEVELOPER COLLABORATION
          </span>

          <h1 className="mt-7 text-4xl font-extrabold leading-tight md:text-6xl">
            Build together.
            <br />
            <span className="text-blue-700">Grow together.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
            Manage your projects, collaborate with team members,
            organize notes and files, and make development easier
            with AI-powered tools.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <a
              href="/register"
              className="rounded-lg bg-blue-700 px-7 py-3.5 font-semibold text-white shadow-md hover:bg-blue-800"
            >
              Get Started →
            </a>

            <a
              href="#features"
              className="rounded-lg border border-blue-200 bg-white px-7 py-3.5 font-semibold text-blue-700 hover:bg-blue-50"
            >
              Explore Features
            </a>
          </div>

        </div>
      </section>

      {/* Workspace Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">

        <div className="text-center">
          <p className="font-semibold tracking-wider text-blue-700">
            WORKSPACE FEATURES
          </p>

          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            Everything in one workspace
          </h2>

          <p className="mt-4 text-slate-500">
            Organize your projects and work better with your team.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {workspaceFeatures.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
            >
              <div className="text-3xl">{feature.icon}</div>

              <h3 className="mt-5 text-lg font-bold">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                {feature.description}
              </p>
            </div>
          ))}

        </div>
      </section>

      {/* AI Tools */}
      <section id="ai-tools" className="bg-slate-50 px-6 py-20">

        <div className="mx-auto max-w-7xl">

          <div className="text-center">
            <p className="font-semibold tracking-wider text-blue-700">
              POWERED BY GEMINI AI
            </p>

            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Smart AI tools for developers
            </h2>

            <p className="mt-4 text-slate-500">
              Understand code and simplify your documentation work.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {aiTools.map((tool) => (
              <div
                key={tool.title}
                className="rounded-xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
              >
                <div className="text-3xl">{tool.icon}</div>

                <h3 className="mt-5 text-lg font-bold">
                  {tool.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-500">
                  {tool.description}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* Get Started */}
      <section className="px-6 py-20 text-center">

        <h2 className="text-3xl font-bold">
          Ready to collaborate?
        </h2>

        <p className="mt-4 text-slate-500">
          Bring your projects, team and ideas together with CollabSphere.
        </p>

        <a
          href="/register"
          className="mt-7 inline-block rounded-lg bg-blue-700 px-7 py-3.5 font-semibold text-white hover:bg-blue-800"
        >
          Create Your Account →
        </a>

      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 px-6 py-7">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">

          <span className="text-lg font-bold text-blue-700">
            CollabSphere
          </span>

          <p className="text-sm text-slate-500">
            Build. Collaborate. Create.
          </p>

          <p className="text-sm text-slate-400">
            © 2026 CollabSphere By Najni saikh
          </p>

        </div>
      </footer>

    </div>
  );
}

export default App;
