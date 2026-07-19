package com.chatapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class MessageRequest {
    
    @NotNull(message = "Conversation ID is required")
    private Long conversationId;
    
    @NotBlank(message = "Content is required")
    private String content;
    
    private Long replyToId; // ID of message being replied to
    
    // Constructors
    public MessageRequest() {
    }
    
    public MessageRequest(Long conversationId, String content) {
        this.conversationId = conversationId;
        this.content = content;
    }
    
    // Getters and Setters
    public Long getConversationId() {
        return conversationId;
    }
    
    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public Long getReplyToId() {
        return replyToId;
    }
    
    public void setReplyToId(Long replyToId) {
        this.replyToId = replyToId;
    }
}
