import React from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
                    <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
                        {/* Background Decorative Gradient */}
                        <div className="absolute -top-24 -right-24 h-48 w-48 bg-violet-600/20 blur-[80px]" />
                        <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-blue-600/20 blur-[80px]" />

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="h-20 w-20 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
                                <AlertTriangle className="h-10 w-10 text-red-500 animate-pulse" />
                            </div>

                            <h1 className="text-2xl font-bold text-white mb-2">System Interruption</h1>
                            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                                Something unexpected happened. We've logged the incident and our team has been notified.
                            </p>

                            <div className="flex flex-col gap-3 w-full">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full h-12 bg-white text-slate-950 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all active:scale-[0.98]"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Restart Application
                                </button>
                                <button
                                    onClick={() => (window.location.href = "/")}
                                    className="w-full h-12 bg-white/5 text-white rounded-xl font-medium border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                                >
                                    <Home className="h-4 w-4" />
                                    Return Home
                                </button>
                            </div>

                            <details className="mt-8 text-left w-full group">
                                <summary className="text-[10px] text-slate-500 hover:text-slate-400 cursor-pointer uppercase tracking-widest font-bold flex items-center gap-2 select-none outline-none">
                                    Technical Details
                                </summary>
                                <div className="mt-2 p-4 bg-black/40 rounded-lg border border-white/5 max-h-32 overflow-auto custom-scrollbar">
                                    <code className="text-[10px] text-slate-500 leading-tight block break-all">
                                        {this.state.error?.toString()}
                                    </code>
                                </div>
                            </details>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
