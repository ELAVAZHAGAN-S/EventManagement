package org.eventmate.server.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eventmate.server.dto.TicketTypeRequest;
import org.eventmate.server.entity.TicketType;
import org.eventmate.server.service.TicketTypeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ticket-types")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class TicketTypeController {
    
    private final TicketTypeService ticketTypeService;
    
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<TicketType>> getTicketTypesByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(ticketTypeService.getTicketTypesByEvent(eventId));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TicketType> getTicketTypeById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketTypeService.getTicketTypeById(id));
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ORGANIZATION', 'ADMIN')")
    public ResponseEntity<TicketType> createTicketType(@Valid @RequestBody TicketTypeRequest request) {
        return ResponseEntity.ok(ticketTypeService.createTicketType(request));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZATION', 'ADMIN')")
    public ResponseEntity<TicketType> updateTicketType(@PathVariable Long id, @Valid @RequestBody TicketTypeRequest request) {
        return ResponseEntity.ok(ticketTypeService.updateTicketType(id, request));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZATION', 'ADMIN')")
    public ResponseEntity<String> deleteTicketType(@PathVariable Long id) {
        ticketTypeService.deleteTicketType(id);
        return ResponseEntity.ok("Ticket type deleted successfully");
    }
}
