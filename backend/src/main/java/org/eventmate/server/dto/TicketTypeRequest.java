package org.eventmate.server.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TicketTypeRequest {
    @NotNull(message = "Event ID is required")
    private Long eventId;
    
    @NotBlank(message = "Ticket name is required")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private String name;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", message = "Price cannot be negative")
    private BigDecimal price;
    
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantityAllocated;
    
    private LocalDateTime salesStartDate;
    private LocalDateTime salesEndDate;
}
