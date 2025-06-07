package com.bitzomax.repository;

import com.bitzomax.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    private User testUser;
    private User adminUser;
    private User premiumUser;

    @BeforeEach
    void setUp() {
        testUser = new User("testuser", "test@example.com", "password123");
        testUser.setRole(User.Role.USER);
        testUser.setPremium(false);
        testUser.setCreatedAt(LocalDateTime.now());

        adminUser = new User("admin", "admin@example.com", "adminpass");
        adminUser.setRole(User.Role.ADMIN);
        adminUser.setPremium(false);
        adminUser.setCreatedAt(LocalDateTime.now());

        premiumUser = new User("premiumuser", "premium@example.com", "premiumpass");
        premiumUser.setRole(User.Role.USER);
        premiumUser.setPremium(true);
        premiumUser.setPremiumExpiryDate(LocalDateTime.now().plusMonths(1));
        premiumUser.setCreatedAt(LocalDateTime.now());

        entityManager.persistAndFlush(testUser);
        entityManager.persistAndFlush(adminUser);
        entityManager.persistAndFlush(premiumUser);
    }

    @Test
    void findByUsername_ShouldReturnUser() {
        // When
        Optional<User> found = userRepository.findByUsername("testuser");

        // Then
        assertTrue(found.isPresent());
        assertEquals("testuser", found.get().getUsername());
        assertEquals("test@example.com", found.get().getEmail());
    }

    @Test
    void findByUsername_WithNonExistentUsername_ShouldReturnEmpty() {
        // When
        Optional<User> found = userRepository.findByUsername("nonexistent");

        // Then
        assertFalse(found.isPresent());
    }

    @Test
    void findByEmail_ShouldReturnUser() {
        // When
        Optional<User> found = userRepository.findByEmail("admin@example.com");

        // Then
        assertTrue(found.isPresent());
        assertEquals("admin", found.get().getUsername());
        assertEquals("admin@example.com", found.get().getEmail());
    }

    @Test
    void findByEmail_WithNonExistentEmail_ShouldReturnEmpty() {
        // When
        Optional<User> found = userRepository.findByEmail("nonexistent@example.com");

        // Then
        assertFalse(found.isPresent());
    }

    @Test
    void existsByUsername_ShouldReturnTrue() {
        // When
        Boolean exists = userRepository.existsByUsername("testuser");

        // Then
        assertTrue(exists);
    }

    @Test
    void existsByUsername_WithNonExistentUsername_ShouldReturnFalse() {
        // When
        Boolean exists = userRepository.existsByUsername("nonexistent");

        // Then
        assertFalse(exists);
    }

    @Test
    void existsByEmail_ShouldReturnTrue() {
        // When
        Boolean exists = userRepository.existsByEmail("premium@example.com");

        // Then
        assertTrue(exists);
    }

    @Test
    void existsByEmail_WithNonExistentEmail_ShouldReturnFalse() {
        // When
        Boolean exists = userRepository.existsByEmail("nonexistent@example.com");

        // Then
        assertFalse(exists);
    }

    @Test
    void countByIsPremiumTrue_ShouldReturnCorrectCount() {
        // When
        Long count = userRepository.countByIsPremiumTrue();

        // Then
        assertEquals(1L, count); // Only premiumUser has premium = true
    }

    @Test
    void countByRole_ShouldReturnCorrectCount() {
        // When
        Long userCount = userRepository.countByRole(User.Role.USER);
        Long adminCount = userRepository.countByRole(User.Role.ADMIN);

        // Then
        assertEquals(2L, userCount); // testUser and premiumUser
        assertEquals(1L, adminCount); // only adminUser
    }

    @Test
    void save_ShouldPersistNewUser() {
        // Given
        User newUser = new User("newuser", "newuser@example.com", "newpassword");
        newUser.setRole(User.Role.USER);
        newUser.setPremium(false);

        // When
        User saved = userRepository.save(newUser);

        // Then
        assertNotNull(saved);
        assertNotNull(saved.getId());
        assertEquals("newuser", saved.getUsername());
        assertEquals("newuser@example.com", saved.getEmail());

        // Verify it's actually in the database
        Optional<User> found = userRepository.findByUsername("newuser");
        assertTrue(found.isPresent());
    }

    @Test
    void delete_ShouldRemoveUser() {
        // Given
        Long userId = testUser.getId();

        // When
        userRepository.delete(testUser);
        entityManager.flush();

        // Then
        Optional<User> found = userRepository.findById(userId);
        assertFalse(found.isPresent());
    }

    @Test
    void findAll_ShouldReturnAllUsers() {
        // When
        var users = userRepository.findAll();

        // Then
        assertEquals(3, users.size());
        assertTrue(users.stream().anyMatch(u -> u.getUsername().equals("testuser")));
        assertTrue(users.stream().anyMatch(u -> u.getUsername().equals("admin")));
        assertTrue(users.stream().anyMatch(u -> u.getUsername().equals("premiumuser")));
    }

    @Test
    void updateUser_ShouldModifyExistingUser() {
        // Given
        testUser.setPremium(true);
        testUser.setPremiumExpiryDate(LocalDateTime.now().plusMonths(6));

        // When
        User updated = userRepository.save(testUser);
        entityManager.flush();

        // Then
        assertTrue(updated.isPremium());
        assertNotNull(updated.getPremiumExpiryDate());

        // Verify from database
        Optional<User> found = userRepository.findById(testUser.getId());
        assertTrue(found.isPresent());
        assertTrue(found.get().isPremium());
    }
}
