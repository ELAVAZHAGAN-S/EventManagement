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

    // Check if user is on public pages (login, register, forgot-password, etc.)
    const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/verify-otp', '/reset-password'];
    const isPublicPage = publicRoutes.includes(location.pathname);

    // Check if user is authenticated (has token in localStorage)
    const isAuthenticated = !!localStorage.getItem('token');

    // Only show AI sidebar if authenticated AND not on public pages
    const shouldShowSidebar = isAuthenticated && !isPublicPage;

    // Get active session
    const activeSession = sessions.find(s => s.id === activeSessionId);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeSession?.messages]);

    // Create new chat session
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

    // Close a session
    const closeSession = (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (activeSessionId === sessionId) {
            setActiveSessionId(sessions.length > 1 ? sessions[0].id : null);
        }
    };

    // Execute AI navigation command
    const executeCommand = (target: string) => {
        const validRoutes = [
            '/events', '/org/events', '/org/events/create', '/org/venues',
            '/org/venues/create', '/bookings', '/profile', '/org/dashboard'
        ];

        // Check if it's a valid route or an event detail route
        if (validRoutes.includes(target) || target.startsWith('/event/')) {
            setIsOpen(false);
            navigate(target);
        } else {
            console.warn('AI tried to navigate to invalid route:', target);
        }
    };

    // Send message to AI
    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        // Create session if none active and get the session ID to use
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

        // Add user message to the correct session
        setSessions(prev => prev.map(s =>
            s.id === currentSessionId
                ? { ...s, messages: [...s.messages, userMessage] }
                : s
        ));

        const messageToSend = inputMessage;
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await aiService.chat(messageToSend);

            const assistantMessage: ChatMessage = {
                id: `msg-${Date.now()}-ai`,
                role: 'assistant',
                content: response.isCommand ? (response.message || 'Navigating...') : response.response,
                timestamp: new Date(),
                isCommand: response.isCommand,
                action: response.action,
                target: response.target
            };

            // Add assistant response to the correct session
            setSessions(prev => prev.map(s =>
                s.id === currentSessionId
                    ? {
                        ...s,
                        messages: [...s.messages, assistantMessage],
                        title: s.messages.length === 0 ? messageToSend.slice(0, 30) + '...' : s.title
                    }
                    : s
            ));

            // Execute command if needed
            if (response.isCommand && response.target) {
                setTimeout(() => executeCommand(response.target!), 500);
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

    // Handle Enter key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Quick action buttons
    const quickActions = [
        { label: 'Browse Events', prompt: 'Show me all events' },
        { label: 'Create Event', prompt: 'Take me to create event page' },
        { label: 'My Bookings', prompt: 'Show my bookings' },
        { label: 'Manage Venues', prompt: 'Go to venue management' }
    ];

    // Don't render anything if user is not authenticated or on public pages
    if (!shouldShowSidebar) {
        return null;
    }

    return (
        <>
            {/* Floating Trigger Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed right-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-violet-600 to-blue-600 text-white p-3 rounded-l-2xl shadow-2xl hover:shadow-violet-500/25 z-50 flex items-center gap-2 group transition-all duration-300"
                >
                    <Sparkles size={20} className="animate-pulse" />
                    <span className="max-w-0 overflow-hidden group-hover:max-w-[100px] transition-all duration-300 whitespace-nowrap">
                        AI Assistant
                    </span>
                </motion.button>
            )}

            {/* Backdrop */}
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

            {/* Sidebar Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed right-0 top-0 h-full w-[420px] max-w-[90vw] bg-slate-900 border-l border-white/10 shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-violet-600/20 to-blue-600/20 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl">
                                    <Bot size={20} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-white">EventMate AI</h2>
                                    <p className="text-xs text-slate-400">Your intelligent assistant</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-1 p-2 bg-slate-800/50 border-b border-white/5 overflow-x-auto">
                            <button
                                onClick={createNewSession}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-violet-500/20 text-violet-300 rounded-lg hover:bg-violet-500/30 transition-colors whitespace-nowrap"
                            >
                                <Plus size={14} /> New Chat
                            </button>
                            {sessions.map(session => (
                                <div
                                    key={session.id}
                                    onClick={() => setActiveSessionId(session.id)}
                                    className={`relative group flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg cursor-pointer transition-colors whitespace-nowrap ${activeSessionId === session.id
                                        ? 'bg-white/10 text-white'
                                        : 'text-slate-400 hover:bg-white/5'
                                        }`}
                                >
                                    <span className="max-w-[80px] truncate">{session.title}</span>
                                    <X
                                        size={12}
                                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"
                                        onClick={(e) => closeSession(session.id, e)}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {!activeSession || activeSession.messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                                    <div className="p-4 bg-gradient-to-br from-violet-500/20 to-blue-500/20 rounded-2xl mb-4">
                                        <Sparkles size={32} className="text-violet-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">How can I help you?</h3>
                                    <p className="text-sm text-slate-400 mb-6">
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
                                                className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-300 transition-colors text-left"
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
                                            <div className={`p-2 rounded-xl shrink-0 ${msg.role === 'user'
                                                ? 'bg-violet-500'
                                                : 'bg-gradient-to-br from-slate-700 to-slate-800'
                                                }`}>
                                                {msg.role === 'user' ? (
                                                    <User size={16} className="text-white" />
                                                ) : (
                                                    <Bot size={16} className="text-violet-400" />
                                                )}
                                            </div>
                                            <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user'
                                                ? 'bg-violet-500 text-white rounded-tr-sm'
                                                : 'bg-white/5 text-slate-200 rounded-tl-sm border border-white/10'
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

                                    {/* Typing Indicator - Shows while AI is processing */}
                                    {isLoading && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex gap-3"
                                        >
                                            <div className="p-2 rounded-xl shrink-0 bg-gradient-to-br from-slate-700 to-slate-800">
                                                <Bot size={16} className="text-violet-400" />
                                            </div>
                                            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <motion.span
                                                        className="w-2 h-2 bg-violet-400 rounded-full"
                                                        animate={{ y: [0, -6, 0] }}
                                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                                    />
                                                    <motion.span
                                                        className="w-2 h-2 bg-violet-400 rounded-full"
                                                        animate={{ y: [0, -6, 0] }}
                                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                                                    />
                                                    <motion.span
                                                        className="w-2 h-2 bg-violet-400 rounded-full"
                                                        animate={{ y: [0, -6, 0] }}
                                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                                                    />
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">AI is thinking...</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10 bg-slate-800/50">
                            <div className="flex items-end gap-2">
                                <textarea
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask me anything..."
                                    rows={1}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    style={{ minHeight: '48px', maxHeight: '120px' }}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!inputMessage.trim() || isLoading}
                                    className="p-3 bg-gradient-to-r from-violet-600 to-blue-600 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-violet-500/25 transition-all"
                                >
                                    {isLoading ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <Send size={20} />
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2 text-center">
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
