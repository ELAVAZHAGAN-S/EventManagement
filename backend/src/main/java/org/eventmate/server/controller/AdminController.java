package org.eventmate.server.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eventmate.server.dto.AnalyticsResponse;
import org.eventmate.server.entity.Role;
import org.eventmate.server.entity.Transaction;
import org.eventmate.server.entity.User;
import org.eventmate.server.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(adminService.getAnalytics());
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        return ResponseEntity.ok(adminService.getAllTransactions());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/users/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable Role role) {
        return ResponseEntity.ok(adminService.getUsersByRole(role));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok("User deleted successfully");
    }

    @PutMapping("/users/{userId}/toggle-status")
    public ResponseEntity<String> toggleUserStatus(@PathVariable Long userId) {
        adminService.toggleUserStatus(userId);
        return ResponseEntity.ok("User status toggled successfully");
    }

    // ========== Event Management Endpoints ==========

    @GetMapping("/events")
    public ResponseEntity<List<org.eventmate.server.entity.Event>> getAllEvents(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(adminService.getAllEventsForAdmin(status));
    }

    @GetMapping("/events/featured")
    public ResponseEntity<List<org.eventmate.server.entity.Event>> getFeaturedEvents() {
        return ResponseEntity.ok(adminService.getFeaturedEvents());
    }

    @PutMapping("/events/{eventId}/toggle-featured")
    public ResponseEntity<org.eventmate.server.entity.Event> toggleFeatured(@PathVariable Long eventId) {
        return ResponseEntity.ok(adminService.toggleFeatured(eventId));
    }

    @DeleteMapping("/events/{eventId}")
    public ResponseEntity<String> softDeleteEvent(
            @PathVariable Long eventId,
            @RequestParam String reason) {
        adminService.softDeleteEvent(eventId, reason);
        return ResponseEntity.ok("Event deleted successfully");
    }
}
