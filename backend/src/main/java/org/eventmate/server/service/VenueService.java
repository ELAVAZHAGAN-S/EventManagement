package org.eventmate.server.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eventmate.server.dto.*;
import org.eventmate.server.entity.Venue;
import org.eventmate.server.entity.VenueBooking;
import org.eventmate.server.exception.custom.*;
import org.eventmate.server.repository.VenueBookingRepository;
import org.eventmate.server.repository.VenueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class VenueService {

    private final VenueRepository venueRepository;
    private final VenueBookingRepository venueBookingRepository;

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Venue createVenue(VenueRequest request, Long createdBy) {
        Optional<Venue> existing = venueRepository.findByNameAndAddressAndCity(
                request.getName(), request.getAddress(), request.getCity());

        if (existing.isPresent()) {
            log.info("Venue already exists: {}", request.getName());
            return existing.get();
        }

        Venue venue = new Venue();
        venue.setCreatedBy(createdBy);
        venue.setName(request.getName());
        venue.setAddress(request.getAddress());
        venue.setCity(request.getCity());
        venue.setState(request.getState());
        venue.setCountry(request.getCountry());
        venue.setCapacity(request.getCapacity());
        venue.setNumberOfFloors(request.getNumberOfFloors());
        venue.setFloorPlanUrl(request.getFloorPlanUrl());
        venue.setLatitude(request.getLatitude());
        venue.setLongitude(request.getLongitude());

        log.info("Creating venue: {}", request.getName());
        return venueRepository.save(venue);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Venue updateVenue(Long venueId, VenueRequest request, Long userId) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));

        venue.setName(request.getName());
        venue.setAddress(request.getAddress());
        venue.setCity(request.getCity());
        venue.setState(request.getState());
        venue.setCountry(request.getCountry());
        venue.setCapacity(request.getCapacity());
        venue.setNumberOfFloors(request.getNumberOfFloors());
        venue.setFloorPlanUrl(request.getFloorPlanUrl());
        venue.setLatitude(request.getLatitude());
        venue.setLongitude(request.getLongitude());

        log.info("Updating venue: {}", venueId);
        return venueRepository.save(venue);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void deleteVenue(Long venueId) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));
        venueRepository.delete(venue);
        log.info("Deleted venue: {}", venueId);
    }

    public List<Venue> getAllVenues() {
        return venueRepository.findAll();
    }

    public Venue getVenueById(Long venueId) {
        return venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));
    }

    public List<Venue> getAvailableVenues() {
        return venueRepository.findByIsBookedFalse();
    }

    public List<Venue> searchVenues(VenueSearchCriteria criteria) {
        return venueRepository.searchVenues(
                criteria.getName(),
                criteria.getAddress(),
                criteria.getCity(),
                criteria.getState(),
                criteria.getCountry(),
                criteria.getMinCapacity(),
                criteria.getMaxCapacity(),
                criteria.getNumberOfFloors(),
                criteria.getAvailableOnly());
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public VenueBooking bookVenue(VenueBookingRequest request, Long bookedBy) {
        validateBookingDates(request.getBookingStartDate(), request.getBookingEndDate());

        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));

        List<VenueBooking> conflicts = venueBookingRepository.findConflictingBookings(
                request.getVenueId(),
                request.getBookingStartDate(),
                request.getBookingEndDate());

        if (!conflicts.isEmpty()) {
            throw new ValidationException("Venue is already booked for the selected dates");
        }

        VenueBooking booking = new VenueBooking();
        booking.setVenueId(request.getVenueId());
        booking.setEventId(request.getEventId());
        booking.setBookedBy(bookedBy);
        booking.setBookingStartDate(request.getBookingStartDate());
        booking.setBookingEndDate(request.getBookingEndDate());

        venue.setIsBooked(true);
        venue.setBookedBy(bookedBy);
        venue.setBookedForEventId(request.getEventId());
        venue.setBookingStartDate(request.getBookingStartDate());
        venue.setBookingEndDate(request.getBookingEndDate());

        venueRepository.save(venue);
        log.info("Venue {} booked by user {} for event {}", request.getVenueId(), bookedBy, request.getEventId());

        return venueBookingRepository.save(booking);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void cancelVenueBooking(Long bookingId, Long userId) {
        VenueBooking booking = venueBookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getBookedBy().equals(userId)) {
            throw new UnauthorizedException("Unauthorized to cancel this booking");
        }

        booking.setStatus(VenueBooking.BookingStatus.CANCELLED);
        venueBookingRepository.save(booking);

        Venue venue = venueRepository.findById(booking.getVenueId())
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));

        venue.setIsBooked(false);
        venue.setBookedBy(null);
        venue.setBookedForEventId(null);
        venue.setBookingStartDate(null);
        venue.setBookingEndDate(null);
        venueRepository.save(venue);

        log.info("Venue booking {} cancelled by user {}", bookingId, userId);
    }

    public List<VenueBookingResponse> getMyVenueBookings(Long userId) {
        List<VenueBooking> bookings = venueBookingRepository.findByBookedBy(userId);
        return bookings.stream().map(booking -> {
            Venue venue = venueRepository.findById(booking.getVenueId()).orElse(null);
            String venueName = venue != null ? venue.getName() : "Unknown Venue";
            return new VenueBookingResponse(
                    booking.getBookingId(),
                    booking.getVenueId(),
                    venueName,
                    booking.getEventId(),
                    booking.getBookedBy(),
                    booking.getBookingStartDate(),
                    booking.getBookingEndDate(),
                    booking.getStatus().name());
        }).collect(java.util.stream.Collectors.toList());
    }

    public List<VenueBooking> getVenueBookingHistory(Long venueId) {
        return venueBookingRepository.findByVenueId(venueId);
    }

    private void validateBookingDates(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate.isBefore(LocalDateTime.now())) {
            throw new ValidationException("Booking start date cannot be in the past");
        }
        if (endDate.isBefore(startDate)) {
            throw new ValidationException("Booking end date must be after start date");
        }
    }
}
