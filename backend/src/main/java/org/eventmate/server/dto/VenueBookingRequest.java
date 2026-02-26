package org.eventmate.server.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class VenueBookingRequest {
    @NotNull(message = "Venue ID is required")
    private Long venueId;
    
    @NotNull(message = "Event ID is required")
    private Long eventId;
    
    @NotNull(message = "Booking start date is required")
    @Future(message = "Booking start date must be in the future")
    private LocalDateTime bookingStartDate;
    
    @NotNull(message = "Booking end date is required")
    @Future(message = "Booking end date must be in the future")
    private LocalDateTime bookingEndDate;
}
