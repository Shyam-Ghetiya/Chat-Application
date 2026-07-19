package com.chatapp.controller;

import com.chatapp.dto.ErrorResponse;
import com.chatapp.dto.NotificationResponse;
import com.chatapp.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    @GetMapping
    public ResponseEntity<?> getUserNotifications(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<NotificationResponse> notifications = notificationService.getUserNotifications(email);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadNotifications(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<NotificationResponse> notifications = notificationService.getUnreadNotifications(email);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/unread/count")
    public ResponseEntity<?> getUnreadCount(Authentication authentication) {
        try {
            String email = authentication.getName();
            Long count = notificationService.getUnreadCount(email);
            Map<String, Long> response = new HashMap<>();
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Authentication authentication) {
        try {
            String email = authentication.getName();
            notificationService.markAsRead(email, id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Authentication authentication) {
        try {
            String email = authentication.getName();
            notificationService.markAllAsRead(email);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id, Authentication authentication) {
        try {
            String email = authentication.getName();
            notificationService.deleteNotification(email, id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
