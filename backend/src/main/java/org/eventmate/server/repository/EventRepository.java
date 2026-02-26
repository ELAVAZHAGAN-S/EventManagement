package org.eventmate.server.repository;

import org.eventmate.server.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByOrganizerId(Long organizerId);

    List<Event> findByStatus(Event.EventStatus status);

    List<Event> findByEventType(Event.EventType eventType);

    @Query("SELECT e FROM Event e WHERE e.startDate >= :now AND e.status = 'ACTIVE' AND e.deletedAt IS NULL")
    List<Event> findUpcomingEvents(LocalDateTime now);

    @Query("SELECT e FROM Event e WHERE (e.title LIKE %:keyword% OR e.description LIKE %:keyword%) AND e.deletedAt IS NULL")
    List<Event> searchEvents(String keyword);

    // Admin-related queries
    List<Event> findByDeletedAtIsNullOrderByCreatedAtDesc();

    List<Event> findByStatusAndDeletedAtIsNullOrderByCreatedAtDesc(Event.EventStatus status);

    List<Event> findByIsFeaturedTrueAndDeletedAtIsNullAndStatus(Event.EventStatus status);

    List<Event> findByEventTypeAndStatusAndDeletedAtIsNull(Event.EventType eventType, Event.EventStatus status);

    @Query("SELECT e FROM Event e WHERE e.status = 'ACTIVE' AND e.deletedAt IS NULL ORDER BY e.startDate ASC")
    List<Event> findActiveEventsForAttendee();
}
