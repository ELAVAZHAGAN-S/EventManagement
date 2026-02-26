package org.eventmate.server.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "events")
@Data
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_id")
    private Long eventId;

    @Column(name = "organizer_id")
    private Long organizerId;

    @ManyToOne
    @JoinColumn(name = "venue_id")
    private Venue venue;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "tagline")
    private String tagline;

    @Column(name = "rules_and_guidelines", columnDefinition = "TEXT")
    private String rulesAndGuidelines;

    @Column(name = "rewards_and_prizes", columnDefinition = "TEXT")
    private String rewardsAndPrizes;

    @Column(name = "deliverables_required", columnDefinition = "TEXT")
    private String deliverablesRequired;

    @Column(name = "judging_criteria", columnDefinition = "TEXT")
    private String judgingCriteria;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_format")
    private EventFormat eventFormat;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type")
    private EventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private EventStatus status = EventStatus.PLANNED;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "registration_open_date")
    private LocalDateTime registrationOpenDate;

    @Column(name = "registration_close_date")
    private LocalDateTime registrationCloseDate;

    @Column(name = "results_date")
    private LocalDateTime resultsDate;

    @Column(name = "target_audience", columnDefinition = "TEXT")
    private String targetAudience;

    @Column(name = "event_goals", columnDefinition = "TEXT")
    private String eventGoals;

    @Column(name = "total_capacity")
    private Integer totalCapacity;

    @Column(name = "meeting_url")
    private String meetingUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "custom_details", columnDefinition = "JSON")
    private Map<String, Object> customDetails;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "faqs", columnDefinition = "JSON")
    private java.util.List<Map<String, Object>> faqs;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "agenda", columnDefinition = "JSON")
    private java.util.List<Map<String, Object>> agenda;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "contact_info", columnDefinition = "JSON")
    private Map<String, Object> contactInfo;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "delete_reason", columnDefinition = "TEXT")
    private String deleteReason;

    @Column(name = "banner_image_id")
    private String bannerImageId;

    @Enumerated(EnumType.STRING)
    @Column(name = "ticket_type")
    private TicketType ticketType;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<TicketTier> ticketTiers = new java.util.ArrayList<>();

    @Column(name = "ticket_price")
    private Double ticketPrice = 0.0;

    @Column(name = "allow_coupon")
    private Boolean allowCoupon = false;

    @Column(name = "coupon_code")
    private String couponCode;

    @Column(name = "discount_percentage")
    private Double discountPercentage = 0.0;

    @Column(name = "allow_membership_discount")
    private Boolean allowMembershipDiscount = false;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Guest> guests = new java.util.ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        if (isFeatured == null) {
            isFeatured = false;
        }
        if (allowCoupon == null) {
            allowCoupon = false;
        }
        if (allowMembershipDiscount == null) {
            allowMembershipDiscount = false;
        }
        if (ticketPrice == null) {
            ticketPrice = 0.0;
        }
        if (discountPercentage == null) {
            discountPercentage = 0.0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void addGuest(Guest guest) {
        guests.add(guest);
        guest.setEvent(this);
    }

    public void removeGuest(Guest guest) {
        guests.remove(guest);
        guest.setEvent(null);
    }

    public void addTicketTier(TicketTier tier) {
        ticketTiers.add(tier);
        tier.setEvent(this);
    }

    public void removeTicketTier(TicketTier tier) {
        ticketTiers.remove(tier);
        tier.setEvent(null);
    }

    public enum TicketType {
        FREE,
        PAID
    }

    public enum EventFormat {
        ONSITE,
        REMOTE,
        HYBRID
    }

    public enum EventType {
        AWARD_FUNCTION,
        CONFERENCE,
        WEBINAR,
        TRADE_SHOW,
        WORKSHOP,
        CONCERT,
        MEETING,
        SPORTING_EVENT,
        PRODUCT_LAUNCH,
        FUNDRAISER
    }

    public enum EventStatus {
        PLANNED,
        DRAFT,
        ACTIVE,
        COMPLETED,
        CANCELLED
    }
}