package org.eventmate.server.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eventmate.server.entity.Booking;
import org.eventmate.server.entity.Event;
import org.eventmate.server.entity.User;
import org.eventmate.server.repository.BookingRepository;
import org.eventmate.server.repository.EventRepository;
import org.eventmate.server.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReminderService {

    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final org.eventmate.server.repository.NotificationRepository notificationRepository;

    @Scheduled(cron = "0 0 9 * * *") // Run daily at 9 AM
    public void sendEventReminders() {
        // Calculate date range: events starting strictly between tomorrow+1 day and
        // tomorrow+2 days
        // E.g. if today is 1st 9AM. tomorrow is 2nd 9AM. dayAfter is 3rd 9AM.
        // We want events on the 3rd.
        // So target range: [Now + 48h, Now + 72h] approx?
        // Or simpler: events starting on (Today + 2 days).

        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDate targetDate = today.plusDays(2);

        LocalDateTime startOfDay = targetDate.atStartOfDay();
        LocalDateTime endOfDay = targetDate.plusDays(1).atStartOfDay();

        List<Event> upcomingEvents = eventRepository.findAll().stream()
                .filter(e -> e.getStartDate().isAfter(startOfDay) && e.getStartDate().isBefore(endOfDay))
                .toList();

        for (Event event : upcomingEvents) {
            List<Booking> bookings = bookingRepository.findByEventId(event.getEventId());
            for (Booking booking : bookings) {
                if (booking.getStatus() == Booking.BookingStatus.CONFIRMED) {
                    User user = userRepository.findById(booking.getUserId()).orElse(null);
                    if (user != null) {
                        sendReminder(user, event);
                    }
                }
            }
        }
        log.info("Event reminders processed for {} events", upcomingEvents.size());
    }

    private void sendReminder(User user, Event event) {
        // 1. Send Email
        try {
            log.info("Sending reminder to {} for event {}", user.getEmail(), event.getTitle());
            emailService.sendEventReminder(user.getEmail(), user.getFullName(), event);
        } catch (Exception e) {
            log.error("Failed to send reminder email to {}", user.getEmail(), e);
        }

        // 2. Create In-App Notification
        try {
            org.eventmate.server.entity.Notification notification = new org.eventmate.server.entity.Notification();
            notification.setUserId(user.getUserId());
            notification.setEventId(event.getEventId());
            notification.setMessage("Reminder: " + event.getTitle() + " starts in 2 days!");
            notification.setRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(notification);
        } catch (Exception e) {
            log.error("Failed to create notification for user {}", user.getUserId(), e);
        }
    }
}
