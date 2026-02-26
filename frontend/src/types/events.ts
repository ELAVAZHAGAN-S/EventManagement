export interface Event {
    eventId: number;
    title: string;
    description: string;
    eventType: 'ONSITE' | 'REMOTE' | 'HYBRID'; // This might actually be the EventType (Workshop etc), checking usage.
    eventFormat: 'ONSITE' | 'REMOTE' | 'HYBRID'; // Added this to match usage
    startDate: string;
    endDate: string;
    totalCapacity: number;
    availableSeats: number;
    venueName?: string;
    city?: string;
    state?: string;
    targetAudience?: string;
    eventGoals?: string;
    venueId?: number;
    venue?: Venue;
    meetingUrl?: string;
    status?: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    bannerImageId?: string;
    ticketType?: 'FREE' | 'PAID';
    ticketTiers?: any[]; // Using any[] for now or define TicketTier interface
    tagline?: string;
    customDetails?: any;
    contactInfo?: any;
    faqs?: any;
    agenda?: any;
    registrationOpenDate?: string;
    registrationCloseDate?: string;
    resultsDate?: string;
    guests?: Guest[];
    ticketPrice?: number;
    allowCoupon?: boolean;
    couponCode?: string;
    discountPercentage?: number;
    allowMembershipDiscount?: boolean;
    rulesAndGuidelines?: string;
    rewardsAndPrizes?: string;
    deliverablesRequired?: string;
    judgingCriteria?: string;
    isFeatured?: boolean;
    isEnrolled?: boolean;
}

export interface Guest {
    id?: number;
    name: string;
    role: string;
    photo?: string;
    bio?: string;
}

export interface TicketType {
    ticketTypeId: number;
    eventId: number;
    typeName: string;
    price: number;
    quantityAvailable: number;
    description: string;
}

export interface Venue {
    venueId: number;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    capacity: number;
    numberOfFloors: number;
    isBooked: boolean;
    floorPlanUrl?: string; // Added to match backend
    latitude?: number;      // Added to match backend
    longitude?: number;     // Added to match backend
}

export interface Booking {
    bookingId: number;
    userId: number;
    eventId: number;
    ticketTypeId: number;
    bookingDate: string;
    status: 'CONFIRMED' | 'CANCELLED' | 'WAITLISTED';
    checkinStatus?: boolean;
    attendeeName?: string;
    contactNumber?: string;
    attendeeAge?: number;
    bookingType?: 'SOLO' | 'GROUP';
    groupCode?: string;
    ticketCode?: string;
}

export interface SearchFilters {
    keyword?: string;
    eventType?: 'ONSITE' | 'REMOTE' | 'HYBRID';
    startDate?: string;
    endDate?: string;
    city?: string;
}

export interface VenueBooking {
    bookingId: number;
    venueId: number;
    venueName?: string; // Backend might not return name directly in validation response or list if using DTO
    eventId?: number;
    userId?: number;
    bookingStartDate: string;
    bookingEndDate: string;
    status?: 'ACTIVE' | 'CANCELLED';
}

export interface EventAttendee {
    bookingId: number;
    userId: number;
    userName: string;
    userEmail: string;
    eventId: number;
    ticketTypeId: number;
    ticketTypeName: string;
    bookingDate: string;
    status: 'CONFIRMED' | 'CANCELLED';
    dietaryRestrictions?: string;
    accessibilityNeeds?: string;
    jobTitle?: string;
    companyName?: string;
    attendeeName?: string;
    contactNumber?: string;
    ticketCode?: string;
}

export interface EventFeedback {
    feedbackId: number;
    userId: number;
    userName: string;
    eventId: number;
    rating: number;
    comments: string;
    submittedAt: string;
}
