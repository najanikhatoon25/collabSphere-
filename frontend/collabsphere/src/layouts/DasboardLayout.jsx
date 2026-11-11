
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-w-0 flex-1 px-4 pb-8 pt-20 sm:px-6 sm:pb-10 sm:pt-8 lg:px-9">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
