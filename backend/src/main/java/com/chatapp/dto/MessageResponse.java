package com.chatapp.dto;

import java.time.LocalDateTime;

public class MessageResponse {
    
    private Long id;
    private Long conversationId;
    private UserSearchResponse sender;
    private String content;
    private String messageType;
    private LocalDateTime createdAt;
    private String status; // SENT, DELIVERED, SEEN
    private LocalDateTime editedAt;
    private LocalDateTime deletedAt;
    private MessageResponse replyTo;
    private Boolean isForwarded;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private String fileType;
    
    // Constructors
    public MessageResponse() {
    }
    
    public MessageResponse(Long id, Long conversationId, UserSearchResponse sender, 
                          String content, String messageType, LocalDateTime createdAt) {
        this.id = id;
        this.conversationId = conversationId;
        this.sender = sender;
        this.content = content;
        this.messageType = messageType;
        this.createdAt = createdAt;
        this.status = "SENT";
    }
    
    public MessageResponse(Long id, Long conversationId, UserSearchResponse sender, 
                          String content, String messageType, LocalDateTime createdAt, String status) {
        this.id = id;
        this.conversationId = conversationId;
        this.sender = sender;
        this.content = content;
        this.messageType = messageType;
        this.createdAt = createdAt;
        this.status = status;
        this.isForwarded = false;
    }
    
    public MessageResponse(Long id, Long conversationId, UserSearchResponse sender, 
                          String content, String messageType, LocalDateTime createdAt, String status,
                          LocalDateTime editedAt, LocalDateTime deletedAt, MessageResponse replyTo, Boolean isForwarded) {
        this.id = id;
        this.conversationId = conversationId;
        this.sender = sender;
        this.content = content;
        this.messageType = messageType;
        this.createdAt = createdAt;
        this.status = status;
        this.editedAt = editedAt;
        this.deletedAt = deletedAt;
        this.replyTo = replyTo;
        this.isForwarded = isForwarded;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getConversationId() {
        return conversationId;
    }
    
    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }
    
    public UserSearchResponse getSender() {
        return sender;
    }
    
    public void setSender(UserSearchResponse sender) {
        this.sender = sender;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public String getMessageType() {
        return messageType;
    }
    
    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public LocalDateTime getEditedAt() {
        return editedAt;
    }
    
    public void setEditedAt(LocalDateTime editedAt) {
        this.editedAt = editedAt;
    }
    
    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }
    
    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }
    
    public MessageResponse getReplyTo() {
        return replyTo;
    }
    
    public void setReplyTo(MessageResponse replyTo) {
        this.replyTo = replyTo;
    }
    
    public Boolean getIsForwarded() {
        return isForwarded;
    }
    
    public void setIsForwarded(Boolean isForwarded) {
        this.isForwarded = isForwarded;
    }
    
    public String getFileUrl() {
        return fileUrl;
    }
    
    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }
    
    public String getFileName() {
        return fileName;
    }
    
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
    
    public Long getFileSize() {
        return fileSize;
    }
    
    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }
    
    public String getFileType() {
        return fileType;
    }
    
    public void setFileType(String fileType) {
        this.fileType = fileType;
    }
}
