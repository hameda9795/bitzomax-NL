package com.bitzomax.controller;

import com.bitzomax.model.User;
import com.bitzomax.repository.UserRepository;
import com.bitzomax.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<User> getUserProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Optional<User> user = userRepository.findById(userPrincipal.getId());
        return user.map(u -> ResponseEntity.ok().body(u))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/subscribe")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> subscribeToPremium(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Optional<User> userOpt = userRepository.findById(userPrincipal.getId());
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPremium(true);
            user.setPremiumExpiryDate(LocalDateTime.now().plusMonths(1));
            userRepository.save(user);
            
            return ResponseEntity.ok().body("Premium abonnement succesvol geactiveerd!");
        }
        
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/liked-videos")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getLikedVideos(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Optional<User> user = userRepository.findById(userPrincipal.getId());
        return user.map(u -> ResponseEntity.ok().body(u.getLikedVideos()))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/favorite-videos")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getFavoriteVideos(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Optional<User> user = userRepository.findById(userPrincipal.getId());
        return user.map(u -> ResponseEntity.ok().body(u.getFavoriteVideos()))
                .orElse(ResponseEntity.notFound().build());
    }
}
