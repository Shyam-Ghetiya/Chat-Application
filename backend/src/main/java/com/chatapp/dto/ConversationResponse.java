package com.chatapp.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ConversationResponse {
    
    private Long id;
    private String type;
    private String name;
    private List<UserSearchResponse> members;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // For direct conversations, this will be the other user
    private UserSearchResponse otherUser;
    
    // Constructors
    public ConversationResponse() {
    }
    
    public ConversationResponse(Long id, String type, String name, List<UserSearchResponse> members, 
                               LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.members = members;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
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
    
    public List<UserSearchResponse> getMembers() {
        return members;
    }
    
    public void setMembers(List<UserSearchResponse> members) {
        this.members = members;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public UserSearchResponse getOtherUser() {
        return otherUser;
    }
    
    public void setOtherUser(UserSearchResponse otherUser) {
        this.otherUser = otherUser;
    }
}
