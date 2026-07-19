package com.chatapp.service;

import com.chatapp.dto.PresenceUpdate;
import com.chatapp.entity.User;
import com.chatapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PresenceService {
    
    // In-memory storage of online users: userId -> lastSeen timestamp
    private final Map<Long, LocalDateTime> onlineUsers = new ConcurrentHashMap<>();
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private UserRepository userRepository;
    
    public void userConnected(Long userId) {
        onlineUsers.put(userId, LocalDateTime.now());
        broadcastPresenceUpdate(userId, true, null);
    }
    
    public void userDisconnected(Long userId) {
        LocalDateTime lastSeen = LocalDateTime.now();
        onlineUsers.remove(userId);
        broadcastPresenceUpdate(userId, false, lastSeen);
    }
    
    public void updateUserActivity(Long userId) {
        if (onlineUsers.containsKey(userId)) {
            onlineUsers.put(userId, LocalDateTime.now());
        }
    }
    
    public boolean isUserOnline(Long userId) {
        return onlineUsers.containsKey(userId);
    }
    
    public LocalDateTime getUserLastSeen(Long userId) {
        return onlineUsers.get(userId);
    }
    
    public Map<Long, Boolean> getOnlineStatuses() {
        Map<Long, Boolean> statuses = new ConcurrentHashMap<>();
        onlineUsers.keySet().forEach(userId -> statuses.put(userId, true));
        return statuses;
    }
    
    private void broadcastPresenceUpdate(Long userId, boolean isOnline, LocalDateTime lastSeen) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            PresenceUpdate update = new PresenceUpdate(
                user.getId(),
                user.getName(),
                user.getEmail(),
                isOnline,
                lastSeen
            );
            
            // Broadcast to all clients
            messagingTemplate.convertAndSend("/topic/presence", update);
        }
    }
}
