package com.chatapp.websocket;

import com.chatapp.entity.User;
import com.chatapp.repository.UserRepository;
import com.chatapp.service.PresenceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketEventListener {
    
    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);
    
    // Map sessionId to userId
    private final Map<String, Long> sessionUserMap = new ConcurrentHashMap<>();
    
    @Autowired
    private PresenceService presenceService;
    
    @Autowired
    private UserRepository userRepository;
    
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        
        // Get the CONNECT message which has the session attributes
        StompHeaderAccessor connectMessage = StompHeaderAccessor.wrap(
            (org.springframework.messaging.Message<?>) headerAccessor.getHeader("simpConnectMessage")
        );
        
        if (connectMessage != null && connectMessage.getSessionAttributes() != null) {
            Long userId = (Long) connectMessage.getSessionAttributes().get("userId");
            
            if (userId != null) {
                sessionUserMap.put(sessionId, userId);
                presenceService.userConnected(userId);
                logger.info("User connected: userId={}, sessionId={}", userId, sessionId);
            } else {
                logger.warn("User connected without userId: sessionId={}", sessionId);
            }
        } else {
            logger.warn("No connect message or session attributes: sessionId={}", sessionId);
        }
    }
    
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        
        Long userId = sessionUserMap.remove(sessionId);
        if (userId != null) {
            // Check if user has other active sessions
            boolean hasOtherSessions = sessionUserMap.containsValue(userId);
            
            if (!hasOtherSessions) {
                presenceService.userDisconnected(userId);
                logger.info("User disconnected: userId={}, sessionId={}", userId, sessionId);
            }
        }
    }
}
