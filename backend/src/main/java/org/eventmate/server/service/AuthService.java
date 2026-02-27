package org.eventmate.server.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eventmate.server.dto.*;
import org.eventmate.server.exception.custom.*;
import org.eventmate.server.entity.User;
import org.eventmate.server.repository.UserRepository;
import org.eventmate.server.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service class for handling authentication operations.
 * Manages user registration, login, and JWT token generation.
 * 
 * @author EventMate Team
 * @version 1.0
 * @since 1.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    /**
     * Registers a new user in the system.
     * 
     * @param request the registration request containing user details
     * @return AuthResponse with JWT token and user information
     * @throws RuntimeException if email already exists
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Attempting to register user with email: {}", request.getEmail());
        
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed - email already exists: {}", request.getEmail());
            throw new DuplicateResourceException("Email already exists");
        }

        // Create new user entity
        User user = createUserFromRequest(request);
        
        // Save user to database
        @SuppressWarnings("null")
        User savedUser = userRepository.save(user);
        log.info("User registered successfully with ID: {}", savedUser.getUserId());
        
        // Generate JWT token
        String token = jwtUtil.generateToken(savedUser);

        return buildAuthResponse(token, savedUser);
    }

    /**
     * Authenticates a user and generates JWT token.
     * 
     * @param request the login request containing email and password
     * @return AuthResponse with JWT token and user information
     * @throws RuntimeException if authentication fails or user not found
     */
    public AuthResponse login(LoginRequest request) {
        log.info("Attempting to authenticate user: {}", request.getEmail());
        
        // Authenticate user credentials
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.error("User not found after successful authentication: {}", request.getEmail());
                    return new ResourceNotFoundException("User not found");
                });

        log.info("User authenticated successfully: {}", request.getEmail());
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user);

        return buildAuthResponse(token, user);
    }

    /**
     * Initiates forgot password process by sending OTP to user's email.
     */
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), user.getFullName(), otp);
        log.info("OTP sent to email: {}", request.getEmail());
    }

    /**
     * Verifies OTP for password reset.
     */
    public boolean verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getOtp() == null || user.getOtpExpiry() == null) {
            throw new ValidationException("No OTP found for this email");
        }

        if (java.time.LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            throw new ValidationException("OTP has expired");
        }

        return user.getOtp().equals(request.getOtp());
    }

    /**
     * Resets password using verified OTP.
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("Passwords do not match");
        }

        if (!verifyOtp(new VerifyOtpRequest() {{
            setEmail(request.getEmail());
            setOtp(request.getOtp());
        }})) {
            throw new ValidationException("Invalid OTP");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        log.info("Password reset successfully for email: {}", request.getEmail());
    }

    private String generateOtp() {
        return String.format("%06d", (int) (Math.random() * 1000000));
    }

    /**
     * Creates a User entity from registration request.
     * 
     * @param request the registration request
     * @return User entity ready for persistence
     */
    private User createUserFromRequest(RegisterRequest request) {
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole(request.getRole());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setIsActive(true);
        return user;
    }

    /**
     * Builds AuthResponse from token and user data.
     * 
     * @param token the JWT token
     * @param user the user entity
     * @return AuthResponse containing token and user information
     */
    private AuthResponse buildAuthResponse(String token, User user) {
        return new AuthResponse(token, user.getUserId(), user.getEmail(), 
                               user.getFullName(), user.getRole());
    }
}