package com.chatapp.dto;

import java.time.LocalDateTime;

public class PresenceUpdate {
    private Long id;
    private String name;
    private String email;
    private Boolean isOnline;
    private LocalDateTime lastSeen;
    
    public PresenceUpdate() {
    }
    
    public PresenceUpdate(Long id, String name, String email, Boolean isOnline, LocalDateTime lastSeen) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.isOnline = isOnline;
        this.lastSeen = lastSeen;
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
    
    public Boolean getIsOnline() {
        return isOnline;
    }
    
    public void setIsOnline(Boolean isOnline) {
        this.isOnline = isOnline;
    }
    
    public LocalDateTime getLastSeen() {
        return lastSeen;
    }
    
    public void setLastSeen(LocalDateTime lastSeen) {
        this.lastSeen = lastSeen;
    }
}
