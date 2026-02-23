import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { KeyRound, ArrowLeft, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import axios from "axios";
import { API_BASE } from "../config";
import { getTimeBasedGreeting } from "../components/AuthLayoutLeft";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");
    const greeting = getTimeBasedGreeting();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("Invalid or depleted security token.");
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!token) {
            setError("Security token missing.");
            return;
        }

        if (password.length < 8) {
            setError("Entropy requirement not met: Password must be 8+ characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Identity verification mismatch: Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_BASE}/api/auth/reset-password`, {
                token,
                password,
            });
            setSuccess(true);
            setTimeout(() => navigate("/login", { state: { message: "Security credentials updated successfully." } }), 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Reset sequence failure. Token may have expired.");
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
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">New Credentials</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Define your new access security profile</p>
                </div>

                <div className="flex justify-center mb-10">
                    <div className="h-20 w-20 rounded-3xl bg-violet-600/10 flex items-center justify-center text-violet-600 shadow-xl shadow-violet-600/5">
                        <KeyRound className="h-10 w-10" />
                    </div>
                </div>

                {success ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
                        <div className="rounded-2xl p-6 bg-emerald-500/5 border border-emerald-500/10 text-center">
                            <p className="text-emerald-600 dark:text-emerald-400 font-bold mb-2 flex items-center justify-center gap-2">
                                <Sparkles className="h-4 w-4" /> Database Updated
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Your new password has been hashed and stored. Redirecting to gateway...</p>
                        </div>
                        <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 animate-[progress_2s_ease-in-out]" />
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="rounded-2xl px-5 py-4 text-sm font-medium bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 animate-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Secure Password</label>
                                <div className="relative group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-5 py-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all font-medium"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Verify Password</label>
                                <input
                                    type="password"
                                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-5 py-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all font-medium"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                                {loading ? "Updating Vault..." : "Establish New Access"}
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                    </form>
                )}

                <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                    <Link to="/login" className="text-slate-500 hover:text-violet-600 dark:text-slate-500 dark:hover:text-violet-400 font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                        <ArrowLeft className="h-4 w-4" /> Cancel and Return to Gateway
                    </Link>
                </div>
            </div>
        </div>
    );
}
