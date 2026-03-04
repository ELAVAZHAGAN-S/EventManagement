    package org.eventmate.server.entity;

    import jakarta.persistence.*;
    import lombok.Getter;
    import lombok.Setter;

    import java.time.LocalDateTime;

    @Entity
    @Table(name = "coupon_codes")
    @Getter
    @Setter
    public class CouponCode {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        private String code;

        private Long eventId;

        private Boolean isUsed = false;

        private Long usedBy;

        private LocalDateTime usedAt;

        private LocalDateTime createdAt = LocalDateTime.now();
    }