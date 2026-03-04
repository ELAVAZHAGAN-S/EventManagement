package org.eventmate.server.repository;

import org.eventmate.server.entity.CouponCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CouponCodeRepository extends JpaRepository<CouponCode, Long> {

    List<CouponCode> findByEventId(Long eventId);

    Optional<CouponCode> findByCode(String code);

}