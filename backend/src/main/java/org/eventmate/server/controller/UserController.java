package org.eventmate.server.controller;

import lombok.RequiredArgsConstructor;
import org.eventmate.server.dto.UserProfileResponse;
import org.eventmate.server.entity.SocialLink;
import org.eventmate.server.entity.User;
import org.eventmate.server.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;

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
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());

        response.setPhoneNumber(user.getPhoneNumber());
        response.setAreaOfInterest(user.getAreaOfInterest());
        response.setBio(user.getBio());
        response.setProfilePicture(user.getProfilePicture());

        if (user.getSocialLinks() != null) {
            response.setSocialLinks(
                    user.getSocialLinks().stream().map(link -> {
                        UserProfileResponse.SocialLinkDTO dto =
                                new UserProfileResponse.SocialLinkDTO();
                        dto.setId(link.getLinkId());
                        dto.setPlatform(link.getPlatformName());
                        dto.setUrl(link.getUrl());
                        return dto;
                    }).toList());
        }

        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @RequestBody UserProfileResponse request,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmailWithSocialLinks(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAreaOfInterest(request.getAreaOfInterest());
        user.setBio(request.getBio());
        user.setProfilePicture(request.getProfilePicture());

        if (user.getSocialLinks() == null) {
            user.setSocialLinks(new ArrayList<>());
        } else {
            user.getSocialLinks().clear();
        }

        if (request.getSocialLinks() != null) {
            request.getSocialLinks().forEach(dto -> {
                SocialLink link = new SocialLink();
                link.setPlatformName(dto.getPlatform());
                link.setUrl(dto.getUrl());
                link.setUser(user);
                user.getSocialLinks().add(link);
            });
        }

        userRepository.save(user);

        return getProfile(authentication);
    }
}