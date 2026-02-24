import React from "react";

const Logo = ({ className = "", iconOnly = false, showText = true }) => {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="relative flex-shrink-0">
                <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-9 w-9"
                    aria-hidden="true"
                >
                    <defs>
                        <linearGradient id="sol-ai-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#7C3AED" />
                            <stop offset="100%" stopColor="#2563EB" />
                        </linearGradient>
                        <filter id="sol-ai-glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Outer Glow / Pulse Effect Background */}
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="#7C3AED"
                        fillOpacity="0.1"
                        className="animate-pulse"
                    />

                    {/* Futuristic Medical Cross / Sunburst */}
                    <path
                        d="M50 15 L50 85 M15 50 L85 50"
                        stroke="url(#sol-ai-grad)"
                        strokeWidth="10"
                        strokeLinecap="round"
                    />

                    {/* Rotating Ring */}
                    <circle
                        cx="50"
                        cy="50"
                        r="32"
                        stroke="url(#sol-ai-grad)"
                        strokeWidth="4"
                        strokeDasharray="12 8"
                        className="animate-spin"
                        style={{ animationDuration: '8s', transformOrigin: 'center' }}
                    />

                    {/* Core */}
                    <circle
                        cx="50"
                        cy="50"
                        r="12"
                        fill="url(#sol-ai-grad)"
                        filter="url(#sol-ai-glow)"
                    />
                </svg>
            </div>

            {showText && (
                <span className="font-bold text-xl tracking-tighter flex items-center select-none">
                    <span className="text-slate-900 dark:text-white">Sol</span>
                    <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent italic ml-0.5">.AI</span>
                </span>
            )}
        </div>
    );
};

export default Logo;
