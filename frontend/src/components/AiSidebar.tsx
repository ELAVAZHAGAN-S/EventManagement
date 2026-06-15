import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import aiService, { type ChatMessage, type ChatSession } from '../services/aiService';

const AiSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const saved = localStorage.getItem("ai-chat-sessions")
        if (saved) {
            setSessions(JSON.parse(saved))
        }
    }, [])

    useEffect(() => {
        localStorage.setItem("ai-chat-sessions", JSON.stringify(sessions))
    }, [sessions])

    const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/verify-otp', '/reset-password'];
    const isPublicPage = publicRoutes.includes(location.pathname);
    const isAuthenticated = !!localStorage.getItem('token');
    const shouldShowSidebar = isAuthenticated && !isPublicPage;
    const activeSession = sessions.find(s => s.id === activeSessionId);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeSession?.messages]);
    const createNewSession = () => {
        const newSession: ChatSession = {
            id: `chat-${Date.now()}`,
            title: 'New Chat',
            messages: [],
            createdAt: new Date()
        };
        setSessions(prev => [...prev, newSession]);
        setActiveSessionId(newSession.id);
    };
    const closeSession = (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (activeSessionId === sessionId) {
            setActiveSessionId(sessions.length > 1 ? sessions[0].id : null);
        }
    };
    const executeCommand = (target: string) => {
        const validRoutes = [
            '/events',
            '/my-bookings',
            '/org/events',
            '/org/events/create',
            '/org/venues',
            '/org/venues/create',
            '/org/coupons',
            '/profile'
        ]

        if (validRoutes.includes(target) || target.startsWith('/event/')) {
            if (target === '/events'){
                setIsOpen(false)
                navigate('/events?type=ALL_TYPE')
            }else{
                setIsOpen(false)
                navigate(target)
            }
        } else {
            console.warn('AI tried to navigate to invalid route:', target)
        }
    }

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;
        let currentSessionId = activeSessionId;
        if (!currentSessionId) {
            const newSession: ChatSession = {
                id: `chat-${Date.now()}`,
                title: 'New Chat',
                messages: [],
                createdAt: new Date()
            };
            setSessions(prev => [...prev, newSession]);
            setActiveSessionId(newSession.id);
            currentSessionId = newSession.id;
        }

        const userMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setSessions(prev => prev.map(s =>
            s.id === currentSessionId
                ? { ...s, messages: [...s.messages, userMessage] }
                : s
        ));

        const messageToSend = inputMessage.trim().slice(0, 400)
        if (isLoading) return
        setInputMessage('');
        setIsLoading(true);

        try {
            const role = localStorage.getItem("role") || "USER"

            const response = await aiService.chat(messageToSend, role);

            const assistantMessage: ChatMessage = {
                id: `msg-${Date.now()}-ai`,
                role: 'assistant',
                content: response.isCommand ? (response.message || 'Navigating...') : response.response,
                timestamp: new Date(),
                isCommand: response.isCommand,
                action: response.action,
                target: response.target
            };

            setSessions(prev => prev.map(s =>
                s.id === currentSessionId
                    ? {
                        ...s,
                        messages: [...s.messages, assistantMessage],
                        title: s.messages.length === 0 ? messageToSend.slice(0, 30) + '...' : s.title
                    }
                    : s
            ));

            let target = response.target

            if (!target && response.response) {

                const text = response.response.toLowerCase()

                if (text.includes("events")) target = "/events"

                else if (text.includes("create event"))
                    target = "/org/events/create"

                else if (text.includes("venues"))
                    target = "/org/venues"

                else if (text.includes("coupon"))
                    target = "/org/coupons"

                else if (text.includes("booking"))
                    target = "/my-bookings"

                else if (text.includes("profile"))
                    target = "/profile"

            }

            if (response.isCommand && response.target) {
                setTimeout(() => executeCommand(response.target!), 500)
            } else if (target) {
                setTimeout(() => executeCommand(target), 500)
            }

        } catch (error) {
            console.error('AI chat error:', error);
            const errorMessage: ChatMessage = {
                id: `msg-${Date.now()}-error`,
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            };
            setSessions(prev => prev.map(s =>
                s.id === activeSessionId
                    ? { ...s, messages: [...s.messages, errorMessage] }
                    : s
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const storedUser = localStorage.getItem("user")

    let role = "user"

    if (storedUser) {
        try {
            const user = JSON.parse(storedUser)
            role = (user.role || "user").toLowerCase()
        } catch {
            role = "user"
        }
    }

    let quickActions = []

    if (role.includes("admin")) {
        quickActions = [
            { label: "Manage Events", prompt: "Open admin events management" },
            { label: "Manage Users", prompt: "Open user management page" },
            { label: "Show Analytics", prompt: "Show admin analytics dashboard" }
        ]
    }

    else if (role.includes("organizer") || role.includes("organization")) {
        quickActions = [
            { label: "Create Event", prompt: "Take me to create event page" },
            { label: "Manage Events", prompt: "Show my events" },
            { label: "Manage Venues", prompt: "Go to venue management" },
            { label: "Coupons", prompt: "Open coupons page" }
        ]
    }

    else {
        quickActions = [
            { label: "Browse Events", prompt: "Show me all events" },
            { label: "My Bookings", prompt: "Show my bookings" },
            { label: "Upcoming Events", prompt: "Show upcoming events" },
            { label: "Profile", prompt: "Open my profile" }
        ]
    }

    if (!shouldShowSidebar) {
        return null;
    }

    return (
        <>
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed right-0 top-1/2 -translate-y-1/2 bg-amber-200 text-black p-3 rounded-l-2xl shadow-2xl z-50 flex items-center gap-2 group transition-all duration-300"
                >
                    <Sparkles size={20} className="animate-pulse" />
                    <span className="max-w-0 overflow-hidden group-hover:max-w-[100px] transition-all duration-300 whitespace-nowrap">
                        AI Assistant
                    </span>
                </motion.button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed right-0 top-0 h-full w-[420px] max-w-[90vw] bg-slate-900 border-l border-white/10 shadow-2xl z-50 flex flex-col rounded-l-4xl overflow-hidden"
                    >
                        <div className="py-4 px-6 bg-linear-to-r from-amber-100 to-amber-200 border-b border-black/20 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-linear-to-br from-amber-200 to-amber-300 border border-black rounded-xl">
                                    <Bot size={20} className="text-black" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-black">EventMate 2.0 AI</h2>
                                    <p className="text-xs text-slate-800">Your intelligent assistant</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-slate-900" />
                            </button>
                        </div>

                        <div className="flex items-center gap-1 px-6 py-3 bg-linear-to-r from-amber-100 to-amber-200 border-b border-black/20 overflow-x-auto">
                            <button
                                onClick={createNewSession}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-900 text-white rounded-lg hover:bg-gray-600 transition-colors whitespace-nowrap"
                            >
                                <Plus size={14} /> New Chat
                            </button>
                            {sessions.map(session => (
                                <div
                                    key={session.id}
                                    onClick={() => setActiveSessionId(session.id)}
                                    className={`relative group flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg cursor-pointer transition-colors whitespace-nowrap ${activeSessionId === session.id
                                        ? 'bg-white text-black border border-black'
                                        : 'text-black border border-black bg-amber-50/70 hover:bg-white/50'
                                        }`}
                                >
                                    <span className="max-w-20 truncate">{session.title}</span>
                                    <X
                                        size={12}
                                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 font-bold"
                                        onClick={(e) => closeSession(session.id, e)}
                                    />
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex-1 bg-linear-to-r from-amber-100 to-amber-200 overflow-y-auto py-4 px-8 space-y-4">
                            {!activeSession || activeSession.messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                                    <div className="p-4 border-2 border-black rounded-full mb-4">
                                        <Sparkles size={32} className="text-black" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-black mb-2">How can I help you?</h3>
                                    <p className="text-sm text-gray-800 mb-6">
                                        Ask me to navigate, find events, or get information
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 w-full">
                                        {quickActions.map((action, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    if (!activeSessionId) createNewSession();
                                                    setInputMessage(action.prompt);
                                                }}
                                                className="py-3 px-5 text-black border border-black bg-amber-50/70 hover:bg-white rounded-xl text-sm transition-colors text-left"
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {activeSession.messages.map(msg => (
                                        <div
                                            key={msg.id}
                                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                        >
                                            <div className={`p-2 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'user'
                                                ? 'bg-black'
                                                : 'bg-linear-to-br from-amber-200 to-amber-300 border border-black'
                                                }`}>
                                                {msg.role === 'user' ? (
                                                    <User size={16} className="text-white" />
                                                ) : (
                                                    <Bot size={16} className="text-black" />
                                                )}
                                            </div>
                                            <div className={`max-w-[80%] py-2 px-4 rounded-2xl ${msg.role === 'user'
                                                ? 'bg-black text-white rounded-tr-sm'
                                                : 'bg-linear-to-br from-amber-200 to-amber-300 border border-black text-black'
                                                }`}>
                                                {msg.role === 'assistant' ? (
                                                    <div className="prose prose-invert prose-sm max-w-none">
                                                        <ReactMarkdown>
                                                            {msg.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm">{msg.content}</p>
                                                )}
                                                {msg.isCommand && msg.target && (
                                                    <div className="mt-2 p-2 bg-green-500/20 rounded-lg text-xs text-green-300 flex items-center gap-2">
                                                        <Loader2 size={12} className="animate-spin" />
                                                        Navigating to {msg.target}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {isLoading && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex gap-3"
                                        >
                                            <div className="p-2 rounded-xl shrink-0 bg-linear-to-br from-amber-200 to-amber-300 border border-black">
                                                <Bot size={16} className="text-black" />
                                            </div>
                                            <div className="bg-linear-to-br from-amber-200 to-amber-300 border border-black rounded-2xl rounded-tl-sm px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <motion.span
                                                        className="w-2 h-2 bg-black rounded-full"
                                                        animate={{ y: [0, -6, 0] }}
                                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                                    />
                                                    <motion.span
                                                        className="w-2 h-2 bg-black rounded-full"
                                                        animate={{ y: [0, -6, 0] }}
                                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                                                    />
                                                    <motion.span
                                                        className="w-2 h-2 bg-black rounded-full"
                                                        animate={{ y: [0, -6, 0] }}
                                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                                                    />
                                                </div>
                                                <p className="text-xs text-black mt-1">EventMate 2.0 AI is thinking...</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        <div className="py-4 px-8 border-t border-black/20 bg-linear-to-r from-amber-100 to-amber-200">
                            <div className="flex items-end gap-2">
                                <textarea
                                    value={inputMessage}
                                    onChange={(e) => {
                                        setInputMessage(e.target.value)
                                        e.target.style.height = "auto"
                                        e.target.style.height = e.target.scrollHeight + "px"
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask me anything..."
                                    rows={1}
                                    className="flex-1 bg-white/5 border border-black rounded-xl px-4 py-3 text-sm text-black placeholder-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-amber-100 transition-all"
                                    style={{ minHeight: '48px', maxHeight: '120px' }}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!inputMessage.trim() || isLoading}
                                    className="p-3 bg-black rounded-xl text-white disabled:opacity-90 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-amber-400/25 transition-all"
                                >
                                    {isLoading ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <Send size={20} />
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-gray-700 mt-2 text-center">
                                Press Enter to send • Shift+Enter for new line
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AiSidebar;
