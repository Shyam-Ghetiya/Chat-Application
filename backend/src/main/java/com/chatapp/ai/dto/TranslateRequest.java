package com.chatapp.ai.dto;

import jakarta.validation.constraints.NotBlank;

public class TranslateRequest {
    
    @NotBlank(message = "Text is required")
    private String text;
    
    @NotBlank(message = "Source language is required")
    private String sourceLanguage;
    
    @NotBlank(message = "Target language is required")
    private String targetLanguage;
    
    // Constructors
    public TranslateRequest() {
    }
    
    public TranslateRequest(String text, String sourceLanguage, String targetLanguage) {
        this.text = text;
        this.sourceLanguage = sourceLanguage;
        this.targetLanguage = targetLanguage;
    }
    
    // Getters and Setters
    public String getText() {
        return text;
    }
    
    public void setText(String text) {
        this.text = text;
    }
    
    public String getSourceLanguage() {
        return sourceLanguage;
    }
    
    public void setSourceLanguage(String sourceLanguage) {
        this.sourceLanguage = sourceLanguage;
    }
    
    public String getTargetLanguage() {
        return targetLanguage;
    }
    
    public void setTargetLanguage(String targetLanguage) {
        this.targetLanguage = targetLanguage;
    }
}
