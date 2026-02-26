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

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;
    private final TransactionRepository transactionRepository;

    public AnalyticsResponse getAnalytics() {
        Long totalEvents = eventRepository.count();
        Long totalUsers = userRepository.countByRole(Role.USER);
        Long totalOrgs = userRepository.countByRole(Role.ORGANIZATION);
        Long totalBookings = bookingRepository.count();
        BigDecimal totalRevenue = transactionRepository.getTotalRevenue();
        Long activeEvents = (long) eventRepository.findByStatus(Event.EventStatus.ACTIVE).size();
        Long completedEvents = (long) eventRepository.findByStatus(Event.EventStatus.COMPLETED).size();

        return new AnalyticsResponse(
                totalEvents, totalUsers, totalOrgs, totalBookings,
                totalRevenue != null ? totalRevenue : BigDecimal.ZERO,
                activeEvents, completedEvents);
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
        userRepository.deleteById(userId);
        log.info("Admin deleted user {}", userId);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
        log.info("Admin toggled user {} status to {}", userId, user.getIsActive());
    }

    // ========== Event Management Methods ==========

    /**
     * Get all events with optional status filter (excludes soft-deleted)
     */
    public List<Event> getAllEventsForAdmin(String status) {
        if (status != null && !status.isEmpty()) {
            try {
                Event.EventStatus eventStatus = Event.EventStatus.valueOf(status);
                return eventRepository.findByStatusAndDeletedAtIsNullOrderByCreatedAtDesc(eventStatus);
            } catch (IllegalArgumentException e) {
                // Invalid status, return all
            }
        }
        return eventRepository.findByDeletedAtIsNullOrderByCreatedAtDesc();
    }

    /**
     * Toggle featured status for an event
     */
    @Transactional
    public Event toggleFeatured(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        event.setIsFeatured(!Boolean.TRUE.equals(event.getIsFeatured()));
        log.info("Admin toggled featured status for event {} to {}", eventId, event.getIsFeatured());
        return eventRepository.save(event);
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
