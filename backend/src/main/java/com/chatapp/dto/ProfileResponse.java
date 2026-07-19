package com.chatapp.dto;

import java.time.LocalDateTime;

public class ProfileResponse {
    
    private Long id;
    private String name;
    private String email;
    private String profilePicture;
    private String about;
    private LocalDateTime lastSeen;
    private Boolean isOnline;
    private LocalDateTime createdAt;
    
    // Constructors
    public ProfileResponse() {
    }
    
    public ProfileResponse(Long id, String name, String email, String profilePicture, 
                          String about, LocalDateTime lastSeen, Boolean isOnline, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.profilePicture = profilePicture;
        this.about = about;
        this.lastSeen = lastSeen;
        this.isOnline = isOnline;
        this.createdAt = createdAt;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getProfilePicture() {
        return profilePicture;
    }
    
    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }
    
    public String getAbout() {
        return about;
    }
    
    public void setAbout(String about) {
        this.about = about;
    }
    
    public LocalDateTime getLastSeen() {
        return lastSeen;
    }
    
    public void setLastSeen(LocalDateTime lastSeen) {
        this.lastSeen = lastSeen;
    }
    
    public Boolean getIsOnline() {
        return isOnline;
    }
    
    public void setIsOnline(Boolean isOnline) {
        this.isOnline = isOnline;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
