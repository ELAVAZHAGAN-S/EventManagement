package org.eventmate.server.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final MongoTemplate mongoTemplate;
    private static final String COLLECTION_NAME = "profile_pictures";

    public String storeFile(String filename, byte[] content, String contentType) {
        try {
            // 1. Calculate Hash
            String fileHash = calculateHash(content);

            // 2. Check if file already exists
            Query query = new Query(Criteria.where("fileHash").is(fileHash));
            FileDocument existing = mongoTemplate.findOne(query, FileDocument.class, COLLECTION_NAME);

            if (existing != null) {
                // Reuse existing file
                return existing.getId();
            }

            // 3. Save new file
            FileDocument doc = new FileDocument();
            doc.setFilename(filename);
            doc.setContentType(contentType);
            doc.setContent(content);
            doc.setFileHash(fileHash); // Store hash

            FileDocument saved = mongoTemplate.save(doc, COLLECTION_NAME);
            return saved.getId();

        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }

    private String calculateHash(byte[] content) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(content);
        return Base64.getEncoder().encodeToString(hash);
    }

    public FileDocument getFile(String id) {
        return mongoTemplate.findById(id, FileDocument.class, COLLECTION_NAME);
    }

    @org.springframework.data.mongodb.core.mapping.Document(collection = "profile_pictures")
    @lombok.Data
    public static class FileDocument {
        @org.springframework.data.annotation.Id
        private String id;
        private String filename;
        private String contentType;
        private byte[] content;
        private String fileHash;
    }
}
