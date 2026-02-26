package org.eventmate.server.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_types")
@Data
public class TicketType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_type_id")
    private Long ticketTypeId;

    @Column(name = "event_id")
    private Long eventId;

    @Column(name = "name")
    private String name;

    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "quantity_allocated")
    private Integer quantityAllocated;

    @Column(name = "quantity_sold")
    private Integer quantitySold = 0;

    @Column(name = "sales_start_date")
    private LocalDateTime salesStartDate;

    @Column(name = "sales_end_date")
    private LocalDateTime salesEndDate;

    @Column(name = "status")
    private String status = "AVAILABLE";

    @PrePersist
    protected void onCreate() {
        if (quantitySold == null) {
            quantitySold = 0;
        }
        if (status == null) {
            status = "AVAILABLE";
        }
    }
}