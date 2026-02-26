package org.eventmate.server.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eventmate.server.dto.TicketTypeRequest;
import org.eventmate.server.entity.TicketType;
import org.eventmate.server.exception.custom.ResourceNotFoundException;
import org.eventmate.server.repository.EventRepository;
import org.eventmate.server.repository.TicketTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketTypeService {
    
    private final TicketTypeRepository ticketTypeRepository;
    private final EventRepository eventRepository;
    
    @Transactional
    public TicketType createTicketType(TicketTypeRequest request) {
        if (!eventRepository.existsById(request.getEventId())) {
            throw new ResourceNotFoundException("Event not found");
        }
        
        TicketType ticketType = new TicketType();
        ticketType.setEventId(request.getEventId());
        ticketType.setName(request.getName());
        ticketType.setPrice(request.getPrice());
        ticketType.setQuantityAllocated(request.getQuantityAllocated());
        ticketType.setSalesStartDate(request.getSalesStartDate());
        ticketType.setSalesEndDate(request.getSalesEndDate());
        
        log.info("Creating ticket type: {} for event: {}", request.getName(), request.getEventId());
        return ticketTypeRepository.save(ticketType);
    }
    
    @Transactional
    public TicketType updateTicketType(Long ticketTypeId, TicketTypeRequest request) {
        TicketType ticketType = ticketTypeRepository.findById(ticketTypeId)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket type not found"));
        
        ticketType.setName(request.getName());
        ticketType.setPrice(request.getPrice());
        ticketType.setQuantityAllocated(request.getQuantityAllocated());
        ticketType.setSalesStartDate(request.getSalesStartDate());
        ticketType.setSalesEndDate(request.getSalesEndDate());
        
        log.info("Updating ticket type: {}", ticketTypeId);
        return ticketTypeRepository.save(ticketType);
    }
    
    @Transactional
    public void deleteTicketType(Long ticketTypeId) {
        TicketType ticketType = ticketTypeRepository.findById(ticketTypeId)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket type not found"));
        ticketTypeRepository.delete(ticketType);
        log.info("Deleted ticket type: {}", ticketTypeId);
    }
    
    public List<TicketType> getTicketTypesByEvent(Long eventId) {
        return ticketTypeRepository.findByEventId(eventId);
    }
    
    public TicketType getTicketTypeById(Long ticketTypeId) {
        return ticketTypeRepository.findById(ticketTypeId)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket type not found"));
    }
}
