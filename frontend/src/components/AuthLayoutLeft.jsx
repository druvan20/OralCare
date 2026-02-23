import ThemeToggle from "./ThemeToggle";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export function getTimeBasedGreeting() {
  return getGreeting();
}

export default function AuthLayoutLeft({ variant = "login", title, tip, children }) {
  const defaultTitle = variant === "login"
    ? "Sign in to your account to get the full SOL.AI experience."
    : "Create your account to access AI-powered oral cancer screening.";
  const defaultTip = variant === "login"
    ? "Tip: Verify your email and phone for full access and secure screening history."
    : "Tip: After signing up, verify your email to activate your account. Phone verification optional.";

  return (
    <div className="relative flex flex-col justify-between min-h-full bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 dark:from-violet-800 dark:via-violet-900 dark:to-indigo-950 p-8 sm:p-10 lg:p-14 overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-white/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-white/5" />
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <span className="text-xl font-bold tracking-tight text-white">SOL.AI</span>
        <ThemeToggle className="!text-white/80 hover:!bg-white/10 hover:!text-white dark:hover:!bg-white/10" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
        <div className="max-w-md">
          <p className="text-2xl sm:text-3xl font-bold text-white leading-tight tracking-tight">
            {title || defaultTitle}
          </p>
          <p className="mt-5 text-sm sm:text-base text-white/80 leading-relaxed">
            {tip || defaultTip}
          </p>
        </div>
        {children}
      </div>

      <div className="relative z-10 text-xs text-white/50 tracking-wide">
        OralCare AI · For research &amp; clinical support only
      </div>
    </div>
  );
}
