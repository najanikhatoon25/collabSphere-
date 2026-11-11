import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import {
  Bot,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  NotebookPen,
  PanelLeftOpen,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Projects",
    path: "/projects",
    icon: FolderKanban,
  },
  {
    name: "Notes",
    path: "/notes",
    icon: NotebookPen,
  },
  {
    name: "AI Tools",
    path: "/ai-tools",
    icon: Bot,
  },
  {
    name: "Invitations",
    path: "/invitations",
    icon: UsersRound,
  },
  {
    name: "My account",
    path: "/account",
    icon: UserRound,
  },
];

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    setLogoutError("");
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      setLogoutError(error.message || "Unable to log out. Please try again.");
    }
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open sidebar"
        aria-expanded={isOpen}
        className="fixed left-4 top-4 z-40 rounded-lg border border-slate-200 bg-white p-2 text-xl shadow-sm lg:hidden"
      >
        ☰
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-64 flex-col
          border-r border-slate-200 bg-white p-5
          transition-transform duration-300
          lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Logo and Close Button */}
        <div className="mb-10 flex items-center justify-between">
          <NavLink to="/dashboard" className="brand-lockup" onClick={closeSidebar}>
            <span className="brand-mark"><PanelLeftOpen size={18} /></span>
            <span>Collab<span>Sphere</span></span>
          </NavLink>

          <button
            onClick={closeSidebar}
            aria-label="Close sidebar"
            className="text-xl text-slate-500 hover:text-red-500 lg:hidden"
          >
            ✕
          </button>
        </div>

        {/* Workspace Heading */}
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-slate-200 pt-5">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800">
                {user?.name || "Your account"}
              </p>

              <p className="truncate text-xs text-slate-500">
                {user?.email || "Signed in"}
              </p>
            </div>
          </div>
          {logoutError && <p className="form-error sidebar-error" role="alert">{logoutError}</p>}
          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={17} /> Log out
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
