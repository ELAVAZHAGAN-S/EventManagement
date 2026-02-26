package org.eventmate.server.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eventmate.server.dto.*;
import org.eventmate.server.entity.Event;
import org.eventmate.server.service.EventService;
import org.eventmate.server.service.UserContextService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class EventController {

    private final EventService eventService;
    private final UserContextService userContextService;

    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<EventResponse>> searchEvents(@RequestParam String keyword) {
        return ResponseEntity.ok(eventService.searchEvents(keyword));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<EventResponse>> filterByType(@RequestParam Event.EventType type) {
        return ResponseEntity.ok(eventService.filterEventsByType(type));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<EventResponse>> getUpcomingEvents() {
        return ResponseEntity.ok(eventService.getUpcomingEvents());
    }

    @GetMapping("/all")
    public ResponseEntity<List<EventResponse>> getAllEventsForAttendee() {
        return ResponseEntity.ok(eventService.getAllEventsForAttendee());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ORGANIZATION', 'ADMIN')")
    public ResponseEntity<Event> createEvent(@Valid @RequestBody EventRequest request) {
        log.info("Received request to create event: {}", request);
        Long organizerId = userContextService.getCurrentUserId();
        return ResponseEntity.ok(eventService.createEvent(request, organizerId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZATION', 'ADMIN')")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @Valid @RequestBody EventRequest request) {
        Long organizerId = userContextService.getCurrentUserId();
        return ResponseEntity.ok(eventService.updateEvent(id, request, organizerId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZATION', 'ADMIN')")
    public ResponseEntity<String> deleteEvent(@PathVariable Long id) {
        Long organizerId = userContextService.getCurrentUserId();
        eventService.deleteEvent(id, organizerId);
        return ResponseEntity.ok("Event deleted successfully");
    }

    @GetMapping("/my-events")
    @PreAuthorize("hasAnyRole('ORGANIZATION', 'ADMIN')")
    public ResponseEntity<List<EventResponse>> getMyEvents() {
        Long organizerId = userContextService.getCurrentUserId();
        return ResponseEntity.ok(eventService.getEventsByOrganizer(organizerId));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<EventResponse>> getFeaturedEvents() {
        return ResponseEntity.ok(eventService.getFeaturedEvents());
    }
}
