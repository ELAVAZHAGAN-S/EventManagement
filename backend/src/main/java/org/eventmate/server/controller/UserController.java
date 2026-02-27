package org.eventmate.server.controller;

import lombok.RequiredArgsConstructor;
import org.eventmate.server.dto.UserProfileResponse;
import org.eventmate.server.entity.User;
import org.eventmate.server.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(Authentication authentication) {
        String email = authentication.getName();

        User user = userRepository.findByEmailWithSocialLinks(email)
        .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getUserId());
        response.setName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());

        if (user.getSocialLinks() != null) {
            response.setSocialLinks(
                    user.getSocialLinks().stream().map(link -> {
                        UserProfileResponse.SocialLinkDTO dto =
                                new UserProfileResponse.SocialLinkDTO();
                        dto.setId(link.getLinkId());
                        dto.setPlatform(link.getPlatformName());
                        dto.setUrl(link.getUrl());
                        return dto;
                    }).toList()
            );
        }

        return ResponseEntity.ok(response);
    }
}