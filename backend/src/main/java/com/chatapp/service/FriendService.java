package com.chatapp.service;

import com.chatapp.dto.FriendRequestResponse;
import com.chatapp.dto.UserSearchResponse;
import com.chatapp.entity.FriendRequest;
import com.chatapp.entity.Friendship;
import com.chatapp.entity.Notification;
import com.chatapp.entity.User;
import com.chatapp.repository.FriendRequestRepository;
import com.chatapp.repository.FriendshipRepository;
import com.chatapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FriendService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FriendRequestRepository friendRequestRepository;
    
    @Autowired
    private FriendshipRepository friendshipRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    public List<UserSearchResponse> searchUsers(String query, String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<User> users = userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);
        
        return users.stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .map(user -> mapToUserSearchResponse(user, currentUser))
                .collect(Collectors.toList());
    }
    
    @Transactional
    public FriendRequestResponse sendFriendRequest(String senderEmail, Long receiverId) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));
        
        if (sender.getId().equals(receiver.getId())) {
            throw new RuntimeException("Cannot send friend request to yourself");
        }
        
        // Check if already friends
        if (friendshipRepository.areFriends(sender, receiver)) {
            throw new RuntimeException("Already friends");
        }
        
        // Check if request already exists
        if (friendRequestRepository.existsBySenderAndReceiverAndStatus(
                sender, receiver, FriendRequest.RequestStatus.PENDING)) {
            throw new RuntimeException("Friend request already sent");
        }
        
        if (friendRequestRepository.existsBySenderAndReceiverAndStatus(
                receiver, sender, FriendRequest.RequestStatus.PENDING)) {
            throw new RuntimeException("Friend request already received from this user");
        }
        
        FriendRequest request = new FriendRequest(sender, receiver, FriendRequest.RequestStatus.PENDING);
        FriendRequest savedRequest = friendRequestRepository.save(request);
        
        // Create notification for receiver
        notificationService.createNotification(
            receiver,
            Notification.NotificationType.FRIEND_REQUEST,
            "New Friend Request",
            sender.getName() + " sent you a friend request",
            savedRequest.getId(),
            "FRIEND_REQUEST"
        );
        
        return mapToFriendRequestResponse(savedRequest, sender);
    }
    
    @Transactional
    public FriendRequestResponse acceptFriendRequest(String receiverEmail, Long requestId) {
        User receiver = userRepository.findByEmail(receiverEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));
        
        if (!request.getReceiver().getId().equals(receiver.getId())) {
            throw new RuntimeException("Not authorized to accept this request");
        }
        
        if (request.getStatus() != FriendRequest.RequestStatus.PENDING) {
            throw new RuntimeException("Request already processed");
        }
        
        // Update request status
        request.setStatus(FriendRequest.RequestStatus.ACCEPTED);
        friendRequestRepository.save(request);
        
        // Create bidirectional friendship
        Friendship friendship1 = new Friendship(request.getSender(), request.getReceiver());
        Friendship friendship2 = new Friendship(request.getReceiver(), request.getSender());
        friendshipRepository.save(friendship1);
        friendshipRepository.save(friendship2);
        
        // Create notification for sender
        notificationService.createNotification(
            request.getSender(),
            Notification.NotificationType.FRIEND_REQUEST_ACCEPTED,
            "Friend Request Accepted",
            receiver.getName() + " accepted your friend request",
            request.getSender().getId(),
            "USER"
        );
        
        return mapToFriendRequestResponse(request, receiver);
    }
    
    @Transactional
    public void rejectFriendRequest(String receiverEmail, Long requestId) {
        User receiver = userRepository.findByEmail(receiverEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));
        
        if (!request.getReceiver().getId().equals(receiver.getId())) {
            throw new RuntimeException("Not authorized to reject this request");
        }
        
        if (request.getStatus() != FriendRequest.RequestStatus.PENDING) {
            throw new RuntimeException("Request already processed");
        }
        
        request.setStatus(FriendRequest.RequestStatus.REJECTED);
        friendRequestRepository.save(request);
    }
    
    @Transactional
    public void cancelFriendRequest(String senderEmail, Long requestId) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));
        
        if (!request.getSender().getId().equals(sender.getId())) {
            throw new RuntimeException("Not authorized to cancel this request");
        }
        
        if (request.getStatus() != FriendRequest.RequestStatus.PENDING) {
            throw new RuntimeException("Cannot cancel processed request");
        }
        
        friendRequestRepository.delete(request);
    }
    
    public List<FriendRequestResponse> getPendingRequests(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<FriendRequest> requests = friendRequestRepository.findByReceiverAndStatus(
                user, FriendRequest.RequestStatus.PENDING);
        
        return requests.stream()
                .map(request -> mapToFriendRequestResponse(request, user))
                .collect(Collectors.toList());
    }
    
    public List<FriendRequestResponse> getSentRequests(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<FriendRequest> requests = friendRequestRepository.findBySenderAndStatus(
                user, FriendRequest.RequestStatus.PENDING);
        
        return requests.stream()
                .map(request -> mapToFriendRequestResponse(request, user))
                .collect(Collectors.toList());
    }
    
    public List<UserSearchResponse> getFriends(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Friendship> friendships = friendshipRepository.findByUser(user);
        
        return friendships.stream()
                .map(friendship -> mapToUserSearchResponse(friendship.getFriend(), user))
                .collect(Collectors.toList());
    }
    
    private UserSearchResponse mapToUserSearchResponse(User user, User currentUser) {
        String friendshipStatus = getFriendshipStatus(user, currentUser);
        
        return new UserSearchResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getProfilePicture(),
                user.getAbout(),
                user.getIsOnline(),
                friendshipStatus
        );
    }
    
    private String getFriendshipStatus(User user, User currentUser) {
        // Check if friends
        if (friendshipRepository.areFriends(currentUser, user)) {
            return "FRIENDS";
        }
        
        // Check if current user sent request
        if (friendRequestRepository.existsBySenderAndReceiverAndStatus(
                currentUser, user, FriendRequest.RequestStatus.PENDING)) {
            return "PENDING_SENT";
        }
        
        // Check if current user received request
        if (friendRequestRepository.existsBySenderAndReceiverAndStatus(
                user, currentUser, FriendRequest.RequestStatus.PENDING)) {
            return "PENDING_RECEIVED";
        }
        
        return "NONE";
    }
    
    private FriendRequestResponse mapToFriendRequestResponse(FriendRequest request, User currentUser) {
        return new FriendRequestResponse(
                request.getId(),
                mapToUserSearchResponse(request.getSender(), currentUser),
                mapToUserSearchResponse(request.getReceiver(), currentUser),
                request.getStatus().toString(),
                request.getCreatedAt()
        );
    }
}
