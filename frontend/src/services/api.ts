import axios from 'axios';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';
import { API_BASE_URL } from '../config';

// 1. Create the Axios Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor (The "Security Guard")
// Before sending ANY request, check if we have a token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Response Interceptor (The "Error Handler")
// If the backend says "Token Expired" (401), force logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Call Failed:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response && error.response.status === 401) {
      // Don't redirect if we are already trying to login/register, just let the component handle the error
      if (!error.config.url.includes('/auth/login') && !error.config.url.includes('/auth/register')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// 4. API Functions (The actual calls)
export const authService = {
  // Login
  login: async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    // Auto-save token on success
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      const user = {
        id: response.data.userId,
        email: response.data.email,
        fullName: response.data.fullName,
        role: response.data.role
      };
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  },

  // Register
  register: async (data: RegisterRequest) => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      const user = {
        id: response.data.userId,
        email: response.data.email,
        fullName: response.data.fullName,
        role: response.data.role
      };
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  },

  // Get Current User Profile (Test Endpoint)
  getCurrentUser: async () => {
    return api.get('/users/me');
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Forgot Password - Request OTP
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Verify OTP
  verifyOtp: async (email: string, otp: string) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  // Reset Password
  resetPassword: async (data: any) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  }
};

export const orgService = {
  // Events CRUD
  createEvent: async (data: any) => {
    const response = await api.post('/events', data);
    return response.data;
  },
  getMyEvents: async () => {
    const response = await api.get('/events/my-events');
    return response.data;
  },
  getMyPlannedEvents: async () => {
    const response = await api.get('/events/my-events');
    return response.data.filter((event: any) => event.status === 'PLANNED');
  },
  getEventDetails: async (id: string | number) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
  updateEvent: async (id: string | number, data: any) => {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  },
  deleteEvent: async (id: string | number) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  // Ticket Types CRUD
  createTicketType: async (data: any) => {
    const response = await api.post('/ticket-types', data);
    return response.data;
  },
  getTicketTypesByEvent: async (eventId: string | number) => {
    const response = await api.get(`/ticket-types/event/${eventId}`);
    return response.data;
  },
  updateTicketType: async (id: string | number, data: any) => {
    const response = await api.put(`/ticket-types/${id}`, data);
    return response.data;
  },
  deleteTicketType: async (id: string | number) => {
    const response = await api.delete(`/ticket-types/${id}`);
    return response.data;
  },

  // Venues CRUD
  createVenue: async (data: any) => {
    const response = await api.post('/venues', data);
    return response.data;
  },
  getAllVenues: async () => {
    const response = await api.get('/venues');
    return response.data;
  },
  getVenueDetails: async (id: string | number) => {
    const response = await api.get(`/venues/${id}`);
    return response.data;
  },
  searchVenues: async (filters: any) => {
    const response = await api.post('/venues/search', filters);
    return response.data;
  },
  updateVenue: async (id: string | number, data: any) => {
    const response = await api.put(`/venues/${id}`, data);
    return response.data;
  },
  bookVenue: async (data: any) => {
    const response = await api.post('/venues/book', data);
    return response.data;
  },
  getMyVenueBookings: async () => {
    const response = await api.get('/venues/my-bookings');
    return response.data;
  },
  cancelVenueBooking: async (id: string | number) => {
    const response = await api.delete(`/venues/bookings/${id}`);
    return response.data;
  },

  // Attendees & Feedback
  getEventAttendees: async (eventId: string | number) => {
    const response = await api.get(`/bookings/event/${eventId}`);
    return response.data;
  },
  getEventFeedback: async (eventId: string | number) => {
    const response = await api.get(`/feedback/event/${eventId}`);
    return response.data;
  },
  getEventRating: async (eventId: string | number) => {
    const response = await api.get(`/feedback/event/${eventId}/rating`);
    return response.data;
  },
};

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  markAsRead: async (id: number) => {
    await api.put(`/notifications/${id}/read`);
  }
};

export const bookingService = {
  getMyBookings: async () => {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },
  enroll: async (data: any) => {
    const response = await api.post('/bookings/enroll', data);
    return response.data;
  },
  getBookedSeats: async (eventId: string | number) => {
    const response = await api.get(`/bookings/event/${eventId}/seats`);
    return response.data;
  },
  checkEnrollment: async (eventId: string | number) => {
    const response = await api.get(`/bookings/event/${eventId}/check`);
    return response.data;
  }
};

export const feedbackService = {
  getPublicFeedback: async (eventId: string | number) => {
    const response = await api.get(`/feedback/event/${eventId}/public`);
    return response.data;
  },
  submitFeedback: async (data: { eventId: number; rating: number; comments: string }) => {
    const response = await api.post('/feedback', data);
    return response.data;
  },
  checkSubmitted: async (eventId: string | number) => {
    const response = await api.get(`/feedback/event/${eventId}/check`);
    return response.data;
  },
  getEventRating: async (eventId: string | number) => {
    const response = await api.get(`/feedback/event/${eventId}/rating`);
    return response.data;
  }
};

export const userService = {
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },
  updateProfile: async (data: any) => {
    const response = await api.put('/user/profile', data);
    return response.data;
  },
  searchUsers: async (query: string) => {
    const response = await api.get(`/user/search?query=${encodeURIComponent(query)}`);
    return response.data;
  }
};

export const fileService = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // Backend returns file ID, construct full URL
    const fileId = response.data;
    return `${api.defaults.baseURL}/files/${fileId}`;
  }
};

export const eventService = {
  // Public endpoints for attendee
  getEventById: async (id: string | number) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
  searchEvents: async (keyword: string) => {
    const response = await api.get(`/events/search?keyword=${encodeURIComponent(keyword)}`);
    return response.data;
  },
  filterByType: async (type: string) => {
    const response = await api.get(`/events/filter?type=${type}`);
    return response.data;
  },
  getUpcomingEvents: async () => {
    const response = await api.get('/events/upcoming');
    return response.data;
  },
  getAllEvents: async () => {
    const response = await api.get('/events/all');
    return response.data;
  },
  getFeaturedEvents: async () => {
    const response = await api.get('/events/featured');
    return response.data;
  }
};

export const adminService = {
  // Event Management
  getAllEvents: async (status?: string) => {
    const params = status ? `?status=${status}` : '';
    const response = await api.get(`/admin/events${params}`);
    return response.data;
  },
  getFeaturedEvents: async () => {
    const response = await api.get('/admin/events/featured');
    return response.data;
  },
  toggleFeatured: async (eventId: number) => {
    const response = await api.put(`/admin/events/${eventId}/toggle-featured`);
    return response.data;
  },
  deleteEvent: async (eventId: number, reason: string) => {
    const response = await api.delete(`/admin/events/${eventId}?reason=${encodeURIComponent(reason)}`);
    return response.data;
  },

  // Analytics
  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },

  // User Management
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  getUsersByRole: async (role: string) => {
    const response = await api.get(`/admin/users/role/${role}`);
    return response.data;
  },
  toggleUserStatus: async (userId: number) => {
    const response = await api.put(`/admin/users/${userId}/toggle-status`);
    return response.data;
  },
  deleteUser: async (userId: number) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  }
};

export default api;