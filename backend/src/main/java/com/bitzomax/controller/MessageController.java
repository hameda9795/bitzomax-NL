package com.bitzomax.controller;

import com.bitzomax.model.Message;
import com.bitzomax.model.User;
import com.bitzomax.security.UserPrincipal;
import com.bitzomax.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    // Public endpoint for contact form
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@Valid @RequestBody SendMessageRequest request, Authentication authentication) {
        try {
            Long userId = null;
            if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
                UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
                userId = userPrincipal.getId();
            }

            Message message = messageService.sendMessage(
                request.getName(),
                request.getEmail(),
                request.getReason(),
                request.getSubject(),
                request.getMessage(),
                userId
            );

            return ResponseEntity.ok(new MessageResponse(message));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error sending message: " + e.getMessage());
        }
    }

    // User endpoints - view their own messages
    @GetMapping("/my-messages")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Page<MessageResponse>> getMyMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Long userId = userPrincipal.getId();
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Message> messages = messageService.getUserMessages(userId, pageable);
        Page<MessageResponse> response = messages.map(MessageResponse::new);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> getMessageById(@PathVariable Long id, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        // Admins can view any message, users can only view their own
        if (userPrincipal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            Optional<Message> messageOpt = messageService.findById(id);
            if (messageOpt.isPresent()) {
                return ResponseEntity.ok(new MessageResponse(messageOpt.get()));
            }
        } else {
            // Regular user - can only view their own messages
            Optional<Message> messageOpt = messageService.getMessageById(id, userPrincipal.getId());
            if (messageOpt.isPresent()) {
                return ResponseEntity.ok(new MessageResponse(messageOpt.get()));
            }
        }
        
        return ResponseEntity.notFound().build();
    }

    // Admin endpoints
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<MessageResponse>> getAllMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<Message> messages = messageService.getAllMessages(pageable);
        Page<MessageResponse> response = messages.map(MessageResponse::new);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<MessageResponse>> getMessagesByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            Message.Status messageStatus = Message.Status.valueOf(status.toUpperCase());
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            
            Page<Message> messages = messageService.getMessagesByStatus(messageStatus, pageable);
            Page<MessageResponse> response = messages.map(MessageResponse::new);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/admin/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<MessageResponse>> searchMessages(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Message> messages = messageService.searchMessages(keyword, pageable);
        Page<MessageResponse> response = messages.map(MessageResponse::new);
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/admin/{id}/read")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> markAsRead(@PathVariable Long id, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Long adminId = userPrincipal.getId();
        
        Message message = messageService.markAsRead(id, adminId);
        if (message != null) {
            return ResponseEntity.ok(new MessageResponse(message));
        }
        
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/admin/{id}/respond")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> respondToMessage(
            @PathVariable Long id, 
            @Valid @RequestBody RespondToMessageRequest request,
            Authentication authentication) {
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Long adminId = userPrincipal.getId();
        
        Message message = messageService.respondToMessage(id, request.getResponse(), adminId);
        if (message != null) {
            return ResponseEntity.ok(new MessageResponse(message));
        }
        
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/admin/{id}/close")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> closeMessage(@PathVariable Long id, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Long adminId = userPrincipal.getId();
        
        Message message = messageService.closeMessage(id, adminId);
        if (message != null) {
            return ResponseEntity.ok(new MessageResponse(message));
        }
        
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteMessage(@PathVariable Long id) {
        boolean deleted = messageService.deleteMessage(id);
        if (deleted) {
            return ResponseEntity.ok().body("Message deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageStatsResponse> getMessageStats() {
        long totalMessages = messageService.getTotalMessagesCount();
        long unreadMessages = messageService.getUnreadMessagesCount();
        long pendingMessages = messageService.getMessagesByStatusCount(Message.Status.PENDING);
        long respondedMessages = messageService.getMessagesByStatusCount(Message.Status.RESPONDED);
        long closedMessages = messageService.getMessagesByStatusCount(Message.Status.CLOSED);
        
        MessageStatsResponse stats = new MessageStatsResponse(
            totalMessages, unreadMessages, pendingMessages, respondedMessages, closedMessages
        );
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/admin/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MessageResponse>> getRecentMessages(@RequestParam(defaultValue = "5") int limit) {
        List<Message> messages = messageService.getRecentMessages(limit);
        List<MessageResponse> response = messages.stream().map(MessageResponse::new).toList();
        
        return ResponseEntity.ok(response);
    }

    // DTO Classes
    public static class SendMessageRequest {
        private String name;
        private String email;
        private String reason;
        private String subject;
        private String message;

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class RespondToMessageRequest {
        private String response;

        public String getResponse() { return response; }
        public void setResponse(String response) { this.response = response; }
    }

    public static class MessageResponse {
        private Long id;
        private String name;
        private String email;
        private String reason;
        private String subject;
        private String message;
        private String status;
        private String adminResponse;
        private String respondedBy;
        private String createdAt;
        private String readAt;
        private String respondedAt;
        private Long userId;
        private String username;

        public MessageResponse(Message message) {
            this.id = message.getId();
            this.name = message.getName();
            this.email = message.getEmail();
            this.reason = message.getReason();
            this.subject = message.getSubject();
            this.message = message.getMessage();
            this.status = message.getStatus().toString();
            this.adminResponse = message.getAdminResponse();
            this.respondedBy = message.getRespondedBy() != null ? message.getRespondedBy().getUsername() : null;
            this.createdAt = message.getCreatedAt() != null ? message.getCreatedAt().toString() : null;
            this.readAt = message.getReadAt() != null ? message.getReadAt().toString() : null;
            this.respondedAt = message.getRespondedAt() != null ? message.getRespondedAt().toString() : null;
            this.userId = message.getUser() != null ? message.getUser().getId() : null;
            this.username = message.getUser() != null ? message.getUser().getUsername() : null;
        }

        // Getters
        public Long getId() { return id; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getReason() { return reason; }
        public String getSubject() { return subject; }
        public String getMessage() { return message; }
        public String getStatus() { return status; }
        public String getAdminResponse() { return adminResponse; }
        public String getRespondedBy() { return respondedBy; }
        public String getCreatedAt() { return createdAt; }
        public String getReadAt() { return readAt; }
        public String getRespondedAt() { return respondedAt; }
        public Long getUserId() { return userId; }
        public String getUsername() { return username; }
    }

    public static class MessageStatsResponse {
        private long totalMessages;
        private long unreadMessages;
        private long pendingMessages;
        private long respondedMessages;
        private long closedMessages;

        public MessageStatsResponse(long totalMessages, long unreadMessages, long pendingMessages, 
                                  long respondedMessages, long closedMessages) {
            this.totalMessages = totalMessages;
            this.unreadMessages = unreadMessages;
            this.pendingMessages = pendingMessages;
            this.respondedMessages = respondedMessages;
            this.closedMessages = closedMessages;
        }

        // Getters
        public long getTotalMessages() { return totalMessages; }
        public long getUnreadMessages() { return unreadMessages; }
        public long getPendingMessages() { return pendingMessages; }
        public long getRespondedMessages() { return respondedMessages; }
        public long getClosedMessages() { return closedMessages; }
    }
}
