import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orgService } from '../../services/api';
import type { Event } from '../../types/events';
import { Plus, Search, Calendar, MapPin, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast'; // Assuming react-hot-toast is installed based on App.tsx

const OrgEvents = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadEvents();
    }, []);

    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = events.filter(e =>
            e.title.toLowerCase().includes(lowerTerm) ||
            e.description.toLowerCase().includes(lowerTerm)
        );
        setFilteredEvents(filtered);
    }, [searchTerm, events]);

    const loadEvents = async () => {
        try {
            const data = await orgService.getMyEvents();
            setEvents(data);
            setFilteredEvents(data);
        } catch (error: any) {
            console.error('Failed to load events', error);
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            return;
        }

        try {
            await orgService.deleteEvent(id);
            toast.success('Event deleted successfully');
            setEvents(events.filter(e => e.eventId !== id));
        } catch (error: any) {
            console.error('Failed to delete event', error);
            toast.error('Failed to delete event');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-200">Loading...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-100">My Events</h1>
                <Link
                    to="/org/events/new"
                    className="flex items-center gap-2 px-4 py-2 bg-amber-200 hover:bg-amber-100 text-black! rounded-lg transition-all shadow-lg"
                >
                    <Plus size={20} />
                    Create Event
                </Link>
            </div>

            <div className="glass-card py-4 px-6">
                <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="glass-input rounded-4xl! w-full px-14! py-2"
                    />
                </div>
            </div>

            <div className="grid gap-6">
                {filteredEvents.length === 0 ? (
                    <div className="text-center py-12 glass-card">
                        <p className="text-slate-400">No events found matching your criteria.</p>
                    </div>
                ) : (
                    filteredEvents.map((event) => (
                        <div key={event.eventId} className="glass-card py-8 px-12 hover:bg-white/5 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-bold text-slate-100">{event.title}</h3>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                            ${event.eventType === 'ONSITE' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                                event.eventType === 'REMOTE' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                                    'bg-purple-500/20 text-purple-300 border border-purple-500/30'}`}>
                                            {event.eventType}
                                        </span>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                            ${event.status === 'ACTIVE' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                                event.status === 'PLANNED' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                                    'bg-slate-500/20 text-slate-300 border border-slate-500/30'}`}>
                                            {event.status}
                                        </span>
                                    </div>
                                    <p className="text-slate-400 line-clamp-2">{event.description}</p>

                                    <div className="flex gap-6 text-sm text-slate-500 mt-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} />
                                            <span>
                                                {new Date(event.startDate).toLocaleDateString()} at {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} />
                                            <span>{event.venueName || 'Remote'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => navigate(`/org/events/${event.eventId}`)}
                                        className="px-3 py-1 text-amber-200 hover:border hover:bg-amber-200/10 rounded-md text-sm font-medium transition-colors"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => navigate(`/org/events/edit/${event.eventId}`)}
                                        className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/10 hover:border rounded-md transition-colors"
                                        title="Edit Event"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(event.eventId)}
                                        className="p-2 text-red-400 hover:bg-red-500/10 hover:border rounded-md transition-colors"
                                        title="Delete Event"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default OrgEvents;
