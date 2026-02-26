import { HiCalendar, HiMapPin, HiUserGroup, HiArrowRight } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import type { Event } from '../../types/events';
import { getImageUrl } from '../../config';

interface EventCardProps {
    event: Event;
    onEnroll?: (eventId: number) => void;
}

const EventCard = ({ event, onEnroll }: EventCardProps) => {
    const navigate = useNavigate();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Check if event has ended
    const isEnded = event.endDate && new Date(event.endDate) < new Date();

    return (
        <div className={`glass-card overflow-hidden group flex flex-col h-full card-lift cursor-pointer ${isEnded ? 'opacity-75' : ''}`}>
            {/* Image Header */}
            <div className="h-48 relative">
                {event.bannerImageId ? (
                    <img
                        src={getImageUrl(event.bannerImageId)}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1000';
                        }}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-500" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                    <span className={`
                        absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm
                        ${event.eventType === 'ONSITE' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : ''}
                        ${event.eventType === 'REMOTE' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : ''}
                        ${event.eventType === 'HYBRID' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : ''}
                        ${!['ONSITE', 'REMOTE', 'HYBRID'].includes(event.eventType) ? 'bg-white/20 text-white border border-white/30' : ''}
                    `}>
                        {event.eventType}
                    </span>

                    {event.isFeatured && (
                        <span className="absolute top-4 left-4 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm animate-pulse">
                            Featured
                        </span>
                    )}

                    {isEnded && (
                        <span className="absolute top-12 left-4 bg-slate-500/30 text-slate-200 border border-slate-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                            Ended
                        </span>
                    )}

                    <h3 className="text-white font-bold text-xl leading-tight">{event.title}</h3>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-grow">{event.description}</p>

                <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                        <HiCalendar className="w-4 h-4 text-violet-400" />
                        <span>{formatDate(event.startDate)}</span>
                    </div>
                    {(event.venueName || event.city) && (
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <HiMapPin className="w-4 h-4 text-pink-400" />
                            <span>{event.venueName}{event.city ? `, ${event.city}` : ''}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                        <HiUserGroup className="w-4 h-4 text-cyan-400" />
                        <span>{event.availableSeats} / {event.totalCapacity} seats left</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/10">
                    <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.eventId}`); }}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 rounded-xl transition-all"
                    >
                        View Details
                    </button>
                    {onEnroll && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onEnroll(event.eventId); }}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 rounded-xl transition-all flex items-center justify-center gap-1 group/btn shadow-lg shadow-violet-500/25"
                        >
                            Enroll
                            <HiArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventCard;
