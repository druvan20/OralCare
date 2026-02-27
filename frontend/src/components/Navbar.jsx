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
    <>
      <nav className="fixed top-2 md:top-4 left-0 right-0 z-50 mx-auto max-w-5xl px-2 md:px-6 transition-all">
        <div className="glass flex h-14 md:h-16 items-center justify-between rounded-xl md:rounded-2xl px-4 md:px-6 shadow-xl shadow-slate-900/5 dark:shadow-none">
          <NavLink to="/dashboard" className="transition-transform active:scale-95">
            <Logo className="h-7 w-7 md:h-8 md:w-8" />
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

            <div className="flex items-center gap-2 md:gap-4">
              <ThemeToggle />

              <div className="flex items-center gap-2 md:gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] md:text-xs font-bold text-slate-900 dark:text-white leading-none mb-1">
                    {user?.name || "User"}
                  </span>
                  <span className="text-[8px] md:text-[10px] text-slate-500 dark:text-slate-500 font-medium">
                    Professional
                  </span>
                </div>

                <div className="group relative">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm md:text-lg shadow-lg shadow-violet-500/30 transition-transform group-hover:scale-110">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4 md:h-5 md:w-5" />}
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-1.5 md:p-2 rounded-lg md:rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Dock Navigation */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="glass bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 rounded-2xl p-2 shadow-2xl flex items-center justify-around">
          <NavLink to="/dashboard" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive ? "text-violet-600 bg-violet-50 dark:bg-violet-500/10" : "text-slate-400"}`}>
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Dash</span>
          </NavLink>
          <NavLink to="/predict" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive ? "text-violet-600 bg-violet-50 dark:bg-violet-500/10" : "text-slate-400"}`}>
            <div className="relative">
              <ScanLine className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 h-2 w-2 bg-violet-500 rounded-full animate-pulse" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">Scan</span>
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive ? "text-violet-600 bg-violet-50 dark:bg-violet-500/10" : "text-slate-400"}`}>
            <History className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Vault</span>
          </NavLink>
        </div>
      </div>
    </>
  );
}
