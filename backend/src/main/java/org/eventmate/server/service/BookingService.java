package org.eventmate.server.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eventmate.server.entity.*;
import org.eventmate.server.dto.BookingRequest;
import org.eventmate.server.dto.BookingResponse;
import org.eventmate.server.exception.custom.*;
import org.eventmate.server.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    @SuppressWarnings("unused")
    private final TicketTypeRepository ticketTypeRepository; // Kept for legacy, but we use logic for check
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public synchronized Booking enrollEvent(BookingRequest request, Long userId) {
        log.info("Attempting enrollment for User: {}, Event: {}", userId, request.getEventId());

        // 1. Check if already enrolled (with lock to prevent race conditions)
        if (bookingRepository.findByUserIdAndEventId(userId, request.getEventId()).isPresent()) {
            throw new DuplicateResourceException("Already enrolled in this event");
        }

        // 2. Fetch Event
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        // ONSITE Seat Validation
        if (event.getEventFormat() == Event.EventFormat.ONSITE) {
            if (request.getSeatNumber() == null) {
                throw new ValidationException("Seat number is required for Onsite events");
            }
            if (request.getSeatNumber() < 1 || request.getSeatNumber() > event.getTotalCapacity()) {
                throw new ValidationException("Invalid seat number");
            }
            List<Integer> bookedSeats = bookingRepository.findBookedSeatsByEventId(request.getEventId());
            if (bookedSeats.contains(request.getSeatNumber())) {
                throw new ValidationException("Seat " + request.getSeatNumber() + " is already booked");
            }
        }

        // 3. Check Capacity
        Long currentBookings = bookingRepository.countConfirmedBookings(request.getEventId());
        if (currentBookings >= event.getTotalCapacity()) {
            throw new ValidationException("Event is full");
        }

        // 4. Handle Group Logic
        String groupCode = request.getGroupCode();
        if ("GROUP".equalsIgnoreCase(request.getBookingType()) || (groupCode != null && !groupCode.isEmpty())) {
            if (groupCode == null || groupCode.isEmpty()) {
                // Create new Group Code
                groupCode = "GRP-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            }
            // If joining existing, we could validate it, but for now we just link it.
        }

        // 5. Generate Ticket Code
        String ticketCode = "EVT-" + event.getEventId() + "-"
                + java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        // 6. Create Booking
        Booking booking = new Booking();
        booking.setEventId(request.getEventId());
        booking.setUserId(userId);
        booking.setTicketTypeId(request.getTicketTypeId());
        booking.setSeatNumber(request.getSeatNumber());

        // New Fields
        booking.setAttendeeName(request.getAttendeeName());
        booking.setContactNumber(request.getContactNumber());
        booking.setAttendeeAge(request.getAttendeeAge());
        booking.setBookingType(request.getBookingType() != null && request.getBookingType().equalsIgnoreCase("GROUP")
                ? Booking.BookingType.GROUP
                : Booking.BookingType.SOLO);
        booking.setGroupCode(groupCode);
        booking.setTicketCode(ticketCode);

        booking.setDietaryRestrictions(request.getDietaryRestrictions());
        booking.setAccessibilityNeeds(request.getAccessibilityNeeds());
        booking.setJobTitle(request.getJobTitle());
        booking.setCompanyName(request.getCompanyName());

        // 7. Save
        log.info("Duplicate check passed. Creating booking for User: {} Event: {}", userId, request.getEventId());
        Booking savedBooking = bookingRepository.save(booking);
        log.info("User {} enrolled in event {}. Ticket: {}", userId, request.getEventId(), ticketCode);

        // 8. Handle Invited Users (Group Booking)
        if (request.getInvitedUsers() != null && !request.getInvitedUsers().isEmpty()) {
            for (String invitedEmail : request.getInvitedUsers()) {
                userRepository.findByEmail(invitedEmail).ifPresent(invitedUser -> {
                    // Check if already enrolled
                    if (bookingRepository.findByUserIdAndEventId(invitedUser.getUserId(), request.getEventId())
                            .isPresent()) {
                        log.warn("User {} is already enrolled", invitedEmail);
                        return;
                    }

                    Booking invitedBooking = new Booking();
                    invitedBooking.setEventId(request.getEventId());
                    invitedBooking.setUserId(invitedUser.getUserId());
                    invitedBooking.setTicketTypeId(request.getTicketTypeId()); // Same ticket type
                    // Seat logic is tricky for group, assumming generic 'GROUP' booking for now or
                    // needing multiple seat inputs
                    // For now, assuming seat selection is only for the primary user or handled
                    // separately

                    invitedBooking.setAttendeeName(invitedUser.getFullName());
                    invitedBooking.setContactNumber(invitedUser.getPhoneNumber());
                    // Age? We don't know. Default or null.

                    invitedBooking.setBookingType(Booking.BookingType.GROUP);
                    invitedBooking.setGroupCode(savedBooking.getGroupCode());
                    invitedBooking.setTicketCode("EVT-" + event.getEventId() + "-"
                            + java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase());

                    bookingRepository.save(invitedBooking);

                    // Send Email to Invited User
                    java.util.Map<String, Object> inviteModel = new java.util.HashMap<>();
                    inviteModel.put("inviterName", request.getAttendeeName());
                    inviteModel.put("eventName", event.getTitle());
                    inviteModel.put("groupCode", savedBooking.getGroupCode());
                    // In a real app, buttons would link to API endpoints to accept/decline
                    inviteModel.put("acceptLink", "http://localhost:5173/events/" + event.getEventId() + "/accept?code="
                            + savedBooking.getGroupCode());

                    emailService.sendTicketConfirmation(invitedEmail, "You're Invited to " + event.getTitle(),
                            inviteModel); // Using confirm template for now, ideally dedicated invite template
                });
            }
        }

        // 9. Send Email (Async typically, but sync here for simplicity)
        User user = userRepository.findById(userId).orElse(null);
        if (user != null && user.getEmail() != null) {
            java.util.Map<String, Object> model = new java.util.HashMap<>();
            model.put("userName", request.getAttendeeName()); // Use attendee name or User name
            model.put("eventName", event.getTitle());
            model.put("eventDate", event.getStartDate().toString()); // Format nicely in real app
            model.put("venue",
                    event.getEventFormat() == Event.EventFormat.REMOTE ? "Online"
                            : (event.getVenue() != null ? "Venue: " + event.getVenue().getName() : "Venue TBD"));
            model.put("ticketCode", ticketCode);
            model.put("groupCode", groupCode);
            if (groupCode != null) {
                // In a real app, this would be the frontend URL
                model.put("inviteLink", "http://localhost:5173/events/" + event.getEventId() + "?group=" + groupCode);
            }

            emailService.sendTicketConfirmation(user.getEmail(), "Ticket Confirmed: " + event.getTitle(), model);
        }

        return savedBooking;
    }

    public List<BookingResponse> getUserBookings(Long userId) {
        List<Booking> bookings = bookingRepository.findByUserId(userId);
        return bookings.stream().map(this::toBookingResponse).collect(java.util.stream.Collectors.toList());
    }

    public List<BookingResponse> getEventBookings(Long eventId) {
        List<Booking> bookings = bookingRepository.findByEventId(eventId);
        return bookings.stream().map(this::toBookingResponse).collect(java.util.stream.Collectors.toList());
    }

    private BookingResponse toBookingResponse(Booking booking) {
        User user = userRepository.findById(booking.getUserId()).orElse(new User());
        Event event = eventRepository.findById(booking.getEventId()).orElse(null);

        String eventTitle = event != null ? event.getTitle() : "Unknown Event";
        java.time.LocalDateTime eventStartDate = event != null ? event.getStartDate() : null;
        String eventBannerImageId = event != null ? event.getBannerImageId() : null;

        return new BookingResponse(
                booking.getBookingId(),
                booking.getEventId(),
                booking.getUserId(),
                user.getFullName(),
                user.getEmail(),
                booking.getTicketTypeId(),
                "Ticket #" + booking.getTicketTypeId(),
                booking.getTicketCode(),
                booking.getGroupCode(),
                booking.getBookingType() != null ? booking.getBookingType().name() : "SOLO",
                booking.getStatus().name(),
                booking.getBookingDate(),
                booking.getAttendeeName() != null ? booking.getAttendeeName() : user.getFullName(),
                booking.getContactNumber(),
                eventTitle,
                eventStartDate,
                eventBannerImageId);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void cancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        // Allow user OR admin/organizer (logic for checking organizer ownership needed
        // ideally)
        if (!booking.getUserId().equals(userId)) {
            // Ideally check if userId is the organizer of the event
            throw new UnauthorizedException("Unauthorized to cancel this booking");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);
        log.info("Booking {} cancelled by user {}", bookingId, userId);
    }

    public List<Integer> getBookedSeats(Long eventId) {
        return bookingRepository.findBookedSeatsByEventId(eventId);
    }

    /**
     * Check if user is already enrolled in an event
     */
    public boolean isUserEnrolled(Long eventId, Long userId) {
        return bookingRepository.findByUserIdAndEventId(userId, eventId).isPresent();
    }
}
