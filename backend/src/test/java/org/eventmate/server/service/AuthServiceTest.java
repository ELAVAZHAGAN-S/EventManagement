package org.eventmate.server.service;

import org.eventmate.server.dto.*;
import org.eventmate.server.entity.Role;
import org.eventmate.server.entity.User;
import org.eventmate.server.repository.UserRepository;
import org.eventmate.server.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @Mock
    private JwtUtil jwtUtil;
    
    @Mock
    private AuthenticationManager authenticationManager;
    
    @Mock
    private EmailService emailService;
    
    @InjectMocks
    private AuthService authService;
    
    private User testUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUserId(1L);
        testUser.setEmail("test@example.com");
        testUser.setPasswordHash("hashedPassword");
        testUser.setFullName("Test User");
        testUser.setRole(Role.USER);
        testUser.setIsActive(true);
        
        registerRequest = new RegisterRequest();
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setFullName("Test User");
        registerRequest.setRole(Role.USER);
        
        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");
    }

    @Test
    void register_Success() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtUtil.generateToken(any(User.class))).thenReturn("jwt-token");

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals("test@example.com", response.getEmail());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_EmailAlreadyExists_ThrowsException() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThrows(RuntimeException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_Success() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(null);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(jwtUtil.generateToken(any(User.class))).thenReturn("jwt-token");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals("test@example.com", response.getEmail());
    }

    @Test
    void login_UserNotFound_ThrowsException() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(null);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
    }

    @Test
    void forgotPassword_Success() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        doNothing().when(emailService).sendOtpEmail(anyString(), anyString(), anyString());

        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("test@example.com");

        assertDoesNotThrow(() -> authService.forgotPassword(request));
        verify(userRepository).save(any(User.class));
        verify(emailService).sendOtpEmail(anyString(), anyString(), anyString());
    }

    @Test
    void verifyOtp_ValidOtp_ReturnsTrue() {
        testUser.setOtp("123456");
        testUser.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));

        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setEmail("test@example.com");
        request.setOtp("123456");

        assertTrue(authService.verifyOtp(request));
    }

    @Test
    void verifyOtp_ExpiredOtp_ThrowsException() {
        testUser.setOtp("123456");
        testUser.setOtpExpiry(LocalDateTime.now().minusMinutes(1));
        
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));

        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setEmail("test@example.com");
        request.setOtp("123456");

        assertThrows(RuntimeException.class, () -> authService.verifyOtp(request));
    }

    @Test
    void resetPassword_Success() {
        testUser.setOtp("123456");
        testUser.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode(anyString())).thenReturn("newHashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setEmail("test@example.com");
        request.setOtp("123456");
        request.setNewPassword("newPassword123");
        request.setConfirmPassword("newPassword123");

        assertDoesNotThrow(() -> authService.resetPassword(request));
        verify(userRepository).save(any(User.class));
    }

    @Test
    void resetPassword_PasswordMismatch_ThrowsException() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setEmail("test@example.com");
        request.setOtp("123456");
        request.setNewPassword("password1");
        request.setConfirmPassword("password2");

        assertThrows(RuntimeException.class, () -> authService.resetPassword(request));
        verify(userRepository, never()).save(any(User.class));
    }
}
