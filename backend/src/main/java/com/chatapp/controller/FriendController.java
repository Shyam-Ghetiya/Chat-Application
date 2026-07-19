package com.chatapp.controller;

import com.chatapp.dto.*;
import com.chatapp.service.FriendService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class FriendController {
    
    @Autowired
    private FriendService friendService;
    
    @GetMapping("/users")
    public ResponseEntity<?> searchUsers(@RequestParam String query, Authentication authentication) {
        try {
            String email = authentication.getName();
            List<UserSearchResponse> users = friendService.searchUsers(query, email);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/friend-request")
    public ResponseEntity<?> sendFriendRequest(@Valid @RequestBody SendFriendRequestRequest request,
                                               Authentication authentication) {
        try {
            String email = authentication.getName();
            FriendRequestResponse response = friendService.sendFriendRequest(email, request.getReceiverId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PutMapping("/friend-request/{id}/accept")
    public ResponseEntity<?> acceptFriendRequest(@PathVariable Long id, Authentication authentication) {
        try {
            String email = authentication.getName();
            FriendRequestResponse response = friendService.acceptFriendRequest(email, id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PutMapping("/friend-request/{id}/reject")
    public ResponseEntity<?> rejectFriendRequest(@PathVariable Long id, Authentication authentication) {
        try {
            String email = authentication.getName();
            friendService.rejectFriendRequest(email, id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/friend-request/{id}")
    public ResponseEntity<?> cancelFriendRequest(@PathVariable Long id, Authentication authentication) {
        try {
            String email = authentication.getName();
            friendService.cancelFriendRequest(email, id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/friend-requests/pending")
    public ResponseEntity<?> getPendingRequests(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<FriendRequestResponse> requests = friendService.getPendingRequests(email);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/friend-requests/sent")
    public ResponseEntity<?> getSentRequests(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<FriendRequestResponse> requests = friendService.getSentRequests(email);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/friends")
    public ResponseEntity<?> getFriends(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<UserSearchResponse> friends = friendService.getFriends(email);
            return ResponseEntity.ok(friends);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
