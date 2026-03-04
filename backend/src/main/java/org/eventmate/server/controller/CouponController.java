package org.eventmate.server.controller;

import lombok.RequiredArgsConstructor;
import org.eventmate.server.entity.CouponCode;
import org.eventmate.server.repository.CouponCodeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CouponController {

    private final CouponCodeRepository couponCodeRepository;

    @GetMapping("/events")
    public ResponseEntity<List<Long>> getEventsWithCoupons() {

        List<Long> eventIds = couponCodeRepository
                .findAll()
                .stream()
                .map(CouponCode::getEventId)
                .distinct()
                .toList();

        return ResponseEntity.ok(eventIds);

    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<CouponCode>> getCouponsByEvent(@PathVariable Long eventId) {

        return ResponseEntity.ok(
                couponCodeRepository.findByEventId(eventId));

    }

}