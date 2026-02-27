import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Command, Sparkles, Navigation, Heart, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

const CHIPS = [
    { label: "Start Screening", action: "/predict", icon: Sparkles },
    { label: "Check Records", action: "/history", icon: Navigation },
    { label: "Medical Feed", action: "/dashboard", icon: Heart },
];

export default function UrSolChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Greetings! I am **UrSol**, your clinical AI companion. I'm here to help you navigate the platform and answer your oral oncology queries. How can I assist today?" }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setInput("");
        setIsTyping(true);

        try {
            const res = await fetch(`${API_BASE}/api/ursol/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMsg })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: "assistant", content: "I'm temporarily disconnected from the clinical core. Please try again in a moment." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleChipClick = (action) => {
        navigate(action);
        setMessages(prev => [...prev, { role: "assistant", content: `Directing you to the ${action.replace('/', '').toUpperCase()} command center.` }]);
    };

    return (
        <div className="fixed bottom-8 right-8 z-[9999] font-sans antialiased">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="h-16 w-16 rounded-3xl bg-violet-600 text-white shadow-2xl shadow-violet-600/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all animate-bounce duration-300 group relative"
                >
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-950 animate-pulse" />
                    <MessageSquare className="h-7 w-7 rotate-3" />
                    <div className="absolute -left-28 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        UrSol AI Online
                    </div>
                </button>
            ) : (
                <div className="w-[380px] h-[550px] glass rounded-[2.5rem] shadow-2xl shadow-slate-900/10 dark:shadow-[-20px_20px_60px_rgba(0,0,0,0.4)] border border-slate-200 dark:border-white/20 flex flex-col overflow-hidden animate-in slide-in-from-right-8 fade-in duration-500">
                    {/* Header */}
                    <div className="p-6 bg-gradient-to-br from-violet-600 to-indigo-700 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                <Command className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-[0.2em]">UrSol <span className="text-violet-200">AI</span></h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    <p className="text-[10px] font-bold text-violet-100 uppercase tracking-widest">Medical Intelligence Active</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
                    >
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                            >
                                <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-violet-600 text-white rounded-tr-none shadow-lg shadow-violet-600/20'
                                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-white/5'
                                    }`}>
                                    <p dangerouslySetInnerHTML={{ __html: msg.content }} />
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 dark:bg-slate-800/80 p-4 rounded-3xl rounded-tl-none flex gap-1 items-center h-10 border border-slate-100 dark:border-white/5">
                                    <div className="h-1 w-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="h-1 w-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="h-1 w-1 bg-slate-400 rounded-full animate-bounce" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Context Chips */}
                    <div className="px-6 pb-2 overflow-x-auto no-scrollbar">
                        <div className="flex gap-2 min-w-max">
                            {CHIPS.map((chip, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleChipClick(chip.action)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-all hover:bg-violet-600 hover:text-white hover:border-violet-600 whitespace-nowrap"
                                >
                                    <chip.icon className="h-3 w-3" /> {chip.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-6 pt-2">
                        <form
                            onSubmit={handleSend}
                            className="relative"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask UrSol anything..."
                                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-2 h-10 w-10 bg-violet-600 text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-violet-600/30"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </form>
                        <div className="mt-4 flex items-center gap-2 justify-center opacity-40">
                            <Navigation className="h-3 w-3 text-slate-400" />
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Enterprise Diagnostic Layer v2.0</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
