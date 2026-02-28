package org.eventmate.server.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserProfileResponse {

    private Long id;
    private String fullName;
    private String email;
    private String role;

    private String phoneNumber;
    private String areaOfInterest;
    private String bio;
    private String profilePicture;

    private List<SocialLinkDTO> socialLinks;

    @Data
    public static class SocialLinkDTO {
        private Long id;
        private String platform;
        private String url;
    }
}