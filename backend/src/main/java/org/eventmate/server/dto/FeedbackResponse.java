package org.eventmate.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FeedbackResponse {
    private Long feedbackId;
    private Long eventId;
    private Long userId;
    private String userName;
    private Integer rating;
    private String comments;
    private LocalDateTime submittedAt;
}
