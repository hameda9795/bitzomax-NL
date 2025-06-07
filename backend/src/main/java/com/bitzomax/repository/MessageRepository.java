package com.bitzomax.repository;

import com.bitzomax.model.Message;
import com.bitzomax.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    // Find messages by status
    Page<Message> findByStatusOrderByCreatedAtDesc(Message.Status status, Pageable pageable);
    
    // Find all messages ordered by creation date (for admin dashboard)
    Page<Message> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    // Find messages by user (for user profile)
    Page<Message> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    // Find messages by email (for non-logged-in users)
    Page<Message> findByEmailOrderByCreatedAtDesc(String email, Pageable pageable);
    
    // Count messages by status
    Long countByStatus(Message.Status status);
    
    // Find unread messages count
    @Query("SELECT COUNT(m) FROM Message m WHERE m.status = 'PENDING'")
    Long countUnreadMessages();
    
    // Search messages by subject or message content
    @Query("SELECT m FROM Message m WHERE " +
           "LOWER(m.subject) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.message) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "ORDER BY m.createdAt DESC")
    Page<Message> searchMessages(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    // Find recent messages (last 24 hours)
    @Query("SELECT m FROM Message m WHERE m.createdAt >= :since ORDER BY m.createdAt DESC")
    List<Message> findRecentMessages(@Param("since") java.time.LocalDateTime since);
}
