package org.eventmate.server.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.eventmate.server.entity.Event;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class EventRequest {
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;

    private String tagline;

    private Event.EventFormat eventFormat;
    private Event.EventType eventType; // Category

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime registrationOpenDate;
    private LocalDateTime registrationCloseDate;
    private LocalDateTime resultsDate;

    @Size(max = 255, message = "Target audience cannot exceed 255 characters")
    private String targetAudience;

    @Size(max = 500, message = "Event goals cannot exceed 500 characters")
    private String eventGoals;

    private String rulesAndGuidelines;
    private String rewardsAndPrizes;
    private String deliverablesRequired;
    private String judgingCriteria;

    private Integer totalCapacity;

    private Long venueId;

    @Pattern(regexp = "^$|^https?://.*$", message = "Meeting URL must start with http:// or https://")
    private String meetingUrl;

    private Event.EventStatus status;

    // JSON Fields
    private Map<String, Object> customDetails;
    private java.util.List<Map<String, Object>> faqs;
    private java.util.List<Map<String, Object>> agenda;
    private Map<String, Object> contactInfo;

    private String bannerImageId;
    private Event.TicketType ticketType;
    private java.util.List<TicketTierRequest> ticketTiers;
    private Double ticketPrice;
    private Boolean allowCoupon;
    private String couponCode;
    private Double discountPercentage;
    private Boolean allowMembershipDiscount;

    private java.util.List<GuestRequest> guests;
}
