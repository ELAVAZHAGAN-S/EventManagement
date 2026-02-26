import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    HiHome,
    HiCalendar,
    HiUserGroup,
    HiChartBar,
    HiArrowRightOnRectangle,
    HiSparkles
} from 'react-icons/hi2';
import { authService } from '../../services/api';
import Navbar from './Navbar';

const adminNavItems = [
    { path: '/admin', icon: HiHome, label: 'Dashboard', exact: true },
    { path: '/admin/events', icon: HiCalendar, label: 'Events' },
    { path: '/admin/users', icon: HiUserGroup, label: 'Users' },
    { path: '/admin/analytics', icon: HiChartBar, label: 'Analytics' },
];

const AdminLayout = () => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex">
            {/* Sidebar with hover expand */}
            <aside
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`
                    glass fixed left-0 top-0 h-full z-50 
                    flex flex-col border-r border-white/10
                    transition-all duration-300 ease-out
                    ${isHovered ? 'w-64' : 'w-[72px]'}
                `}
            >
                {/* Logo */}
                <div className="h-14 flex items-center justify-center border-b border-white/10 px-4">
                    <NavLink to="/admin" className="flex items-center gap-2 overflow-hidden">
                        <HiSparkles className="w-7 h-7 text-violet-500 flex-shrink-0" />
                        <span className={`text-lg font-bold text-gradient whitespace-nowrap transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0'}`}>
                            Admin Panel
                        </span>
                    </NavLink>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-2">
                    {adminNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.exact}
                                className={({ isActive }) => `
                                    nav-item group
                                    ${isActive ? 'active' : ''}
                                `}
                            >
                                <Icon className="nav-icon w-6 h-6 flex-shrink-0" />
                                <span className={`nav-label font-medium text-sm whitespace-nowrap transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                                    {item.label}
                                </span>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="nav-item w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                        <HiArrowRightOnRectangle className="nav-icon w-6 h-6 flex-shrink-0" />
                        <span className={`nav-label font-medium text-sm whitespace-nowrap transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                            Logout
                        </span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${isHovered ? 'ml-64' : 'ml-[72px]'}`}>
                <Navbar homeLink="/admin" />
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
