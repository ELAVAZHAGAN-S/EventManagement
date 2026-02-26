import { Link, useNavigate } from 'react-router-dom';
import { HiArrowRightOnRectangle, HiUserCircle, HiBars3, HiBell, HiSparkles } from 'react-icons/hi2';
import { authService, userService, notificationService } from '../../services/api';
import { useEffect, useState, useRef } from 'react';
import type { Notification } from '../../types/notification';
import { getImageUrl } from '../../config';

interface NavbarProps {
    homeLink?: string;
    onMenuClick?: () => void;
}

const Navbar = ({ homeLink = '/dashboard', onMenuClick }: NavbarProps) => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>({});
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await userService.getProfile();
                setUser(profile);
            } catch (error) {
                console.error("Failed to fetch profile", error);
                setUser(JSON.parse(localStorage.getItem('user') || '{}'));
            }
        };
        fetchProfile();
    }, []);

    // Fetch notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                if (localStorage.getItem('token')) {
                    const data = await notificationService.getNotifications();
                    setNotifications(data);
                }
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const handleNotificationClick = async (notification: Notification) => {
        try {
            if (!notification.isRead) {
                await notificationService.markAsRead(notification.id);
                setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
            }
            if (notification.eventId) {
                navigate(`/events/${notification.eventId}`);
                setShowNotifications(false);
            }
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    const getProfileImage = () => {
        if (user.profilePicture) {
            return (
                <img
                    src={getImageUrl(user.profilePicture)}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-500/30 hover:ring-violet-500/60 transition-all"
                />
            );
        }
        return <HiUserCircle className="w-8 h-8 text-slate-400 hover:text-violet-400 transition-colors" />;
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <header className="glass h-14 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 border-b border-white/10 transition-all duration-300">
            <div className="flex items-center gap-3">
                {onMenuClick && (
                    <button
                        onClick={onMenuClick}
                        className="md:hidden p-2 -ml-2 text-slate-400 hover:text-violet-400 hover:bg-white/5 rounded-lg transition-all"
                        aria-label="Open Menu"
                    >
                        <HiBars3 className="w-6 h-6" />
                    </button>
                )}
                <Link to={homeLink} className="flex items-center gap-2 group">
                    <HiSparkles className="w-6 h-6 text-violet-500 group-hover:text-violet-400 transition-colors float-animation" />
                    <span className="text-lg sm:text-xl font-bold text-gradient tracking-tight">
                        EventMate
                    </span>
                </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                {/* Notifications */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2 text-slate-400 hover:text-violet-400 relative rounded-full hover:bg-white/5 transition-all group"
                    >
                        <span className="sr-only">Notifications</span>
                        <HiBell className="w-6 h-6 group-hover:animate-pulse" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-gradient-to-r from-violet-500 to-pink-500"></span>
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="glass-dropdown absolute right-0 mt-2 w-80 py-1 z-50 max-h-96 overflow-y-auto">
                            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-slate-200">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            {notifications.length === 0 ? (
                                <div className="px-4 py-8 text-center">
                                    <HiBell className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                                    <p className="text-sm text-slate-500">No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`px-4 py-3 hover:bg-white/5 cursor-pointer transition-all border-b border-white/5 last:border-0 group ${!notification.isRead ? 'bg-violet-500/5' : ''}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${!notification.isRead ? 'bg-violet-500' : 'bg-slate-600'}`}></div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${!notification.isRead ? 'font-medium text-slate-200' : 'text-slate-400'} group-hover:text-violet-300 transition-colors`}>
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Profile */}
                <Link to="/profile" className="flex items-center gap-2 text-slate-300 hover:text-slate-100 transition-colors group">
                    {getProfileImage()}
                    <span className="text-sm font-medium hidden sm:block max-w-[120px] truncate group-hover:text-violet-300 transition-colors">
                        {user.fullName || 'User'}
                    </span>
                </Link>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-400 transition-all rounded-full hover:bg-red-500/10 group"
                    title="Logout"
                >
                    <HiArrowRightOnRectangle className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </header>
    );
};

export default Navbar;
