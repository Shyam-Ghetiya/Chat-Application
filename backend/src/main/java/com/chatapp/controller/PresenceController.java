package com.chatapp.controller;

import com.chatapp.service.PresenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class PresenceController {
    
    @Autowired
    private PresenceService presenceService;
    
    @GetMapping("/api/presence/online")
    public ResponseEntity<Map<Long, Boolean>> getOnlineUsers() {
        return ResponseEntity.ok(presenceService.getOnlineStatuses());
    }
    
    @GetMapping("/api/presence/{userId}")
    public ResponseEntity<Map<String, Object>> getUserPresence(@PathVariable Long userId) {
        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("isOnline", presenceService.isUserOnline(userId));
        response.put("lastSeen", presenceService.getUserLastSeen(userId));
        return ResponseEntity.ok(response);
    }
}
