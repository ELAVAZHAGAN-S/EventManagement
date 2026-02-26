package org.eventmate.server.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eventmate.server.repository.EventRepository;
import org.eventmate.server.repository.VenueRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * MetadataService - Caches event and venue data for fast AI context retrieval.
 * Uses the "Cache-Aside" pattern to avoid database queries on every AI request.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MetadataService {

    private static final String METADATA_FILE = "ai-context/metadata.json";
    private final ObjectMapper mapper = new ObjectMapper();

    private final VenueRepository venueRepository;
    private final EventRepository eventRepository;

    /**
     * Automatically sync metadata when the application starts
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("Application started - syncing AI metadata cache...");
        syncMetadataSync(); // Call synchronous version on startup
    }

    /**
     * Sync metadata to JSON file for fast AI access (Async version).
     * Call this after any Event or Venue CRUD operation.
     */
    @Async
    public void syncMetadata() {
        doSyncMetadata();
    }

    /**
     * Sync metadata synchronously - Used on startup
     */
    public void syncMetadataSync() {
        doSyncMetadata();
    }

    /**
     * Core sync logic - shared by async and sync methods
     */
    private void doSyncMetadata() {
        try {
            log.info("Syncing AI metadata cache...");

            // 1. Fetch Key Data from Database
            List<Map<String, Object>> venues = venueRepository.findAll().stream()
                    .map(v -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("id", v.getVenueId());
                        m.put("name", v.getName());
                        m.put("location", v.getAddress() + ", " + v.getCity() + ", " + v.getState());
                        m.put("capacity", v.getCapacity());
                        return m;
                    }).toList();

            List<Map<String, Object>> events = eventRepository.findAll().stream()
                    .filter(e -> e.getStatus() != null && e.getStatus().name().equals("ACTIVE"))
                    .map(e -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("id", e.getEventId());
                        m.put("title", e.getTitle());
                        m.put("description",
                                e.getDescription() != null
                                        ? e.getDescription().substring(0, Math.min(200, e.getDescription().length()))
                                        : null);
                        m.put("type", e.getEventType() != null ? e.getEventType().name() : "GENERAL");
                        m.put("format", e.getEventFormat() != null ? e.getEventFormat().name() : "HYBRID");
                        m.put("startDate", e.getStartDate() != null ? e.getStartDate().toString() : null);
                        m.put("endDate", e.getEndDate() != null ? e.getEndDate().toString() : null);
                        m.put("ticketType", e.getTicketType() != null ? e.getTicketType().name() : "FREE");
                        m.put("price", e.getTicketPrice());
                        m.put("capacity", e.getTotalCapacity());
                        m.put("venue", e.getVenue() != null ? e.getVenue().getName() : null);
                        m.put("meetingUrl", e.getMeetingUrl() != null ? "Online" : null);
                        return m;
                    }).toList();

            // 2. Build Cache Object
            Map<String, Object> context = new HashMap<>();
            context.put("venues", venues);
            context.put("events", events);
            context.put("totalVenues", venues.size());
            context.put("totalEvents", events.size());
            context.put("lastUpdated", LocalDateTime.now().toString());

            // 3. Write to JSON File
            File file = new File(METADATA_FILE);
            file.getParentFile().mkdirs(); // Create directory if missing
            mapper.writerWithDefaultPrettyPrinter().writeValue(file, context);

            log.info("AI metadata cache synced successfully. {} venues, {} events", venues.size(), events.size());

        } catch (IOException e) {
            log.error("CRITICAL: Failed to sync AI metadata cache. AI will use fallback.", e);
        }
    }

    /**
     * Read cached metadata for AI context (0ms latency vs DB query latency)
     */
    public String readMetadata() {
        try {
            Path path = Path.of(METADATA_FILE);
            if (Files.exists(path)) {
                return Files.readString(path);
            } else {
                // File doesn't exist, trigger sync and return empty
                syncMetadata();
                return getEmptyContext();
            }
        } catch (IOException e) {
            log.warn("Failed to read AI metadata cache, returning empty context", e);
            return getEmptyContext();
        }
    }

    /**
     * Emergency fallback when cache is unavailable
     */
    private String getEmptyContext() {
        return """
                {
                    "venues": [],
                    "events": [],
                    "note": "Cache unavailable. Please ask user for specific details.",
                    "lastUpdated": null
                }
                """;
    }

    /**
     * Force refresh the metadata cache
     */
    public void forceRefresh() {
        syncMetadata();
    }
}
