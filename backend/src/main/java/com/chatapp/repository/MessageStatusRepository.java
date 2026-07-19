package com.chatapp.repository;

import com.chatapp.entity.Message;
import com.chatapp.entity.MessageStatus;
import com.chatapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageStatusRepository extends JpaRepository<MessageStatus, Long> {
    
    Optional<MessageStatus> findByMessageAndUser(Message message, User user);
    
    List<MessageStatus> findByMessage(Message message);
    
    @Query("SELECT ms FROM MessageStatus ms WHERE ms.message.id IN :messageIds AND ms.user.id = :userId")
    List<MessageStatus> findByMessageIdsAndUser(@Param("messageIds") List<Long> messageIds, @Param("userId") Long userId);
}
