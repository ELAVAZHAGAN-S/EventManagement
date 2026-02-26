package org.eventmate.server.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingRequest {
    @NotNull(message = "Event ID is required")
    private Long eventId;

    private Long ticketTypeId;

    private String dietaryRestrictions;
    private String accessibilityNeeds;
    private String jobTitle;
    private String companyName;

    @NotNull(message = "Attendee name is required")
    private String attendeeName;

    @NotNull(message = "Contact number is required")
    private String contactNumber;

    @NotNull(message = "Age is required")
    private Integer attendeeAge;

    private String bookingType; // SOLO or GROUP
    private String groupCode; // Optional, for joining a group OR creating one

    // For paid events (replacing/supplementing ticketTypeId if needed, but
    // keepingTicketTypeId for compatibility)
    // Actually, ticketTypeId usually refers to TicketType (Free/Paid), but we added
    // TicketTier entity.
    // We should probably rely on `ticketTierId` for Paid events.
    private Long ticketTierId; // Optional, for Paid events with tiers

    private Integer seatNumber; // For ONSITE events

    private java.util.List<String> invitedUsers; // List of emails or usernames to invite
}
