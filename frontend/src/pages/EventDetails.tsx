import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { HiCalendar, HiMapPin, HiArrowLeft, HiCheckBadge } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import AttendeeLayout from '../components/layout/AttendeeLayout';
import { eventService } from '../services/eventService';
import { bookingService } from '../services/api';
import EnrollmentModal from './attendee/EnrollmentModal';
import FeedbackSection from '../components/FeedbackSection';
import type { Event, TicketType } from '../types/events';
import { getImageUrl } from '../config';

const EventDetails = () => {
    const { id } = useParams<{ id: string }>();
    // Check for group invite param
    const [searchParams] = useSearchParams();
    const groupCodeParam = searchParams.get('group');

    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | null>(null);
    const [tickets, setTickets] = useState<TicketType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                // Fetch event details including custom fields logic (if any)
                // Note: using existing eventService.getEventById
                const eventData = await eventService.getEventById(Number(id));
                // If the event has tiers, fetch them, else fallback to ticket types (legacy)
                // For now, assuming backend returns consolidated 'tickets' or frontend adapts.
                // If using new 'ticketTiers', we might need to fetch them if not in eventData.
                let ticketData: any[] = [];
                if (eventData.ticketTiers && eventData.ticketTiers.length > 0) {
                    ticketData = eventData.ticketTiers;
                } else {
                    try {
                        ticketData = await eventService.getTicketTypes(Number(id));
                    } catch (e) { /* ignore */ }
                }

                setEvent(eventData);
                setTickets(ticketData);

                // Check if user is already enrolled
                try {
                    const enrollmentCheck = await bookingService.checkEnrollment(Number(id));
                    setIsEnrolled(enrollmentCheck.isEnrolled);
                } catch (e) {
                    // User might not be logged in, ignore
                }
            } catch (error) {
                console.error("Failed to load event details", error);
                toast.error("Event not found");
                navigate('/events');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, navigate]);

    if (loading) return <AttendeeLayout><div className="p-10 text-center">Loading details...</div></AttendeeLayout>;
    if (!event) return <AttendeeLayout><div className="p-10 text-center">Event not found</div></AttendeeLayout>;

    return (
        <AttendeeLayout>
            <button
                onClick={() => navigate('/events')}
                className="mb-6 flex items-center gap-2 text-slate-400 hover:text-violet-400 transition-colors"
            >
                <HiArrowLeft className="w-5 h-5" /> Back to Events
            </button>

            {/* Hero / Banner Section */}
            <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-8 shadow-lg">
                <img
                    src={getImageUrl(event.bannerImageId ? event.bannerImageId : null) || "/placeholder-event.jpg"}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2670'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                    <div className="text-white">
                        <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold tracking-wide uppercase mb-3 inline-block">
                            {event.eventType}
                        </span>
                        <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
                        {event.tagline && <p className="text-lg text-gray-200">{event.tagline}</p>}
                    </div>
                </div>
            </div>

            {/* Countdown Timer */}
            <div className="glass-card p-6 mb-8 flex flex-col md:flex-row items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-slate-100 mb-1">Event Starts In</h3>
                    <p className="text-slate-400 text-sm">Mark your calendar!</p>
                </div>
                <div className="flex gap-4 mt-4 md:mt-0 text-center">
                    <Countdown targetDate={event.startDate} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Key Info Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 glass-card">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-500/20 text-violet-400 rounded-lg">
                                <HiCalendar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 font-medium">Date & Time</p>
                                <p className="font-bold text-slate-100 text-sm">{new Date(event.startDate).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-pink-500/20 text-pink-400 rounded-lg">
                                <HiMapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 font-medium">Location</p>
                                <p className="font-bold text-slate-100 text-sm">
                                    {event.eventFormat === 'REMOTE' ? 'Online Event' : (event.venue?.name || event.venueName || 'Venue TBD')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg">
                                <HiCalendar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 font-medium">Registration</p>
                                <p className="font-bold text-slate-100 text-sm">
                                    {event.registrationOpenDate ? new Date(event.registrationOpenDate).toLocaleDateString() : 'Now'} - {event.registrationCloseDate ? new Date(event.registrationCloseDate).toLocaleDateString() : 'TBD'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-8 space-y-8">

                        {/* Guests Section */}
                        {event.guests && event.guests.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold text-slate-100 mb-6 border-b border-white/10 pb-2">Guests & Speakers</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {event.guests.map((guest: any, idx: number) => (
                                        <div key={guest.id || idx} className="glass-card overflow-hidden flex flex-col">
                                            <div className="h-24 bg-gradient-to-r from-violet-600 to-blue-600"></div>
                                            <div className="px-6 -mt-12 text-center flex-1 flex flex-col pb-6">
                                                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-md mb-3 bg-white">
                                                    <img
                                                        src={guest.photo || 'https://via.placeholder.com/150?text=Guest'}
                                                        alt={guest.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <h4 className="font-bold text-slate-100 text-lg mb-1">{guest.name}</h4>
                                                <p className="text-sm text-violet-400 font-medium mb-3">{guest.role}</p>
                                                {guest.bio && <p className="text-center text-slate-400 text-sm line-clamp-3">{guest.bio}</p>}
                                                {guest.linkedinProfile && (
                                                    <a href={guest.linkedinProfile} target="_blank" rel="noreferrer" className="mt-auto pt-4 text-violet-400 hover:text-violet-300 text-sm font-medium">
                                                        View Profile
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-xl font-bold text-slate-100 mb-3 border-b border-white/10 pb-2">About The Event</h3>
                            <p className="text-slate-300 leading-relaxed whitespace-pre-line">{event.description}</p>
                        </div>

                        {/* Dynamic Custom Sections based on available data */}
                        {event.eventGoals && (
                            <div>
                                <h3 className="text-xl font-bold text-slate-100 mb-3 border-b border-white/10 pb-2">Event Goals</h3>
                                <p className="text-slate-300 leading-relaxed whitespace-pre-line">{event.eventGoals}</p>
                            </div>
                        )}

                        {event.rulesAndGuidelines && (
                            <div>
                                <h3 className="text-xl font-bold text-slate-100 mb-3 border-b border-white/10 pb-2">Rules & Guidelines</h3>
                                <div className="bg-red-500/10 p-6 rounded-xl border border-red-500/30 text-slate-300 leading-relaxed whitespace-pre-line">
                                    {event.rulesAndGuidelines}
                                </div>
                            </div>
                        )}

                        {event.judgingCriteria && (
                            <div>
                                <h3 className="text-xl font-bold text-slate-100 mb-3 border-b border-white/10 pb-2">Judging Criteria</h3>
                                <p className="text-slate-300 leading-relaxed whitespace-pre-line">{event.judgingCriteria}</p>
                            </div>
                        )}

                        {event.rewardsAndPrizes && (
                            <div>
                                <h3 className="text-xl font-bold text-slate-100 mb-3 border-b border-white/10 pb-2">Rewards & Prizes</h3>
                                <div className="bg-yellow-500/10 p-6 rounded-xl border border-yellow-500/30 text-slate-300 leading-relaxed whitespace-pre-line">
                                    {event.rewardsAndPrizes}
                                </div>
                            </div>
                        )}

                        {event.deliverablesRequired && (
                            <div>
                                <h3 className="text-xl font-bold text-slate-100 mb-3 border-b border-white/10 pb-2">Deliverables Required</h3>
                                <p className="text-slate-300 leading-relaxed whitespace-pre-line">{event.deliverablesRequired}</p>
                            </div>
                        )}

                        {event.agenda && (
                            <div>
                                <h3 className="text-xl font-bold text-slate-100 mb-3 border-b border-white/10 pb-2">Agenda</h3>
                                <div className="bg-white/5 p-4 rounded-lg overflow-x-auto">
                                    <pre className="font-sans text-slate-300 whitespace-pre-wrap text-sm">{typeof event.agenda === 'string' ? event.agenda : JSON.stringify(event.agenda, null, 2)}</pre>
                                </div>
                            </div>
                        )}

                        {event.faqs && (
                            <div>
                                <h3 className="text-xl font-bold text-slate-100 mb-3 border-b border-white/10 pb-2">FAQs</h3>
                                <div className="space-y-4">
                                    <pre className="font-sans text-slate-300 whitespace-pre-wrap text-sm">{typeof event.faqs === 'string' ? event.faqs : JSON.stringify(event.faqs, null, 2)}</pre>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Feedback Section */}
                    <FeedbackSection eventId={event.eventId} startDate={event.startDate} isEnrolled={isEnrolled} />
                </div>

                {/* Sidebar / Booking Card */}
                <div className="lg:col-span-1">
                    <div className="glass-card p-6 sticky top-24">
                        {(() => {
                            const now = new Date();
                            const eventEndDate = event.endDate ? new Date(event.endDate) : null;
                            const regOpenDate = event.registrationOpenDate ? new Date(event.registrationOpenDate) : null;
                            const regCloseDate = event.registrationCloseDate ? new Date(event.registrationCloseDate) : null;

                            // Check if event has ended
                            if (eventEndDate && now > eventEndDate) {
                                return (
                                    <div className="text-center">
                                        <div className="w-full py-4 text-lg bg-slate-500/20 border border-slate-500/40 rounded-xl flex items-center justify-center gap-2 text-slate-400 font-bold">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Event Ended
                                        </div>
                                        <p className="text-sm text-slate-500 mt-3">This event concluded on {eventEndDate.toLocaleDateString()}</p>
                                    </div>
                                );
                            }

                            // Check if registration hasn't started yet
                            if (regOpenDate && now < regOpenDate) {
                                return (
                                    <div className="text-center">
                                        <p className="text-slate-400 font-medium mb-1">Registration</p>
                                        {event.ticketType === 'FREE' ? (
                                            <h2 className="text-3xl font-bold text-green-400 mb-4">Free Entry</h2>
                                        ) : (
                                            <h2 className="text-3xl font-bold text-gradient mb-4">
                                                ₹{event.ticketPrice || (tickets.length > 0 ? Math.min(...tickets.map((t: any) => t.price || 0)) : '0')}
                                            </h2>
                                        )}
                                        <div className="w-full py-4 text-lg bg-yellow-500/20 border border-yellow-500/40 rounded-xl flex items-center justify-center gap-2 text-yellow-400 font-bold">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Registration Opens Soon
                                        </div>
                                        <p className="text-sm text-slate-400 mt-3">Opens on {regOpenDate.toLocaleString()}</p>
                                    </div>
                                );
                            }

                            // Check if registration has closed
                            if (regCloseDate && now > regCloseDate) {
                                return (
                                    <div className="text-center">
                                        <div className="w-full py-4 text-lg bg-red-500/20 border border-red-500/40 rounded-xl flex items-center justify-center gap-2 text-red-400 font-bold">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Registration Closed
                                        </div>
                                        <p className="text-sm text-slate-500 mt-3">Registration closed on {regCloseDate.toLocaleDateString()}</p>
                                    </div>
                                );
                            }

                            // Registration is open - show normal enrollment flow
                            return (
                                <>
                                    <div className="text-center mb-6">
                                        <p className="text-slate-400 font-medium mb-1">Registration</p>
                                        {event.ticketType === 'FREE' ? (
                                            <h2 className="text-3xl font-bold text-green-400">Free Entry</h2>
                                        ) : (
                                            <h2 className="text-3xl font-bold text-gradient">
                                                ₹{event.ticketPrice || (tickets.length > 0 ? Math.min(...tickets.map((t: any) => t.price || 0)) : '0')}
                                            </h2>
                                        )}
                                    </div>

                                    {groupCodeParam && (
                                        <div className="mb-4 p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg text-center">
                                            <p className="text-sm text-violet-300 font-bold">You are invited to join a group!</p>
                                            <code className="text-xs bg-white/10 px-2 py-1 rounded border border-white/20 mt-1 inline-block text-slate-200">{groupCodeParam}</code>
                                        </div>
                                    )}

                                    {isEnrolled ? (
                                        <div className="w-full py-4 text-lg bg-green-500/20 border border-green-500/40 rounded-xl flex items-center justify-center gap-2 text-green-400 font-bold">
                                            <HiCheckBadge className="w-6 h-6" />
                                            Already Enrolled
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowEnrollModal(true)}
                                            className="btn-glow w-full py-4 text-lg"
                                        >
                                            Enroll Now
                                        </button>
                                    )}

                                    <p className="text-xs text-center text-slate-500 mt-4 px-4">
                                        By enrolling, you agree to our Terms of Service and Privacy Policy.
                                    </p>
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* Enrollment Modal */}
            {
                showEnrollModal && (
                    <EnrollmentModal
                        event={event}
                        ticketTypes={tickets}
                        onClose={() => setShowEnrollModal(false)}
                        onSuccess={() => {
                            setShowEnrollModal(false);
                            // Optional: Navigate to bookings or stay
                        }}
                        initialGroupCode={groupCodeParam || undefined}
                    />
                )
            }
        </AttendeeLayout >
    );
};

// Helper Component: Countdown Timer
const Countdown = ({ targetDate }: { targetDate: string }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft: any = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    const timerComponents: React.ReactNode[] = [];

    Object.keys(timeLeft).forEach((interval) => {
        if (!timeLeft[interval as keyof typeof timeLeft]) {
            return;
        }
        timerComponents.push(
            <div key={interval} className="flex flex-col items-center mx-2">
                <span className="text-2xl font-bold">{timeLeft[interval as keyof typeof timeLeft]}</span>
                <span className="text-xs uppercase opacity-75">{interval}</span>
            </div>
        );
    });

    return (
        <div className="flex justify-center text-center">
            {timerComponents.length ? timerComponents : <span>Event Started!</span>}
        </div>
    );
};

export default EventDetails;
