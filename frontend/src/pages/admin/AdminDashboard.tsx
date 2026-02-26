import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    HiCalendar,
    HiUserGroup,
    HiSparkles,
    HiStar,
    HiArrowTrendingUp,
    HiChartBar
} from 'react-icons/hi2';
import { adminService } from '../../services/api';

interface DashboardStats {
    totalEvents: number;
    totalUsers: number;
    totalOrgs: number;
    totalBookings: number;
    totalRevenue: number;
    activeEvents: number;
    completedEvents: number;
}

const AdminDashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminService.getAnalytics();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { label: 'Total Events', value: stats?.totalEvents || 0, icon: HiCalendar, color: 'violet' },
        { label: 'Active Events', value: stats?.activeEvents || 0, icon: HiSparkles, color: 'green' },
        { label: 'Total Users', value: stats?.totalUsers || 0, icon: HiUserGroup, color: 'blue' },
        { label: 'Organizations', value: stats?.totalOrgs || 0, icon: HiStar, color: 'pink' },
        { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: HiArrowTrendingUp, color: 'cyan' },
        { label: 'Completed', value: stats?.completedEvents || 0, icon: HiChartBar, color: 'amber' },
    ];

    const colorClasses: Record<string, string> = {
        violet: 'bg-violet-500/20 text-violet-400',
        green: 'bg-green-500/20 text-green-400',
        blue: 'bg-blue-500/20 text-blue-400',
        pink: 'bg-pink-500/20 text-pink-400',
        cyan: 'bg-cyan-500/20 text-cyan-400',
        amber: 'bg-amber-500/20 text-amber-400',
    };

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                    <HiSparkles className="w-6 h-6 text-violet-400" />
                    Admin Dashboard
                </h1>
                <p className="text-slate-400 mt-1">Welcome back! Here's an overview of your platform.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="glass-card p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                                    <h3 className="text-3xl font-bold text-slate-100 mt-2">{stat.value}</h3>
                                </div>
                                <div className={`p-3 rounded-xl ${colorClasses[stat.color]}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-bold text-slate-100 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link
                        to="/admin/events"
                        className="glass-card p-4 text-center hover:border-violet-500/50 transition-all group"
                    >
                        <HiCalendar className="w-8 h-8 mx-auto text-violet-400 group-hover:scale-110 transition-transform" />
                        <p className="text-slate-200 font-medium mt-2">Manage Events</p>
                        <p className="text-slate-500 text-sm">Feature or remove events</p>
                    </Link>
                    <Link
                        to="/admin/users"
                        className="glass-card p-4 text-center hover:border-violet-500/50 transition-all group"
                    >
                        <HiUserGroup className="w-8 h-8 mx-auto text-blue-400 group-hover:scale-110 transition-transform" />
                        <p className="text-slate-200 font-medium mt-2">Manage Users</p>
                        <p className="text-slate-500 text-sm">View and manage users</p>
                    </Link>
                    <Link
                        to="/admin/analytics"
                        className="glass-card p-4 text-center hover:border-violet-500/50 transition-all group"
                    >
                        <HiChartBar className="w-8 h-8 mx-auto text-cyan-400 group-hover:scale-110 transition-transform" />
                        <p className="text-slate-200 font-medium mt-2">Analytics</p>
                        <p className="text-slate-500 text-sm">View detailed reports</p>
                    </Link>
                    <Link
                        to="/admin/settings"
                        className="glass-card p-4 text-center hover:border-violet-500/50 transition-all group"
                    >
                        <HiStar className="w-8 h-8 mx-auto text-amber-400 group-hover:scale-110 transition-transform" />
                        <p className="text-slate-200 font-medium mt-2">Settings</p>
                        <p className="text-slate-500 text-sm">Platform configuration</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
