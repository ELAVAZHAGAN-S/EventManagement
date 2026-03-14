package org.eventmate.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatRequest {
    private String message;
    private String role; // "USER" or "ORGANIZER"
    private Long chatId; // Optional: for conversation context
}
