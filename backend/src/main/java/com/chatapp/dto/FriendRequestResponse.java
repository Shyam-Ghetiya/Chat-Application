package com.chatapp.dto;

import java.time.LocalDateTime;

public class FriendRequestResponse {
    
    private Long id;
    private UserSearchResponse sender;
    private UserSearchResponse receiver;
    private String status;
    private LocalDateTime createdAt;
    
    // Constructors
    public FriendRequestResponse() {
    }
    
    public FriendRequestResponse(Long id, UserSearchResponse sender, UserSearchResponse receiver, 
                                String status, LocalDateTime createdAt) {
        this.id = id;
        this.sender = sender;
        this.receiver = receiver;
        this.status = status;
        this.createdAt = createdAt;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public UserSearchResponse getSender() {
        return sender;
    }
    
    public void setSender(UserSearchResponse sender) {
        this.sender = sender;
    }
    
    public UserSearchResponse getReceiver() {
        return receiver;
    }
    
    public void setReceiver(UserSearchResponse receiver) {
        this.receiver = receiver;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
