import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/auth";
import { API_BASE } from "../config";
import { getTimeBasedGreeting } from "../components/AuthLayoutLeft";
import { User, Mail, Lock, ShieldCheck, ArrowRight, CheckCircle2, Circle } from "lucide-react";

const PASSWORD_RULES = [
  { id: "length", test: (p) => p.length >= 8, label: "At least 8 characters" },
  { id: "upper", test: (p) => /[A-Z]/.test(p), label: "One uppercase letter" },
  { id: "lower", test: (p) => /[a-z]/.test(p), label: "One lowercase letter" },
  { id: "number", test: (p) => /\d/.test(p), label: "One number" },
  { id: "special", test: (p) => /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/'`~]/.test(p), label: "One special character" },
];

function passwordStrength(p) {
  if (!p) return 0;
  return PASSWORD_RULES.filter((r) => r.test(p)).length;
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const greeting = getTimeBasedGreeting();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const strength = useMemo(() => passwordStrength(form.password), [form.password]);
  const allRulesPass = useMemo(() => PASSWORD_RULES.every((r) => r.test(form.password)), [form.password]);
  const passwordsMatch = form.password && form.password === form.confirm;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name?.trim() || !form.email?.trim() || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!allRulesPass) {
      setError("Password requirements not met.");
      return;
    }
    setLoading(true);
    try {
      const payload = { name: form.name.trim(), email: form.email.trim(), password: form.password };
      const res = await registerUser(payload);
      if (res.status === 201 || res.data?.message === "Registered successfully") {
        navigate("/verify-email", { state: { email: form.email.trim(), justRegistered: true } });
      } else {
        setError(res.data?.message || "Registration failed.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed.");
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

      <div className="glass-card w-full max-w-[480px] animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-400/80 mb-2">{greeting}</p>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Create Account</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Join our AI-powered screening network</p>
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
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </a>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">or initialize</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="rounded-2xl px-5 py-4 text-sm font-medium bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                <input
                  name="name"
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 pl-14 pr-5 py-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
                  placeholder="Full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                <input
                  name="email"
                  type="email"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 pl-14 pr-5 py-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
                  placeholder="Email address"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                <input
                  name="password"
                  type="password"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 pl-14 pr-5 py-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`h-1.5 w-3 rounded-full transition-all ${i <= strength ? (strength <= 2 ? "bg-red-400" : strength <= 4 ? "bg-amber-400" : "bg-violet-500") : "bg-slate-200 dark:bg-slate-800"}`} />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-2">
                {PASSWORD_RULES.map((r) => {
                  const passed = r.test(form.password);
                  return (
                    <div key={r.id} className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${passed ? "text-violet-600 dark:text-violet-400" : "text-slate-400 dark:text-slate-600"}`}>
                      {passed ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                      {r.label}
                    </div>
                  );
                })}
              </div>

              <div className="relative group">
                <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                <input
                  name="confirm"
                  type="password"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 pl-14 pr-5 py-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
                  placeholder="Confirm password"
                  value={form.confirm}
                  onChange={handleChange}
                  required
                />
                {form.confirm && !passwordsMatch && <p className="absolute -bottom-6 left-2 text-[10px] font-bold text-red-500 tracking-wider">PASSWORDS DO NOT MATCH</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !allRulesPass || !passwordsMatch}
              className="group relative w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-lg shadow-2xl shadow-violet-600/30 hover:shadow-violet-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none mt-4"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? "Initializing..." : "Register Account"}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </form>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-slate-500 dark:text-slate-500 font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-violet-600 dark:text-violet-400 font-black hover:underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
