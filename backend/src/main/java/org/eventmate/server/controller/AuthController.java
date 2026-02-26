package org.eventmate.server.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eventmate.server.dto.*;
import org.eventmate.server.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for authentication operations.
 * Handles user registration and login with JWT token generation.
 * 
 * @author EventMate Team
 * @version 1.0
 * @since 1.0
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class AuthController {

    private final AuthService authService;

    /**
     * Registers a new user in the system.
     * 
     * @param request the registration request containing user details
     * @return ResponseEntity with AuthResponse containing JWT token and user info
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registration attempt for email: {}, role: {}", request.getEmail(), request.getRole());
        log.debug("Registration request details - fullName: {}, phone: {}",
                request.getFullName(), request.getPhoneNumber());
        AuthResponse response = authService.register(request);
        log.info("User registered successfully: {} with role: {}", request.getEmail(), request.getRole());
        return ResponseEntity.ok(response);
    }

    /**
     * Authenticates a user and returns JWT token.
     * 
     * @param request the login request containing email and password
     * @return ResponseEntity with AuthResponse containing JWT token and user info
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            log.info("Login attempt for email: {}", request.getEmail());
            AuthResponse response = authService.login(request);
            log.info("User logged in successfully: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Login failed for email: {}, error: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    /**
     * Initiates forgot password process by sending OTP to email.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            log.info("Forgot password request for email: {}", request.getEmail());
            authService.forgotPassword(request);
            return ResponseEntity.ok("OTP sent to your email");
        } catch (RuntimeException e) {
            log.error("Forgot password failed for email: {}, error: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Verifies OTP for password reset.
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        try {
            log.info("OTP verification for email: {}", request.getEmail());
            boolean isValid = authService.verifyOtp(request);
            if (isValid) {
                return ResponseEntity.ok("OTP verified successfully");
            } else {
                return ResponseEntity.badRequest().body("Invalid OTP");
            }
        } catch (RuntimeException e) {
            log.error("OTP verification failed for email: {}, error: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Resets password using verified OTP.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            log.info("Password reset for email: {}", request.getEmail());
            authService.resetPassword(request);
            return ResponseEntity.ok("Password reset successfully");
        } catch (RuntimeException e) {
            log.error("Password reset failed for email: {}, error: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}