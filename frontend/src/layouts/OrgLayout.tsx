import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Calendar, MapPin, User, Sparkles, Ticket } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

const OrgLayout = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const navItems = [
        { name: 'Dashboard', path: '/org/dashboard', icon: LayoutDashboard },
        { name: 'My Events', path: '/org/events', icon: Calendar },
        { name: 'Coupons', path: '/org/coupons', icon: Ticket },
        { name: 'Venues', path: '/org/venues', icon: MapPin },
        { name: 'Profile', path: '/org/profile', icon: User },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <Navbar homeLink="/org/dashboard" onMenuClick={() => setIsMobileMenuOpen(true)} />

            <div className="flex flex-1">
                {/* Sidebar */}
                <aside
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className={`
                        glass fixed left-0 top-[55px] h-[calc(100%-55px)]
                        flex flex-col z-1
                        transition-all duration-300 ease-out
                        ${isHovered ? 'w-64 sidebar-hovered' : 'w-[72px]'}
                    `}
                >
                    {/* Mobile Header */}
                    <div className="md:hidden h-14 flex items-center justify-center border-b border-white/10">
                        <span className="text-xl font-bold text-gradient">
                            <Sparkles className="inline-block w-5 h-5 mr-2" />
                            {(isHovered || isMobileMenuOpen) && 'Organizer'}
                        </span>
                    </div>

                    {/* Navigation Items */}
                    <nav className="p-3 space-y-2 flex-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) => `
                                    nav-item group
                                    ${isActive ? 'active' : ''}
                                `}
                            >
                                <item.icon className="nav-icon w-6 h-6 shrink-0" />
                                <span className={`nav-label font-medium text-sm ${isHovered || isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'} transition-all duration-300`}>
                                    {item.name}
                                </span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Branding at Bottom */}
                    <div className={`p-4 border-t border-white/10 transition-all duration-300 ${isHovered || isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="text-center">
                            <p className="text-xs text-slate-500">EventMate</p>
                            <p className="text-[10px] text-slate-600">Organizer Portal</p>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-4 sm:p-6 overflow-x-hidden page-container transition-all duration-300 ease-out">
                    <div className="flex-1 w-[calc(100% - 100px)] z-0 ml-[75px]! p-6 overflow-x-hidden page-container">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default OrgLayout;
