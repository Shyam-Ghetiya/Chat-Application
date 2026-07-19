package com.chatapp.repository;

import com.chatapp.entity.FriendRequest;
import com.chatapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {
    
    List<FriendRequest> findByReceiverAndStatus(User receiver, FriendRequest.RequestStatus status);
    
    List<FriendRequest> findBySenderAndStatus(User sender, FriendRequest.RequestStatus status);
    
    Optional<FriendRequest> findBySenderAndReceiverAndStatus(User sender, User receiver, FriendRequest.RequestStatus status);
    
    boolean existsBySenderAndReceiverAndStatus(User sender, User receiver, FriendRequest.RequestStatus status);
}
