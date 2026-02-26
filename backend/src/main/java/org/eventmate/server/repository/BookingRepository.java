package org.eventmate.server.repository;

import org.eventmate.server.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);

    List<Booking> findByEventId(Long eventId);

    Optional<Booking> findByUserIdAndEventId(Long userId, Long eventId);

    @Query("SELECT b.seatNumber FROM Booking b WHERE b.eventId = :eventId AND b.status = 'CONFIRMED' AND b.seatNumber IS NOT NULL")
    List<Integer> findBookedSeatsByEventId(Long eventId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.eventId = :eventId AND b.status = 'CONFIRMED'")
    Long countConfirmedBookings(Long eventId);
}
