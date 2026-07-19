package com.chatapp.ai.dto;

public class SummarizeResponse {
    private String summary;
    private int messageCount;
    private String summaryType;
    private String length;
    private String style;
    private String language;
    
    // Constructors
    public SummarizeResponse() {
    }
    
    public SummarizeResponse(String summary, int messageCount, String summaryType, String length, String style, String language) {
        this.summary = summary;
        this.messageCount = messageCount;
        this.summaryType = summaryType;
        this.length = length;
        this.style = style;
        this.language = language;
    }
    
    // Getters and Setters
    public String getSummary() {
        return summary;
    }
    
    public void setSummary(String summary) {
        this.summary = summary;
    }
    
    public int getMessageCount() {
        return messageCount;
    }
    
    public void setMessageCount(int messageCount) {
        this.messageCount = messageCount;
    }
    
    public String getSummaryType() {
        return summaryType;
    }
    
    public void setSummaryType(String summaryType) {
        this.summaryType = summaryType;
    }
    
    public String getLength() {
        return length;
    }
    
    public void setLength(String length) {
        this.length = length;
    }
    
    public String getStyle() {
        return style;
    }
    
    public void setStyle(String style) {
        this.style = style;
    }
    
    public String getLanguage() {
        return language;
    }
    
    public void setLanguage(String language) {
        this.language = language;
    }
}
