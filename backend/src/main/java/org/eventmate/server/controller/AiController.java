package org.eventmate.server.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eventmate.server.ai.EventAgent;
import org.eventmate.server.dto.ChatRequest;
import org.eventmate.server.dto.ChatResponse;
import org.eventmate.server.service.MetadataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AI Chat Controller - Handles AI assistant interactions
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class AiController {

    private final EventAgent eventAgent;
    private final MetadataService metadataService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        try {
            log.info("AI Chat request: {}", request.getMessage());

            // 1. Get cached metadata for context
            String metadata = metadataService.readMetadata();

            // 2. Call AI Agent
            String aiResponse = eventAgent.chat(request.getMessage(), metadata);
            log.info("AI Response: {}", aiResponse);

            // 3. Parse response to detect commands
            ChatResponse response = parseAiResponse(aiResponse);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("AI Chat error: ", e);
            return ResponseEntity.ok(ChatResponse.builder()
                    .response("I'm having trouble processing your request right now. Please try again.")
                    .isCommand(false)
                    .build());
        }
    }

    @PostMapping("/sync-metadata")
    public ResponseEntity<String> syncMetadata() {
        metadataService.forceRefresh();
        return ResponseEntity.ok("Metadata sync triggered");
    }

    @GetMapping("/metadata")
    public ResponseEntity<String> getMetadata() {
        return ResponseEntity.ok(metadataService.readMetadata());
    }

    /**
     * Parse AI response to detect navigation commands
     */
    private ChatResponse parseAiResponse(String aiResponse) {
        try {
            // Check if response is a JSON command
            String trimmed = aiResponse.trim();
            if (trimmed.startsWith("{") && trimmed.contains("\"action\"")) {
                JsonNode json = objectMapper.readTree(trimmed);

                if (json.has("action") && "NAVIGATE".equals(json.get("action").asText())) {
                    String friendlyMessage = json.has("message") ? json.get("message").asText() : "Navigating...";
                    return ChatResponse.builder()
                            .response(friendlyMessage)
                            .isCommand(true)
                            .action("NAVIGATE")
                            .target(json.has("target") ? json.get("target").asText() : null)
                            .message(friendlyMessage)
                            .build();
                }
            }
        } catch (Exception e) {
            // Not a valid JSON command, treat as text response
            log.debug("Response is not a command: {}", e.getMessage());
        }

        // Regular text response
        return ChatResponse.builder()
                .response(aiResponse)
                .isCommand(false)
                .build();
    }
}
