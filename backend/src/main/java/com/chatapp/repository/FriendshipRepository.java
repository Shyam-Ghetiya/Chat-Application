package com.chatapp.repository;

import com.chatapp.entity.Friendship;
import com.chatapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    
    List<Friendship> findByUser(User user);
    
    @Query("SELECT f FROM Friendship f WHERE f.user = :user OR f.friend = :user")
    List<Friendship> findAllFriendships(@Param("user") User user);
    
    boolean existsByUserAndFriend(User user, User friend);
    
    @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END FROM Friendship f " +
           "WHERE (f.user = :user AND f.friend = :friend) OR (f.user = :friend AND f.friend = :user)")
    boolean areFriends(@Param("user") User user, @Param("friend") User friend);
    
    void deleteByUserAndFriend(User user, User friend);
}
