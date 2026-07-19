package com.chatapp.repository;

import com.chatapp.entity.CallHistory;
import com.chatapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CallHistoryRepository extends JpaRepository<CallHistory, Long> {
    
    @Query("SELECT c FROM CallHistory c WHERE c.caller = :user OR c.callee = :user ORDER BY c.createdAt DESC")
    List<CallHistory> findByUserOrderByCreatedAtDesc(User user);
}
