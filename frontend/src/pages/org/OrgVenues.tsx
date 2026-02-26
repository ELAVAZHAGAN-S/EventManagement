import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orgService } from '../../services/api';
import { eventService } from '../../services/eventService';
import type { Venue } from '../../types/events';
import { Plus, MapPin, Building, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const OrgVenues = () => {
    const [activeTab, setActiveTab] = useState<'venues' | 'bookings'>('venues');
    const [venues, setVenues] = useState<Venue[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingModal, setBookingModal] = useState<{ isOpen: boolean; venue: Venue | null }>({
        isOpen: false,
        venue: null
    });
    const [bookingData, setBookingData] = useState({
        bookingDate: '',
        startTime: '',
        endTime: '',
        eventId: ''
    });
    const [plannedEvents, setPlannedEvents] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Always load venues to map IDs to Names
            const venuesData = await orgService.getAllVenues();
            const plannedEventsData = await orgService.getMyPlannedEvents();
            setVenues(venuesData);
            setPlannedEvents(plannedEventsData);

            if (activeTab === 'bookings') {
                const bookingsData = await orgService.getMyVenueBookings();

                // Enrich bookings with Event details
                const enrichedBookings = await Promise.all(bookingsData.map(async (b: any) => {
                    let eventTitle = 'Unknown Event';
                    try {
                        if (b.eventId) {
                            const event = await eventService.getEventById(b.eventId);
                            eventTitle = event.title;
                        }
                    } catch (e) { console.error('Error fetching event', e); }

                    // Use strict comparison or conversion to ensure match
                    const venue = venuesData.find((v: Venue) => Number(v.venueId) === Number(b.venueId));

                    return {
                        ...b,
                        eventTitle,
                        venueName: venue ? venue.name : `Venue #${b.venueId}`
                    };
                }));
                setBookings(enrichedBookings);
            }
        } catch (error) {
            console.error('Failed to load data', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // Helper to format date safely (handles ISO string or array)
    const formatDate = (dateVal: any) => {
        if (!dateVal) return 'Invalid Date';
        if (Array.isArray(dateVal)) {
            // [yyyy, mm, dd, hh, mm, ss]
            const [y, m, d, h, min, s] = dateVal;
            return new Date(y, m - 1, d, h, min, s || 0).toLocaleString();
        }
        return new Date(dateVal).toLocaleString();
    };

    const handleCancelBooking = async (bookingId: number) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await orgService.cancelVenueBooking(bookingId);
            toast.success('Booking cancelled successfully');
            loadData();
        } catch (error) {
            console.error('Failed to cancel booking', error);
            toast.error('Failed to cancel booking');
        }
    };

    const handleBookClick = (venue: Venue) => {
        setBookingModal({ isOpen: true, venue });
    };

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!bookingData.eventId) {
            toast.error('Please select an Event');
            return;
        }

        try {
            // Construct LocalDateTime strings (YYYY-MM-DDTHH:mm:ss) to preserve local time
            // and avoid timezone shifting that might cause @Future validation to fail
            const startDateTime = `${bookingData.bookingDate}T${bookingData.startTime}:00`;
            const endDateTime = `${bookingData.bookingDate}T${bookingData.endTime}:00`;

            await orgService.bookVenue({
                venueId: bookingModal.venue?.venueId,
                eventId: parseInt(bookingData.eventId),
                bookingStartDate: startDateTime,
                bookingEndDate: endDateTime
            });
            toast.success('Venue booked successfully!');
            setBookingModal({ isOpen: false, venue: null });
            setActiveTab('bookings'); // Switch to bookings tab
        } catch (error: any) {
            console.error('Booking failed', error);
            toast.error(error.response?.data?.message || 'Failed to book venue');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-100">Venue Management</h1>
                <Link
                    to="/org/venues/new"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-lg hover:shadow-blue-500/25"
                >
                    <Plus size={20} />
                    Add Venue
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
                <button
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'venues' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                    onClick={() => setActiveTab('venues')}
                >
                    All Venues
                </button>
                <button
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'bookings' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                    onClick={() => setActiveTab('bookings')}
                >
                    My Bookings
                </button>
            </div>

            {activeTab === 'venues' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {venues.map((venue) => (
                        <div key={venue.venueId} className="glass-card p-6 hover:bg-white/5 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
                                    <Building size={24} />
                                </div>
                                <button
                                    onClick={() => navigate(`/org/venues/edit/${venue.venueId}`)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <Edit size={18} />
                                </button>
                            </div>

                            <h3 className="text-lg font-bold text-slate-100 mb-1">{venue.name}</h3>
                            <div className="flex items-start gap-2 text-sm text-slate-400 mb-4 h-10">
                                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                                <span>{venue.address}, {venue.city}, {venue.state}</span>
                            </div>

                            <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-500">Capacity</p>
                                    <p className="font-medium text-slate-200">{venue.capacity}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Status</p>
                                    <p className={`font-medium ${!venue.isBooked ? 'text-green-400' : 'text-red-400'}`}>
                                        {!venue.isBooked ? 'Available' : 'Booked'}
                                    </p>
                                </div>
                            </div>

                            {/* Book Button - Mockup for now, could be a modal */}
                            <div className="mt-4 pt-2">
                                <button
                                    className="w-full py-2 bg-white/5 text-blue-400 font-medium rounded hover:bg-white/10 transition"
                                    onClick={() => handleBookClick(venue)}
                                >
                                    Book This Venue
                                </button>
                            </div>
                        </div>
                    ))}
                    {venues.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-400 glass-card">
                            No venues found.
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div key={booking.bookingId} className="glass-card p-6 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-100">{booking.venueName}</h3>
                                <div className="text-sm text-slate-400 mt-1">
                                    {formatDate(booking.bookingStartDate)} - {formatDate(booking.bookingEndDate)}
                                </div>
                                <div className="text-sm text-slate-400">
                                    Event: <span className="text-blue-400 font-medium">{booking.eventTitle || 'Not Assigned'}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleCancelBooking(booking.bookingId)}
                                className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg font-medium transition-colors"
                            >
                                Cancel Booking
                            </button>
                        </div>
                    ))}
                    {bookings.length === 0 && (
                        <div className="py-12 text-center text-slate-400 glass-card">
                            You have no active venue bookings.
                        </div>
                    )}
                </div>
            )}
            {/* Booking Modal */}
            {bookingModal.isOpen && bookingModal.venue && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-slate-100 mb-4">Book {bookingModal.venue.name}</h2>
                        <form onSubmit={handleBookingSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Select Event (Planned)</label>
                                {plannedEvents.length > 0 ? (
                                    <select
                                        required
                                        className="glass-input w-full"
                                        value={bookingData.eventId}
                                        onChange={(e) => setBookingData({ ...bookingData, eventId: e.target.value })}
                                    >
                                        <option value="">-- Choose Event --</option>
                                        {plannedEvents.map((event: any) => (
                                            <option key={event.eventId} value={event.eventId}>
                                                {event.title}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="text-sm text-yellow-500 bg-yellow-500/10 p-2 rounded">
                                        No planned events. <Link to="/org/events/new" className="underline hover:text-yellow-400">Create one first</Link>.
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    {/* Intentionally left blank for Date label if using loop, below is specific */}
                                    Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    className="glass-input w-full"
                                    value={bookingData.bookingDate}
                                    onChange={(e) => setBookingData({ ...bookingData, bookingDate: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        required
                                        className="glass-input w-full"
                                        value={bookingData.startTime}
                                        onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">End Time</label>
                                    <input
                                        type="time"
                                        required
                                        className="glass-input w-full"
                                        value={bookingData.endTime}
                                        onChange={(e) => setBookingData({ ...bookingData, endTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setBookingModal({ ...bookingModal, isOpen: false })}
                                    className="flex-1 py-2 text-slate-400 hover:bg-white/10 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Confirm Booking
                                </button>
                            </div>


                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrgVenues;
