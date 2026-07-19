package com.chatapp.service;

import com.chatapp.dto.NotificationResponse;
import com.chatapp.entity.Notification;
import com.chatapp.entity.User;
import com.chatapp.repository.NotificationRepository;
import com.chatapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    public void createNotification(User user, Notification.NotificationType type, 
                                   String title, String message, Long referenceId, String referenceType) {
        Notification notification = new Notification(user, type, title, message, referenceId, referenceType);
        notification = notificationRepository.save(notification);
        
        // Send notification via WebSocket
        NotificationResponse response = mapToResponse(notification);
        messagingTemplate.convertAndSend("/topic/notifications/" + user.getId(), response);
    }
    
    public List<NotificationResponse> getUserNotifications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        
        return notifications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<NotificationResponse> getUnreadNotifications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Notification> notifications = notificationRepository.findByUserAndIsReadOrderByCreatedAtDesc(user, false);
        
        return notifications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public Long getUnreadCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return notificationRepository.countUnreadByUser(user);
    }
    
    @Transactional
    public void markAsRead(String userEmail, Long notificationId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized");
        }
        
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }
    
    @Transactional
    public void markAllAsRead(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Notification> notifications = notificationRepository.findByUserAndIsReadOrderByCreatedAtDesc(user, false);
        
        for (Notification notification : notifications) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }
    
    @Transactional
    public void deleteNotification(String userEmail, Long notificationId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized");
        }
        
        notificationRepository.delete(notification);
    }
    
    private NotificationResponse mapToResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType().toString(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getReferenceId(),
                notification.getReferenceType(),
                notification.getIsRead(),
                notification.getCreatedAt()
        );
    }
}
