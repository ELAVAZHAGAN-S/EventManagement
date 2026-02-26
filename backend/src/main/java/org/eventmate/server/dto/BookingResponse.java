package org.eventmate.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingResponse {
    private Long bookingId;
    private Long eventId;
    private Long userId;
    private String userName; // From User entity or Booking attendeeName
    private String userEmail; // From User entity
    private Long ticketTypeId;
    private String ticketTypeName; // From TicketType or Tier
    private String ticketCode;
    private String groupCode;
    private String bookingType;
    private String status;
    private LocalDateTime bookingDate;

    // Attendee specific
    private String attendeeName;
    private String contactNumber;

    // Event Details
    private String eventTitle;
    private LocalDateTime eventStartDate;
    private String eventBannerImageId;
}
