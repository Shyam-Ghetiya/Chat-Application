package com.chatapp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {
    
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;
    
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    
    public String storeFile(MultipartFile file, String category) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new RuntimeException("Cannot store empty file");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds maximum limit of 50MB");
        }
        
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !isAllowedContentType(contentType)) {
            throw new RuntimeException("File type not allowed");
        }
        
        // Create category directory if it doesn't exist
        Path categoryPath = Paths.get(uploadDir, category);
        if (!Files.exists(categoryPath)) {
            Files.createDirectories(categoryPath);
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID().toString() + extension;
        
        // Store file
        Path targetLocation = categoryPath.resolve(filename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        
        // Return relative path
        return category + "/" + filename;
    }
    
    public void deleteFile(String filePath) throws IOException {
        Path path = Paths.get(uploadDir, filePath);
        Files.deleteIfExists(path);
    }
    
    public Path getFilePath(String filePath) {
        return Paths.get(uploadDir, filePath);
    }
    
    private boolean isAllowedContentType(String contentType) {
        return contentType.startsWith("image/") ||
               contentType.startsWith("video/") ||
               contentType.startsWith("audio/") ||
               contentType.equals("application/pdf") ||
               contentType.equals("application/msword") ||
               contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
               contentType.equals("application/vnd.ms-excel") ||
               contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") ||
               contentType.equals("application/zip") ||
               contentType.equals("application/x-rar-compressed") ||
               contentType.equals("text/plain");
    }
    
    public String getCategoryFromContentType(String contentType) {
        if (contentType.startsWith("image/")) {
            return "images";
        } else if (contentType.startsWith("video/")) {
            return "videos";
        } else if (contentType.startsWith("audio/")) {
            return "audio";
        } else {
            return "documents";
        }
    }
}
