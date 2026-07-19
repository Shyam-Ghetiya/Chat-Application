package com.chatapp.dto;

public class CallSignal {
    
    private String type; // "offer", "answer", "ice-candidate", "call-initiate", "call-accept", "call-reject", "call-end"
    private Long callerId;
    private Long calleeId;
    private String callType; // "voice" or "video"
    private String sdp;
    private IceCandidate candidate;
    private Long callId;
    
    public static class IceCandidate {
        private String candidate;
        private String sdpMid;
        private Integer sdpMLineIndex;
        
        public IceCandidate() {
        }
        
        public String getCandidate() {
            return candidate;
        }
        
        public void setCandidate(String candidate) {
            this.candidate = candidate;
        }
        
        public String getSdpMid() {
            return sdpMid;
        }
        
        public void setSdpMid(String sdpMid) {
            this.sdpMid = sdpMid;
        }
        
        public Integer getSdpMLineIndex() {
            return sdpMLineIndex;
        }
        
        public void setSdpMLineIndex(Integer sdpMLineIndex) {
            this.sdpMLineIndex = sdpMLineIndex;
        }
    }
    
    // Constructors
    public CallSignal() {
    }
    
    // Getters and Setters
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public Long getCallerId() {
        return callerId;
    }
    
    public void setCallerId(Long callerId) {
        this.callerId = callerId;
    }
    
    public Long getCalleeId() {
        return calleeId;
    }
    
    public void setCalleeId(Long calleeId) {
        this.calleeId = calleeId;
    }
    
    public String getCallType() {
        return callType;
    }
    
    public void setCallType(String callType) {
        this.callType = callType;
    }
    
    public String getSdp() {
        return sdp;
    }
    
    public void setSdp(String sdp) {
        this.sdp = sdp;
    }
    
    public IceCandidate getCandidate() {
        return candidate;
    }
    
    public void setCandidate(IceCandidate candidate) {
        this.candidate = candidate;
    }
    
    public Long getCallId() {
        return callId;
    }
    
    public void setCallId(Long callId) {
        this.callId = callId;
    }
}
