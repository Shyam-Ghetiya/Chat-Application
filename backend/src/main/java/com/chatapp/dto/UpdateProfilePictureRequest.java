package com.chatapp.dto;

public class UpdateProfilePictureRequest {
    
    private String profilePicture;
    
    // Constructors
    public UpdateProfilePictureRequest() {
    }
    
    public UpdateProfilePictureRequest(String profilePicture) {
        this.profilePicture = profilePicture;
    }
    
    // Getters and Setters
    public String getProfilePicture() {
        return profilePicture;
    }
    
    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }
}
