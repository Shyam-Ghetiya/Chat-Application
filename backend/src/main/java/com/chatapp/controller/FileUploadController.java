package com.chatapp.controller;

import com.chatapp.dto.ErrorResponse;
import com.chatapp.dto.MessageResponse;
import com.chatapp.entity.Conversation;
import com.chatapp.entity.ConversationMember;
import com.chatapp.entity.Message;
import com.chatapp.entity.MessageStatus;
import com.chatapp.entity.User;
import com.chatapp.repository.ConversationMemberRepository;
import com.chatapp.repository.ConversationRepository;
import com.chatapp.repository.MessageRepository;
import com.chatapp.repository.MessageStatusRepository;
import com.chatapp.repository.UserRepository;
import com.chatapp.service.FileStorageService;
import com.chatapp.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @Autowired
    private MessageService messageService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ConversationRepository conversationRepository;
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private ConversationMemberRepository conversationMemberRepository;
    
    @Autowired
    private MessageStatusRepository messageStatusRepository;
    
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("conversationId") Long conversationId,
            @RequestParam(value = "caption", required = false) String caption,
            Authentication authentication) {
        
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Conversation conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));
            
            // Determine category based on content type
            String category = fileStorageService.getCategoryFromContentType(file.getContentType());
            
            // Store file
            String filePath = fileStorageService.storeFile(file, category);
            
            // Create message with file info
            Message message = new Message(conversation, user, caption != null ? caption : file.getOriginalFilename());
            message.setFileUrl(filePath);
            message.setFileName(file.getOriginalFilename());
            message.setFileSize(file.getSize());
            message.setFileType(file.getContentType());
            
            // Set message type based on content type
            if (file.getContentType().startsWith("image/")) {
                message.setMessageType(Message.MessageType.IMAGE);
            } else if (file.getContentType().startsWith("video/")) {
                message.setMessageType(Message.MessageType.VIDEO);
            } else if (file.getContentType().startsWith("audio/")) {
                message.setMessageType(Message.MessageType.AUDIO);
            } else {
                message.setMessageType(Message.MessageType.DOCUMENT);
            }
            
            message = messageRepository.save(message);
            
            // Create MessageStatus for all other members (DELIVERED)
            List<ConversationMember> members = conversationMemberRepository.findByConversation(conversation);
            for (ConversationMember member : members) {
                if (!member.getUser().getId().equals(user.getId())) {
                    MessageStatus deliveredStatus = new MessageStatus(message, member.getUser(), MessageStatus.Status.DELIVERED);
                    messageStatusRepository.save(deliveredStatus);
                }
            }
            
            // Update conversation's updated_at timestamp
            conversation.setUpdatedAt(message.getCreatedAt());
            conversationRepository.save(conversation);
            
            // Create and broadcast message response with proper status
            MessageResponse response = messageService.createFileMessageResponse(message, user);
            messageService.broadcastMessage(conversationId, response);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/download/{category}/{filename:.+}")
    public ResponseEntity<?> downloadFile(
            @PathVariable String category,
            @PathVariable String filename,
            Authentication authentication) {
        
        try {
            Path filePath = fileStorageService.getFilePath(category + "/" + filename);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException("File not found");
            }
            
            String contentType = "application/octet-stream";
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
            
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.NOT_FOUND.value(), e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    @GetMapping("/view/{category}/{filename:.+}")
    public ResponseEntity<?> viewFile(
            @PathVariable String category,
            @PathVariable String filename,
            Authentication authentication) {
        
        try {
            Path filePath = fileStorageService.getFilePath(category + "/" + filename);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException("File not found");
            }
            
            // Determine content type
            String contentType = "application/octet-stream";
            try {
                contentType = java.nio.file.Files.probeContentType(filePath);
            } catch (IOException ex) {
                // Use default content type
            }
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
            
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.NOT_FOUND.value(), e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    @PostMapping("/profile/upload")
    public ResponseEntity<?> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Validate it's an image
            if (!file.getContentType().startsWith("image/")) {
                throw new RuntimeException("Only image files are allowed for profile pictures");
            }
            
            // Store file in profile directory
            String filePath = fileStorageService.storeFile(file, "profile");
            
            // Delete old profile picture if exists
            if (user.getProfilePicture() != null && !user.getProfilePicture().startsWith("http")) {
                try {
                    fileStorageService.deleteFile(user.getProfilePicture());
                } catch (IOException e) {
                    // Ignore if old file doesn't exist
                }
            }
            
            // Update user profile picture
            user.setProfilePicture("/api/files/view/" + filePath);
            userRepository.save(user);
            
            Map<String, String> response = new HashMap<>();
            response.put("profilePicture", user.getProfilePicture());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
