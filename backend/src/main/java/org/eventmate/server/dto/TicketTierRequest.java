package org.eventmate.server.dto;

import lombok.Data;

@Data
public class TicketTierRequest {
    private String name;
    private Double price;
    private Integer capacity;
    private String description;
}
