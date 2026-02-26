package org.eventmate.server.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class VenueRequest {
    @NotBlank(message = "Venue name is required")
    @Size(min = 3, max = 255, message = "Name must be between 3 and 255 characters")
    private String name;
    
    @NotBlank(message = "Address is required")
    private String address;
    
    @NotBlank(message = "City is required")
    private String city;
    
    @NotBlank(message = "State is required")
    private String state;
    
    @NotBlank(message = "Country is required")
    private String country;
    
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;
    
    @Min(value = 1, message = "Number of floors must be at least 1")
    private Integer numberOfFloors;
    
    private String floorPlanUrl;
    private Double latitude;
    private Double longitude;
}
