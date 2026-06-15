package org.eventmate.server.controller;

import lombok.RequiredArgsConstructor;
import org.eventmate.server.entity.Booking;
import org.eventmate.server.repository.BookingRepository;
import org.eventmate.server.service.EmailService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ticket")
@RequiredArgsConstructor
public class TicketController {

    private final BookingRepository bookingRepository;
    private final EmailService emailService;

    @GetMapping("/download/{bookingId}")
    public ResponseEntity<byte[]> downloadTicket(@PathVariable Long bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Map<String, Object> model = new HashMap<>();
        model.put("userName", booking.getAttendeeName());
        model.put("eventName", "EventMate Event");
        model.put("eventDate", booking.getBookingDate().toString());
        model.put("venue", "Event Venue");
        model.put("ticketCode", booking.getTicketCode());
        model.put("groupCode", booking.getGroupCode());

        byte[] pdf = emailService.generateTicketPdf(model);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ticket.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}