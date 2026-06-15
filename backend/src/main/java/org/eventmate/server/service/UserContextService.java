package org.eventmate.server.service;

import lombok.RequiredArgsConstructor;
import org.eventmate.server.entity.User;
import org.eventmate.server.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserContextService {
    
    private final UserRepository userRepository;
    
    public Long getCurrentUserId() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getPrincipal().equals("anonymousUser")) {
            throw new RuntimeException("User not authenticated");
        }

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user.getUserId();
    }
    
    public User getCurrentUser() {
        return userRepository.findById(getCurrentUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
