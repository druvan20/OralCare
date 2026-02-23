import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import axios from "axios";
import { API_BASE } from "../config";
import { getTimeBasedGreeting } from "../components/AuthLayoutLeft";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const greeting = getTimeBasedGreeting();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API_BASE}/api/auth/forgot-password`, { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Recovery sequence initialization failed.");
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
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Recover Access</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Reset your encrypted security credentials</p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="h-20 w-20 rounded-3xl bg-violet-600/10 flex items-center justify-center text-violet-600 shadow-xl shadow-violet-600/5">
            <Mail className="h-10 w-10" />
          </div>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-2xl px-5 py-4 text-sm font-medium bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="forgot-email" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Registered Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 pl-14 pr-5 py-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all font-medium"
                  placeholder="entity@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-lg shadow-2xl shadow-violet-600/30 hover:shadow-violet-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? "Re-initializing..." : "Transmit Recovery Link"}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </form>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="rounded-2xl p-6 bg-emerald-500/5 border border-emerald-500/10 text-center">
              <p className="text-emerald-600 dark:text-emerald-400 font-bold mb-2 flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" /> Link Transmitted
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Check your secure inbox for reset instructions.</p>
            </div>

            <Link to="/login" className="btn-secondary w-full mt-8 py-4 flex items-center justify-center gap-2">
              <ArrowLeft className="h-5 w-5" /> Return to Gateway
            </Link>
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
          <Link to="/login" className="text-slate-500 hover:text-violet-600 dark:text-slate-500 dark:hover:text-violet-400 font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Workspace Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
