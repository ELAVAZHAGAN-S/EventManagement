import { NavLink, useNavigate } from 'react-router-dom';
import {
    HiHome,
    HiCalendarDays,
    HiTicket,
    HiClock
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
                        glass fixed left-0 top-[55px] h-[calc(100%-55px)]
                        flex flex-col z-1 border-transparent! border-r-amber-100!
                        transition-all duration-300 ease-out
                        ${isHovered ? 'w-64 sidebar-hovered' : 'w-[72px]'}
                    `}
            >
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
                            <item.icon className="nav-icon w-6 h-6 shrink-0" />
                            <span className={`nav-label font-medium text-sm ${isHovered || isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'} transition-all duration-300`}>
                                {item.name}
                            </span>
                        </NavLink>
                    ))}
                </nav>

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
                    .slice(0, 3);

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
                <HiClock className="w-6 h-6 mx-auto text-amber-100 mb-2" />
                <p className="text-xs text-slate-400">No upcoming events</p>
            </div>
        );
    }

    const nextEvent = upcomingEvents[0];
    const daysUntil = Math.ceil((new Date(nextEvent.eventStartDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    if (!isExpanded) {
        return (
            <div
                onClick={() => navigate(`/events/${nextEvent.eventId}`)}
                className="flex justify-center cursor-pointer group"
                title={`${nextEvent.eventTitle} - ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}
            >
                <div className="relative">
                    <HiClock className="w-6 h-6 text-amber-200 group-hover:text-amber-100 transition-colors" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-linear-to-r from-amber-100 to-amber-200 rounded-full text-[10px] font-bold flex items-center justify-center text-black notification-badge">
                        {daysUntil}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="event-reminder-card">
            <div className="flex items-center gap-2 mb-3">
                <HiClock className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
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
                            <p className="text-sm font-medium text-slate-200 group-hover:text-amber-300 transition-colors truncate">
                                {event.eventTitle}
                            </p>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-linear-to-r from-amber-100 to-amber-200"></span>
                                {days === 0 ? 'Today!' : days === 1 ? 'Tomorrow!' : `${days} days`}
                            </p>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={() => navigate('/my-bookings')}
                className="mt-3 w-full text-xs bg-linear-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white px-3 py-2 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-amber-500/25"
            >
                View All Bookings
            </button>
        </div>
    );
};

export default Sidebar;
