package com.chatapp.ai.dto;

public class TranslateResponse {
    private String translatedText;
    private String sourceLanguage;
    private String targetLanguage;
    
    // Constructors
    public TranslateResponse() {
    }
    
    public TranslateResponse(String translatedText, String sourceLanguage, String targetLanguage) {
        this.translatedText = translatedText;
        this.sourceLanguage = sourceLanguage;
        this.targetLanguage = targetLanguage;
    }
    
    // Getters and Setters
    public String getTranslatedText() {
        return translatedText;
    }
    
    public void setTranslatedText(String translatedText) {
        this.translatedText = translatedText;
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
