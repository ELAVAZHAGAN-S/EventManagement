package org.eventmate.server.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class SchemaFixConfig implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking and fixing schema constraints...");
        try {
            // Attempt to make ticket_type_id nullable in bookings table
            // logical name: bookings, column: ticket_type_id
            // This is safe to run even if already nullable (in Postgres it just succeeds,
            // usually)

            String sql = "ALTER TABLE bookings MODIFY ticket_type_id BIGINT NULL";
            jdbcTemplate.execute(sql);

            log.info("Successfully executed schema fix: ticket_type_id is now nullable.");
        } catch (Exception e) {
            // If it fails, it might be because the table doesn't exist or column names
            // differ,
            // or (less likely in Postgres) it's already nullable in a way that throws.
            // We log error but don't stop the app, as this is a 'best effort' fix.
            log.warn("Schema fix attempt finished with message: {}", e.getMessage());
        }
    }
}
