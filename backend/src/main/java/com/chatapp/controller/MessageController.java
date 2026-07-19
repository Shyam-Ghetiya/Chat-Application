package com.chatapp.controller;

import com.chatapp.dto.ErrorResponse;
import com.chatapp.dto.MessageRequest;
import com.chatapp.dto.MessageResponse;
import com.chatapp.dto.MessageStatusUpdate;
import com.chatapp.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Controller
public class MessageController {
    
    @Autowired
    private MessageService messageService;
    
    // WebSocket endpoint for sending messages
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MessageRequest request, Principal principal) {
        String senderEmail = principal.getName();
        messageService.sendMessage(senderEmail, request);
    }
    
    // REST endpoint for sending messages (fallback)
    @PostMapping("/api/messages")
    public ResponseEntity<?> sendMessageRest(@Valid @RequestBody MessageRequest request, 
                                            Authentication authentication) {
        try {
            String email = authentication.getName();
            MessageResponse response = messageService.sendMessage(email, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Get messages for a conversation
    @GetMapping("/api/conversations/{conversationId}/messages")
    public ResponseEntity<?> getMessages(@PathVariable Long conversationId, 
                                        Authentication authentication) {
        try {
            String email = authentication.getName();
            List<MessageResponse> messages = messageService.getConversationMessages(email, conversationId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Mark messages as seen
    @PostMapping("/api/conversations/{conversationId}/messages/seen")
    public ResponseEntity<?> markAsSeen(@PathVariable Long conversationId,
                                       Authentication authentication) {
        try {
            String email = authentication.getName();
            messageService.markMessagesAsSeen(email, conversationId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Edit message
    @PutMapping("/api/messages/{messageId}")
    public ResponseEntity<?> editMessage(@PathVariable Long messageId,
                                        @RequestBody MessageRequest request,
                                        Authentication authentication) {
        try {
            String email = authentication.getName();
            MessageResponse response = messageService.editMessage(email, messageId, request.getContent());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Delete message
    @DeleteMapping("/api/messages/{messageId}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long messageId,
                                          Authentication authentication) {
        try {
            String email = authentication.getName();
            messageService.deleteMessage(email, messageId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Search messages
    @GetMapping("/api/messages/search")
    public ResponseEntity<?> searchMessages(@RequestParam String query,
                                           @RequestParam(required = false) Long conversationId,
                                           Authentication authentication) {
        try {
            String email = authentication.getName();
            List<MessageResponse> messages = messageService.searchMessages(email, query, conversationId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
