import { NavLink } from "react-router-dom";
import { LayoutDashboard, ScanLine, History, LogOut, User } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

export default function Navbar() {
  const { user, logout } = useAuth();

  const getNavLinkClass = ({ isActive }) =>
    `nav-link ${isActive ? "nav-link-active" : "nav-link-inactive"}`;

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-5xl px-4 sm:px-6">
      <div className="glass flex h-16 items-center justify-between rounded-2xl px-6 shadow-xl shadow-slate-900/5 dark:shadow-none">
        <NavLink to="/dashboard" className="transition-transform active:scale-95">
          <Logo className="h-8 w-8" />
        </NavLink>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-2 mr-2">
            <NavLink to="/dashboard" className={getNavLinkClass}>
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </NavLink>
            <NavLink to="/predict" className={getNavLinkClass}>
              <ScanLine className="h-4 w-4" /> Predict
            </NavLink>
            <NavLink to="/history" className={getNavLinkClass}>
              <History className="h-4 w-4" /> History
            </NavLink>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-none mb-1">
                  {user?.name || "User"}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-500 font-medium">
                  Professional Plan
                </span>
              </div>

              <div className="group relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-violet-500/30 transition-transform group-hover:scale-110">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
