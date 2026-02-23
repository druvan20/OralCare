import { useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Mail, ArrowLeft, RefreshCw, ShieldCheck, Sparkles, LogOut, CheckCircle } from "lucide-react";
import { resendVerificationEmail } from "../services/auth";
import { getTimeBasedGreeting } from "../components/AuthLayoutLeft";

export default function VerifyEmail() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const emailFromState = location.state?.email;
  const justRegistered = location.state?.justRegistered;
  const [email, setEmail] = useState(emailFromState || "");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const greeting = getTimeBasedGreeting();

  const showVerifyInstructions = !token && (justRegistered || emailFromState);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setResendMessage("Enter your email above.");
      return;
    }
    setResendLoading(true);
    setResendMessage("");
    try {
      const res = await resendVerificationEmail(email);
      setResendMessage(res?.data?.message || "Verification link transmitted.");
    } catch (err) {
      setResendMessage(err.response?.data?.message || "Transmission failed. Try again.");
    } finally {
      setResendLoading(false);
    }
  };

  if (token) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-100 dark:bg-slate-900">
        <div className="glass-card max-w-sm text-center">
          <div className="h-16 w-16 border-4 border-violet-600/20 border-t-violet-600 animate-spin rounded-full mx-auto mb-6"></div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Validating Link</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium italic">Synchronizing with secure database...</p>
          <Link to="/login" className="mt-8 btn-secondary w-full py-4">Return to Gateway</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 sm:p-10">
      <div className="absolute top-10 left-10 flex items-center gap-2 font-bold text-2xl tracking-tight text-white pointer-events-none">
        <ShieldCheck className="h-8 w-8 text-violet-400" />
        <span>OralCare<span className="text-violet-400 font-light ml-1">AI</span></span>
      </div>

      <div className="glass-card w-full max-w-[460px] animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-400/80 mb-2">{greeting}</p>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Identity Activation</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Verify your email to establish account trust</p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="h-20 w-20 rounded-3xl bg-violet-600/10 flex items-center justify-center text-violet-600 shadow-xl shadow-slate-200/50">
            <Mail className="h-10 w-10" />
          </div>
        </div>

        <div className="space-y-8">
          {showVerifyInstructions ? (
            <div className="text-center animate-in fade-in slide-in-from-bottom-2">
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                A verification sequence has been transmitted to:
              </p>
              <p className="mt-2 text-lg font-black text-slate-900 dark:text-white italic">
                {emailFromState || email}
              </p>
              <div className="mt-6 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center gap-2 text-emerald-600 font-bold text-sm">
                <CheckCircle className="h-5 w-5" /> Path Active
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="verify-email" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Registered Email</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                  <input
                    id="verify-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 pl-14 pr-5 py-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all font-medium"
                    placeholder="entity@domain.com"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 pt-4">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-violet-600/20 text-violet-600 dark:text-violet-400 hover:border-violet-600/40 hover:bg-violet-600/5 font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${resendLoading ? "animate-spin" : ""}`} />
              {resendLoading ? "Retransmitting..." : "Resend Link"}
            </button>

            {resendMessage && (
              <p className={`text-xs font-bold text-center uppercase tracking-tighter animate-in slide-in-from-top-2 ${resendMessage.includes("transmitted") ? "text-emerald-500" : "text-violet-500"}`}>
                <Sparkles className="inline h-3 w-3 mr-1" /> {resendMessage}
              </p>
            )}
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
          <Link to="/login" className="text-slate-500 hover:text-violet-600 dark:text-slate-500 dark:hover:text-violet-400 font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Workspace Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
