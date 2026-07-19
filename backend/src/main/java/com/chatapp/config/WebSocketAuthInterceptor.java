package com.chatapp.config;

import com.chatapp.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            List<String> authorization = accessor.getNativeHeader("Authorization");
            
            if (authorization != null && !authorization.isEmpty()) {
                String token = authorization.get(0);
                
                if (token.startsWith("Bearer ")) {
                    token = token.substring(7);
                }
                
                try {
                    String email = jwtUtil.getEmailFromToken(token);
                    Long userId = jwtUtil.getUserIdFromToken(token);
                    
                    if (email != null && jwtUtil.validateToken(token)) {
                        UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(email, null, new ArrayList<>());
                        
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        accessor.setUser(authentication);
                        
                        // Store userId in session attributes for later use
                        accessor.getSessionAttributes().put("userId", userId);
                    }
                } catch (Exception e) {
                    System.err.println("WebSocket authentication failed: " + e.getMessage());
                }
            }
        }
        
        return message;
    }
}
