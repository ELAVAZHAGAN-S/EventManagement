package org.eventmate.server.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eventmate.server.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for user-related operations.
 * Provides endpoints for user profile and role-based access examples.
 * 
 * @author EventMate Team
 * @version 1.0
 * @since 1.0
 */
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class UserController {

    private final org.eventmate.server.service.UserService userService;
    private final org.eventmate.server.repository.UserRepository userRepository; // Direct repo access for simple get

    /**
     * Retrieves the authenticated user's profile.
     * 
     * @param authentication the current authentication context
     * @return ResponseEntity containing user profile data
     */
    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(Authentication authentication) {
        String email = authentication.getName(); // Get email from Principal
        // Fetch fresh from DB to include new fields and social links
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<java.util.List<User>> searchUsers(@RequestParam String query) {
        return ResponseEntity.ok(userService.searchUsers(query));
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(Authentication authentication, @RequestBody User updatedData) {
        String email = authentication.getName();
        User savedUser = userService.updateProfile(email, updatedData);
        return ResponseEntity.ok(savedUser);
    }

    /**
     * Admin-only endpoint for testing role-based access control.
     * 
     * @return ResponseEntity with success message
     */
    @GetMapping("/admin-only")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> adminOnly() {
        log.info("Admin-only endpoint accessed");
        return ResponseEntity.ok("Admin access granted");
    }

    /**
     * Organization and Admin access endpoint for testing role-based access control.
     * 
     * @return ResponseEntity with success message
     */
    @GetMapping("/organization-only")
    @PreAuthorize("hasAnyRole('ORGANIZATION', 'ADMIN')")
    public ResponseEntity<String> organizationOnly() {
        log.info("Organization-only endpoint accessed");
        return ResponseEntity.ok("Organization access granted");
    }
}