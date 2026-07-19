package com.chatapp.dto;

public class TypingIndicator {
    private Long userId;
    private String userName;
    private Long conversationId;
    private boolean isTyping;
    
    public TypingIndicator() {
    }
    
    public TypingIndicator(Long userId, String userName, Long conversationId, boolean isTyping) {
        this.userId = userId;
        this.userName = userName;
        this.conversationId = conversationId;
        this.isTyping = isTyping;
    }
    
    // Getters and Setters
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getUserName() {
        return userName;
    }
    
    public void setUserName(String userName) {
        this.userName = userName;
    }
    
    public Long getConversationId() {
        return conversationId;
    }
    
    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }
    
    public boolean isTyping() {
        return isTyping;
    }
    
    public void setTyping(boolean typing) {
        isTyping = typing;
    }
}
