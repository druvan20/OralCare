export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row text-sm text-slate-500 dark:text-slate-400">
          <span>© {new Date().getFullYear()} OralCare AI · AI-assisted screening</span>
          <span>For research &amp; academic use only</span>
        </div>
      </div>
    </footer>
  );
}
