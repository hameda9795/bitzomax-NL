package com.bitzomax.service;

import com.bitzomax.model.Message;
import com.bitzomax.model.User;
import com.bitzomax.repository.MessageRepository;
import com.bitzomax.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    // User actions
    public Message sendMessage(String name, String email, String reason, String subject, String messageContent, Long userId) {
        Message message = new Message();
        message.setName(name);
        message.setEmail(email);
        message.setReason(reason);
        message.setSubject(subject);
        message.setMessage(messageContent);
        message.setStatus(Message.Status.PENDING);
        
        // If user is logged in, associate the message with them
        if (userId != null) {
            Optional<User> userOpt = userRepository.findById(userId);
            userOpt.ifPresent(message::setUser);
        }
        
        return messageRepository.save(message);
    }    public Page<Message> getUserMessages(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return Page.empty(pageable);
        }
        return messageRepository.findByUserOrderByCreatedAtDesc(user, pageable);
    }

    public List<Message> getUserMessagesByEmail(String email) {
        Page<Message> messages = messageRepository.findByEmailOrderByCreatedAtDesc(email, PageRequest.of(0, 100));
        return messages.getContent();
    }

    public Optional<Message> getMessageById(Long messageId, Long userId) {
        Optional<Message> messageOpt = messageRepository.findById(messageId);
        if (messageOpt.isPresent()) {
            Message message = messageOpt.get();
            // User can only view their own messages
            if (message.getUser() != null && message.getUser().getId().equals(userId)) {
                return messageOpt;
            } else if (message.getUser() == null && userId == null) {
                // For anonymous messages, we could implement email verification
                return messageOpt;
            }
        }
        return Optional.empty();
    }

    // Admin actions
    public Page<Message> getAllMessages(Pageable pageable) {
        return messageRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public Page<Message> getMessagesByStatus(Message.Status status, Pageable pageable) {
        return messageRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
    }    public Page<Message> searchMessages(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllMessages(pageable);
        }
        return messageRepository.searchMessages(keyword.trim(), pageable);
    }

    public Message markAsRead(Long messageId, Long adminId) {
        Optional<Message> messageOpt = messageRepository.findById(messageId);
        if (messageOpt.isPresent()) {
            Message message = messageOpt.get();
            if (message.getStatus() == Message.Status.PENDING) {
                message.setStatus(Message.Status.READ);
                message.setReadAt(LocalDateTime.now());
                
                // Set admin who read the message
                if (adminId != null) {
                    Optional<User> adminOpt = userRepository.findById(adminId);
                    adminOpt.ifPresent(message::setRespondedBy);
                }
                
                return messageRepository.save(message);
            }
        }
        return null;
    }

    public Message respondToMessage(Long messageId, String response, Long adminId) {
        Optional<Message> messageOpt = messageRepository.findById(messageId);
        if (messageOpt.isPresent()) {
            Message message = messageOpt.get();
            message.setAdminResponse(response);
            message.setStatus(Message.Status.RESPONDED);
            message.setRespondedAt(LocalDateTime.now());
            
            // Set admin who responded
            if (adminId != null) {
                Optional<User> adminOpt = userRepository.findById(adminId);
                adminOpt.ifPresent(message::setRespondedBy);
            }
            
            return messageRepository.save(message);
        }
        return null;
    }

    public Message closeMessage(Long messageId, Long adminId) {
        Optional<Message> messageOpt = messageRepository.findById(messageId);
        if (messageOpt.isPresent()) {
            Message message = messageOpt.get();
            message.setStatus(Message.Status.CLOSED);
            
            // Set admin who closed the message if not already set
            if (message.getRespondedBy() == null && adminId != null) {
                Optional<User> adminOpt = userRepository.findById(adminId);
                adminOpt.ifPresent(message::setRespondedBy);
            }
            
            return messageRepository.save(message);
        }
        return null;
    }

    public boolean deleteMessage(Long messageId) {
        if (messageRepository.existsById(messageId)) {
            messageRepository.deleteById(messageId);
            return true;
        }
        return false;
    }

    // Statistics
    public long getTotalMessagesCount() {
        return messageRepository.count();
    }

    public long getUnreadMessagesCount() {
        return messageRepository.countUnreadMessages();
    }

    public long getMessagesByStatusCount(Message.Status status) {
        return messageRepository.countByStatus(status);
    }    public List<Message> getRecentMessages(int limit) {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        return messageRepository.findRecentMessages(since);
    }

    // Utility methods
    public Optional<Message> findById(Long messageId) {
        return messageRepository.findById(messageId);
    }    public List<Message> findByUser(User user) {
        Page<Message> page = messageRepository.findByUserOrderByCreatedAtDesc(user, PageRequest.of(0, 100));
        return page.getContent();
    }
}
