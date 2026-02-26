package org.eventmate.server.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "venues")
@Data
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "venue_id")
    private Long venueId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String country;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "number_of_floors")
    private Integer numberOfFloors;

    @Column(name = "floor_plan_url")
    private String floorPlanUrl;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "is_booked")
    private Boolean isBooked = false;

    @Column(name = "booked_by")
    private Long bookedBy;

    @Column(name = "booked_for_event_id")
    private Long bookedForEventId;

    @Column(name = "booking_start_date")
    private LocalDateTime bookingStartDate;

    @Column(name = "booking_end_date")
    private LocalDateTime bookingEndDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        if (isBooked == null) {
            isBooked = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}