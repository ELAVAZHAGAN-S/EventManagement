package org.eventmate.server.service;

import org.eventmate.server.dto.VenueBookingRequest;
import org.eventmate.server.dto.VenueRequest;
import org.eventmate.server.dto.VenueSearchCriteria;
import org.eventmate.server.entity.Venue;
import org.eventmate.server.entity.VenueBooking;
import org.eventmate.server.exception.custom.ResourceNotFoundException;
import org.eventmate.server.exception.custom.UnauthorizedException;
import org.eventmate.server.exception.custom.ValidationException;
import org.eventmate.server.repository.VenueBookingRepository;
import org.eventmate.server.repository.VenueRepository;
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
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VenueServiceTest {

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private VenueBookingRepository venueBookingRepository;

    @InjectMocks
    private VenueService venueService;

    private Venue testVenue;
    private VenueRequest venueRequest;

    @BeforeEach
    void setUp() {
        testVenue = new Venue();
        testVenue.setVenueId(1L);
        testVenue.setName("Test Hall");
        testVenue.setAddress("123 Main St");
        testVenue.setCity("Mumbai");
        testVenue.setState("Maharashtra");
        testVenue.setCountry("India");
        testVenue.setCapacity(500);
        testVenue.setNumberOfFloors(3);
        testVenue.setCreatedBy(1L);
        testVenue.setIsBooked(false);

        venueRequest = new VenueRequest();
        venueRequest.setName("Test Hall");
        venueRequest.setAddress("123 Main St");
        venueRequest.setCity("Mumbai");
        venueRequest.setState("Maharashtra");
        venueRequest.setCountry("India");
        venueRequest.setCapacity(500);
        venueRequest.setNumberOfFloors(3);
    }

    @Test
    void createVenue_Success() {
        when(venueRepository.findByNameAndAddressAndCity(anyString(), anyString(), anyString()))
                .thenReturn(Optional.empty());
        when(venueRepository.save(any(Venue.class))).thenReturn(testVenue);

        Venue result = venueService.createVenue(venueRequest, 1L);

        assertNotNull(result);
        assertEquals("Test Hall", result.getName());
        verify(venueRepository).save(any(Venue.class));
    }

    @Test
    void createVenue_DuplicateReturnsExisting() {
        when(venueRepository.findByNameAndAddressAndCity(anyString(), anyString(), anyString()))
                .thenReturn(Optional.of(testVenue));

        Venue result = venueService.createVenue(venueRequest, 1L);

        assertNotNull(result);
        assertEquals(testVenue.getVenueId(), result.getVenueId());
        verify(venueRepository, never()).save(any(Venue.class));
    }

    @Test
    void getAllVenues_Success() {
        when(venueRepository.findAll()).thenReturn(Arrays.asList(testVenue));

        List<Venue> result = venueService.getAllVenues();

        assertEquals(1, result.size());
        assertEquals("Test Hall", result.get(0).getName());
    }

    @Test
    void getVenueById_Success() {
        when(venueRepository.findById(1L)).thenReturn(Optional.of(testVenue));

        Venue result = venueService.getVenueById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getVenueId());
    }

    @Test
    void getVenueById_NotFound() {
        when(venueRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> venueService.getVenueById(1L));
    }

    @Test
    void updateVenue_Success() {
        when(venueRepository.findById(1L)).thenReturn(Optional.of(testVenue));
        when(venueRepository.save(any(Venue.class))).thenReturn(testVenue);

        venueRequest.setName("Updated Hall");
        Venue result = venueService.updateVenue(1L, venueRequest, 1L);

        assertNotNull(result);
        verify(venueRepository).save(any(Venue.class));
    }

    @Test
    void deleteVenue_Success() {
        when(venueRepository.findById(1L)).thenReturn(Optional.of(testVenue));
        doNothing().when(venueRepository).delete(any(Venue.class));

        assertDoesNotThrow(() -> venueService.deleteVenue(1L));
        verify(venueRepository).delete(testVenue);
    }

    @Test
    void searchVenues_WithCriteria() {
        VenueSearchCriteria criteria = new VenueSearchCriteria();
        criteria.setCity("Mumbai");
        criteria.setMinCapacity(100);
        criteria.setMaxCapacity(1000);

        when(venueRepository.searchVenues(isNull(), isNull(), eq("Mumbai"),
                isNull(), isNull(), eq(100), eq(1000), isNull(), eq(true)))
                .thenReturn(Arrays.asList(testVenue));

        List<Venue> result = venueService.searchVenues(criteria);

        assertEquals(1, result.size());
        assertEquals("Mumbai", result.get(0).getCity());
    }

    @Test
    void bookVenue_Success() {
        VenueBookingRequest bookingRequest = new VenueBookingRequest();
        bookingRequest.setVenueId(1L);
        bookingRequest.setEventId(1L);
        bookingRequest.setBookingStartDate(LocalDateTime.now().plusDays(1));
        bookingRequest.setBookingEndDate(LocalDateTime.now().plusDays(2));

        when(venueRepository.findById(1L)).thenReturn(Optional.of(testVenue));
        when(venueBookingRepository.findConflictingBookings(anyLong(), any(), any()))
                .thenReturn(Arrays.asList());
        when(venueBookingRepository.save(any(VenueBooking.class)))
                .thenReturn(new VenueBooking());
        when(venueRepository.save(any(Venue.class))).thenReturn(testVenue);

        VenueBooking result = venueService.bookVenue(bookingRequest, 1L);

        assertNotNull(result);
        verify(venueBookingRepository).save(any(VenueBooking.class));
        verify(venueRepository).save(any(Venue.class));
    }

    @Test
    void bookVenue_ConflictExists() {
        VenueBookingRequest bookingRequest = new VenueBookingRequest();
        bookingRequest.setVenueId(1L);
        bookingRequest.setEventId(1L);
        bookingRequest.setBookingStartDate(LocalDateTime.now().plusDays(1));
        bookingRequest.setBookingEndDate(LocalDateTime.now().plusDays(2));

        VenueBooking existingBooking = new VenueBooking();
        existingBooking.setStatus(VenueBooking.BookingStatus.ACTIVE);

        when(venueRepository.findById(1L)).thenReturn(Optional.of(testVenue));
        when(venueBookingRepository.findConflictingBookings(anyLong(), any(), any()))
                .thenReturn(Arrays.asList(existingBooking));

        assertThrows(ValidationException.class,
                () -> venueService.bookVenue(bookingRequest, 1L));
    }

    @Test
    void bookVenue_InvalidDates() {
        VenueBookingRequest bookingRequest = new VenueBookingRequest();
        bookingRequest.setVenueId(1L);
        bookingRequest.setEventId(1L);
        bookingRequest.setBookingStartDate(LocalDateTime.now().plusDays(2));
        bookingRequest.setBookingEndDate(LocalDateTime.now().plusDays(1));

        assertThrows(ValidationException.class,
                () -> venueService.bookVenue(bookingRequest, 1L));
    }

    @Test
    void cancelBooking_Success() {
        VenueBooking booking = new VenueBooking();
        booking.setBookingId(1L);
        booking.setVenueId(1L);
        booking.setBookedBy(1L);
        booking.setStatus(VenueBooking.BookingStatus.ACTIVE);

        when(venueBookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(venueRepository.findById(1L)).thenReturn(Optional.of(testVenue));
        when(venueBookingRepository.save(any(VenueBooking.class))).thenReturn(booking);
        when(venueRepository.save(any(Venue.class))).thenReturn(testVenue);

        assertDoesNotThrow(() -> venueService.cancelVenueBooking(1L, 1L));
        verify(venueBookingRepository).save(any(VenueBooking.class));
    }

    @Test
    void cancelBooking_Unauthorized() {
        VenueBooking booking = new VenueBooking();
        booking.setBookingId(1L);
        booking.setBookedBy(2L);

        when(venueBookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        assertThrows(UnauthorizedException.class,
                () -> venueService.cancelVenueBooking(1L, 1L));
    }

    @Test
    void getBookingHistory_Success() {
        VenueBooking booking = new VenueBooking();
        booking.setVenueId(1L);
        when(venueBookingRepository.findByBookedBy(1L))
                .thenReturn(Arrays.asList(booking));
        when(venueRepository.findById(1L)).thenReturn(Optional.of(testVenue));

        List<org.eventmate.server.dto.VenueBookingResponse> result = venueService.getMyVenueBookings(1L);

        assertEquals(1, result.size());
    }

    @Test
    void getVenueBookings_Success() {
        VenueBooking booking = new VenueBooking();
        when(venueBookingRepository.findByVenueId(1L))
                .thenReturn(Arrays.asList(booking));

        List<VenueBooking> result = venueService.getVenueBookingHistory(1L);

        assertEquals(1, result.size());
    }
}
