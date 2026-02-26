package org.eventmate.server.exception.custom;

public class ValidationException extends RuntimeException {
    public ValidationException(String message) {
        super(message);
    }
}
