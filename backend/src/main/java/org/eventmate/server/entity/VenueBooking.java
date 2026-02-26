package org.eventmate.server.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "venue_bookings")
@Data
public class VenueBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "venue_id", nullable = false)
    private Long venueId;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "booked_by", nullable = false)
    private Long bookedBy;

    @Column(name = "booking_start_date", nullable = false)
    private LocalDateTime bookingStartDate;

    @Column(name = "booking_end_date", nullable = false)
    private LocalDateTime bookingEndDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.ACTIVE;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = BookingStatus.ACTIVE;
        }
    }

    public enum BookingStatus {
        ACTIVE,
        CANCELLED
    }
}