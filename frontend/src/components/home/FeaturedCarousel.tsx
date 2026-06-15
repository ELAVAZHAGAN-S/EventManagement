import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { HiChevronLeft, HiChevronRight, HiSparkles } from 'react-icons/hi2';
import { eventService } from '../../services/api';
import type { Event } from '../../types/events';
import { getImageUrl } from '../../config';

const AUTO_SCROLL_INTERVAL = 4000;

const FeaturedCarousel = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [loading, setLoading] = useState(true);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const data = await eventService.getFeaturedEvents();
                setEvents(data);
            } catch (error) {
                console.error('Failed to fetch featured events:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const startTimer = useCallback(() => {
        clearTimer();
        if (events.length > 1 && !isPaused) {
            timerRef.current = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % events.length);
            }, AUTO_SCROLL_INTERVAL);
        }
    }, [events.length, isPaused, clearTimer]);

    useEffect(() => {
        startTimer();
        return () => clearTimer();
    }, [startTimer, clearTimer]);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
        startTimer();
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % events.length);
        startTimer();
    };

    const handleDotClick = (index: number) => {
        setCurrentIndex(index);
        startTimer();
    };

    const handleMouseEnter = () => {
        setIsPaused(true);
        clearTimer();
    };

    const handleMouseLeave = () => {
        setIsPaused(false);
        startTimer();
    };

    if (loading) {
        return (
            <div className="glass-card h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-100"></div>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="glass-card p-8 text-center">
                <HiSparkles className="w-12 h-12 mx-auto text-amber-100 mb-3" />
                <p className="text-slate-400">No featured events yet</p>
            </div>
        );
    }

    return (
        <div
            className="relative group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="overflow-hidden rounded-2xl">
                <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {events.map((event) => (
                        <Link
                            key={event.eventId}
                            to={`/events/${event.eventId}`}
                            className="w-full shrink-0"
                        >
                            <div className="relative h-72 md:h-96 overflow-hidden">
                                <img
                                    src={getImageUrl(event.bannerImageId ?? null) || ''}
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                                    <span className="inline-block px-3 py-1 bg-amber-200/80 text-black text-xs font-semibold rounded-full mb-3">
                                        {event.eventType?.replace('_', ' ') || 'EVENT'}
                                    </span>
                                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2">
                                        {event.title}
                                    </h3>
                                    <p className="text-slate-300 text-sm line-clamp-1">
                                        {event.tagline || new Date(event.startDate).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric', year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {events.length > 1 && !isPaused && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
                    <div
                        className="h-full bg-linear-to-r from-amber-500 to-orange-500 transition-all"
                        style={{
                            animation: `progressBar ${AUTO_SCROLL_INTERVAL}ms linear infinite`,
                        }}
                    />
                </div>
            )}

            {events.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.preventDefault(); handlePrev(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass 
                            flex items-center justify-center text-white opacity-0 group-hover:opacity-100 
                            transition-opacity hover:bg-white/20 z-10"
                    >
                        <HiChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); handleNext(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass 
                            flex items-center justify-center text-white opacity-0 group-hover:opacity-100 
                            transition-opacity hover:bg-white/20 z-10"
                    >
                        <HiChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}

            {events.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {events.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => { e.preventDefault(); handleDotClick(idx); }}
                            className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex
                                    ? 'bg-amber-100 w-6'
                                    : 'bg-white/50 hover:bg-white/80 w-2'
                                }`}
                        />
                    ))}
                </div>
            )}

            <style>{`
                @keyframes progressBar {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default FeaturedCarousel;
