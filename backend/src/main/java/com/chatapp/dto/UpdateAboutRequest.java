package com.chatapp.dto;

import jakarta.validation.constraints.Size;

public class UpdateAboutRequest {
    
    @Size(max = 500, message = "About must not exceed 500 characters")
    private String about;
    
    // Constructors
    public UpdateAboutRequest() {
    }
    
    public UpdateAboutRequest(String about) {
        this.about = about;
    }
    
    // Getters and Setters
    public String getAbout() {
        return about;
    }
    
    public void setAbout(String about) {
        this.about = about;
    }
}
