package org.eventmate.server.service;

import org.eventmate.server.dto.EventRequest;
import org.eventmate.server.dto.EventResponse;
import org.eventmate.server.entity.Event;
import org.eventmate.server.entity.Venue;
import org.eventmate.server.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private FeedbackRepository feedbackRepository;

    @InjectMocks
    private EventService eventService;

    private Event testEvent;
    private EventRequest eventRequest;
    private Venue testVenue;

    @BeforeEach
    void setUp() {
        testVenue = new Venue();
        testVenue.setVenueId(1L);
        testVenue.setName("Test Venue");

        testEvent = new Event();
        testEvent.setEventId(1L);
        testEvent.setOrganizerId(1L);
        testEvent.setTitle("Test Event");
        testEvent.setDescription("Test Description");
        testEvent.setEventType(Event.EventType.CONFERENCE);
        testEvent.setStartDate(LocalDateTime.now().plusDays(7));
        testEvent.setEndDate(LocalDateTime.now().plusDays(7).plusHours(5));
        testEvent.setTotalCapacity(100);
        testEvent.setVenue(testVenue);

        eventRequest = new EventRequest();
        eventRequest.setTitle("Test Event");
        eventRequest.setDescription("Test Description");
        eventRequest.setEventType(Event.EventType.CONFERENCE);
        eventRequest.setStartDate(LocalDateTime.now().plusDays(7));
        eventRequest.setEndDate(LocalDateTime.now().plusDays(7).plusHours(5));
        eventRequest.setTotalCapacity(100);
        eventRequest.setVenueId(1L);
        eventRequest.setMeetingUrl("https://meet.example.com/test");
    }

    @Test
    void createEvent_Success() {
        when(venueRepository.findById(anyLong())).thenReturn(Optional.of(testVenue));
        when(eventRepository.save(any(Event.class))).thenReturn(testEvent);

        Event result = eventService.createEvent(eventRequest, 1L);

        assertNotNull(result);
        assertEquals("Test Event", result.getTitle());
        verify(eventRepository).save(any(Event.class));
    }

    @Test
    void createEvent_VenueNotFound_ThrowsException() {
        when(venueRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> eventService.createEvent(eventRequest, 1L));
        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void updateEvent_Success() {
        when(eventRepository.findById(anyLong())).thenReturn(Optional.of(testEvent));
        when(venueRepository.findById(anyLong())).thenReturn(Optional.of(testVenue));
        when(eventRepository.save(any(Event.class))).thenReturn(testEvent);

        Event result = eventService.updateEvent(1L, eventRequest, 1L);

        assertNotNull(result);
        verify(eventRepository).save(any(Event.class));
    }

    @Test
    void updateEvent_Unauthorized_ThrowsException() {
        when(eventRepository.findById(anyLong())).thenReturn(Optional.of(testEvent));

        assertThrows(RuntimeException.class, () -> eventService.updateEvent(1L, eventRequest, 999L));
        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void deleteEvent_Success() {
        when(eventRepository.findById(anyLong())).thenReturn(Optional.of(testEvent));
        doNothing().when(eventRepository).delete(any(Event.class));

        assertDoesNotThrow(() -> eventService.deleteEvent(1L, 1L));
        verify(eventRepository).delete(any(Event.class));
    }

    @Test
    void deleteEvent_Unauthorized_ThrowsException() {
        when(eventRepository.findById(anyLong())).thenReturn(Optional.of(testEvent));

        assertThrows(RuntimeException.class, () -> eventService.deleteEvent(1L, 999L));
        verify(eventRepository, never()).delete(any(Event.class));
    }

    @Test
    void getAllEvents_Success() {
        when(eventRepository.findAll()).thenReturn(Arrays.asList(testEvent));
        when(bookingRepository.countConfirmedBookings(anyLong())).thenReturn(10L);
        when(feedbackRepository.getAverageRating(anyLong())).thenReturn(4.5);

        List<EventResponse> results = eventService.getAllEvents();

        assertNotNull(results);
        assertEquals(1, results.size());
        verify(eventRepository).findAll();
    }

    @Test
    void searchEvents_Success() {
        when(eventRepository.searchEvents(anyString())).thenReturn(Arrays.asList(testEvent));
        when(bookingRepository.countConfirmedBookings(anyLong())).thenReturn(10L);
        when(feedbackRepository.getAverageRating(anyLong())).thenReturn(4.5);

        List<EventResponse> results = eventService.searchEvents("Test");

        assertNotNull(results);
        assertEquals(1, results.size());
        verify(eventRepository).searchEvents(anyString());
    }

    @Test
    void filterEventsByType_Success() {
        when(eventRepository.findByEventType(any(Event.EventType.class))).thenReturn(Arrays.asList(testEvent));
        when(bookingRepository.countConfirmedBookings(anyLong())).thenReturn(10L);
        when(feedbackRepository.getAverageRating(anyLong())).thenReturn(4.5);

        List<EventResponse> results = eventService.filterEventsByType(Event.EventType.CONFERENCE);

        assertNotNull(results);
        assertEquals(1, results.size());
        verify(eventRepository).findByEventType(any(Event.EventType.class));
    }
}
