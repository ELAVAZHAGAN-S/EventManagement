import { useEffect, useState } from 'react';
import {
    HiStar,
    HiTrash,
    HiMagnifyingGlass,
    HiFunnel,
    HiSparkles,
    HiEye
} from 'react-icons/hi2';
import { adminService } from '../../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../config';

interface Event {
    eventId: number;
    title: string;
    eventType: string;
    status: string;
    startDate: string;
    organizerId: number;
    bannerImageId: string | null;
    isFeatured: boolean;
    totalCapacity: number;
}

const AdminEventList = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; eventId: number | null; eventTitle: string }>({
        open: false,
        eventId: null,
        eventTitle: ''
    });
    const [deleteReason, setDeleteReason] = useState('');

    useEffect(() => {
        fetchEvents();
    }, [statusFilter]);

    const fetchEvents = async () => {
        try {
            const data = await adminService.getAllEvents(statusFilter || undefined);
            setEvents(data);
        } catch (error) {
            console.error('Failed to fetch events:', error);
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFeatured = async (eventId: number) => {
        try {
            await adminService.toggleFeatured(eventId);
            setEvents(prev => prev.map(e =>
                e.eventId === eventId ? { ...e, isFeatured: !e.isFeatured } : e
            ));
            toast.success('Featured status updated');
        } catch (error) {
            console.error('Failed to toggle featured:', error);
            toast.error('Failed to update featured status');
        }
    };

    const handleDeleteEvent = async () => {
        if (!deleteModal.eventId || !deleteReason.trim()) {
            toast.error('Please provide a reason for deletion');
            return;
        }

        try {
            await adminService.deleteEvent(deleteModal.eventId, deleteReason);
            setEvents(prev => prev.filter(e => e.eventId !== deleteModal.eventId));
            toast.success('Event deleted successfully');
            setDeleteModal({ open: false, eventId: null, eventTitle: '' });
            setDeleteReason('');
        } catch (error) {
            console.error('Failed to delete event:', error);
            toast.error('Failed to delete event');
        }
    };

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            ACTIVE: 'bg-green-500/20 text-green-300 border-green-500/30',
            PLANNED: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            COMPLETED: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
            CANCELLED: 'bg-red-500/20 text-red-300 border-red-500/30',
        };
        return styles[status] || styles.PLANNED;
    };

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                        <HiSparkles className="w-6 h-6 text-violet-400" />
                        Event Management
                    </h1>
                    <p className="text-slate-400 mt-1">Manage all events on the platform</p>
                </div>

                {/* Filters */}
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search events..."
                            className="glass-input w-full pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <HiFunnel className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <select
                            className="glass-input pl-10 pr-8 appearance-none"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="PLANNED">Planned</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Events Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Event</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Featured</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredEvents.map((event) => (
                                <tr key={event.eventId} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={getImageUrl(event.bannerImageId)}
                                                alt={event.title}
                                                className="w-12 h-12 rounded-lg object-cover"
                                            />
                                            <div>
                                                <p className="font-medium text-slate-100">{event.title}</p>
                                                <p className="text-xs text-slate-500">ID: {event.eventId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-300">
                                            {event.eventType?.replace('_', ' ') || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-400">
                                            {new Date(event.startDate).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric'
                                            })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-lg border ${getStatusBadge(event.status)}`}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleFeatured(event.eventId)}
                                            className={`p-2 rounded-lg transition-all ${event.isFeatured
                                                ? 'bg-amber-500/20 text-amber-400'
                                                : 'bg-white/5 text-slate-500 hover:text-amber-400'
                                                }`}
                                            title={event.isFeatured ? 'Remove from featured' : 'Add to featured'}
                                        >
                                            <HiStar className={`w-5 h-5 ${event.isFeatured ? 'fill-current' : ''}`} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/events/${event.eventId}`}
                                                className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-violet-400 transition-colors"
                                                title="View Event"
                                            >
                                                <HiEye className="w-5 h-5" />
                                            </Link>
                                            <button
                                                onClick={() => setDeleteModal({
                                                    open: true,
                                                    eventId: event.eventId,
                                                    eventTitle: event.title
                                                })}
                                                className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-red-400 transition-colors"
                                                title="Delete Event"
                                            >
                                                <HiTrash className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredEvents.length === 0 && (
                    <div className="p-12 text-center">
                        <HiSparkles className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-400">No events found</p>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="glass-card p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-bold text-slate-100 mb-2">Delete Event</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Are you sure you want to delete <strong className="text-slate-200">"{deleteModal.eventTitle}"</strong>?
                        </p>
                        <div className="mb-4">
                            <label className="text-sm font-medium text-slate-300 mb-2 block">
                                Reason for deletion <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={deleteReason}
                                onChange={(e) => setDeleteReason(e.target.value)}
                                className="glass-input w-full resize-none"
                                rows={3}
                                placeholder="Enter reason for deleting this event..."
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setDeleteModal({ open: false, eventId: null, eventTitle: '' });
                                    setDeleteReason('');
                                }}
                                className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteEvent}
                                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 
                                    hover:bg-red-500/30 transition-all"
                            >
                                Delete Event
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEventList;
