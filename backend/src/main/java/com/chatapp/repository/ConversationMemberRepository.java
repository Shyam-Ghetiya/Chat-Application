package com.chatapp.repository;

import com.chatapp.entity.Conversation;
import com.chatapp.entity.ConversationMember;
import com.chatapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationMemberRepository extends JpaRepository<ConversationMember, Long> {
    
    List<ConversationMember> findByConversation(Conversation conversation);
    
    Optional<ConversationMember> findByConversationAndUser(Conversation conversation, User user);
    
    boolean existsByConversationAndUser(Conversation conversation, User user);
    
    @Query("SELECT cm.user FROM ConversationMember cm WHERE cm.conversation = :conversation")
    List<User> findUsersByConversation(@Param("conversation") Conversation conversation);
    
    @Query("SELECT cm.conversation FROM ConversationMember cm WHERE cm.user = :user")
    List<Conversation> findConversationsByUser(@Param("user") User user);
}
