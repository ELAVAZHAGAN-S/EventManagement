package org.eventmate.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class VenueBookingResponse {
    private Long bookingId;
    private Long venueId;
    private String venueName;
    private Long eventId;
    private Long bookedBy;
    private LocalDateTime bookingStartDate;
    private LocalDateTime bookingEndDate;
    private String status;
}
