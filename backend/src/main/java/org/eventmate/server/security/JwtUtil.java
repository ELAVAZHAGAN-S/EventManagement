package org.eventmate.server.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Utility class for JWT token operations.
 * Handles token generation, validation, and claims extraction.
 * 
 * @author EventMate Team
 * @version 1.0
 * @since 1.0
 */
@Component
@Slf4j
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration}")
    private Long expiration;

    /**
     * Creates signing key from the secret.
     * 
     * @return SecretKey for JWT signing
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    /**
     * Extracts username from JWT token.
     * 
     * @param token the JWT token
     * @return username from token subject
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extracts expiration date from JWT token.
     * 
     * @param token the JWT token
     * @return expiration date
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extracts specific claim from JWT token.
     * 
     * @param token the JWT token
     * @param claimsResolver function to extract specific claim
     * @param <T> type of the claim
     * @return extracted claim value
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extracts all claims from JWT token.
     * 
     * @param token the JWT token
     * @return Claims object containing all token claims
     * @throws JwtException if token is invalid
     */
    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException e) {
            log.error("Failed to parse JWT token: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Checks if JWT token is expired.
     * 
     * @param token the JWT token
     * @return true if token is expired, false otherwise
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Generates JWT token for user.
     * 
     * @param userDetails the user details
     * @return generated JWT token
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        if (userDetails instanceof org.eventmate.server.entity.User) {
            claims.put("userId", ((org.eventmate.server.entity.User) userDetails).getUserId());
        }
        String token = createToken(claims, userDetails.getUsername());
        log.debug("Generated JWT token for user: {}", userDetails.getUsername());
        return token;
    }
    
    /**
     * Extracts userId from JWT token.
     */
    public Long extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("userId", Long.class);
    }

    /**
     * Creates JWT token with claims and subject.
     * 
     * @param claims additional claims to include
     * @param subject the token subject (username)
     * @return JWT token string
     */
    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date(System.currentTimeMillis());
        Date expiryDate = new Date(now.getTime() + expiration);
        
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Validates JWT token against user details.
     * 
     * @param token the JWT token
     * @param userDetails the user details to validate against
     * @return true if token is valid, false otherwise
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            boolean isValid = username.equals(userDetails.getUsername()) && !isTokenExpired(token);
            log.debug("Token validation result for user {}: {}", username, isValid);
            return isValid;
        } catch (JwtException e) {
            log.warn("Token validation failed: {}", e.getMessage());
            return false;
        }
    }
}