import { Navigate, Outlet } from 'react-router-dom';
import type { UserRole } from '../types/auth';

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const userStr = localStorage.getItem('user');

    if (!userStr) {
        return <Navigate to="/login" replace />;
    }

    const user = JSON.parse(userStr);
    const userRole = user.role as UserRole;

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        if (userRole === 'ORGANIZATION') {
            return <Navigate to="/org/dashboard" replace />;
        } else if (userRole === 'USER') {
            return <Navigate to="/events" replace />;
        } else if (userRole === 'ADMIN') {
            return <Navigate to="/admin" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
