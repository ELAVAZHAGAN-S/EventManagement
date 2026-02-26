import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import AttendeeHome from './pages/AttendeeHome';
import EventDetails from './pages/EventDetails';
import MyBookings from './pages/MyBookings';
import { Toaster } from 'react-hot-toast';
import AiSidebar from './components/AiSidebar';

// Org Imports
import OrgLayout from './layouts/OrgLayout';
import OrgDashboard from './pages/org/OrgDashboard';
import OrgEvents from './pages/org/OrgEvents';
import CreateEditEvent from './pages/org/CreateEditEvent';
import OrgEventDetails from './pages/org/OrgEventDetails';
import OrgVenues from './pages/org/OrgVenues';
import CreateEditVenue from './pages/org/CreateEditVenue';
import OrgProfile from './pages/org/OrgProfile';

// Admin Imports
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEventList from './pages/admin/AdminEventList';

const App = () => {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <AiSidebar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ATTENDEE ROUTES - Accessible by USER and ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']} />}>
          <Route path="/events" element={<AttendeeHome />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Dashboard />} />
          <Route path="/home" element={<AttendeeHome />} />
        </Route>

        {/* ORGANIZATION ROUTES - Accessible only by ORGANIZATION */}
        <Route element={<ProtectedRoute allowedRoles={['ORGANIZATION']} />}>
          <Route path="/org" element={<OrgLayout />}>
            <Route index element={<Navigate to="/org/dashboard" replace />} />
            <Route path="dashboard" element={<OrgDashboard />} />
            <Route path="events" element={<OrgEvents />} />
            <Route path="events/new" element={<CreateEditEvent />} />
            <Route path="events/:id" element={<OrgEventDetails />} />
            <Route path="events/edit/:id" element={<CreateEditEvent />} />
            <Route path="venues" element={<OrgVenues />} />
            <Route path="venues/new" element={<CreateEditVenue />} />
            <Route path="venues/edit/:id" element={<CreateEditVenue />} />
            <Route path="profile" element={<OrgProfile />} />
          </Route>
        </Route>

        {/* ADMIN ROUTES - Accessible only by ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="events" element={<AdminEventList />} />
            <Route path="users" element={<div className="p-8 text-center text-slate-400">User Management Coming Soon</div>} />
            <Route path="analytics" element={<div className="p-8 text-center text-slate-400">Analytics Coming Soon</div>} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;