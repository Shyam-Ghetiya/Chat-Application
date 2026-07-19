package com.chatapp.controller;

import com.chatapp.dto.CallSignal;
import com.chatapp.entity.CallHistory;
import com.chatapp.entity.User;
import com.chatapp.repository.CallHistoryRepository;
import com.chatapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
public class CallController {
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CallHistoryRepository callHistoryRepository;
    
    @MessageMapping("/call/signal")
    public void handleCallSignal(@Payload CallSignal signal) {
        // Forward the signal to the appropriate user
        if (signal.getCalleeId() != null) {
            messagingTemplate.convertAndSend("/topic/call/" + signal.getCalleeId(), signal);
        } else if (signal.getCallerId() != null) {
            messagingTemplate.convertAndSend("/topic/call/" + signal.getCallerId(), signal);
        }
    }
    
    @RestController
    @RequestMapping("/api/calls")
    public static class CallHistoryController {
        
        @Autowired
        private CallHistoryRepository callHistoryRepository;
        
        @Autowired
        private UserRepository userRepository;
        
        @PostMapping("/initiate")
        public Map<String, Object> initiateCall(@RequestBody Map<String, Object> request, Authentication authentication) {
            String email = authentication.getName();
            User caller = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Long calleeId = Long.valueOf(request.get("calleeId").toString());
            String callType = request.get("callType").toString();
            
            User callee = userRepository.findById(calleeId)
                    .orElseThrow(() -> new RuntimeException("Callee not found"));
            
            CallHistory callHistory = new CallHistory(
                    caller,
                    callee,
                    CallHistory.CallType.valueOf(callType.toUpperCase()),
                    CallHistory.CallStatus.INITIATED
            );
            callHistory = callHistoryRepository.save(callHistory);
            
            Map<String, Object> response = new HashMap<>();
            response.put("callId", callHistory.getId());
            return response;
        }
        
        @PutMapping("/{callId}/answer")
        public void answerCall(@PathVariable Long callId) {
            CallHistory call = callHistoryRepository.findById(callId)
                    .orElseThrow(() -> new RuntimeException("Call not found"));
            
            call.setStatus(CallHistory.CallStatus.ANSWERED);
            call.setStartedAt(LocalDateTime.now());
            callHistoryRepository.save(call);
        }
        
        @PutMapping("/{callId}/reject")
        public void rejectCall(@PathVariable Long callId) {
            CallHistory call = callHistoryRepository.findById(callId)
                    .orElseThrow(() -> new RuntimeException("Call not found"));
            
            call.setStatus(CallHistory.CallStatus.REJECTED);
            call.setEndedAt(LocalDateTime.now());
            callHistoryRepository.save(call);
        }
        
        @PutMapping("/{callId}/end")
        public void endCall(@PathVariable Long callId) {
            CallHistory call = callHistoryRepository.findById(callId)
                    .orElseThrow(() -> new RuntimeException("Call not found"));
            
            call.setStatus(CallHistory.CallStatus.ENDED);
            call.setEndedAt(LocalDateTime.now());
            
            if (call.getStartedAt() != null) {
                long duration = ChronoUnit.SECONDS.between(call.getStartedAt(), call.getEndedAt());
                call.setDurationSeconds((int) duration);
            }
            
            callHistoryRepository.save(call);
        }
        
        @GetMapping("/history")
        public List<Map<String, Object>> getCallHistory(Authentication authentication) {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<CallHistory> calls = callHistoryRepository.findByUserOrderByCreatedAtDesc(user);
            
            return calls.stream().map(call -> {
                Map<String, Object> callMap = new HashMap<>();
                callMap.put("id", call.getId());
                callMap.put("callType", call.getCallType().toString());
                callMap.put("status", call.getStatus().toString());
                callMap.put("durationSeconds", call.getDurationSeconds());
                callMap.put("createdAt", call.getCreatedAt());
                
                boolean isIncoming = call.getCallee().getId().equals(user.getId());
                User otherUser = isIncoming ? call.getCaller() : call.getCallee();
                
                Map<String, Object> otherUserMap = new HashMap<>();
                otherUserMap.put("id", otherUser.getId());
                otherUserMap.put("name", otherUser.getName());
                otherUserMap.put("profilePicture", otherUser.getProfilePicture());
                
                callMap.put("isIncoming", isIncoming);
                callMap.put("otherUser", otherUserMap);
                
                return callMap;
            }).collect(Collectors.toList());
        }
    }
}
