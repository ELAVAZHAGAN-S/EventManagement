package org.eventmate.server.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Long transactionId;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "amount", precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "transaction_status")
    private String transactionStatus = "SUCCESS";

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(name = "invoice_id")
    private String invoiceId;

    @PrePersist
    protected void onCreate() {
        if (paymentDate == null) {
            paymentDate = LocalDateTime.now();
        }
        if (transactionStatus == null) {
            transactionStatus = "SUCCESS";
        }
    }
}