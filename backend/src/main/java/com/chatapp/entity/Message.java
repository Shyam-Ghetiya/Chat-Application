package com.chatapp.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;
    
    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;
    
    @Column(nullable = false, length = 5000)
    private String content;
    
    @Column(name = "message_type")
    @Enumerated(EnumType.STRING)
    private MessageType messageType;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "edited_at")
    private LocalDateTime editedAt;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    @ManyToOne
    @JoinColumn(name = "reply_to_id")
    private Message replyTo;
    
    @Column(name = "is_forwarded")
    private Boolean isForwarded = false;
    
    @Column(name = "file_url")
    private String fileUrl;
    
    @Column(name = "file_name")
    private String fileName;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Column(name = "file_type")
    private String fileType;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    public enum MessageType {
        TEXT,
        IMAGE,
        VIDEO,
        DOCUMENT,
        AUDIO,
        FILE,
        SYSTEM
    }
    
    // Constructors
    public Message() {
        this.messageType = MessageType.TEXT;
    }
    
    public Message(Conversation conversation, User sender, String content) {
        this.conversation = conversation;
        this.sender = sender;
        this.content = content;
        this.messageType = MessageType.TEXT;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Conversation getConversation() {
        return conversation;
    }
    
    public void setConversation(Conversation conversation) {
        this.conversation = conversation;
    }
    
    public User getSender() {
        return sender;
    }
    
    public void setSender(User sender) {
        this.sender = sender;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public MessageType getMessageType() {
        return messageType;
    }
    
    public void setMessageType(MessageType messageType) {
        this.messageType = messageType;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
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
    
    public Message getReplyTo() {
        return replyTo;
    }
    
    public void setReplyTo(Message replyTo) {
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
