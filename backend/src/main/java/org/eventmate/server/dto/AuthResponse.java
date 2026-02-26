package org.eventmate.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.eventmate.server.entity.Role;

@Data
@AllArgsConstructor
public class AuthResponse {
    
    private String token;
    private String type = "Bearer";
    private Long userId;
    private String email;
    private String fullName;
    private Role role;
    
    public AuthResponse(String token, Long userId, String email, String fullName, Role role) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
    }
}