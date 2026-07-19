package com.chatapp.dto;

public class UserSearchResponse {
    
    private Long id;
    private String name;
    private String email;
    private String profilePicture;
    private String about;
    private Boolean isOnline;
    private String friendshipStatus; // NONE, PENDING_SENT, PENDING_RECEIVED, FRIENDS
    
    // Constructors
    public UserSearchResponse() {
    }
    
    public UserSearchResponse(Long id, String name, String email, String profilePicture, 
                             String about, Boolean isOnline, String friendshipStatus) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.profilePicture = profilePicture;
        this.about = about;
        this.isOnline = isOnline;
        this.friendshipStatus = friendshipStatus;
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
    
    public Boolean getIsOnline() {
        return isOnline;
    }
    
    public void setIsOnline(Boolean isOnline) {
        this.isOnline = isOnline;
    }
    
    public String getFriendshipStatus() {
        return friendshipStatus;
    }
    
    public void setFriendshipStatus(String friendshipStatus) {
        this.friendshipStatus = friendshipStatus;
    }
}
