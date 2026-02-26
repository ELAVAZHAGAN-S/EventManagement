import api from './api';
import type { Event, TicketType, Booking } from '../types/events';

export const eventService = {
    // Get all events
    getAllEvents: async () => {
        const response = await api.get<Event[]>('/events');
        return response.data;
    },

    // Get upcoming events
    getUpcomingEvents: async () => {
        const response = await api.get<Event[]>('/events/upcoming');
        return response.data;
    },

    // Get single event details
    getEventById: async (id: number) => {
        const response = await api.get<Event>(`/events/${id}`);
        return response.data;
    },

    // Search events
    searchEvents: async (keyword: string) => {
        const response = await api.get<Event[]>(`/events/search`, {
            params: { keyword }
        });
        return response.data;
    },

    // Filter events
    filterEvents: async (type: string) => {
        const response = await api.get<Event[]>(`/events/filter`, {
            params: { type }
        });
        return response.data;
    },

    // Get ticket types for an event
    getTicketTypes: async (eventId: number) => {
        const response = await api.get<TicketType[]>(`/ticket-types/event/${eventId}`);
        return response.data;
    },

    // Enroll in event
    enroll: async (bookingData: { eventId: number; ticketTypeId: number; dietaryRestrictions?: string; accessibilityNeeds?: string; jobTitle?: string; companyName?: string }) => {
        const response = await api.post<Booking>('/bookings/enroll', bookingData);
        return response.data;
    },

    // Get my bookings
    getMyBookings: async () => {
        const response = await api.get<Booking[]>('/bookings/my-bookings');
        return response.data;
    },

    // Cancel booking
    cancelBooking: async (bookingId: number) => {
        const response = await api.delete(`/bookings/${bookingId}`);
        return response.data;
    },

    // Get booked seats for an event
    getBookedSeats: async (eventId: number) => {
        const response = await api.get<number[]>(`/bookings/event/${eventId}/seats`);
        return response.data;
    }
};
