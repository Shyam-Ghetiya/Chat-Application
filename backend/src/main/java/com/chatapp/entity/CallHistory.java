package com.chatapp.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "call_history")
public class CallHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "caller_id", nullable = false)
    private User caller;
    
    @ManyToOne
    @JoinColumn(name = "callee_id", nullable = false)
    private User callee;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private CallType callType;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private CallStatus status;
    
    @Column(name = "duration_seconds")
    private Integer durationSeconds;
    
    @Column(name = "started_at")
    private LocalDateTime startedAt;
    
    @Column(name = "ended_at")
    private LocalDateTime endedAt;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    public enum CallType {
        VOICE,
        VIDEO
    }
    
    public enum CallStatus {
        INITIATED,
        RINGING,
        ANSWERED,
        REJECTED,
        MISSED,
        ENDED,
        FAILED
    }
    
    // Constructors
    public CallHistory() {
    }
    
    public CallHistory(User caller, User callee, CallType callType, CallStatus status) {
        this.caller = caller;
        this.callee = callee;
        this.callType = callType;
        this.status = status;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getCaller() {
        return caller;
    }
    
    public void setCaller(User caller) {
        this.caller = caller;
    }
    
    public User getCallee() {
        return callee;
    }
    
    public void setCallee(User callee) {
        this.callee = callee;
    }
    
    public CallType getCallType() {
        return callType;
    }
    
    public void setCallType(CallType callType) {
        this.callType = callType;
    }
    
    public CallStatus getStatus() {
        return status;
    }
    
    public void setStatus(CallStatus status) {
        this.status = status;
    }
    
    public Integer getDurationSeconds() {
        return durationSeconds;
    }
    
    public void setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
    }
    
    public LocalDateTime getStartedAt() {
        return startedAt;
    }
    
    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }
    
    public LocalDateTime getEndedAt() {
        return endedAt;
    }
    
    public void setEndedAt(LocalDateTime endedAt) {
        this.endedAt = endedAt;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
