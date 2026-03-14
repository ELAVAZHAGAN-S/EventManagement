package org.eventmate.server.service;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiService {

    private final Client client;

    @Value("${ai.gemini.model-name:gemini-2.5-flash-lite}")
    private String model;

    public String chat(String message, String metadata, String role) {

        String systemPrompt = """
You are EventMate AI assistant.

User role: %s

Platform metadata:
%s

You help users navigate the EventMate app and answer event questions.

Navigation format (JSON only):
{"action":"NAVIGATE","target":"<route>","message":"<text>"}

Routes:

User:
- /events
- /my-bookings
- /profile

Organizer:
- /org/events
- /org/events/create
- /org/venues
- /org/venues/create
- /org/coupons

Rules:

USER
- browse events → /events
- bookings → /my-bookings
- profile → /profile

ORGANIZER
- manage events → /org/events
- create event → /org/events/create
- venues → /org/venues
- create venue → /org/venues/create
- coupons → /org/coupons

Important:
Return JSON ONLY for navigation.
Never use /my-bookings for browsing events.

Example:

show events →
{"action":"NAVIGATE","target":"/events","message":"Opening events page"}

show my bookings →
{"action":"NAVIGATE","target":"/my-bookings","message":"Opening your bookings"}
""".formatted(role, metadata);

        GenerateContentResponse response = client.models.generateContent(
                model,
                systemPrompt + "\nUser: " + message,
                null
        );

        return response.text();
    }
}