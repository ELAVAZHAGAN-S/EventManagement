package org.eventmate.server.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eventmate.server.dto.*;
import org.eventmate.server.entity.Venue;
import org.eventmate.server.entity.VenueBooking;
import org.eventmate.server.service.UserContextService;
import org.eventmate.server.service.VenueService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/venues")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class VenueController {

    private final VenueService venueService;
    private final UserContextService userContextService;

    @GetMapping
    public ResponseEntity<List<Venue>> getAllVenues() {
        return ResponseEntity.ok(venueService.getAllVenues());
    }

    @GetMapping("/available")
    public ResponseEntity<List<Venue>> getAvailableVenues() {
        return ResponseEntity.ok(venueService.getAvailableVenues());
    }

    @PostMapping("/search")
    public ResponseEntity<List<Venue>> searchVenues(@RequestBody VenueSearchCriteria criteria) {
        return ResponseEntity.ok(venueService.searchVenues(criteria));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venue> getVenueById(@PathVariable Long id) {
        return ResponseEntity.ok(venueService.getVenueById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ORGANIZATION', 'ADMIN')")
    public ResponseEntity<Venue> createVenue(@Valid @RequestBody VenueRequest request) {
        Long userId = userContextService.getCurrentUserId();
        return ResponseEntity.ok(venueService.createVenue(request, userId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZATION', 'ADMIN')")
    public ResponseEntity<Venue> updateVenue(@PathVariable Long id, @Valid @RequestBody VenueRequest request) {
        Long userId = userContextService.getCurrentUserId();
        return ResponseEntity.ok(venueService.updateVenue(id, request, userId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteVenue(@PathVariable Long id) {
        venueService.deleteVenue(id);
        return ResponseEntity.ok("Venue deleted successfully");
    }

    @PostMapping("/book")
    @PreAuthorize("hasAnyRole('ORGANIZATION', 'ADMIN')")
    public ResponseEntity<VenueBooking> bookVenue(@Valid @RequestBody VenueBookingRequest request) {
        Long userId = userContextService.getCurrentUserId();
        return ResponseEntity.ok(venueService.bookVenue(request, userId));
    }

    @DeleteMapping("/bookings/{bookingId}")
    @PreAuthorize("hasAnyRole('ORGANIZATION', 'ADMIN')")
    public ResponseEntity<String> cancelVenueBooking(@PathVariable Long bookingId) {
        Long userId = userContextService.getCurrentUserId();
        venueService.cancelVenueBooking(bookingId, userId);
        return ResponseEntity.ok("Venue booking cancelled successfully");
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("hasAnyRole('ORGANIZATION', 'ADMIN')")
    public ResponseEntity<List<VenueBookingResponse>> getMyVenueBookings() {
        Long userId = userContextService.getCurrentUserId();
        return ResponseEntity.ok(venueService.getMyVenueBookings(userId));
    }

    @GetMapping("/{venueId}/booking-history")
    @PreAuthorize("hasAnyRole('ORGANIZATION', 'ADMIN')")
    public ResponseEntity<List<VenueBooking>> getVenueBookingHistory(@PathVariable Long venueId) {
        return ResponseEntity.ok(venueService.getVenueBookingHistory(venueId));
    }
}
