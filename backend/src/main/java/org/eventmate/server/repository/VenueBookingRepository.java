package org.eventmate.server.repository;

import org.eventmate.server.entity.VenueBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VenueBookingRepository extends JpaRepository<VenueBooking, Long> {
    
    List<VenueBooking> findByBookedBy(Long bookedBy);
    
    List<VenueBooking> findByVenueId(Long venueId);
    
    @Query("SELECT vb FROM VenueBooking vb WHERE vb.venueId = :venueId " +
           "AND vb.status = 'CONFIRMED' " +
           "AND ((vb.bookingStartDate <= :endDate AND vb.bookingEndDate >= :startDate))")
    List<VenueBooking> findConflictingBookings(Long venueId, LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT vb FROM VenueBooking vb WHERE vb.eventId = :eventId AND vb.status = 'CONFIRMED'")
    VenueBooking findByEventId(Long eventId);
}
