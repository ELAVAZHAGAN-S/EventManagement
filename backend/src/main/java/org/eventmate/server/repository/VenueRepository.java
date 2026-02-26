package org.eventmate.server.repository;

import org.eventmate.server.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {
    
    Optional<Venue> findByNameAndAddressAndCity(String name, String address, String city);
    
    List<Venue> findByIsBookedFalse();
    
    @Query(value = "SELECT * FROM venues v WHERE " +
           "(:name IS NULL OR LOWER(v.name::text) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:address IS NULL OR LOWER(v.address::text) LIKE LOWER(CONCAT('%', :address, '%'))) AND " +
           "(:city IS NULL OR LOWER(v.city::text) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:state IS NULL OR LOWER(v.state::text) LIKE LOWER(CONCAT('%', :state, '%'))) AND " +
           "(:country IS NULL OR LOWER(v.country::text) LIKE LOWER(CONCAT('%', :country, '%'))) AND " +
           "(:minCapacity IS NULL OR v.capacity >= :minCapacity) AND " +
           "(:maxCapacity IS NULL OR v.capacity <= :maxCapacity) AND " +
           "(:numberOfFloors IS NULL OR v.number_of_floors = :numberOfFloors) AND " +
           "(:availableOnly = false OR v.is_booked = false)", nativeQuery = true)
    List<Venue> searchVenues(String name, String address, String city, String state, 
                            String country, Integer minCapacity, Integer maxCapacity, 
                            Integer numberOfFloors, Boolean availableOnly);
}
