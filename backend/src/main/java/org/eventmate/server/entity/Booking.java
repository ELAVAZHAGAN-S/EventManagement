package org.eventmate.server.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "event_id")
    private Long eventId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "ticket_type_id")
    private Long ticketTypeId;

    @Column(name = "booking_date")
    private LocalDateTime bookingDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private BookingStatus status = BookingStatus.CONFIRMED;

    @Column(name = "dietary_restrictions", columnDefinition = "TEXT")
    private String dietaryRestrictions;

    @Column(name = "accessibility_needs", columnDefinition = "TEXT")
    private String accessibilityNeeds;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "checkin_status")
    private Boolean checkinStatus = false;

    @Column(name = "checkin_time")
    private LocalDateTime checkinTime;

    @Column(name = "contact_number")
    private String contactNumber;

    @Column(name = "attendee_name")
    private String attendeeName;

    @Column(name = "attendee_age")
    private Integer attendeeAge;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_type")
    private BookingType bookingType;

    @Column(name = "group_code")
    private String groupCode;

    @Column(name = "ticket_code")
    private String ticketCode;

    @Column(name = "seat_number")
    private Integer seatNumber;

    @PrePersist
    public void prePersist() {
        if (bookingDate == null) {
            bookingDate = LocalDateTime.now();
        }
        if (checkinStatus == null) {
            checkinStatus = false;
        }
    }

    public enum BookingStatus {
        CONFIRMED,
        WAITLISTED,
        CANCELLED
    }

    public enum BookingType {
        SOLO,
        GROUP
    }
}