import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { HiChevronLeft, HiChevronRight, HiSparkles } from 'react-icons/hi2';
import { eventService } from '../../services/api';
import type { Event } from '../../types/events';
import { getImageUrl } from '../../config';

const AUTO_SCROLL_INTERVAL = 4000; // 4 seconds

const FeaturedCarousel = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [loading, setLoading] = useState(true);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Fetch featured events
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

    // Clear existing timer
    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // Start auto-scroll timer
    const startTimer = useCallback(() => {
        clearTimer();
        if (events.length > 1 && !isPaused) {
            timerRef.current = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % events.length);
            }, AUTO_SCROLL_INTERVAL);
        }
    }, [events.length, isPaused, clearTimer]);

    // Auto-scroll effect
    useEffect(() => {
        startTimer();
        return () => clearTimer();
    }, [startTimer, clearTimer]);

    // Go to previous slide
    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
        // Reset timer when manually navigating
        startTimer();
    };

    // Go to next slide
    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % events.length);
        // Reset timer when manually navigating
        startTimer();
    };

    // Go to specific slide
    const handleDotClick = (index: number) => {
        setCurrentIndex(index);
        // Reset timer when manually navigating
        startTimer();
    };

    // Pause/resume on hover
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
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500"></div>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="glass-card p-8 text-center">
                <HiSparkles className="w-12 h-12 mx-auto text-violet-400 mb-3" />
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
            {/* Carousel Container */}
            <div className="overflow-hidden rounded-2xl">
                <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {events.map((event) => (
                        <Link
                            key={event.eventId}
                            to={`/events/${event.eventId}`}
                            className="w-full flex-shrink-0"
                        >
                            <div className="relative h-72 md:h-96 overflow-hidden">
                                <img
                                    src={getImageUrl(event.bannerImageId ?? null) || ''}
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                                    <span className="inline-block px-3 py-1 bg-violet-500/80 text-white text-xs font-semibold rounded-full mb-3">
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

            {/* Progress Bar */}
            {events.length > 1 && !isPaused && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
                    <div
                        className="h-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all"
                        style={{
                            animation: `progressBar ${AUTO_SCROLL_INTERVAL}ms linear infinite`,
                        }}
                    />
                </div>
            )}

            {/* Navigation Arrows */}
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

            {/* Dots Indicator */}
            {events.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {events.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => { e.preventDefault(); handleDotClick(idx); }}
                            className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex
                                    ? 'bg-violet-500 w-6'
                                    : 'bg-white/50 hover:bg-white/80 w-2'
                                }`}
                        />
                    ))}
                </div>
            )}

            {/* CSS Animation for progress bar */}
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
