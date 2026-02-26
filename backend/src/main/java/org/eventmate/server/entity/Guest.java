package org.eventmate.server.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "guests")
@Data
public class Guest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "guest_id")
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "linkedin_profile")
    private String linkedinProfile;

    @Column(name = "photo")
    private String photo;

    @Column(name = "role")
    private String role;

    @Column(name = "about", columnDefinition = "TEXT")
    private String about;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Event event;
}