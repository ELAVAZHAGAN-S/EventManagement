package org.eventmate.server.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eventmate.server.dto.FeedbackRequest;
import org.eventmate.server.dto.FeedbackResponse;
import org.eventmate.server.entity.Feedback;
import org.eventmate.server.service.EventService;
import org.eventmate.server.service.FeedbackService;
import org.eventmate.server.service.UserContextService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final UserContextService userContextService;
    private final EventService eventService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Feedback> submitFeedback(@Valid @RequestBody FeedbackRequest request) {
        Long userId = userContextService.getCurrentUserId();
        return ResponseEntity.ok(feedbackService.submitFeedback(request, userId));
    }

    /**
     * Public endpoint for users to view all feedback for an event
     */
    @GetMapping("/event/{eventId}/public")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<FeedbackResponse>> getPublicEventFeedback(@PathVariable Long eventId) {
        eventService.getEventById(eventId); // Validate event exists
        return ResponseEntity.ok(feedbackService.getPublicEventFeedback(eventId));
    }

    /**
     * Check if current user has already submitted feedback for an event
     */
    @GetMapping("/event/{eventId}/check")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Boolean>> checkUserFeedback(@PathVariable Long eventId) {
        Long userId = userContextService.getCurrentUserId();
        boolean hasSubmitted = feedbackService.hasUserSubmittedFeedback(eventId, userId);
        return ResponseEntity.ok(Map.of("hasSubmitted", hasSubmitted));
    }

    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasAnyRole('ORGANIZATION', 'ADMIN')")
    public ResponseEntity<List<FeedbackResponse>> getEventFeedback(@PathVariable Long eventId) {
        eventService.getEventById(eventId);
        return ResponseEntity.ok(feedbackService.getPublicEventFeedback(eventId));
    }

    @GetMapping("/event/{eventId}/rating")
    public ResponseEntity<Double> getEventRating(@PathVariable Long eventId) {
        eventService.getEventById(eventId);
        Double rating = feedbackService.getEventAverageRating(eventId);
        return ResponseEntity.ok(rating != null ? rating : 0.0);
    }
}
