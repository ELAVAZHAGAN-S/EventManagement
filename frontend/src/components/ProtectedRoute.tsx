import { Navigate, Outlet } from 'react-router-dom';
import type { UserRole } from '../types/auth';

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const userStr = localStorage.getItem('user');

    if (!userStr) {
        // Not logged in
        return <Navigate to="/login" replace />;
    }

    const user = JSON.parse(userStr);
    const userRole = user.role as UserRole;

    // specific check: if allowedRoles is provided, user must match
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Redirect based on their actuaL role
        if (userRole === 'ORGANIZATION') {
            return <Navigate to="/org/dashboard" replace />;
        } else if (userRole === 'USER') { // ATTENDEE
            return <Navigate to="/events" replace />;
        } else if (userRole === 'ADMIN') {
            return <Navigate to="/admin" replace />; // Assuming admin route exists or fallback
        } else {
            return <Navigate to="/" replace />;
        }
    }

    // Authorized
    return <Outlet />;
};

export default ProtectedRoute;
