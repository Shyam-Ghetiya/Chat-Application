package com.chatapp.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class CreateConversationRequest {
    
    @NotNull(message = "Conversation type is required")
    private String type; // DIRECT or GROUP
    
    private String name; // Optional, mainly for group chats
    
    @NotEmpty(message = "At least one member is required")
    private List<Long> memberIds;
    
    // Constructors
    public CreateConversationRequest() {
    }
    
    public CreateConversationRequest(String type, String name, List<Long> memberIds) {
        this.type = type;
        this.name = name;
        this.memberIds = memberIds;
    }
    
    // Getters and Setters
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public List<Long> getMemberIds() {
        return memberIds;
    }
    
    public void setMemberIds(List<Long> memberIds) {
        this.memberIds = memberIds;
    }
}
