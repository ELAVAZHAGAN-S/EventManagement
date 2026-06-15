import { HiCalendar, HiMapPin } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import type { Event } from '../../types/events';
import { getImageUrl } from '../../config';

interface EventCardProps {
    event: Event;
    onEnroll?: (eventId: number) => void;
}

const EventCard = ({ event }: EventCardProps) => {
    const navigate = useNavigate();

    const isEnded = event.endDate && new Date(event.endDate) < new Date();

    return (
        <div className={`glass-card hover:shadow-none! bg-linear-to-br! from-amber-100 via-amber-200 to-amber-300 overflow-hidden group flex flex-col h-full card-lift cursor-pointer ${isEnded ? 'opacity-75' : ''}`}>
            <div className="h-48 px-3 pt-3 relative">
                {event.bannerImageId ? (
                    <img
                        src={getImageUrl(event.bannerImageId)}
                        alt={event.title}
                        className="w-full h-full object-cover rounded-4xl"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1000';
                        }}
                    />
                ) : (
                    <div className="w-full h-full rounded-4xl bg-black" />
                )}

                <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <span className={`
                        absolute top-6 right-7 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm
                        ${event.eventType === 'ONSITE' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : ''}
                        ${event.eventType === 'REMOTE' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : ''}
                        ${event.eventType === 'HYBRID' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : ''}
                        ${!['ONSITE', 'REMOTE', 'HYBRID'].includes(event.eventType) ? 'bg-white/20 text-white border border-white/30' : ''}
                    `}>
                        {event.eventType}
                    </span>

                    {event.isFeatured && (
                        <span className="absolute top-6 left-7 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm animate-pulse">
                            Featured
                        </span>
                    )}

                    {isEnded && !event.isFeatured && (
                        <span className="absolute top-6 left-7 bg-slate-500/30 text-slate-200 border border-slate-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                            Ended
                        </span>
                    )}

                    {isEnded && event.isFeatured && (
                        <span className="absolute top-12 left-4 bg-slate-500/30 text-slate-200 border border-slate-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                            Ended
                        </span>
                    )}
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between px-4">
                    <h1 className="text-black text-sm mb-4 line-clamp-2 grow">{event.title}</h1>
                    <span className="text-gray-800 flex items-center justify-center text-sm">
                        <HiCalendar className="w-5 h-5 mr-1 text-gray-800" />
                        {new Date(event.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                </div>
                <p className="text-slate-800 px-4 text-sm line-clamp-2 grow">{event.description}</p>
                
                {(event.venueName || event.city) && (
                    <div className="flex items-center gap-2 text-sm text-slate-800">
                        <HiMapPin className="w-4 h-4 mt-4 text-pink-800" />
                        <span>{event.venueName}{event.city ? `, ${event.city}` : ''}</span>
                    </div>
                )}

                <div className="flex items-center gap-3 mt-4 pt-4 px-6 pb-1 border-t border-black/20">
                    <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.eventId}`); }}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-black border border-black bg-amber-50/70 hover:bg-white rounded-xl transition-colors"
                    >
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventCard;
