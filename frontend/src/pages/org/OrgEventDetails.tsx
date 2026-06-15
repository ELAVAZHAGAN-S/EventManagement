import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orgService } from '../../services/api';
import type { Event, EventAttendee, EventFeedback } from '../../types/events';
import { ArrowLeft, Edit, Users, MessageSquare, FileText, Star, Calendar, MapPin } from 'lucide-react';
import { getImageUrl } from '../../config';

const OrgEventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | null>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'attendees' | 'feedback'>('details');
    const [loading, setLoading] = useState(true);
    const [attendees, setAttendees] = useState<EventAttendee[]>([]);
    const [feedback, setFeedback] = useState<EventFeedback[]>([]);
    const [rating, setRating] = useState<number>(0);

    useEffect(() => {
        if (id) {
            loadEventDetails();
        }
    }, [id]);

    const loadEventDetails = async () => {
        try {
            const data = await orgService.getEventDetails(id!);
            setEvent(data);
        } catch (error) {
            console.error('Failed to load event', error);
            navigate('/org/events');
        } finally {
            setLoading(false);
        }
    };

    const loadAttendees = async () => {
        try {
            const data = await orgService.getEventAttendees(id!);
            setAttendees(data);
        } catch (error) {
            console.error('Failed to load attendees', error);
        }
    };

    const loadFeedback = async () => {
        try {
            const data = await orgService.getEventFeedback(id!);
            const ratingData = await orgService.getEventRating(id!);
            setFeedback(data);
            setRating(ratingData);
        } catch (error) {
            console.error('Failed to load feedback', error);
        }
    };

    useEffect(() => {
        if (activeTab === 'attendees') loadAttendees();
        if (activeTab === 'feedback') loadFeedback();
    }, [activeTab]);

    if (loading || !event) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-slate-400 animate-pulse">Loading event details...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <button
                onClick={() => navigate('/org/events')}
                className="flex items-center gap-2 text-slate-400 hover:text-violet-400 transition-colors"
            >
                <ArrowLeft size={20} />
                Back to Events
            </button>

            <div className="relative border border-amber-200 w-full h-48 md:h-64 rounded-4xl overflow-hidden">
                <img
                    src={getImageUrl(event.bannerImageId || null) || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2670'}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    style={{backgroundBlendMode: "darken"}}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-end justify-between">
                        <div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-2 inline-block
                                ${event.eventFormat === 'ONSITE' ? 'bg-green-500/20 text-green-400 border border-green-500' :
                                    event.eventFormat === 'REMOTE' ? 'bg-blue-500/20 text-blue-400 border border-blue-500' :
                                        'bg-amber-200/20 text-amber-200 border border-amber-200'}`}>
                                {event.eventFormat}
                            </span>
                            <h1 className="text-3xl font-bold text-white mb-1">{event.title}</h1>
                            <div className="flex items-center gap-4 text-slate-300 text-sm">
                                <span className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {new Date(event.startDate).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin size={14} />
                                    {event.venueName || 'Remote'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(`/org/events/edit/${event.eventId}`)}
                            className="flex items-center gap-2 px-6 py-2 bg-amber-200 hover:bg-amber-100 text-black rounded-lg transition-colors shadow-lg"
                        >
                            <Edit size={18} />
                            Edit Event
                        </button>
                    </div>
                </div>
            </div>

            <div className="glass-card overflow-hidden min-h-[500px]">
                <div className="border-b border-white/10">
                    <nav className="flex items-center justify-center">
                        <TabButton
                            active={activeTab === 'details'}
                            onClick={() => setActiveTab('details')}
                            icon={<FileText size={16} />}
                        >
                            Details
                        </TabButton>
                        <TabButton
                            active={activeTab === 'attendees'}
                            onClick={() => setActiveTab('attendees')}
                            icon={<Users size={16} />}
                        >
                            Attendees ({attendees.length})
                        </TabButton>
                        <TabButton
                            active={activeTab === 'feedback'}
                            onClick={() => setActiveTab('feedback')}
                            icon={<MessageSquare size={16} />}
                        >
                            Feedback
                        </TabButton>
                    </nav>
                </div>
                <div className="p-6">
                    {activeTab === 'details' && <DetailsView event={event} />}
                    {activeTab === 'attendees' && <AttendeesView attendees={attendees} />}
                    {activeTab === 'feedback' && <FeedbackView feedback={feedback} rating={rating} />}
                </div>
            </div>
        </div>
    );
};

const TabButton = ({ active, children, onClick, icon }: any) => (
    <button
        onClick={onClick}
        className={`px-10 pt-6 pb-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${active
            ? 'border-amber-200 text-amber-200 bg-amber-200/10'
            : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
    >
        {icon}
        {children}
    </button>
);

const DetailsView = ({ event }: { event: Event }) => (
    <div className="space-y-6 px-10 py-4">
        <div className="glass-card bg-white/5 py-6 px-10 rounded-xl">
            <h3 className="text-lg font-bold text-slate-100 mb-3 flex items-center gap-2">
                <FileText size={18} className="text-amber-200" />
                Description
            </h3>
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{event.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoCard label="Target Audience" value={event.targetAudience || 'Not specified'} />
            <InfoCard label="Event Goals" value={event.eventGoals || 'Not specified'} />
            <InfoCard label="Start Date" value={new Date(event.startDate).toLocaleString()} />
            <InfoCard label="End Date" value={new Date(event.endDate).toLocaleString()} />
            <InfoCard
                label="Capacity"
                value={`${event.availableSeats} / ${event.totalCapacity} seats available`}
                highlight={event.availableSeats < 10}
            />
            {event.meetingUrl && (
                <div className="glass-card bg-white/5 p-4 rounded-xl">
                    <h4 className="text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Meeting URL</h4>
                    <a
                        href={event.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-violet-400 hover:text-violet-300 text-sm font-medium hover:underline break-all"
                    >
                        {event.meetingUrl}
                    </a>
                </div>
            )}
        </div>
    </div>
);

const InfoCard = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
    <div className="glass-card bg-white/5 py-4 px-10 rounded-xl">
        <h4 className="text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">{label}</h4>
        <p className={`text-sm font-medium ${highlight ? 'text-amber-400' : 'text-slate-100'}`}>{value}</p>
    </div>
);

const AttendeesView = ({ attendees }: { attendees: EventAttendee[] }) => (
    <div className='px-10'>
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-200/20 text-amber-200 border rounded-lg">
                <Users size={20} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-100">Registered Attendees</h3>
                <p className="text-sm text-slate-400">{attendees.length} total registrations</p>
            </div>
        </div>

        <div className="glass-card bg-white/5 rounded-xl! overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-amber-200 border-b border-white/10">
                            <th className="px-6 py-4 text-center text-xs font-medium text-black uppercase tracking-wide">Name</th>
                            <th className="px-6 py-4 text-center text-xs font-medium text-black uppercase tracking-wide">Email</th>
                            <th className="px-6 py-4 text-center text-xs font-medium text-black uppercase tracking-wide">Contact</th>
                            <th className="px-6 py-4 text-center text-xs font-medium text-black uppercase tracking-wide">Ticket</th>
                            <th className="px-6 py-4 text-center text-xs font-medium text-black uppercase tracking-wide">Code</th>
                            <th className="px-6 py-4 text-center text-xs font-medium text-black uppercase tracking-wide">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {attendees.map((attendee) => (
                            <tr key={attendee.bookingId} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-black text-xs font-bold">
                                            {(attendee.attendeeName || attendee.userName)?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium text-slate-100">
                                            {attendee.attendeeName || attendee.userName}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{attendee.userEmail}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{attendee.contactNumber || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{attendee.ticketTypeName}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <code className="text-xs bg-white/10 px-2 py-1 rounded text-violet-300 font-mono">
                                        {attendee.ticketCode}
                                    </code>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                        ${attendee.status === 'CONFIRMED'
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                        {attendee.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {attendees.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    No attendees yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

const FeedbackView = ({ feedback, rating }: { feedback: EventFeedback[], rating: number }) => (
    <div className='px-10'>
        <div className="flex items-center gap-4 mb-6">
            <div className="p-2 bg-amber-200/20 text-amber-200 rounded-lg">
                <MessageSquare size={20} />
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-100">Event Feedback</h3>
                <p className="text-sm text-slate-400">{feedback.length} reviews received</p>
            </div>
            <div className="flex items-center gap-2 bg-amber-200/10 border border-amber-200/30 px-4 py-2 rounded-xl">
                <Star className="text-amber-400" size={20} fill="currentColor" />
                <span className="text-amber-400 font-bold text-lg">
                    {rating > 0 ? rating.toFixed(1) : '-'}
                </span>
                <span className="text-slate-400 text-sm">/ 5</span>
            </div>
        </div>

        <div className="space-y-4">
            {feedback.map((item) => (
                <div key={item.feedbackId} className="glass-card bg-white/5 p-5 rounded-xl hover:bg-white/[0.07] transition-colors">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-black text-sm font-bold">
                                {item.userName?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div>
                                <p className="font-medium text-slate-100">{item.userName}</p>
                                <p className="text-xs text-slate-500">
                                    {new Date(item.submittedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                        <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={16}
                                    fill={star <= item.rating ? 'currentColor' : 'none'}
                                />
                            ))}
                        </div>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{item.comments}</p>
                </div>
            ))}
            {feedback.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    No feedback received yet.
                </div>
            )}
        </div>
    </div>
);

export default OrgEventDetails;
