package com.chatapp.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "message_status")
public class MessageStatus {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "message_id", nullable = false)
    private Message message;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;
    
    @Column(name = "status_at", nullable = false)
    private LocalDateTime statusAt;
    
    public enum Status {
        SENT,
        DELIVERED,
        SEEN
    }
    
    public MessageStatus() {
    }
    
    public MessageStatus(Message message, User user, Status status) {
        this.message = message;
        this.user = user;
        this.status = status;
        this.statusAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Message getMessage() {
        return message;
    }
    
    public void setMessage(Message message) {
        this.message = message;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public Status getStatus() {
        return status;
    }
    
    public void setStatus(Status status) {
        this.status = status;
    }
    
    public LocalDateTime getStatusAt() {
        return statusAt;
    }
    
    public void setStatusAt(LocalDateTime statusAt) {
        this.statusAt = statusAt;
    }
}
