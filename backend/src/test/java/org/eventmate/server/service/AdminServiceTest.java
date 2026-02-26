package org.eventmate.server.service;

import org.eventmate.server.dto.AnalyticsResponse;
import org.eventmate.server.entity.Event;
import org.eventmate.server.entity.Role;
import org.eventmate.server.entity.Transaction;
import org.eventmate.server.entity.User;
import org.eventmate.server.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;
    
    @Mock
    private EventRepository eventRepository;
    
    @Mock
    private BookingRepository bookingRepository;
    
    @Mock
    private TransactionRepository transactionRepository;
    
    @InjectMocks
    private AdminService adminService;
    
    private User testUser;
    private Transaction testTransaction;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUserId(1L);
        testUser.setEmail("test@example.com");
        testUser.setRole(Role.USER);
        testUser.setIsActive(true);
        
        testTransaction = new Transaction();
        testTransaction.setTransactionId(1L);
        testTransaction.setAmount(new BigDecimal("100.00"));
    }

    @Test
    void getAnalytics_Success() {
        when(eventRepository.count()).thenReturn(10L);
        when(userRepository.countByRole(Role.USER)).thenReturn(100L);
        when(userRepository.countByRole(Role.ORGANIZATION)).thenReturn(10L);
        when(bookingRepository.count()).thenReturn(500L);
        when(transactionRepository.getTotalRevenue()).thenReturn(new BigDecimal("50000.00"));
        when(eventRepository.findByStatus(Event.EventStatus.ACTIVE)).thenReturn(Arrays.asList());
        when(eventRepository.findByStatus(Event.EventStatus.COMPLETED)).thenReturn(Arrays.asList());

        AnalyticsResponse response = adminService.getAnalytics();

        assertNotNull(response);
        assertEquals(10L, response.getTotalEvents());
        assertEquals(100L, response.getTotalUsers());
        assertEquals(new BigDecimal("50000.00"), response.getTotalRevenue());
    }

    @Test
    void getAllTransactions_Success() {
        when(transactionRepository.findAllOrderByDateDesc()).thenReturn(Arrays.asList(testTransaction));

        List<Transaction> results = adminService.getAllTransactions();

        assertNotNull(results);
        assertEquals(1, results.size());
        verify(transactionRepository).findAllOrderByDateDesc();
    }

    @Test
    void getAllUsers_Success() {
        when(userRepository.findAll()).thenReturn(Arrays.asList(testUser));

        List<User> results = adminService.getAllUsers();

        assertNotNull(results);
        assertEquals(1, results.size());
        verify(userRepository).findAll();
    }

    @Test
    void getUsersByRole_Success() {
        when(userRepository.findByRole(any(Role.class))).thenReturn(Arrays.asList(testUser));

        List<User> results = adminService.getUsersByRole(Role.USER);

        assertNotNull(results);
        assertEquals(1, results.size());
        verify(userRepository).findByRole(any(Role.class));
    }

    @Test
    void deleteUser_Success() {
        doNothing().when(userRepository).deleteById(anyLong());

        assertDoesNotThrow(() -> adminService.deleteUser(1L));
        verify(userRepository).deleteById(anyLong());
    }

    @Test
    void toggleUserStatus_Success() {
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        assertDoesNotThrow(() -> adminService.toggleUserStatus(1L));
        verify(userRepository).save(any(User.class));
        assertFalse(testUser.getIsActive());
    }
}
