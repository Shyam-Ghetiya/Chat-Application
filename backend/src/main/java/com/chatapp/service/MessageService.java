package com.chatapp.service;

import com.chatapp.dto.MessageRequest;
import com.chatapp.dto.MessageResponse;
import com.chatapp.dto.MessageStatusUpdate;
import com.chatapp.dto.UserSearchResponse;
import com.chatapp.entity.Conversation;
import com.chatapp.entity.ConversationMember;
import com.chatapp.entity.Message;
import com.chatapp.entity.MessageStatus;
import com.chatapp.entity.Notification;
import com.chatapp.entity.User;
import com.chatapp.repository.ConversationMemberRepository;
import com.chatapp.repository.ConversationRepository;
import com.chatapp.repository.MessageRepository;
import com.chatapp.repository.MessageStatusRepository;
import com.chatapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MessageService {
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private ConversationRepository conversationRepository;
    
    @Autowired
    private ConversationMemberRepository conversationMemberRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private MessageStatusRepository messageStatusRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Transactional
    public MessageResponse sendMessage(String senderEmail, MessageRequest request) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        
        // Verify sender is a member of the conversation
        if (!conversationMemberRepository.existsByConversationAndUser(conversation, sender)) {
            throw new RuntimeException("Not authorized to send messages in this conversation");
        }
        
        // Create and save message
        Message message = new Message(conversation, sender, request.getContent());
        
        // Handle reply
        if (request.getReplyToId() != null) {
            Message replyToMessage = messageRepository.findById(request.getReplyToId())
                    .orElseThrow(() -> new RuntimeException("Reply message not found"));
            message.setReplyTo(replyToMessage);
        }
        
        message = messageRepository.save(message);
        
        // Create SENT status for sender
        MessageStatus sentStatus = new MessageStatus(message, sender, MessageStatus.Status.SENT);
        messageStatusRepository.save(sentStatus);
        
        // Create DELIVERED status for all other members
        List<User> otherMembers = conversationMemberRepository.findUsersByConversation(conversation);
        for (User member : otherMembers) {
            if (!member.getId().equals(sender.getId())) {
                MessageStatus deliveredStatus = new MessageStatus(message, member, MessageStatus.Status.DELIVERED);
                messageStatusRepository.save(deliveredStatus);
            }
        }
        
        // Update conversation's updated_at timestamp
        conversation.setUpdatedAt(message.getCreatedAt());
        conversationRepository.save(conversation);
        
        // Create notifications for other members
        List<ConversationMember> members = conversationMemberRepository.findByConversation(conversation);
        String conversationName = conversation.getName();
        if (conversation.getType() == Conversation.ConversationType.DIRECT) {
            conversationName = sender.getName();
        }
        
        for (ConversationMember member : members) {
            if (!member.getUser().getId().equals(sender.getId())) {
                String notificationMessage = message.getContent();
                if (notificationMessage.length() > 50) {
                    notificationMessage = notificationMessage.substring(0, 50) + "...";
                }
                
                notificationService.createNotification(
                    member.getUser(),
                    Notification.NotificationType.NEW_MESSAGE,
                    conversationName,
                    notificationMessage,
                    conversation.getId(),
                    "CONVERSATION"
                );
            }
        }
        
        // Convert to response
        MessageResponse response = mapToMessageResponse(message, sender);
        
        // Send to WebSocket topic
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + conversation.getId(),
                response
        );
        
        return response;
    }
    
    public List<MessageResponse> getConversationMessages(String userEmail, Long conversationId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        
        // Verify user is a member
        if (!conversationMemberRepository.existsByConversationAndUser(conversation, user)) {
            throw new RuntimeException("Not authorized to view this conversation");
        }
        
        // Get messages (limit to last 50 for performance)
        List<Message> messages = messageRepository.findTop50ByConversationOrderByCreatedAtDesc(conversation);
        
        // Reverse to get chronological order
        Collections.reverse(messages);
        
        return messages.stream()
                .map(msg -> mapToMessageResponse(msg, user))
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void markMessagesAsSeen(String userEmail, Long conversationId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        
        // Verify user is a member
        if (!conversationMemberRepository.existsByConversationAndUser(conversation, user)) {
            throw new RuntimeException("Not authorized to view this conversation");
        }
        
        // Get all messages in conversation
        List<Message> messages = messageRepository.findTop50ByConversationOrderByCreatedAtDesc(conversation);
        
        // Update status to SEEN for this user
        for (Message message : messages) {
            // Don't mark own messages as seen
            if (!message.getSender().getId().equals(user.getId())) {
                Optional<MessageStatus> existingStatus = messageStatusRepository.findByMessageAndUser(message, user);
                if (existingStatus.isPresent()) {
                    MessageStatus status = existingStatus.get();
                    if (status.getStatus() != MessageStatus.Status.SEEN) {
                        status.setStatus(MessageStatus.Status.SEEN);
                        status.setStatusAt(LocalDateTime.now());
                        messageStatusRepository.save(status);
                        
                        // Broadcast status update via WebSocket
                        MessageStatusUpdate statusUpdate = new MessageStatusUpdate(
                            message.getId(),
                            user.getId(),
                            "SEEN"
                        );
                        messagingTemplate.convertAndSend(
                            "/topic/conversation/" + conversationId + "/status",
                            statusUpdate
                        );
                    }
                }
            }
        }
    }
    
    @Transactional
    public MessageResponse editMessage(String userEmail, Long messageId, String newContent) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        // Verify user is the sender
        if (!message.getSender().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to edit this message");
        }
        
        // Update content and edited timestamp
        message.setContent(newContent);
        message.setEditedAt(LocalDateTime.now());
        message = messageRepository.save(message);
        
        // Broadcast update via WebSocket
        MessageResponse response = mapToMessageResponse(message, user);
        messagingTemplate.convertAndSend(
            "/topic/conversation/" + message.getConversation().getId() + "/edit",
            response
        );
        
        return response;
    }
    
    @Transactional
    public void deleteMessage(String userEmail, Long messageId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        // Verify user is the sender
        if (!message.getSender().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to delete this message");
        }
        
        // Soft delete
        message.setDeletedAt(LocalDateTime.now());
        message.setContent("[Message deleted]");
        messageRepository.save(message);
        
        // Broadcast delete via WebSocket
        MessageResponse response = mapToMessageResponse(message, user);
        messagingTemplate.convertAndSend(
            "/topic/conversation/" + message.getConversation().getId() + "/delete",
            response
        );
    }
    
    private MessageResponse mapToMessageResponse(Message message, User currentUser) {
        UserSearchResponse senderResponse = new UserSearchResponse(
                message.getSender().getId(),
                message.getSender().getName(),
                message.getSender().getEmail(),
                message.getSender().getProfilePicture(),
                message.getSender().getAbout(),
                message.getSender().getIsOnline(),
                null
        );
        
        // Determine message status for current user
        String status = "SENT";
        if (message.getSender().getId().equals(currentUser.getId())) {
            // For sender, check if all recipients have seen it
            List<MessageStatus> statuses = messageStatusRepository.findByMessage(message);
            boolean allSeen = statuses.stream()
                    .filter(s -> !s.getUser().getId().equals(currentUser.getId()))
                    .allMatch(s -> s.getStatus() == MessageStatus.Status.SEEN);
            boolean allDelivered = statuses.stream()
                    .filter(s -> !s.getUser().getId().equals(currentUser.getId()))
                    .allMatch(s -> s.getStatus() == MessageStatus.Status.DELIVERED || s.getStatus() == MessageStatus.Status.SEEN);
            
            if (allSeen) {
                status = "SEEN";
            } else if (allDelivered) {
                status = "DELIVERED";
            }
        } else {
            // For recipient, get their own status
            Optional<MessageStatus> userStatus = messageStatusRepository.findByMessageAndUser(message, currentUser);
            if (userStatus.isPresent()) {
                status = userStatus.get().getStatus().toString();
            }
        }
        
        // Handle reply
        MessageResponse replyToResponse = null;
        if (message.getReplyTo() != null) {
            Message replyMsg = message.getReplyTo();
            UserSearchResponse replySender = new UserSearchResponse(
                    replyMsg.getSender().getId(),
                    replyMsg.getSender().getName(),
                    replyMsg.getSender().getEmail(),
                    replyMsg.getSender().getProfilePicture(),
                    replyMsg.getSender().getAbout(),
                    replyMsg.getSender().getIsOnline(),
                    null
            );
            replyToResponse = new MessageResponse(
                    replyMsg.getId(),
                    replyMsg.getConversation().getId(),
                    replySender,
                    replyMsg.getContent(),
                    replyMsg.getMessageType().toString(),
                    replyMsg.getCreatedAt(),
                    status
            );
        }
        
        return new MessageResponse(
                message.getId(),
                message.getConversation().getId(),
                senderResponse,
                message.getContent(),
                message.getMessageType().toString(),
                message.getCreatedAt(),
                status,
                message.getEditedAt(),
                message.getDeletedAt(),
                replyToResponse,
                message.getIsForwarded()
        ){{
            setFileUrl(message.getFileUrl());
            setFileName(message.getFileName());
            setFileSize(message.getFileSize());
            setFileType(message.getFileType());
        }};
    }
    
    public MessageResponse convertToResponse(Message message) {
        UserSearchResponse senderResponse = new UserSearchResponse(
                message.getSender().getId(),
                message.getSender().getName(),
                message.getSender().getEmail(),
                message.getSender().getProfilePicture(),
                message.getSender().getAbout(),
                message.getSender().getIsOnline(),
                null
        );
        
        MessageResponse response = new MessageResponse(
                message.getId(),
                message.getConversation().getId(),
                senderResponse,
                message.getContent(),
                message.getMessageType().toString(),
                message.getCreatedAt(),
                "SENT"
        );
        
        response.setFileUrl(message.getFileUrl());
        response.setFileName(message.getFileName());
        response.setFileSize(message.getFileSize());
        response.setFileType(message.getFileType());
        response.setEditedAt(message.getEditedAt());
        response.setDeletedAt(message.getDeletedAt());
        response.setIsForwarded(message.getIsForwarded());
        
        return response;
    }
    
    public void broadcastMessage(Long conversationId, MessageResponse messageResponse) {
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + conversationId,
                messageResponse
        );
    }
    
    public MessageResponse createFileMessageResponse(Message message, User sender) {
        UserSearchResponse senderResponse = new UserSearchResponse(
                sender.getId(),
                sender.getName(),
                sender.getEmail(),
                sender.getProfilePicture(),
                sender.getAbout(),
                sender.getIsOnline(),
                null
        );
        
        // For sender, check status of all recipients
        String status = "SENT";
        List<MessageStatus> statuses = messageStatusRepository.findByMessage(message);
        boolean allSeen = statuses.stream()
                .filter(s -> !s.getUser().getId().equals(sender.getId()))
                .allMatch(s -> s.getStatus() == MessageStatus.Status.SEEN);
        boolean allDelivered = statuses.stream()
                .filter(s -> !s.getUser().getId().equals(sender.getId()))
                .allMatch(s -> s.getStatus() == MessageStatus.Status.DELIVERED || s.getStatus() == MessageStatus.Status.SEEN);
        
        if (allSeen) {
            status = "SEEN";
        } else if (allDelivered) {
            status = "DELIVERED";
        }
        
        MessageResponse response = new MessageResponse(
                message.getId(),
                message.getConversation().getId(),
                senderResponse,
                message.getContent(),
                message.getMessageType().toString(),
                message.getCreatedAt(),
                status
        );
        
        response.setFileUrl(message.getFileUrl());
        response.setFileName(message.getFileName());
        response.setFileSize(message.getFileSize());
        response.setFileType(message.getFileType());
        response.setEditedAt(message.getEditedAt());
        response.setDeletedAt(message.getDeletedAt());
        response.setIsForwarded(message.getIsForwarded());
        
        return response;
    }
    
    public List<MessageResponse> searchMessages(String userEmail, String query, Long conversationId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Message> messages;
        
        if (conversationId != null) {
            // Search in specific conversation
            Conversation conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));
            
            // Verify user is a member
            if (!conversationMemberRepository.existsByConversationAndUser(conversation, user)) {
                throw new RuntimeException("Not authorized to view this conversation");
            }
            
            messages = messageRepository.findByConversationAndContentContainingIgnoreCase(conversation, query);
        } else {
            // Search in all user's conversations
            List<Conversation> userConversations = conversationMemberRepository.findConversationsByUser(user);
            messages = messageRepository.findByConversationInAndContentContainingIgnoreCase(userConversations, query);
        }
        
        // Filter out deleted messages
        messages = messages.stream()
                .filter(msg -> msg.getDeletedAt() == null)
                .collect(Collectors.toList());
        
        return messages.stream()
                .map(msg -> mapToMessageResponse(msg, user))
                .collect(Collectors.toList());
    }
}
