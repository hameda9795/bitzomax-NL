package com.bitzomax.controller;

import com.bitzomax.model.User;
import com.bitzomax.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import com.bitzomax.security.TestSecurityConfig;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminController.class)
@Import(TestSecurityConfig.class)
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        testUser = new User("testuser", "test@example.com", "encodedPassword");
        testUser.setId(1L);
        testUser.setRole(User.Role.USER);
        testUser.setPremium(false);
        testUser.setCreatedAt(LocalDateTime.now());

        adminUser = new User("admin", "admin@example.com", "encodedPassword");
        adminUser.setId(2L);
        adminUser.setRole(User.Role.ADMIN);
        adminUser.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllUsers_ShouldReturnUserPage() throws Exception {
        // Given
        Page<User> userPage = new PageImpl<>(Arrays.asList(testUser, adminUser));
        when(userRepository.findAll(any(PageRequest.class))).thenReturn(userPage);

        // When & Then
        mockMvc.perform(get("/api/admin/users")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(2));

        verify(userRepository).findAll(any(PageRequest.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createUser_ShouldReturnCreatedUser() throws Exception {
        // Given
        AdminController.CreateUserRequest createRequest = new AdminController.CreateUserRequest();
        createRequest.setUsername("newuser");
        createRequest.setEmail("newuser@example.com");
        createRequest.setPassword("password123");
        createRequest.setRole(User.Role.USER);
        createRequest.setPremium(false);

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);        // When & Then
        mockMvc.perform(post("/api/admin/users")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@example.com"));

        verify(userRepository).existsByUsername("newuser");
        verify(userRepository).existsByEmail("newuser@example.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createUser_WithExistingUsername_ShouldReturnBadRequest() throws Exception {
        // Given
        AdminController.CreateUserRequest createRequest = new AdminController.CreateUserRequest();
        createRequest.setUsername("existinguser");
        createRequest.setEmail("new@example.com");
        createRequest.setPassword("password123");

        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        // When & Then
        mockMvc.perform(post("/api/admin/users")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Error: Username is already taken!"));

        verify(userRepository).existsByUsername("existinguser");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateUserSubscription_ShouldUpdateUserPremiumStatus() throws Exception {
        // Given
        AdminController.UpdateSubscriptionRequest updateRequest = new AdminController.UpdateSubscriptionRequest();
        updateRequest.setPremium(true);
        updateRequest.setMonths(3);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When & Then
        mockMvc.perform(put("/api/admin/users/1/subscription")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk());

        verify(userRepository).findById(1L);
        verify(userRepository).save(any(User.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteUser_ShouldDeleteExistingUser() throws Exception {
        // Given
        when(userRepository.existsById(1L)).thenReturn(true);        // When & Then
        mockMvc.perform(delete("/api/admin/users/1")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().string("User deleted successfully"));

        verify(userRepository).existsById(1L);
        verify(userRepository).deleteById(1L);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteUser_WithNonExistentUser_ShouldReturnNotFound() throws Exception {
        // Given
        when(userRepository.existsById(999L)).thenReturn(false);

        // When & Then
        mockMvc.perform(delete("/api/admin/users/999")
                .with(csrf()))
                .andExpect(status().isNotFound());

        verify(userRepository).existsById(999L);
        verify(userRepository, never()).deleteById(999L);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getUserStats_ShouldReturnUserStatistics() throws Exception {
        // Given
        when(userRepository.count()).thenReturn(100L);
        when(userRepository.countByIsPremiumTrue()).thenReturn(25L);
        when(userRepository.countByRole(User.Role.ADMIN)).thenReturn(5L);

        // When & Then
        mockMvc.perform(get("/api/admin/users/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(100))
                .andExpect(jsonPath("$.premiumUsers").value(25))
                .andExpect(jsonPath("$.adminUsers").value(5));

        verify(userRepository).count();
        verify(userRepository).countByIsPremiumTrue();
        verify(userRepository).countByRole(User.Role.ADMIN);
    }

    @Test
    @WithMockUser(roles = "USER")
    void createUser_WithoutAdminRole_ShouldReturnForbidden() throws Exception {
        // Given
        AdminController.CreateUserRequest createRequest = new AdminController.CreateUserRequest();
        createRequest.setUsername("newuser");
        createRequest.setEmail("newuser@example.com");

        // When & Then
        mockMvc.perform(post("/api/admin/users")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isForbidden());

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createAdmin_ShouldCreateAdminUser() throws Exception {
        // Given
        when(userRepository.findByUsername("admin")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("admin123")).thenReturn("encodedAdminPassword");
        when(userRepository.save(any(User.class))).thenReturn(adminUser);

        // When & Then
        mockMvc.perform(post("/api/admin/create-admin")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().string("Admin user created successfully! Username: admin, Password: admin123"));

        verify(userRepository).findByUsername("admin");
        verify(userRepository).save(any(User.class));
    }
}
