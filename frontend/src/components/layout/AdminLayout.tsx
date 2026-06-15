import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    HiHome,
    HiCalendar,
    HiUserGroup,
    HiChartBar,
    HiArrowRightOnRectangle,
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
        <div className="min-h-screen bg-(--bg-primary) flex flex-col">
            <Navbar homeLink="/admin" />
            <div className="flex flex-1">
                <aside
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className={`
                        glass fixed left-0 top-0 h-full
                        flex flex-col z-1 border-transparent! border-r-amber-100!
                        transition-all duration-300 ease-out
                        ${isHovered ? 'w-64 sidebar-hovered' : 'w-[72px]'}
                    `}
                >
                    
                    <nav className="flex-1 mt-[55px] p-3 space-y-2">
                        {adminNavItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.exact}
                                    className={({ isActive }) => `
                                    nav-item group text-amber-50
                                    ${isActive ? 'active' : ''}
                                `}
                                >
                                    <Icon className="nav-icon w-6 h-6 shrink-0" />
                                    <span className={`nav-label font-medium text-sm whitespace-nowrap transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0 ml-3' : 'opacity-0 -translate-x-2 ml-0'}`}>
                                        {item.label}
                                    </span>
                                </NavLink>
                            );
                        })}
                    </nav>

                    <div className="p-3 border-t border-white/10">
                        <button
                            onClick={handleLogout}
                            className="nav-item w-full text-slate-400! hover:text-white! hover:bg-red-500!"
                        >
                            <HiArrowRightOnRectangle className="nav-icon w-6 h-6 shrink-0" />
                            <span className={`nav-label font-medium text-sm whitespace-nowrap transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                                Logout
                            </span>
                        </button>
                    </div>
                </aside>
                <main className="flex-1 w-[calc(100% - 100px)] z-0 ml-[75px]! p-6 overflow-x-hidden page-container">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
