import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/auth";
import { API_BASE } from "../config";
import { getTimeBasedGreeting } from "../components/AuthLayoutLeft";
import { Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { user, loading: authLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const greeting = getTimeBasedGreeting();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      if (!user.name) navigate("/complete-profile");
      else navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const saved = localStorage.getItem("oralcare-remember-email");
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  useEffect(() => {
    const msg = searchParams.get("message");
    if (msg) setError(decodeURIComponent(msg.replace(/\+/g, " ")));
  }, [searchParams]);

  useEffect(() => {
    const fromState = location.state?.message;
    if (fromState) {
      setSuccessMessage(fromState);
      setError("");
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      if (res.data?.token && res.data?.user) {
        if (remember) localStorage.setItem("oralcare-remember-email", email);
        else localStorage.removeItem("oralcare-remember-email");

        login(res.data.token, res.data.user);
        if (!res.data.user.name) {
          navigate("/complete-profile");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 sm:p-10">
      <div className="absolute top-10 left-10 flex items-center gap-2 font-bold text-2xl tracking-tight text-white pointer-events-none">
        <ShieldCheck className="h-8 w-8 text-violet-400" />
        <span>OralCare<span className="text-violet-400 font-light ml-1">AI</span></span>
      </div>

      <div className="glass-card w-full max-w-[460px] animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-400/80 mb-2">{greeting}</p>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Empowering your health with AI screening</p>
        </div>

        <div className="space-y-4">
          <a
            href={`${API_BASE}/api/auth/google`}
            className="flex items-center justify-center gap-3 w-full rounded-2xl bg-white dark:bg-slate-800 py-4 px-6 font-bold text-slate-800 dark:text-white shadow-xl shadow-slate-200/50 dark:shadow-none hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-100 dark:border-slate-700 active:scale-[0.98]"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </a>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">or email</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {successMessage && (
              <div
                className="rounded-2xl px-5 py-4 text-sm font-medium bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 animate-in slide-in-from-top-2"
                role="status"
                aria-live="polite"
              >
                {successMessage}
              </div>
            )}
            {error && (
              <div
                className="rounded-2xl px-5 py-4 text-sm font-medium bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 animate-in slide-in-from-top-2"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 pl-14 pr-5 py-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="Email address"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" aria-hidden="true" />
                <input
                  id="password"
                  type="password"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 pl-14 pr-5 py-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-label="Password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${remember ? 'bg-violet-600 border-violet-600' : 'border-slate-200 dark:border-slate-700 bg-transparent'}`}
                  aria-hidden="true"
                >
                  {remember && <ShieldCheck className="h-4 w-4 text-white" />}
                </div>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 group-hover:text-violet-600 transition-colors">Remember me</span>
              </label>
              <Link to="/forgot-password" size="sm" className="text-sm font-bold text-violet-600 hover:text-violet-700 dark:text-violet-400 transition-colors">
                Forgot access?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-lg shadow-2xl shadow-violet-600/30 hover:shadow-violet-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
              aria-busy={loading}
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? "Decrypting profile..." : "Sign in to System"}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </span>
            </button>
          </form>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-slate-500 dark:text-slate-500 font-medium">
            New to SOL.AI?{" "}
            <Link to="/register" className="text-violet-600 dark:text-violet-400 font-black hover:underline underline-offset-4">
              Initialize Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
