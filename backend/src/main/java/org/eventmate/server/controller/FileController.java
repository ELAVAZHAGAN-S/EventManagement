package org.eventmate.server.controller;

import lombok.RequiredArgsConstructor;
import org.eventmate.server.service.FileStorageService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String fileId = fileStorageService.storeFile(
                    file.getOriginalFilename(),
                    file.getBytes(),
                    file.getContentType());
            // Return endpoint to fetch image
            // In a real app, might return full URL. Here returning partial or URL
            // construction.
            // Client will prepend baseURL.
            return ResponseEntity.ok(fileId);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Upload failed");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getFile(@PathVariable String id) {
        FileStorageService.FileDocument doc = fileStorageService.getFile(id);
        if (doc == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + doc.getFilename() + "\"")
                .contentType(MediaType.parseMediaType(doc.getContentType()))
                .body(doc.getContent());
    }
}
