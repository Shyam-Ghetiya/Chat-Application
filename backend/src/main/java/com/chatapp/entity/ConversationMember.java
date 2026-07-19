package com.chatapp.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "conversation_members")
public class ConversationMember {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;
    
    @Column(name = "last_read_at")
    private LocalDateTime lastReadAt;
    
    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
        lastReadAt = LocalDateTime.now();
    }
    
    // Constructors
    public ConversationMember() {
    }
    
    public ConversationMember(Conversation conversation, User user) {
        this.conversation = conversation;
        this.user = user;
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
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }
    
    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }
    
    public LocalDateTime getLastReadAt() {
        return lastReadAt;
    }
    
    public void setLastReadAt(LocalDateTime lastReadAt) {
        this.lastReadAt = lastReadAt;
    }
}
