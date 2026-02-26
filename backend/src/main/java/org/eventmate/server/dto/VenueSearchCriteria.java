package org.eventmate.server.dto;

import lombok.Data;

@Data
public class VenueSearchCriteria {
    private String name;
    private String address;
    private String city;
    private String state;
    private String country;
    private Integer minCapacity;
    private Integer maxCapacity;
    private Integer numberOfFloors;
    private Boolean availableOnly = true;
}
