package org.eventmate.server.repository;

import org.eventmate.server.entity.Role;
import org.eventmate.server.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

// JpaRepository gives us free methods like save(), delete(), findById()
public interface UserRepository extends JpaRepository<User, Long> {

    // Custom method: Find user by email
    // Returns "Optional" because the user might not exist
    Optional<User> findByEmail(String email);

    // Custom method: Check if email is taken (True/False)
    boolean existsByEmail(String email);

    // Find users by role
    List<User> findByRole(Role role);

    // Count users by role
    Long countByRole(Role role);

    // Search users by name or email
    List<User> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email);
}