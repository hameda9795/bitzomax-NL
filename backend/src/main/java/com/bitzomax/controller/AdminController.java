package com.bitzomax.controller;

import com.bitzomax.model.User;
import com.bitzomax.repository.UserRepository;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    // DEVELOPMENT ONLY - Remove in production!
    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin() {
        // Delete existing admin if exists
        Optional<User> existingAdmin = userRepository.findByUsername("admin");
        if (existingAdmin.isPresent()) {
            userRepository.delete(existingAdmin.get());
            System.out.println("Deleted existing admin user");
        }

        User admin = new User("admin", "admin@bitzomax.nl", encoder.encode("admin123"));
        admin.setRole(User.Role.ADMIN);
        userRepository.save(admin);

        System.out.println("Created new admin user with BCrypt encoded password: " + admin.getPassword());        return ResponseEntity.ok("Admin user created successfully! Username: admin, Password: admin123");
    }

    // DEVELOPMENT ONLY - Remove in production!
    @GetMapping("/check-admin")
    public ResponseEntity<?> checkAdmin() {
        Optional<User> adminUser = userRepository.findByUsername("admin");
        if (adminUser.isPresent()) {
            User user = adminUser.get();
            return ResponseEntity.ok("Admin user found! ID: " + user.getId() +
                    ", Username: " + user.getUsername() +
                    ", Email: " + user.getEmail() +
                    ", Role: " + user.getRole());
        } else {
            return ResponseEntity.ok("Admin user not found!");
        }
    }

    // User Management Endpoints
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<User>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<User> users = userRepository.findAll(pageable);
        return ResponseEntity.ok(users);
    }

    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest request) {
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        // Create new user
        User user = new User(request.getUsername(), request.getEmail(), encoder.encode(request.getPassword()));
        
        // Set role
        user.setRole(request.getRole() != null ? request.getRole() : User.Role.USER);
          // Set premium status if specified
        if (request.isPremium()) {
            user.setPremium(true);
            user.setPremiumExpiryDate(LocalDateTime.now().plusMonths(1));
        }

        User savedUser = userRepository.save(user);
        if (savedUser == null) {
            return ResponseEntity.status(500).body("Error: Failed to create user");
        }
        return ResponseEntity.ok(new UserResponse(savedUser));
    }

    @PutMapping("/users/{id}/subscription")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserSubscription(
            @PathVariable Long id, 
            @RequestBody UpdateSubscriptionRequest request) {
        
        Optional<User> userOpt = userRepository.findById(id);
        if (!userOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        user.setPremium(request.isPremium());
        
        if (request.isPremium() && request.getMonths() > 0) {
            user.setPremiumExpiryDate(LocalDateTime.now().plusMonths(request.getMonths()));
        } else if (!request.isPremium()) {
            user.setPremiumExpiryDate(null);
        }

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(new UserResponse(savedUser));
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        userRepository.deleteById(id);
        return ResponseEntity.ok().body("User deleted successfully");
    }

    @GetMapping("/users/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserStatsResponse> getUserStats() {
        long totalUsers = userRepository.count();
        long premiumUsers = userRepository.countByIsPremiumTrue();
        long adminUsers = userRepository.countByRole(User.Role.ADMIN);
        
        return ResponseEntity.ok(new UserStatsResponse(totalUsers, premiumUsers, adminUsers));
    }

    // DTO Classes
    public static class CreateUserRequest {
        private String username;
        private String email;
        private String password;
        private User.Role role;
        @JsonProperty("isPremium")
        private boolean isPremium;

        // Getters and setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public User.Role getRole() { return role; }
        public void setRole(User.Role role) { this.role = role; }
        public boolean isPremium() { return isPremium; }
        public void setPremium(boolean premium) { isPremium = premium; }
    }

    public static class UpdateSubscriptionRequest {
        @JsonProperty("isPremium")
        private boolean isPremium;
        private int months;

        // Getters and setters
        public boolean isPremium() { return isPremium; }
        public void setPremium(boolean premium) { isPremium = premium; }
        public int getMonths() { return months; }
        public void setMonths(int months) { this.months = months; }
    }

    public static class UserResponse {
        private Long id;
        private String username;
        private String email;
        private User.Role role;
        @JsonProperty("isPremium")
        private boolean isPremium;
        private LocalDateTime premiumExpiryDate;
        private LocalDateTime createdAt;        public UserResponse(User user) {
            if (user == null) {
                throw new IllegalArgumentException("User cannot be null");
            }
            this.id = user.getId();
            this.username = user.getUsername();
            this.email = user.getEmail();
            this.role = user.getRole();
            this.isPremium = user.isPremium();
            this.premiumExpiryDate = user.getPremiumExpiryDate();
            this.createdAt = user.getCreatedAt();
        }

        // Getters
        public Long getId() { return id; }
        public String getUsername() { return username; }
        public String getEmail() { return email; }
        public User.Role getRole() { return role; }
        public boolean isPremium() { return isPremium; }
        public LocalDateTime getPremiumExpiryDate() { return premiumExpiryDate; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }

    public static class UserStatsResponse {
        private long totalUsers;
        private long premiumUsers;
        private long adminUsers;

        public UserStatsResponse(long totalUsers, long premiumUsers, long adminUsers) {
            this.totalUsers = totalUsers;
            this.premiumUsers = premiumUsers;
            this.adminUsers = adminUsers;
        }

        // Getters
        public long getTotalUsers() { return totalUsers; }
        public long getPremiumUsers() { return premiumUsers; }
        public long getAdminUsers() { return adminUsers; }
    }
}
