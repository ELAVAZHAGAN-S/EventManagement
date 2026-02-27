package org.eventmate.server.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eventmate.server.dto.*;
import org.eventmate.server.entity.*;
import org.eventmate.server.exception.custom.*;
import org.eventmate.server.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.hibernate.Hibernate;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final BookingRepository bookingRepository;
    private final FeedbackRepository feedbackRepository;

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Event createEvent(EventRequest request, Long organizerId) {
        log.info("Creating event for organizer: {}", organizerId);
        // Validation only if NOT Draft (PLANNED)
        if (request.getStatus() != Event.EventStatus.PLANNED) {
            validateEventDates(request.getStartDate(), request.getEndDate());
        }

        Event event = new Event();
        event.setOrganizerId(organizerId);
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setTagline(request.getTagline());
        event.setEventFormat(request.getEventFormat()); // Was eventType
        event.setEventType(request.getEventType()); // Category

        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setRegistrationOpenDate(request.getRegistrationOpenDate());
        event.setRegistrationCloseDate(request.getRegistrationCloseDate());
        event.setResultsDate(request.getResultsDate());

        event.setTargetAudience(request.getTargetAudience());
        event.setEventGoals(request.getEventGoals());
        event.setTotalCapacity(request.getTotalCapacity());
        event.setMeetingUrl(request.getMeetingUrl());

        event.setRulesAndGuidelines(request.getRulesAndGuidelines());
        event.setRewardsAndPrizes(request.getRewardsAndPrizes());
        event.setDeliverablesRequired(request.getDeliverablesRequired());
        event.setJudgingCriteria(request.getJudgingCriteria());

        // JSON Fields
        event.setCustomDetails(request.getCustomDetails());
        event.setFaqs(request.getFaqs());
        event.setAgenda(request.getAgenda());
        event.setContactInfo(request.getContactInfo());
        event.setBannerImageId(request.getBannerImageId());
        event.setTicketType(request.getTicketType());

        // New Fields
        event.setTicketPrice(request.getTicketPrice());
        event.setAllowCoupon(request.getAllowCoupon());
        event.setCouponCode(request.getCouponCode());
        event.setDiscountPercentage(request.getDiscountPercentage());
        event.setAllowMembershipDiscount(request.getAllowMembershipDiscount());

        // Process Guests
        if (request.getGuests() != null) {
            request.getGuests().forEach(guestDto -> {
                Guest guest = new Guest();
                guest.setName(guestDto.getName());
                guest.setLinkedinProfile(guestDto.getLinkedinProfile());
                guest.setPhoto(guestDto.getPhoto());
                guest.setRole(guestDto.getRole());
                guest.setAbout(guestDto.getAbout());
                event.addGuest(guest);
            });
        }

        // Process Ticket Tiers
        if (request.getTicketTiers() != null) {
            request.getTicketTiers().forEach(tierDto -> {
                TicketTier tier = new TicketTier();
                tier.setName(tierDto.getName());
                tier.setPrice(tierDto.getPrice());
                tier.setCapacity(tierDto.getCapacity());
                tier.setDescription(tierDto.getDescription());
                event.addTicketTier(tier);
            });
        }

        // Set status, default to PLANNED if null or explicitly PLANNED
        if (request.getStatus() == null) {
            event.setStatus(Event.EventStatus.PLANNED);
        } else {
            event.setStatus(request.getStatus());
        }

        // Only validate logistics if the event is being Activated/Launched
        if (event.getStatus() == Event.EventStatus.ACTIVE) {
            validateEventReadiness(request);
        }

        if (request.getVenueId() != null) {
            Venue venue = venueRepository.findById(request.getVenueId())
                    .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));
            event.setVenue(venue);
        }

        Event savedEvent = eventRepository.save(event);
        log.info("Event created successfully with ID: {}", savedEvent.getEventId());
        return savedEvent;
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Event updateEvent(Long eventId, EventRequest request, Long organizerId) {
        if (request.getStatus() != Event.EventStatus.PLANNED) {
            validateEventDates(request.getStartDate(), request.getEndDate());
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (!event.getOrganizerId().equals(organizerId)) {
            throw new UnauthorizedException("Unauthorized to update this event");
        }

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setTagline(request.getTagline());
        event.setEventFormat(request.getEventFormat());
        event.setEventType(request.getEventType());
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setRegistrationOpenDate(request.getRegistrationOpenDate());
        event.setRegistrationCloseDate(request.getRegistrationCloseDate());
        event.setResultsDate(request.getResultsDate());

        event.setTargetAudience(request.getTargetAudience());
        event.setEventGoals(request.getEventGoals());
        event.setTotalCapacity(request.getTotalCapacity());
        event.setMeetingUrl(request.getMeetingUrl());

        event.setRulesAndGuidelines(request.getRulesAndGuidelines());
        event.setRewardsAndPrizes(request.getRewardsAndPrizes());
        event.setDeliverablesRequired(request.getDeliverablesRequired());
        event.setJudgingCriteria(request.getJudgingCriteria());

        // JSON Fields
        // Need to merge or replace? Replace for simplicity in PUT.
        if (request.getFaqs() != null)
            event.setFaqs(request.getFaqs());
        if (request.getAgenda() != null)
            event.setAgenda(request.getAgenda());
        if (request.getContactInfo() != null)
            event.setContactInfo(request.getContactInfo());

        event.setBannerImageId(request.getBannerImageId());
        event.setTicketType(request.getTicketType());

        // New Fields
        event.setTicketPrice(request.getTicketPrice());
        event.setAllowCoupon(request.getAllowCoupon());
        event.setCouponCode(request.getCouponCode());
        event.setDiscountPercentage(request.getDiscountPercentage());
        event.setAllowMembershipDiscount(request.getAllowMembershipDiscount());

        // Update Guests
        if (request.getGuests() != null) {
            event.getGuests().clear();
            request.getGuests().forEach(guestDto -> {
                Guest guest = new Guest();
                guest.setName(guestDto.getName());
                guest.setLinkedinProfile(guestDto.getLinkedinProfile());
                guest.setPhoto(guestDto.getPhoto());
                guest.setRole(guestDto.getRole());
                guest.setAbout(guestDto.getAbout());
                event.addGuest(guest);
            });
        }

        // Clear existing and add new tiers
        if (request.getTicketTiers() != null) {
            event.getTicketTiers().clear();
            request.getTicketTiers().forEach(tierDto -> {
                TicketTier tier = new TicketTier();
                tier.setName(tierDto.getName());
                tier.setPrice(tierDto.getPrice());
                tier.setCapacity(tierDto.getCapacity());
                tier.setDescription(tierDto.getDescription());
                event.addTicketTier(tier);
            });
        }

        if (request.getStatus() != null) {
            event.setStatus(request.getStatus());
        }

        // Validate logistics if the event is ACTIVE (Launched)
        if (event.getStatus() == Event.EventStatus.ACTIVE) {
            validateEventReadiness(request);
        }

        if (request.getVenueId() != null) {
            Venue venue = venueRepository.findById(request.getVenueId())
                    .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));
            event.setVenue(venue);
        }

        return eventRepository.save(event);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void deleteEvent(Long eventId, Long organizerId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (!event.getOrganizerId().equals(organizerId)) {
            throw new UnauthorizedException("Unauthorized to delete this event");
        }

        eventRepository.delete(event);
    }

    public List<EventResponse> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::toEventResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
