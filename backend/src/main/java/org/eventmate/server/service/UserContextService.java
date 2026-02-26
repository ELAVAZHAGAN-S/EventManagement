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
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User) {
            return ((User) auth.getPrincipal()).getUserId();
        }
        throw new RuntimeException("User not authenticated");
    }
    
    public User getCurrentUser() {
        return userRepository.findById(getCurrentUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
