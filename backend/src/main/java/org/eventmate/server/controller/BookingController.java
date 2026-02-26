package org.eventmate.server.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eventmate.server.dto.BookingRequest;
import org.eventmate.server.entity.Booking;
import org.eventmate.server.service.BookingService;
import org.eventmate.server.service.EventService;
import org.eventmate.server.service.UserContextService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class BookingController {

    private final BookingService bookingService;
    private final UserContextService userContextService;
    private final EventService eventService;

    @PostMapping("/enroll")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Booking> enrollEvent(@Valid @RequestBody BookingRequest request) {
        Long userId = userContextService.getCurrentUserId();
        return ResponseEntity.ok(bookingService.enrollEvent(request, userId));
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<org.eventmate.server.dto.BookingResponse>> getMyBookings() {
        Long userId = userContextService.getCurrentUserId();
        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }

    /**
     * Check if current user is already enrolled in an event
     */
    @GetMapping("/event/{eventId}/check")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Boolean>> checkEnrollment(@PathVariable Long eventId) {
        Long userId = userContextService.getCurrentUserId();
        boolean isEnrolled = bookingService.isUserEnrolled(eventId, userId);
        return ResponseEntity.ok(Map.of("isEnrolled", isEnrolled));
    }

    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasAnyRole('ORGANIZATION', 'ADMIN')")
    public ResponseEntity<List<org.eventmate.server.dto.BookingResponse>> getEventBookings(@PathVariable Long eventId) {
        eventService.getEventById(eventId);
        return ResponseEntity.ok(bookingService.getEventBookings(eventId));
    }

    @DeleteMapping("/{bookingId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> cancelBooking(@PathVariable Long bookingId) {
        Long userId = userContextService.getCurrentUserId();
        bookingService.cancelBooking(bookingId, userId);
        return ResponseEntity.ok("Booking cancelled successfully");
    }

    @GetMapping("/event/{eventId}/seats")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<Integer>> getBookedSeats(@PathVariable Long eventId) {
        return ResponseEntity.ok(bookingService.getBookedSeats(eventId));
    }
}
