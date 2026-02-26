import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiTicket, HiCalendar, HiArrowRight } from 'react-icons/hi2';
import { bookingService } from '../../services/api';
import { getImageUrl } from '../../config';

interface Booking {
    bookingId: number;
    eventId: number;
    eventTitle: string;
    eventBannerImageId: string | null;
    eventStartDate: string;
    status: string;
    createdAt: string;
}

const MyActivitySection = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('registrations');

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const data = await bookingService.getMyBookings();
                    setBookings(data);
                }
            } catch (error) {
                console.error('Failed to fetch bookings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const tabs = [
        { id: 'registrations', label: 'Registrations' },
        { id: 'watchlist', label: 'Watchlist' },
        { id: 'recent', label: 'Recently Viewed' },
    ];

    const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');

    if (!localStorage.getItem('token')) {
        return null; // Don't show for non-logged in users
    }

    return (
        <div className="py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-blue-500 rounded-full" />
                    <h2 className="text-xl font-bold text-slate-100">My Activity</h2>
                </div>
                <Link
                    to="/my-bookings"
                    className="flex items-center gap-1 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors group"
                >
                    View All
                    <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.id
                            ? 'bg-white/10 text-white border border-white/20'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="glass-card p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto"></div>
                </div>
            ) : activeTab === 'registrations' ? (
                <div className="overflow-x-auto pb-4">
                    <div className="flex gap-4">
                        {confirmedBookings.length > 0 ? (
                            confirmedBookings.slice(0, 5).map((booking) => (
                                <Link
                                    key={booking.bookingId}
                                    to={`/events/${booking.eventId}`}
                                    className="flex-shrink-0 w-72 glass-card p-4 flex items-center gap-4 
                                        hover:border-violet-500/50 transition-all group"
                                >
                                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                                        <img
                                            src={getImageUrl(booking.eventBannerImageId)}
                                            alt={booking.eventTitle}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-slate-100 truncate group-hover:text-violet-300 transition-colors">
                                            {booking.eventTitle}
                                        </h4>
                                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                            <HiCalendar className="w-3 h-3" />
                                            {new Date(booking.eventStartDate).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="glass-card p-8 w-full text-center">
                                <HiTicket className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                                <p className="text-slate-400">No registrations yet</p>
                                <Link to="/home" className="text-violet-400 text-sm hover:text-violet-300 mt-2 inline-block">
                                    Browse events →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="glass-card p-8 text-center text-slate-400">
                    <p>Coming soon</p>
                </div>
            )}
        </div>
    );
};

export default MyActivitySection;
