package org.eventmate.server.service;

import lombok.RequiredArgsConstructor;
import org.eventmate.server.entity.SocialLink;
import org.eventmate.server.entity.User;
import org.eventmate.server.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<User> searchUsers(String query) {
        return userRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);
    }

    @Transactional
    public User updateProfile(String email, User updatedData) {
        User existingUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!existingUser.getEmail().equals(updatedData.getEmail())) {
            // Basic check, though usually we don't allow email updates here
        }

        // Update basic fields
        existingUser.setFullName(updatedData.getFullName());
        existingUser.setPhoneNumber(updatedData.getPhoneNumber());
        existingUser.setBio(updatedData.getBio());
        existingUser.setAreaOfInterest(updatedData.getAreaOfInterest());
        existingUser.setProfilePicture(updatedData.getProfilePicture());

        // Org specific
        if (updatedData.getWebsite() != null) {
            existingUser.setWebsite(updatedData.getWebsite());
        }
        // Company Name is usually read-only, but if we want to allow allowing it:
        // existingUser.setCompanyName(updatedData.getCompanyName());

        // Handle Social Links
        // Merge strategy: Clear and re-add or intelligent merge?
        // Simple strategy: orphanRemoval=true in Entity handles removal if list is
        // replaced.

        if (updatedData.getSocialLinks() != null) {
            List<SocialLink> newLinks = updatedData.getSocialLinks().stream().map(link -> {
                SocialLink sl = new SocialLink();
                sl.setPlatformName(link.getPlatformName());
                sl.setUrl(link.getUrl());
                sl.setUser(existingUser); // Set parent
                return sl;
            }).collect(Collectors.toList());

            // Allow hibernate to handle collection update
            if (existingUser.getSocialLinks() == null) {
                existingUser.setSocialLinks(new ArrayList<>());
            }
            existingUser.getSocialLinks().clear();
            existingUser.getSocialLinks().addAll(newLinks);
        }

        return userRepository.save(existingUser);
    }
}
