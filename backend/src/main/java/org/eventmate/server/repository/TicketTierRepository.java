package org.eventmate.server.repository;

import org.eventmate.server.entity.TicketTier;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketTierRepository extends JpaRepository<TicketTier, Long> {
}
