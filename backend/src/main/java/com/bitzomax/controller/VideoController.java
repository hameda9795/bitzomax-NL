package com.bitzomax.controller;

import com.bitzomax.dto.VideoRequest;
import com.bitzomax.model.Video;
import com.bitzomax.security.UserPrincipal;
import com.bitzomax.service.VideoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/videos")
public class VideoController {

    @Autowired
    private VideoService videoService;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadVideo(
            @Valid @ModelAttribute VideoRequest videoRequest,
            @RequestParam("videoFile") MultipartFile videoFile,
            @RequestParam(value = "coverImage", required = false) MultipartFile coverImage,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        try {
            Video video = videoService.uploadVideo(videoRequest, videoFile, coverImage, userPrincipal.getId());
            return ResponseEntity.ok(video);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Fout bij uploaden van bestanden: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }    @GetMapping("/public")
    public ResponseEntity<Page<Video>> getPublicVideos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        Pageable pageable = PageRequest.of(page, size);
        Long userId = userPrincipal != null ? userPrincipal.getId() : null;
        Page<Video> videos = videoService.getPublicVideos(pageable, userId);
        return ResponseEntity.ok(videos);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Page<Video>> getAllVideos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Video> videos = videoService.getAllVideos(pageable, userPrincipal.getId());
        return ResponseEntity.ok(videos);
    }@GetMapping("/{id}")
    public ResponseEntity<Video> getVideo(@PathVariable Long id,
                                        @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long userId = userPrincipal != null ? userPrincipal.getId() : null;
        return videoService.getVideoById(id, userId)
                .map(video -> ResponseEntity.ok().body(video))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Video>> searchVideos(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Video> videos = videoService.searchVideos(keyword, pageable);
        return ResponseEntity.ok(videos);
    }

    @GetMapping("/trending")
    public ResponseEntity<List<Video>> getTrendingVideos() {
        List<Video> videos = videoService.getTrendingVideos();
        return ResponseEntity.ok(videos);
    }

    @GetMapping("/popular")
    public ResponseEntity<List<Video>> getPopularVideos() {
        List<Video> videos = videoService.getPopularVideos();
        return ResponseEntity.ok(videos);
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<Video> incrementView(@PathVariable Long id) {
        Video video = videoService.incrementViewCount(id);
        if (video != null) {
            return ResponseEntity.ok(video);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/like")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Video> toggleLike(@PathVariable Long id, 
                                          @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Video video = videoService.toggleLike(id, userPrincipal.getId());
        if (video != null) {
            return ResponseEntity.ok(video);
        }
        return ResponseEntity.notFound().build();
    }    @PostMapping("/{id}/favorite")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Video> toggleFavorite(@PathVariable Long id, 
                                              @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Video video = videoService.toggleFavorite(id, userPrincipal.getId());
        if (video != null) {
            return ResponseEntity.ok(video);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/liked")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Page<Video>> getLikedVideos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Video> videos = videoService.getLikedVideosByUser(userPrincipal.getId(), pageable);
        return ResponseEntity.ok(videos);
    }

    @GetMapping("/favorites")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Page<Video>> getFavoriteVideos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Video> videos = videoService.getFavoriteVideosByUser(userPrincipal.getId(), pageable);
        return ResponseEntity.ok(videos);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteVideo(@PathVariable Long id) {
        try {
            videoService.deleteVideo(id);
            return ResponseEntity.ok().build();
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Fout bij verwijderen van video: " + e.getMessage());
        }
    }
}
