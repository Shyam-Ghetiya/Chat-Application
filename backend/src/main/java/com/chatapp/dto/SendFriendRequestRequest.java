package com.chatapp.dto;

import jakarta.validation.constraints.NotNull;

public class SendFriendRequestRequest {
    
    @NotNull(message = "Receiver ID is required")
    private Long receiverId;
    
    // Constructors
    public SendFriendRequestRequest() {
    }
    
    public SendFriendRequestRequest(Long receiverId) {
        this.receiverId = receiverId;
    }
    
    // Getters and Setters
    public Long getReceiverId() {
        return receiverId;
    }
    
    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }
}
