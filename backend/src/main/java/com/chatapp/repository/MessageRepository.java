package com.chatapp.repository;

import com.chatapp.entity.Conversation;
import com.chatapp.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    List<Message> findByConversationOrderByCreatedAtAsc(Conversation conversation);
    
    List<Message> findTop50ByConversationOrderByCreatedAtDesc(Conversation conversation);
    
    List<Message> findByConversationAndContentContainingIgnoreCase(Conversation conversation, String content);
    
    List<Message> findByConversationInAndContentContainingIgnoreCase(List<Conversation> conversations, String content);
}
