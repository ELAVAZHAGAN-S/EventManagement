package org.eventmate.server.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eventmate.server.dto.ChatRequest;
import org.eventmate.server.dto.ChatResponse;
import org.eventmate.server.service.AiService;
import org.eventmate.server.service.MetadataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class AiController {

    private final AiService aiService;
    private final MetadataService metadataService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        try {
            log.info("AI Chat request: {}", request.getMessage());

            if (request.getMessage() != null && request.getMessage().length() > 400) {
                return ResponseEntity.ok(ChatResponse.builder()
                        .response("Message too long. Please keep it under 400 characters.")
                        .isCommand(false)
                        .build());
            }
            String metadata = metadataService.getCompressedMetadata();

            String aiResponse = aiService.chat(request.getMessage(), metadata, request.getRole());
            log.debug("AI Response: {}", aiResponse);

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

    private ChatResponse parseAiResponse(String aiResponse) {
        try {
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
            log.debug("Response is not a command: {}", e.getMessage());
        }

        return ChatResponse.builder()
                .response(aiResponse)
                .isCommand(false)
                .build();
    }
}
