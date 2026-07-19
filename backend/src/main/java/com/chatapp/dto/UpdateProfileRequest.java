package com.chatapp.dto;

import jakarta.validation.constraints.Size;

public class UpdateProfileRequest {
    
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private String name;
    
    @Size(max = 500, message = "About must not exceed 500 characters")
    private String about;
    
    // Constructors
    public UpdateProfileRequest() {
    }
    
    public UpdateProfileRequest(String name, String about) {
        this.name = name;
        this.about = about;
    }
    
    // Getters and Setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getAbout() {
        return about;
    }
    
    public void setAbout(String about) {
        this.about = about;
    }
}
