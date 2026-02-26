package org.eventmate.server.dto;

import lombok.Data;

@Data
public class GuestRequest {
    private Long id; // For updates
    private String name;
    private String linkedinProfile;
    private String photo;
    private String role;
    private String about;
}
