package org.eventmate.server.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eventmate.server.dto.AnalyticsResponse;
import org.eventmate.server.entity.Event;
import org.eventmate.server.entity.Role;
import org.eventmate.server.entity.Transaction;
import org.eventmate.server.entity.User;
import org.eventmate.server.exception.custom.*;
import org.eventmate.server.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import org.hibernate.Hibernate;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;
    private final TransactionRepository transactionRepository;

    public List<Object[]> getTopEvents() {
        List<Object[]> events = bookingRepository.findTopEvents();
        return events.size() > 5 ? events.subList(0, 5) : events;
    }

    public AnalyticsResponse getAnalytics() {

        Long totalEvents = eventRepository.count();
        Long totalUsers = userRepository.countByRole(Role.USER);
        Long totalOrgs = userRepository.countByRole(Role.ORGANIZATION);
        Long totalBookings = bookingRepository.count();

        BigDecimal totalRevenue = transactionRepository.getTotalRevenue();

        List<Object[]> eventCounts = eventRepository.getEventStatusCounts();

        Long activeEvents = 0L;
        Long completedEvents = 0L;

        if (!eventCounts.isEmpty()) {
            Object[] row = eventCounts.get(0);

            activeEvents = row[0] != null ? ((Number) row[0]).longValue() : 0L;
            completedEvents = row[1] != null ? ((Number) row[1]).longValue() : 0L;
        }

        return new AnalyticsResponse(
                totalEvents,
                totalUsers,
                totalOrgs,
                totalBookings,
                totalRevenue != null ? totalRevenue : BigDecimal.ZERO,
                activeEvents,
                completedEvents);
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAllOrderByDateDesc();
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    @Transactional
    public void deleteUser(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.ADMIN) {
            throw new IllegalStateException("Admin users cannot be deleted");
        }

        userRepository.delete(user);

        log.info("Admin deleted user {}", userId);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void toggleUserStatus(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.ADMIN) {
            throw new IllegalStateException("Admin status cannot be modified");
        }

        user.setIsActive(!user.getIsActive());

        userRepository.save(user);

        log.info("Admin toggled user {} status to {}", userId, user.getIsActive());
    }

    // ========== Event Management Methods ==========

    /**
     * Get all events with optional status filter (excludes soft-deleted)
     */
    @Transactional(readOnly = true)
    public List<Event> getAllEventsForAdmin(String status) {

        List<Event> events;

        if (status != null && !status.isEmpty()) {
            try {
                Event.EventStatus eventStatus = Event.EventStatus.valueOf(status);
                events = eventRepository.findByStatusAndDeletedAtIsNullOrderByCreatedAtDesc(eventStatus);
            } catch (IllegalArgumentException e) {
                events = eventRepository.findByDeletedAtIsNullOrderByCreatedAtDesc();
            }
        } else {
            events = eventRepository.findByDeletedAtIsNullOrderByCreatedAtDesc();
        }

        events.forEach(event -> {
            Hibernate.initialize(event.getTicketTiers());
            Hibernate.initialize(event.getGuests());
        });

        return events;
    }

    /**
     * Toggle featured status for an event
     */
    @Transactional
    public Event toggleFeatured(Long eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        event.setIsFeatured(!Boolean.TRUE.equals(event.getIsFeatured()));

        Event saved = eventRepository.save(event);

        Hibernate.initialize(saved.getTicketTiers());
        Hibernate.initialize(saved.getGuests());

        log.info("Admin toggled featured status for event {} to {}", eventId, saved.getIsFeatured());

        return saved;
    }

    /**
     * Soft delete an event with reason
     */
    @Transactional
    public void softDeleteEvent(Long eventId, String reason) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        event.setDeletedAt(java.time.LocalDateTime.now());
        event.setDeleteReason(reason);
        event.setStatus(Event.EventStatus.CANCELLED);
        eventRepository.save(event);
        log.info("Admin soft deleted event {} with reason: {}", eventId, reason);
    }

    /**
     * Get featured events for carousel
     */
    public List<Event> getFeaturedEvents() {
        return eventRepository.findByIsFeaturedTrueAndDeletedAtIsNullAndStatus(Event.EventStatus.ACTIVE);
    }
}
