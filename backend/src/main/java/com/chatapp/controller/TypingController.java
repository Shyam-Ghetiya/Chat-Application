package com.chatapp.controller;

import com.chatapp.dto.TypingIndicator;
import com.chatapp.entity.User;
import com.chatapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class TypingController {
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private UserRepository userRepository;
    
    @MessageMapping("/typing")
    public void handleTyping(@Payload TypingIndicator typingIndicator, Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user != null) {
            // Set user info
            typingIndicator.setUserId(user.getId());
            typingIndicator.setUserName(user.getName());
            
            // Broadcast to conversation topic
            messagingTemplate.convertAndSend(
                "/topic/conversation/" + typingIndicator.getConversationId() + "/typing",
                typingIndicator
            );
        }
    }
}
