import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orgService } from '../../services/api';
import { HiPlus, HiSparkles } from 'react-icons/hi2';
import type { Event } from '../../types/events';

const OrgDashboard = () => {
    const [stats, setStats] = useState({
        totalEvents: 0,
        upcomingEvents: 0,
        totalAttendees: 0,
        activeBookings: 0
    });
    const [recentEvents, setRecentEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const events = await orgService.getMyEvents();
            const totalEvents = events.length;
            const upcomingEvents = events.filter((e: Event) => new Date(e.startDate) > new Date()).length;
            const totalAttendees = events.reduce((sum: number, e: Event) => sum + (e.totalCapacity - e.availableSeats), 0);

            setStats({
                totalEvents,
                upcomingEvents,
                totalAttendees,
                activeBookings: 0
            });
            setRecentEvents(events.slice(0, 3));
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 text-amber-200 border-amber-200">Loading...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                        <HiSparkles className="w-10 h-10 text-amber-200" />
                        Dashboard
                    </h1>
                    <p className="text-slate-400 mt-1">Welcome back, {user?.fullName || 'Organizer'}! Here's what's happening today.</p>
                </div>
                <Link
                    to="/org/events/new"
                    className="bg-amber-200! px-5 py-2 text-black! rounded-lg hover:bg-amber-100! flex items-center gap-2 transition-colors font-medium"
                >
                    <HiPlus className="w-5 h-5" />
                    Create Event
                </Link>
            </div>

            <div className="flex items-center justify-center gap-4">
                <div className="glass-card py-4 px-10 w-64">
                    <div className="flex flex-col justify-center items-center">
                        <h1 className="text-2xl font-bold text-slate-100 mt-2">{stats.totalEvents}</h1>
                        <p className="text-sm font-medium text-slate-400">Total Events</p>
                    </div>
                </div>

                <div className="glass-card py-4 px-10 w-64">
                    <div className="flex flex-col justify-center items-center">
                        <h1 className="text-2xl font-bold text-slate-100 mt-2">{stats.upcomingEvents}</h1>  
                        <p className="text-sm font-medium text-slate-400">Upcoming</p>                  
                    </div>
                </div>

                <div className="glass-card py-4 px-10 w-64">
                    <div className="flex flex-col justify-center items-center">
                        <h1 className="text-2xl font-bold text-slate-100 mt-2">{Number(stats.totalAttendees) || 0}</h1>
                        <p className="text-sm font-medium text-slate-400">Total Attendees</p>
                    </div>
                </div>

                <div className="glass-card py-4 px-10 w-64">
                    <div className="flex flex-col justify-center items-center">
                        <h1 className="text-2xl font-bold text-slate-100 mt-2">--</h1>
                        <p className="text-sm font-medium text-slate-400">Venues</p>
                    </div>
                </div>
            </div>

            <div className='px-10'>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-100">Recent Events</h2>
                    <Link to="/org/events" className="font-medium text-sm">
                        View All
                    </Link>
                </div>
                <div className="glass-card rounded-xl! overflow-hidden">
                    {recentEvents.length > 0 ? (
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-amber-200">
                                <tr>
                                    <th className="px-6 py-5 text-center text-xs font-medium text-black uppercase tracking-wider">Event Name</th>
                                    <th className="px-6 py-5 text-center text-xs font-medium text-black uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-5 text-center text-xs font-medium text-black uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-5 text-center text-xs font-medium text-black uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {recentEvents.map((event) => (
                                    <tr key={event.eventId} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-100">{event.title}</div>
                                            <div className="text-sm text-slate-500">{event.venueName || 'Remote'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-slate-400">
                                            {new Date(event.startDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-lg border
                                                ${event.eventType === 'ONSITE' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                                    event.eventType === 'REMOTE' ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' :
                                                        'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'}`}>
                                                {event.eventType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-slate-400">
                                            {new Date(event.endDate) > new Date() ? 'Upcoming' : 'Past'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-8 text-center text-slate-400">
                            No events found. Create your first event to get started!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrgDashboard;
