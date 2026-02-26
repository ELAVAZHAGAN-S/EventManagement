import { NavLink, useNavigate } from 'react-router-dom';
import {
    HiHome,
    HiCalendarDays,
    HiTicket,
    HiClock,
    HiSparkles
} from 'react-icons/hi2';
import { useEffect, useState } from 'react';
import { bookingService } from '../../services/api';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const navItems = [
        { name: 'Explore', path: '/events', icon: HiCalendarDays },
        { name: 'My Bookings', path: '/my-bookings', icon: HiTicket },
        { name: 'My Profile', path: '/profile', icon: HiHome },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            <aside
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`
                    glass flex flex-col fixed inset-y-0 left-0 z-30 
                    transition-all duration-300 ease-out
                    ${isHovered ? 'w-64' : 'w-[72px]'}
                    md:translate-x-0 md:sticky md:top-14 md:h-[calc(100vh-3.5rem)]
                    ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full'}
                    ${isHovered || isOpen ? 'sidebar-hovered' : ''}
                `}
            >
                {/* Mobile Header */}
                <div className="md:hidden h-14 flex items-center justify-center border-b border-white/10">
                    <span className="text-xl font-bold text-gradient">
                        <HiSparkles className="inline-block mr-2" />
                        {(isHovered || isOpen) && 'EventMate'}
                    </span>
                </div>

                {/* Navigation Items */}
                <nav className="p-3 space-y-2 flex-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => onClose && onClose()}
                            className={({ isActive }) => `
                                nav-item group
                                ${isActive ? 'active' : ''}
                            `}
                        >
                            <item.icon className="nav-icon w-6 h-6 flex-shrink-0" />
                            <span className={`nav-label font-medium text-sm ${isHovered || isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'} transition-all duration-300`}>
                                {item.name}
                            </span>
                        </NavLink>
                    ))}
                </nav>

                {/* Event Reminder Section - Always Visible */}
                <div className="p-3 border-t border-white/10 mb-14 md:mb-0">
                    <SidebarTimeline isExpanded={isHovered || isOpen} />
                </div>
            </aside>
        </>
    );
};

interface TimelineProps {
    isExpanded: boolean;
}

const SidebarTimeline = ({ isExpanded }: TimelineProps) => {
    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const bookings = await bookingService.getMyBookings();
                const now = new Date();
                const upcoming = bookings
                    .filter((b: any) => b.eventStartDate && new Date(b.eventStartDate) > now)
                    .sort((a: any, b: any) => new Date(a.eventStartDate).getTime() - new Date(b.eventStartDate).getTime())
                    .slice(0, 3); // Show up to 3 upcoming events

                setUpcomingEvents(upcoming);
            } catch (err) {
                console.error("Failed to fetch upcoming events", err);
            }
        };
        fetchBookings();
    }, []);

    if (upcomingEvents.length === 0) {
        return (
            <div className={`text-center transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                <HiClock className="w-6 h-6 mx-auto text-violet-400/50 mb-2" />
                <p className="text-xs text-slate-400">No upcoming events</p>
            </div>
        );
    }

    const nextEvent = upcomingEvents[0];
    const daysUntil = Math.ceil((new Date(nextEvent.eventStartDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    // Collapsed view - just icon with glow
    if (!isExpanded) {
        return (
            <div
                onClick={() => navigate(`/events/${nextEvent.eventId}`)}
                className="flex justify-center cursor-pointer group"
                title={`${nextEvent.eventTitle} - ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}
            >
                <div className="relative">
                    <HiClock className="w-6 h-6 text-violet-400 group-hover:text-violet-300 transition-colors" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white notification-badge">
                        {daysUntil}
                    </span>
                </div>
            </div>
        );
    }

    // Expanded view - full card
    return (
        <div className="event-reminder-card">
            <div className="flex items-center gap-2 mb-3">
                <HiClock className="w-4 h-4 text-violet-400" />
                <h4 className="text-xs font-semibold text-violet-300 uppercase tracking-wider">
                    Upcoming
                </h4>
            </div>

            <div className="space-y-3">
                {upcomingEvents.map((event, idx) => {
                    const days = Math.ceil((new Date(event.eventStartDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return (
                        <div
                            key={event.bookingId || idx}
                            onClick={() => navigate(`/events/${event.eventId}`)}
                            className="group cursor-pointer"
                        >
                            <p className="text-sm font-medium text-slate-200 group-hover:text-violet-300 transition-colors truncate">
                                {event.eventTitle}
                            </p>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-blue-500"></span>
                                {days === 0 ? 'Today!' : days === 1 ? 'Tomorrow!' : `${days} days`}
                            </p>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={() => navigate('/my-bookings')}
                className="mt-3 w-full text-xs bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white px-3 py-2 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-violet-500/25"
            >
                View All Bookings
            </button>
        </div>
    );
};

export default Sidebar;
