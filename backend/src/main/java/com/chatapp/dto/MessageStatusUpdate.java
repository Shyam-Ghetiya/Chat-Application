package com.chatapp.dto;

public class MessageStatusUpdate {
    private Long messageId;
    private Long userId;
    private String status; // DELIVERED or SEEN
    
    public MessageStatusUpdate() {
    }
    
    public MessageStatusUpdate(Long messageId, Long userId, String status) {
        this.messageId = messageId;
        this.userId = userId;
        this.status = status;
    }
    
    // Getters and Setters
    public Long getMessageId() {
        return messageId;
    }
    
    public void setMessageId(Long messageId) {
        this.messageId = messageId;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
}
