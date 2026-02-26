package org.eventmate.server.service;

import org.eventmate.server.dto.BookingRequest;
import org.eventmate.server.entity.Booking;
import org.eventmate.server.entity.Event;
import org.eventmate.server.entity.TicketType;
import org.eventmate.server.repository.*;
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
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private TicketTypeRepository ticketTypeRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BookingService bookingService;

    private Booking testBooking;
    private Event testEvent;
    private TicketType testTicketType;
    private BookingRequest bookingRequest;

    @BeforeEach
    void setUp() {
        testEvent = new Event();
        testEvent.setEventId(1L);
        testEvent.setTotalCapacity(100);

        testTicketType = new TicketType();
        testTicketType.setTicketTypeId(1L);
        testTicketType.setEventId(1L);

        testBooking = new Booking();
        testBooking.setBookingId(1L);
        testBooking.setEventId(1L);
        testBooking.setUserId(1L);
        testBooking.setTicketTypeId(1L);
        testBooking.setStatus(Booking.BookingStatus.CONFIRMED);

        bookingRequest = new BookingRequest();
        bookingRequest.setEventId(1L);
        bookingRequest.setTicketTypeId(1L);
    }

    @Test
    void enrollEvent_Success() {
        when(bookingRepository.findByUserIdAndEventId(anyLong(), anyLong())).thenReturn(Optional.empty());
        when(eventRepository.findById(anyLong())).thenReturn(Optional.of(testEvent));
        when(bookingRepository.countConfirmedBookings(anyLong())).thenReturn(50L);
        when(ticketTypeRepository.findById(anyLong())).thenReturn(Optional.of(testTicketType));
        when(bookingRepository.save(any(Booking.class))).thenReturn(testBooking);

        Booking result = bookingService.enrollEvent(bookingRequest, 1L);

        assertNotNull(result);
        assertEquals(1L, result.getEventId());
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void enrollEvent_AlreadyEnrolled_ThrowsException() {
        when(bookingRepository.findByUserIdAndEventId(anyLong(), anyLong())).thenReturn(Optional.of(testBooking));

        assertThrows(RuntimeException.class, () -> bookingService.enrollEvent(bookingRequest, 1L));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void enrollEvent_EventFull_ThrowsException() {
        when(bookingRepository.findByUserIdAndEventId(anyLong(), anyLong())).thenReturn(Optional.empty());
        when(eventRepository.findById(anyLong())).thenReturn(Optional.of(testEvent));
        when(bookingRepository.countConfirmedBookings(anyLong())).thenReturn(100L);

        assertThrows(RuntimeException.class, () -> bookingService.enrollEvent(bookingRequest, 1L));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void getUserBookings_Success() {
        when(bookingRepository.findByUserId(anyLong())).thenReturn(Arrays.asList(testBooking));

        List<org.eventmate.server.dto.BookingResponse> results = bookingService.getUserBookings(1L);

        assertNotNull(results);
        assertEquals(1, results.size());
        verify(bookingRepository).findByUserId(anyLong());
    }

    @Test
    void cancelBooking_Success() {
        when(bookingRepository.findById(anyLong())).thenReturn(Optional.of(testBooking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(testBooking);

        assertDoesNotThrow(() -> bookingService.cancelBooking(1L, 1L));
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void cancelBooking_Unauthorized_ThrowsException() {
        when(bookingRepository.findById(anyLong())).thenReturn(Optional.of(testBooking));

        assertThrows(RuntimeException.class, () -> bookingService.cancelBooking(1L, 999L));
        verify(bookingRepository, never()).save(any(Booking.class));
    }
}