public List<EventResponse> getEventsByOrganizer(Long organizerId) {

    List<Event> events =
            eventRepository.findByOrganizerIdWithTicketTiers(organizerId);

    events.forEach(event -> {
        Hibernate.initialize(event.getGuests());
    });

    return events.stream()
            .map(this::toEventResponse)
            .collect(Collectors.toList());
}

    public EventResponse getEventById(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        return toEventResponse(event);
    }

    public List<EventResponse> searchEvents(String keyword) {
        return eventRepository.searchEvents(keyword).stream()
                .map(this::toEventResponse)
                .collect(Collectors.toList());
    }

    public List<EventResponse> filterEventsByType(Event.EventType eventType) {
        return eventRepository.findByEventType(eventType).stream()
                .map(this::toEventResponse)
                .collect(Collectors.toList());
    }

    public List<EventResponse> getUpcomingEvents() {
        return eventRepository.findUpcomingEvents(LocalDateTime.now()).stream()
                .map(this::toEventResponse)
                .collect(Collectors.toList());
    }

    public List<EventResponse> getAllEventsForAttendee() {
        // Return all non-deleted, active/completed events (including ended ones)
        return eventRepository.findByDeletedAtIsNullOrderByCreatedAtDesc().stream()
                .filter(e -> e.getStatus() == Event.EventStatus.ACTIVE || e.getStatus() == Event.EventStatus.COMPLETED)
                .map(this::toEventResponse)
                .collect(Collectors.toList());
    }

    public List<EventResponse> getFeaturedEvents() {
        return eventRepository.findByIsFeaturedTrueAndDeletedAtIsNullAndStatus(Event.EventStatus.ACTIVE).stream()
                .map(this::toEventResponse)
                .collect(Collectors.toList());
    }

    public List<EventResponse> getActiveEventsForAttendee() {
        return eventRepository.findActiveEventsForAttendee().stream()
                .map(this::toEventResponse)
                .collect(Collectors.toList());
    }

    public List<EventResponse> getEventsByTypeForAttendee(Event.EventType eventType) {
        return eventRepository.findByEventTypeAndStatusAndDeletedAtIsNull(eventType, Event.EventStatus.ACTIVE).stream()
                .map(this::toEventResponse)
                .collect(Collectors.toList());
    }

    private EventResponse toEventResponse(Event event) {
        Long enrolledCount = bookingRepository.countConfirmedBookings(event.getEventId());
        Double avgRating = feedbackRepository.getAverageRating(event.getEventId());

        return new EventResponse(
                event.getEventId(),
                event.getTitle(),
                event.getDescription(),
                event.getEventType(),
                event.getEventFormat(),
                event.getStatus(),
                event.getStartDate(),
                event.getEndDate(),
                event.getTargetAudience(),
                event.getTotalCapacity(),
                event.getVenue(),
                event.getMeetingUrl(),
                enrolledCount,
                avgRating,
                event.getBannerImageId(),
                event.getTicketType(),
                event.getTicketTiers(),
                event.getCustomDetails(),
                event.getFaqs(),
                event.getAgenda(),
                event.getContactInfo(),
                event.getTagline(),
                event.getRulesAndGuidelines(),
                event.getRewardsAndPrizes(),
                event.getDeliverablesRequired(),
                event.getJudgingCriteria(),
                event.getEventGoals(),
                event.getGuests(),
                event.getRegistrationOpenDate(),
                event.getRegistrationCloseDate(),
                event.getResultsDate(),
                event.getTicketPrice(),
                event.getAllowCoupon(),
                event.getCouponCode(),
                event.getDiscountPercentage(),
                event.getAllowMembershipDiscount(),
                event.getIsFeatured());
    }

    private void validateEventDates(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate == null || endDate == null)
            return; // Allow nulls for Planned/Drafts

        if (startDate.isBefore(LocalDateTime.now())) {
            throw new ValidationException("Start date cannot be in the past");
        }
        if (endDate.isBefore(startDate)) {
            throw new ValidationException("End date must be after start date");
        }
    }

    private void validateEventReadiness(EventRequest request) {
        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new ValidationException("Start and End dates are required to launch an event");
        }
        if (request.getTotalCapacity() == null || request.getTotalCapacity() <= 0) {
            throw new ValidationException("Total capacity must be greater than 0 to launch");
        }
        validateEventType(request.getEventFormat(), request.getVenueId(), request.getMeetingUrl());
    }

    private void validateEventType(Event.EventFormat eventFormat, Long venueId, String meetingUrl) {
        if (eventFormat == null)
            throw new ValidationException("Event Format is required to launch");

        if (eventFormat == Event.EventFormat.ONSITE && venueId == null) {
            throw new ValidationException("Venue is required for ONSITE events");
        }
        if (eventFormat == Event.EventFormat.REMOTE && meetingUrl == null) {
            throw new ValidationException("Meeting URL is required for REMOTE events");
        }
        if (eventFormat == Event.EventFormat.HYBRID && (venueId == null || meetingUrl == null)) {
            throw new ValidationException("Both venue and meeting URL are required for HYBRID events");
        }
    }
}
