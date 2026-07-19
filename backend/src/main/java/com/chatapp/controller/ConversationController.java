package com.chatapp.controller;

import com.chatapp.dto.ConversationResponse;
import com.chatapp.dto.CreateConversationRequest;
import com.chatapp.dto.ErrorResponse;
import com.chatapp.service.ConversationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {
    
    @Autowired
    private ConversationService conversationService;
    
    @PostMapping
    public ResponseEntity<?> createConversation(@Valid @RequestBody CreateConversationRequest request,
                                               Authentication authentication) {
        try {
            String email = authentication.getName();
            ConversationResponse response = conversationService.createConversation(email, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getUserConversations(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<ConversationResponse> conversations = conversationService.getUserConversations(email);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getConversation(@PathVariable Long id, Authentication authentication) {
        try {
            String email = authentication.getName();
            ConversationResponse response = conversationService.getConversation(email, id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Group Management Endpoints
    
    @PutMapping("/{id}/rename")
    public ResponseEntity<?> renameGroup(@PathVariable Long id, 
                                        @RequestBody java.util.Map<String, String> body,
                                        Authentication authentication) {
        try {
            String email = authentication.getName();
            String newName = body.get("name");
            ConversationResponse response = conversationService.renameGroup(email, id, newName);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/{id}/members")
    public ResponseEntity<?> addMember(@PathVariable Long id,
                                      @RequestBody java.util.Map<String, Long> body,
                                      Authentication authentication) {
        try {
            String email = authentication.getName();
            Long memberId = body.get("userId");
            ConversationResponse response = conversationService.addMember(email, id, memberId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<?> removeMember(@PathVariable Long id,
                                         @PathVariable Long memberId,
                                         Authentication authentication) {
        try {
            String email = authentication.getName();
            ConversationResponse response = conversationService.removeMember(email, id, memberId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/{id}/leave")
    public ResponseEntity<?> leaveGroup(@PathVariable Long id, Authentication authentication) {
        try {
            String email = authentication.getName();
            conversationService.leaveGroup(email, id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGroup(@PathVariable Long id, Authentication authentication) {
        try {
            String email = authentication.getName();
            conversationService.deleteGroup(email, id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
