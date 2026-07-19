package com.chatapp.repository;

import com.chatapp.entity.Conversation;
import com.chatapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    
    @Query("SELECT c FROM Conversation c " +
           "JOIN c.members m " +
           "WHERE m.user = :user " +
           "ORDER BY c.updatedAt DESC")
    List<Conversation> findByUserOrderByUpdatedAtDesc(@Param("user") User user);
    
    @Query("SELECT c FROM Conversation c " +
           "JOIN c.members m1 " +
           "JOIN c.members m2 " +
           "WHERE m1.user = :user1 AND m2.user = :user2 " +
           "AND c.type = 'DIRECT' " +
           "AND SIZE(c.members) = 2")
    Optional<Conversation> findDirectConversationBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);
}
