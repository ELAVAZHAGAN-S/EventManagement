package org.eventmate.server.service;

import org.eventmate.server.dto.FeedbackRequest;
import org.eventmate.server.entity.Booking;
import org.eventmate.server.entity.Feedback;
import org.eventmate.server.repository.BookingRepository;
import org.eventmate.server.repository.FeedbackRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FeedbackServiceTest {

    @Mock
    private FeedbackRepository feedbackRepository;
    
    @Mock
    private BookingRepository bookingRepository;
    
    @InjectMocks
    private FeedbackService feedbackService;
    
    private Feedback testFeedback;
    private FeedbackRequest feedbackRequest;
    private Booking testBooking;

    @BeforeEach
    void setUp() {
        testBooking = new Booking();
        testBooking.setBookingId(1L);
        testBooking.setEventId(1L);
        testBooking.setUserId(1L);
        
        testFeedback = new Feedback();
        testFeedback.setFeedbackId(1L);
        testFeedback.setEventId(1L);
        testFeedback.setUserId(1L);
        testFeedback.setRating(5);
        testFeedback.setComments("Great event!");
        
        feedbackRequest = new FeedbackRequest();
        feedbackRequest.setEventId(1L);
        feedbackRequest.setRating(5);
        feedbackRequest.setComments("Great event!");
    }

    @Test
    void submitFeedback_Success() {
        when(bookingRepository.findByUserIdAndEventId(anyLong(), anyLong())).thenReturn(Optional.of(testBooking));
        when(feedbackRepository.save(any(Feedback.class))).thenReturn(testFeedback);

        Feedback result = feedbackService.submitFeedback(feedbackRequest, 1L);

        assertNotNull(result);
        assertEquals(5, result.getRating());
        verify(feedbackRepository).save(any(Feedback.class));
    }

    @Test
    void submitFeedback_NotAttended_ThrowsException() {
        when(bookingRepository.findByUserIdAndEventId(anyLong(), anyLong())).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> feedbackService.submitFeedback(feedbackRequest, 1L));
        verify(feedbackRepository, never()).save(any(Feedback.class));
    }

    @Test
    void getEventFeedback_Success() {
        when(feedbackRepository.findByEventId(anyLong())).thenReturn(Arrays.asList(testFeedback));

        List<Feedback> results = feedbackService.getEventFeedback(1L);

        assertNotNull(results);
        assertEquals(1, results.size());
        verify(feedbackRepository).findByEventId(anyLong());
    }

    @Test
    void getEventAverageRating_Success() {
        when(feedbackRepository.getAverageRating(anyLong())).thenReturn(4.5);

        Double rating = feedbackService.getEventAverageRating(1L);

        assertNotNull(rating);
        assertEquals(4.5, rating);
        verify(feedbackRepository).getAverageRating(anyLong());
    }
}
