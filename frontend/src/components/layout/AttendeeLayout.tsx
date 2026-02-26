import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface AttendeeLayoutProps {
    children: React.ReactNode;
}

const AttendeeLayout = ({ children }: AttendeeLayoutProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
            <div className="flex flex-1">
                <Sidebar
                    isOpen={isMobileMenuOpen}
                    onClose={() => setIsMobileMenuOpen(false)}
                />
                <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 overflow-x-hidden page-container">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AttendeeLayout;
