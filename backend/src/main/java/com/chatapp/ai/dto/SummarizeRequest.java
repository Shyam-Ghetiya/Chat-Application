package com.chatapp.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

public class SummarizeRequest {
    
    @NotNull(message = "Conversation ID is required")
    private Long conversationId;
    
    @NotBlank(message = "Summary type is required")
    private String summaryType; // ENTIRE, LAST_20, LAST_50, LAST_100, SELECTED, DATE_RANGE
    
    @NotBlank(message = "Summary length is required")
    private String length; // SHORT, MEDIUM, DETAILED
    
    @NotBlank(message = "Summary style is required")
    private String style; // BULLET_POINTS, PARAGRAPH, ACTION_ITEMS, MEETING_NOTES, KEY_HIGHLIGHTS
    
    @NotBlank(message = "Language is required")
    private String language;
    
    // Optional: For SELECTED type
    private List<Long> selectedMessageIds;
    
    // Optional: For DATE_RANGE type
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    
    // Constructors
    public SummarizeRequest() {
    }
    
    public SummarizeRequest(Long conversationId, String summaryType, String length, String style, String language) {
        this.conversationId = conversationId;
        this.summaryType = summaryType;
        this.length = length;
        this.style = style;
        this.language = language;
    }
    
    // Getters and Setters
    public Long getConversationId() {
        return conversationId;
    }
    
    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
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
    
    public List<Long> getSelectedMessageIds() {
        return selectedMessageIds;
    }
    
    public void setSelectedMessageIds(List<Long> selectedMessageIds) {
        this.selectedMessageIds = selectedMessageIds;
    }
    
    public LocalDateTime getStartDate() {
        return startDate;
    }
    
    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }
    
    public LocalDateTime getEndDate() {
        return endDate;
    }
    
    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }
}
