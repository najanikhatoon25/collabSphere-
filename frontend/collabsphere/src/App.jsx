import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import DashboardLayout from "./layouts/DasboardLayout";
import AITools from "./pages/AITools";
import Account from "./pages/Account";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotesPage from "./pages/NotesPage";
import ProjectDetails from "./pages/ProjectDetails";
import Projects from "./pages/Project";
import Register from "./pages/Register";
import SharedProjects from "./pages/SharedProjects";
import { useAuth } from "./hooks/useAuth";
import Loader from "./components/Loader";

function ProtectedRoutes() {
  const { user, loading, sessionError, retrySession } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader label="Checking your session..." />;
  }

  if (sessionError) {
    return (
      <main className="auth-page">
        <div className="notice notice-error" role="alert">
          <span>{sessionError}</span>
          <button className="button button-secondary" onClick={retrySession}>Try again</button>
        </div>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function PublicRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader label="Checking your session..." />;
  }

  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<PublicRoutes />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoutes />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId" element={<ProjectDetails />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/ai-tools" element={<AITools />} />
          <Route path="/invitations" element={<SharedProjects />} />
          <Route path="/account" element={<Account />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
