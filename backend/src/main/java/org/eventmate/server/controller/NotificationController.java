package org.eventmate.server.controller;

import lombok.RequiredArgsConstructor;
import org.eventmate.server.entity.Notification;
import org.eventmate.server.exception.custom.ResourceNotFoundException;
import org.eventmate.server.repository.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.eventmate.server.service.UserService;
import org.eventmate.server.entity.User;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<Notification>> getUserNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build(); // Should be handled by security filter usually
        }
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getUserId()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        // Basic security check
        User user = userService.getUserByEmail(userDetails.getUsername());
        if (!notification.getUserId().equals(user.getUserId())) {
            return ResponseEntity.status(403).build();
        }

        notification.setRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok().build();
    }
}
