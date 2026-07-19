package com.chatapp.service;

import com.chatapp.dto.ConversationResponse;
import com.chatapp.dto.CreateConversationRequest;
import com.chatapp.dto.UserSearchResponse;
import com.chatapp.entity.Conversation;
import com.chatapp.entity.ConversationMember;
import com.chatapp.entity.User;
import com.chatapp.repository.ConversationMemberRepository;
import com.chatapp.repository.ConversationRepository;
import com.chatapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ConversationService {
    
    @Autowired
    private ConversationRepository conversationRepository;
    
    @Autowired
    private ConversationMemberRepository conversationMemberRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Transactional
    public ConversationResponse createConversation(String currentUserEmail, CreateConversationRequest request) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Conversation.ConversationType type;
        try {
            type = Conversation.ConversationType.valueOf(request.getType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid conversation type");
        }
        
        // For direct conversations, check if one already exists
        if (type == Conversation.ConversationType.DIRECT) {
            if (request.getMemberIds().size() != 1) {
                throw new RuntimeException("Direct conversation must have exactly one other member");
            }
            
            Long otherUserId = request.getMemberIds().get(0);
            User otherUser = userRepository.findById(otherUserId)
                    .orElseThrow(() -> new RuntimeException("Other user not found"));
            
            // Check if direct conversation already exists
            Optional<Conversation> existing = conversationRepository
                    .findDirectConversationBetweenUsers(currentUser, otherUser);
            
            if (existing.isPresent()) {
                return mapToConversationResponse(existing.get(), currentUser);
            }
        }
        
        // Create new conversation
        Conversation conversation = new Conversation(type, request.getName());
        conversation = conversationRepository.save(conversation);
        
        // Add current user as member
        ConversationMember currentMember = new ConversationMember(conversation, currentUser);
        conversationMemberRepository.save(currentMember);
        
        // Add other members
        for (Long memberId : request.getMemberIds()) {
            User member = userRepository.findById(memberId)
                    .orElseThrow(() -> new RuntimeException("Member not found: " + memberId));
            
            if (!member.getId().equals(currentUser.getId())) {
                ConversationMember conversationMember = new ConversationMember(conversation, member);
                conversationMemberRepository.save(conversationMember);
            }
        }
        
        return mapToConversationResponse(conversation, currentUser);
    }
    
    public List<ConversationResponse> getUserConversations(String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Conversation> conversations = conversationRepository.findByUserOrderByUpdatedAtDesc(currentUser);
        
        return conversations.stream()
                .map(conv -> mapToConversationResponse(conv, currentUser))
                .collect(Collectors.toList());
    }
    
    public ConversationResponse getConversation(String currentUserEmail, Long conversationId) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        
        // Verify user is a member
        if (!conversationMemberRepository.existsByConversationAndUser(conversation, currentUser)) {
            throw new RuntimeException("Not authorized to access this conversation");
        }
        
        return mapToConversationResponse(conversation, currentUser);
    }
    
    private ConversationResponse mapToConversationResponse(Conversation conversation, User currentUser) {
        List<ConversationMember> members = conversationMemberRepository.findByConversation(conversation);
        
        List<UserSearchResponse> memberResponses = members.stream()
                .map(member -> mapToUserSearchResponse(member.getUser()))
                .collect(Collectors.toList());
        
        ConversationResponse response = new ConversationResponse(
                conversation.getId(),
                conversation.getType().toString(),
                conversation.getName(),
                memberResponses,
                conversation.getCreatedAt(),
                conversation.getUpdatedAt()
        );
        
        // For direct conversations, set the other user
        if (conversation.getType() == Conversation.ConversationType.DIRECT && members.size() == 2) {
            User otherUser = members.stream()
                    .map(ConversationMember::getUser)
                    .filter(user -> !user.getId().equals(currentUser.getId()))
                    .findFirst()
                    .orElse(null);
            
            if (otherUser != null) {
                response.setOtherUser(mapToUserSearchResponse(otherUser));
                // Set name to other user's name for convenience
                response.setName(otherUser.getName());
            }
        }
        
        return response;
    }
    
    private UserSearchResponse mapToUserSearchResponse(User user) {
        return new UserSearchResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getProfilePicture(),
                user.getAbout(),
                user.getIsOnline(),
                null // friendshipStatus not needed here
        );
    }
    
    // Group Management Methods
    
    @Transactional
    public ConversationResponse renameGroup(String userEmail, Long conversationId, String newName) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        
        // Verify user is a member
        if (!conversationMemberRepository.existsByConversationAndUser(conversation, user)) {
            throw new RuntimeException("Not authorized");
        }
        
        if (conversation.getType() != Conversation.ConversationType.GROUP) {
            throw new RuntimeException("Can only rename group conversations");
        }
        
        conversation.setName(newName);
        conversationRepository.save(conversation);
        
        return mapToConversationResponse(conversation, user);
    }
    
    @Transactional
    public ConversationResponse addMember(String userEmail, Long conversationId, Long newMemberId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        
        // Verify user is a member
        if (!conversationMemberRepository.existsByConversationAndUser(conversation, user)) {
            throw new RuntimeException("Not authorized");
        }
        
        if (conversation.getType() != Conversation.ConversationType.GROUP) {
            throw new RuntimeException("Can only add members to group conversations");
        }
        
        User newMember = userRepository.findById(newMemberId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if already a member
        if (conversationMemberRepository.existsByConversationAndUser(conversation, newMember)) {
            throw new RuntimeException("User is already a member");
        }
        
        ConversationMember conversationMember = new ConversationMember(conversation, newMember);
        conversationMemberRepository.save(conversationMember);
        
        return mapToConversationResponse(conversation, user);
    }
    
    @Transactional
    public ConversationResponse removeMember(String userEmail, Long conversationId, Long memberIdToRemove) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        
        // Verify user is a member
        if (!conversationMemberRepository.existsByConversationAndUser(conversation, user)) {
            throw new RuntimeException("Not authorized");
        }
        
        if (conversation.getType() != Conversation.ConversationType.GROUP) {
            throw new RuntimeException("Can only remove members from group conversations");
        }
        
        User memberToRemove = userRepository.findById(memberIdToRemove)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        ConversationMember conversationMember = conversationMemberRepository
                .findByConversationAndUser(conversation, memberToRemove)
                .orElseThrow(() -> new RuntimeException("User is not a member"));
        
        conversationMemberRepository.delete(conversationMember);
        
        return mapToConversationResponse(conversation, user);
    }
    
    @Transactional
    public void leaveGroup(String userEmail, Long conversationId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        
        if (conversation.getType() != Conversation.ConversationType.GROUP) {
            throw new RuntimeException("Can only leave group conversations");
        }
        
        ConversationMember conversationMember = conversationMemberRepository
                .findByConversationAndUser(conversation, user)
                .orElseThrow(() -> new RuntimeException("You are not a member"));
        
        conversationMemberRepository.delete(conversationMember);
        
        // If no members left, delete the conversation
        List<ConversationMember> remainingMembers = conversationMemberRepository.findByConversation(conversation);
        if (remainingMembers.isEmpty()) {
            conversationRepository.delete(conversation);
        }
    }
    
    @Transactional
    public void deleteGroup(String userEmail, Long conversationId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        
        // Verify user is a member
        if (!conversationMemberRepository.existsByConversationAndUser(conversation, user)) {
            throw new RuntimeException("Not authorized");
        }
        
        if (conversation.getType() != Conversation.ConversationType.GROUP) {
            throw new RuntimeException("Can only delete group conversations");
        }
        
        // Delete all members
        List<ConversationMember> members = conversationMemberRepository.findByConversation(conversation);
        conversationMemberRepository.deleteAll(members);
        
        // Delete conversation
        conversationRepository.delete(conversation);
    }
}
