package org.eventmate.server.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    public void sendTicketConfirmation(String to, String subject, Map<String, Object> templateModel) {
        try {
            Context context = new Context();
            context.setVariables(templateModel);

            String htmlContent = templateEngine.process("ticket-confirmation", context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = HTML

            // helper.setFrom("EventMate <noreply@eventmate.com>"); // Optional if
            // configured in properties

            mailSender.send(message);
            log.info("Ticket confirmation email sent to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}", to, e);
        }
    }

    public void sendOtpEmail(String to, String name, String otp) {
        try {
            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("otp", otp);

            // Assuming we might have or need an otp-email.html, otherwise use simple text
            // or create one.
            // For now, let's assume we can use a simple template or text.
            // The file list showed 'otp-email.html' exists!
            String htmlContent = templateEngine.process("otp-email", context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Your OTP for EventMate");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("OTP email sent to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send OTP email to {}", to, e);
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    public void sendEventReminder(String to, String name, org.eventmate.server.entity.Event event) {
        try {
            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("event", event);
            // Add derived fields helper if needed, e.g. formatted date
            context.setVariable("eventDate", event.getStartDate().toString()); // Simplify for now

            String htmlContent = templateEngine.process("event-reminder", context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Reminder: " + event.getTitle() + " is coming up!");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Reminder email sent to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send reminder email to {}", to, e);
        }
    }
}