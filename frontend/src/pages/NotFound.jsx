import { Link } from "react-router-dom";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-slate-50 dark:bg-slate-900">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 mb-6">
          <FileQuestion className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">404</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">Page not found</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">The page you’re looking for doesn’t exist or has been moved.</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/login" className="btn-primary inline-flex items-center gap-2">
            <Home className="h-4 w-4" /> Go to sign in
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Go back
          </button>
        </div>
      </div>
    </div>
  );
}
