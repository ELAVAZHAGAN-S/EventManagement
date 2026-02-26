package org.eventmate.server.repository;

import org.eventmate.server.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByBookingId(Long bookingId);
    
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.transactionStatus = 'SUCCESS'")
    BigDecimal getTotalRevenue();
    
    @Query("SELECT t FROM Transaction t ORDER BY t.paymentDate DESC")
    List<Transaction> findAllOrderByDateDesc();
}
