import { useState, useEffect } from 'react';
import AttendeeLayout from '../components/layout/AttendeeLayout';
import CategoryTiles from '../components/home/CategoryTiles';
import FeaturedCarousel from '../components/home/FeaturedCarousel';
import MyActivitySection from '../components/home/MyActivitySection';
import EventCard from '../components/ui/EventCard';
import { HiSparkles, HiMagnifyingGlass, HiFunnel } from 'react-icons/hi2';
import { eventService } from '../services/api';
import type { Event } from '../types/events';

const AttendeeHome = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedType, setSelectedType] = useState('');

    useEffect(() => {
        fetchEvents();
    }, []);

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

    // Filter events based on search and type
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
                {/* Hero Section */}
                <div className="text-center py-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-3">
                        Enjoy the Events
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">
                        Discover amazing events tailored to your interests
                    </p>
                </div>

                {/* Category Tiles */}
                <CategoryTiles />

                {/* Featured Carousel */}
                <div className="py-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-blue-500 rounded-full" />
                        <h2 className="text-xl font-bold text-slate-100">Featured</h2>
                    </div>
                    <FeaturedCarousel />
                </div>

                {/* My Activity - Only for logged-in users */}
                <MyActivitySection />

                {/* All Events Section */}
                <div className="py-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-blue-500 rounded-full" />
                            <h2 className="text-xl font-bold text-slate-100">All Events</h2>
                        </div>

                        {/* Search & Filter */}
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
                                    onChange={(e) => setSelectedType(e.target.value)}
                                >
                                    <option value="">All Types</option>
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

                    {/* Events Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
                        </div>
                    ) : filteredEvents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredEvents.map((event) => (
                                <EventCard key={event.eventId} event={event} />
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card p-12 text-center">
                            <HiSparkles className="w-12 h-12 mx-auto text-violet-400/50 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-300 mb-2">No Events Found</h3>
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
