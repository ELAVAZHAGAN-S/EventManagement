import { useState, useEffect, useRef } from 'react';
import AttendeeLayout from '../components/layout/AttendeeLayout';
import CategoryTiles from '../components/home/CategoryTiles';
import FeaturedCarousel from '../components/home/FeaturedCarousel';
import MyActivitySection from '../components/home/MyActivitySection';
import EventCard from '../components/ui/EventCard';
import { HiSparkles, HiMagnifyingGlass, HiFunnel } from 'react-icons/hi2';
import { eventService } from '../services/api';
import type { Event } from '../types/events';
import { useSearchParams, useNavigate } from 'react-router-dom';

const AttendeeHome = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const eventsSectionRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        fetchEvents();
        const typeFromUrl = searchParams.get("type");
        if (typeFromUrl) {
            setSelectedType(typeFromUrl);
            setTimeout(() => {
                eventsSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 100);
        }
    }, [searchParams]);

    const fetchEvents = async () => {
        try {
            const data = await eventService.getAllEvents();
            setEvents(data);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEvents = events.filter(event => {
        const matchesSearch = !searchKeyword ||
            event.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchKeyword.toLowerCase());
        const matchesType = !selectedType || event.eventType === selectedType;
        return matchesSearch && matchesType;
    });

    return (
        <AttendeeLayout>
            <div className="max-w-7xl mx-auto">
                <div className="text-center py-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-amber-200 mb-3">
                        Enjoy the Events
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">
                        Discover amazing events tailored to your interests
                    </p>
                </div>

                <CategoryTiles />

                <div className="py-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-linear-to-b from-amber-200 to-amber-100 rounded-full" />
                        <h2 className="text-xl font-bold text-white">Featured</h2>
                    </div>
                    <FeaturedCarousel />
                </div>

                <MyActivitySection />

                <div ref={eventsSectionRef} className="py-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-6 bg-linear-to-b from-amber-200 to-amber-100 rounded-full" />
                            <h2 className="text-xl font-bold text-white">All Events</h2>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search events..."
                                    className="glass-input w-full pl-10"
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <HiFunnel className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <select
                                    className="glass-input pl-10 pr-8 appearance-none cursor-pointer"
                                    value={selectedType}
                                    onChange={(e) => {
                                        setSelectedType(e.target.value);
                                        navigate(`/events?type=${e.target.value}`);
                                    }}
                                >
                                    <option value="ALL_TYPE">All Types</option>
                                    <option value="WEBINAR">Webinar</option>
                                    <option value="CONFERENCE">Conference</option>
                                    <option value="WORKSHOP">Workshop</option>
                                    <option value="AWARD_FUNCTION">Award Function</option>
                                    <option value="CONCERT">Concert</option>
                                    <option value="MEETING">Meeting</option>
                                    <option value="TRADE_SHOW">Trade Show</option>
                                    <option value="SPORTING_EVENT">Sporting Event</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-200"></div>
                        </div>
                    ) : filteredEvents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredEvents.map((event) => (
                                <EventCard key={event.eventId} event={event} />
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card p-12 text-center">
                            <HiSparkles className="w-12 h-12 mx-auto text-amber-200/50 mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">No Events Found</h3>
                            <p className="text-slate-500">
                                {searchKeyword || selectedType
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'Check back soon for new events!'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AttendeeLayout>
    );
};

export default AttendeeHome;
