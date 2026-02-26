import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HiCalendar, HiMapPin, HiTicket, HiXMark } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import AttendeeLayout from '../components/layout/AttendeeLayout';
import { eventService } from '../services/eventService';
import type { Booking, Event, TicketType } from '../types/events';

interface BookingWithDetails extends Booking {
    eventDetails?: Event;
    ticketDetails?: TicketType;
}

const MyBookings = () => {
    const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const loadBookings = async () => {
        setLoading(true);
        try {
            const myBookings = await eventService.getMyBookings();

            const enrichedBookings = await Promise.all(
                myBookings.map(async (booking) => {
                    try {
                        const event = await eventService.getEventById(booking.eventId);
                        return { ...booking, eventDetails: event };
                    } catch (e) {
                        return booking;
                    }
                })
            );

            setBookings(enrichedBookings);
        } catch (error) {
            console.error("Failed to load bookings", error);
            toast.error("Could not load your bookings.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookings();
    }, []);

    const handleCancel = async (bookingId: number) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;

        try {
            await eventService.cancelBooking(bookingId);
            toast.success("Booking cancelled successfully");
            loadBookings();
        } catch (error: any) {
            console.error("Cancellation failed", error);
            toast.error(error.response?.data?.message || "Failed to cancel booking");
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return 'bg-green-500/20 text-green-300 border-green-500/30';
            case 'WAITLISTED':
                return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
            default:
                return 'bg-red-500/20 text-red-300 border-red-500/30';
        }
    };

    return (
        <AttendeeLayout>
            <h1 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                <HiTicket className="w-7 h-7 text-violet-400" />
                My Bookings
            </h1>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="glass-card h-32 shimmer"></div>)}
                </div>
            ) : bookings.length > 0 ? (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div
                            key={booking.bookingId}
                            className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 card-lift cursor-pointer"
                            onClick={() => booking.eventDetails && navigate(`/events/${booking.eventId}`)}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border ${getStatusStyles(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        Booking #{booking.bookingId}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-slate-100 mb-3">
                                    {booking.eventDetails?.title || `Event #${booking.eventId}`}
                                </h3>

                                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                                    {booking.eventDetails && (
                                        <>
                                            <div className="flex items-center gap-1.5">
                                                <HiCalendar className="text-violet-400" />
                                                <span>{formatDate(booking.eventDetails.startDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <HiMapPin className="text-pink-400" />
                                                <span>{booking.eventDetails.venueName || 'Virtual'}</span>
                                            </div>
                                        </>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                        <HiTicket className="text-cyan-400" />
                                        <span>Ticket #{booking.ticketTypeId}</span>
                                    </div>
                                </div>
                            </div>

                            {booking.status !== 'CANCELLED' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleCancel(booking.bookingId); }}
                                    className="px-4 py-2.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5"
                                >
                                    <HiXMark className="w-4 h-4" />
                                    Cancel
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 glass-card">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-violet-500/20">
                        <HiTicket className="w-8 h-8 text-violet-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-200">No bookings yet</h3>
                    <p className="text-slate-400 mb-6">Explore events and book your seat today!</p>
                    <button
                        onClick={() => navigate('/events')}
                        className="btn-glow px-6 py-2"
                    >
                        Browse Events
                    </button>
                </div>
            )}
        </AttendeeLayout>
    );
};

export default MyBookings;
