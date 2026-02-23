import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_BASE } from "../config";
import { getTimeBasedGreeting } from "../components/AuthLayoutLeft";
import { User, Mail, ShieldCheck, ArrowRight, Sparkles, LogOut } from "lucide-react";

export default function CompleteProfile() {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const greeting = getTimeBasedGreeting();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!name.trim() || !email.trim()) {
            setError("Identity name and contact email are required.");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const res = await axios.put(
                `${API_BASE}/api/auth/update-profile`,
                { name, email },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            updateUser(res.data.user);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Identity synchronization failed.");
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

            <button
                onClick={logout}
                className="absolute top-10 right-10 flex items-center gap-2 font-bold text-sm tracking-widest text-white/50 hover:text-red-400 transition-colors uppercase"
            >
                <LogOut className="h-4 w-4" />
                Disconnect
            </button>

            <div className="glass-card w-full max-w-[460px] animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-10">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-400/80 mb-2">{greeting}</p>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Final Step</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Complete your identity profile to begin</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="rounded-2xl px-5 py-4 text-sm font-medium bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 animate-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative group">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                            <input
                                id="name"
                                type="text"
                                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 pl-14 pr-5 py-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all font-medium"
                                placeholder="Legal Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                            <input
                                id="email"
                                type="email"
                                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 pl-14 pr-5 py-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all font-medium"
                                placeholder="Contact Email Entity"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> System Requirement
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Valid identity credentials are required for encrypted medical record association.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-lg shadow-2xl shadow-violet-600/30 hover:shadow-violet-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                    >
                        <span className="flex items-center justify-center gap-2">
                            {loading ? "Synchronizing..." : "Initialize Identity"}
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>
                </form>
            </div>
        </div>
    );
}
