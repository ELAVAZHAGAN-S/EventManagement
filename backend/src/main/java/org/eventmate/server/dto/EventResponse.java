package org.eventmate.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.eventmate.server.entity.Event;
import org.eventmate.server.entity.Venue;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class EventResponse {
    private Long eventId;
    private String title;
    private String description;
    private Event.EventType eventType;
    private Event.EventFormat eventFormat;
    private Event.EventStatus status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String targetAudience;
    private Integer totalCapacity;
    private Venue venue;
    private String meetingUrl;
    private Long enrolledCount;
    private Double averageRating;
    private String bannerImageId;
    private Event.TicketType ticketType;
    private java.util.List<org.eventmate.server.entity.TicketTier> ticketTiers;
    private java.util.Map<String, Object> customDetails;
    private Object faqs;
    private Object agenda;
    private Object contactInfo;
    private String tagline;
    private String rulesAndGuidelines;
    private String rewardsAndPrizes;
    private String deliverablesRequired;
    private String judgingCriteria;
    private String eventGoals;
    private java.util.List<org.eventmate.server.entity.Guest> guests;
    private LocalDateTime registrationOpenDate;
    private LocalDateTime registrationCloseDate;
    private LocalDateTime resultsDate;
    private Double ticketPrice;
    private Boolean allowCoupon;
    private String couponCode;
    private Double discountPercentage;
    private Boolean allowMembershipDiscount;
    private Boolean isFeatured;
}
