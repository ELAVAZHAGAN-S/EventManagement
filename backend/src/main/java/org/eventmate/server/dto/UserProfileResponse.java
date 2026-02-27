package org.eventmate.server.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserProfileResponse {

    private Long id;
    private String name;
    private String email;
    private String role;
    private List<SocialLinkDTO> socialLinks;

    @Data
    public static class SocialLinkDTO {
        private Long id;
        private String platform;
        private String url;
    }
}