package org.eventmate.server.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eventmate.server.dto.FeedbackRequest;
import org.eventmate.server.dto.FeedbackResponse;
import org.eventmate.server.entity.Event;
import org.eventmate.server.entity.Feedback;
import org.eventmate.server.entity.User;
import org.eventmate.server.exception.custom.*;
import org.eventmate.server.repository.BookingRepository;
import org.eventmate.server.repository.EventRepository;
import org.eventmate.server.repository.FeedbackRepository;
import org.eventmate.server.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Feedback submitFeedback(FeedbackRequest request, Long userId) {
        // Check if user is enrolled in the event
        if (bookingRepository.findByUserIdAndEventId(userId, request.getEventId()).isEmpty()) {
            throw new ValidationException("You must enroll in the event to give feedback");
        }

        // Check if event has started (feedback only allowed after event starts)
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        LocalDateTime now = LocalDateTime.now();
        if (event.getStartDate() != null && now.isBefore(event.getStartDate())) {
            throw new ValidationException("Feedback can only be submitted after the event has started");
        }

        // Check if user already submitted feedback for this event
        if (feedbackRepository.findByEventIdAndUserId(request.getEventId(), userId).isPresent()) {
            throw new ValidationException("You have already submitted feedback for this event");
        }

        Feedback feedback = new Feedback();
        feedback.setEventId(request.getEventId());
        feedback.setUserId(userId);
        feedback.setRating(request.getRating());
        feedback.setComments(request.getComments());

        log.info("Feedback submitted for event {} by user {}", request.getEventId(), userId);
        return feedbackRepository.save(feedback);
    }

    public List<Feedback> getEventFeedback(Long eventId) {
        return feedbackRepository.findByEventId(eventId);
    }

    /**
     * Get public feedback with user names for attendee view
     */
    public List<FeedbackResponse> getPublicEventFeedback(Long eventId) {
        List<Feedback> feedbacks = feedbackRepository.findByEventIdOrderBySubmittedAtDesc(eventId);
        return feedbacks.stream()
                .map(this::toFeedbackResponse)
                .collect(Collectors.toList());
    }

    /**
     * Check if a user has already submitted feedback for an event
     */
    public boolean hasUserSubmittedFeedback(Long eventId, Long userId) {
        return feedbackRepository.findByEventIdAndUserId(eventId, userId).isPresent();
    }

    public Double getEventAverageRating(Long eventId) {
        return feedbackRepository.getAverageRating(eventId);
    }

    private FeedbackResponse toFeedbackResponse(Feedback feedback) {
        User user = userRepository.findById(feedback.getUserId()).orElse(null);
        String userName = user != null ? user.getFullName() : "Anonymous";

        return new FeedbackResponse(
                feedback.getFeedbackId(),
                feedback.getEventId(),
                feedback.getUserId(),
                userName,
                feedback.getRating(),
                feedback.getComments(),
                feedback.getSubmittedAt());
    }
}
