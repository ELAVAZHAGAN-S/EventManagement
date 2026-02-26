package org.eventmate.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class AnalyticsResponse {
    private Long totalEvents;
    private Long totalUsers;
    private Long totalOrganizations;
    private Long totalBookings;
    private BigDecimal totalRevenue;
    private Long activeEvents;
    private Long completedEvents;
}
