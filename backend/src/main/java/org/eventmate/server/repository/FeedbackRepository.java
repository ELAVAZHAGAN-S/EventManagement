package org.eventmate.server.repository;

import org.eventmate.server.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByEventId(Long eventId);

    List<Feedback> findByEventIdOrderBySubmittedAtDesc(Long eventId);

    Optional<Feedback> findByEventIdAndUserId(Long eventId, Long userId);

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.eventId = :eventId")
    Double getAverageRating(Long eventId);
}
