package com.bitzomax.repository;

import com.bitzomax.model.User;
import com.bitzomax.model.Video;
import com.bitzomax.model.Video.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class VideoRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private VideoRepository videoRepository;

    private User testUser;
    private Video testVideo1;
    private Video testVideo2;
    private Video testVideo3;    @BeforeEach
    void setUp() {
        // Create test user
        testUser = new User("testuser", "test@example.com", "password");
        testUser.setRole(User.Role.USER);
        testUser = entityManager.persistAndFlush(testUser);
        
        // Use fixed dates with large time differences rather than relative timestamps
        LocalDateTime baseTime = LocalDateTime.of(2023, 1, 1, 12, 0);
        
        // Video 3 - Most recent (January 3rd)
        testVideo3 = new Video();
        testVideo3.setTitle("Searchable Video");
        testVideo3.setDescription("This video contains keywords");
        testVideo3.setVideoUrl("video3.mp4");
        testVideo3.setContentType(ContentType.FREE);
        testVideo3.setUploadedBy(testUser);
        testVideo3.setViewCount(50L);
        testVideo3.setLikeCount(5L);
        testVideo3.setHashtags("#test #searchable");
        testVideo3.setCreatedAt(baseTime.plusDays(2)); // January 3rd
        testVideo3 = entityManager.persistAndFlush(testVideo3);
        
        // Video 1 - Second most recent (January 2nd)
        testVideo1 = new Video();
        testVideo1.setTitle("Test Video 1");
        testVideo1.setDescription("Description 1");
        testVideo1.setVideoUrl("video1.mp4");
        testVideo1.setContentType(ContentType.FREE);
        testVideo1.setUploadedBy(testUser);
        testVideo1.setViewCount(100L);
        testVideo1.setLikeCount(10L);
        testVideo1.setCreatedAt(baseTime.plusDays(1)); // January 2nd
        testVideo1 = entityManager.persistAndFlush(testVideo1);
        
        // Video 2 - Oldest (January 1st - base date)
        testVideo2 = new Video();
        testVideo2.setTitle("Premium Video");
        testVideo2.setDescription("Premium content");
        testVideo2.setVideoUrl("video2.mp4");
        testVideo2.setContentType(ContentType.PREMIUM);
        testVideo2.setUploadedBy(testUser);
        testVideo2.setViewCount(200L);
        testVideo2.setLikeCount(20L);
        testVideo2.setCreatedAt(baseTime); // January 1st
        testVideo2 = entityManager.persistAndFlush(testVideo2);
        
        // Print timestamps for debugging
        System.out.println("--- After setUp - CreatedAt Timestamps: ---");
        System.out.println("Searchable Video timestamp: " + testVideo3.getCreatedAt());
        System.out.println("Test Video 1 timestamp: " + testVideo1.getCreatedAt());
        System.out.println("Premium Video timestamp: " + testVideo2.getCreatedAt());
    }    @Test
    void findAllByOrderByCreatedAtDescWithUser_ShouldReturnVideosOrderedByCreatedAt() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Video> result = videoRepository.findAllByOrderByCreatedAtDescWithUser(pageable);
        
        // Then
        assertNotNull(result);
        assertEquals(3, result.getTotalElements());
        List<Video> videos = result.getContent();
        
        // Print actual video order and timestamps to help diagnose the issue
        System.out.println("--- findAllByOrderByCreatedAtDescWithUser Actual Order: ---");
        for (Video video : videos) {
            System.out.println(video.getTitle() + " - " + video.getCreatedAt());
        }
        
        // Videos should be in descending order of creation date (most recent first)
        assertEquals("Searchable Video", videos.get(0).getTitle()); // Jan 3rd
        assertEquals("Test Video 1", videos.get(1).getTitle());     // Jan 2nd
        assertEquals("Premium Video", videos.get(2).getTitle());    // Jan 1st
    }

    @Test
    void findByContentTypeWithUser_ShouldReturnOnlyFreeVideos() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Video> result = videoRepository.findByContentTypeWithUser(ContentType.FREE, pageable);

        // Then
        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        assertTrue(result.getContent().stream()
                .allMatch(video -> video.getContentType() == ContentType.FREE));
    }

    @Test
    void findByContentTypeWithUser_ShouldReturnOnlyPremiumVideos() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Video> result = videoRepository.findByContentTypeWithUser(ContentType.PREMIUM, pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Premium Video", result.getContent().get(0).getTitle());
    }

    @Test
    void findByKeywordWithUser_ShouldFindVideosByTitle() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Video> result = videoRepository.findByKeywordWithUser("Searchable", pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Searchable Video", result.getContent().get(0).getTitle());
    }

    @Test
    void findByKeywordWithUser_ShouldFindVideosByDescription() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Video> result = videoRepository.findByKeywordWithUser("keywords", pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Searchable Video", result.getContent().get(0).getTitle());
    }

    @Test
    void findByKeywordWithUser_ShouldFindVideosByHashtags() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Video> result = videoRepository.findByKeywordWithUser("searchable", pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Searchable Video", result.getContent().get(0).getTitle());
    }

    @Test
    void findByUploadedByUserIdWithUser_ShouldReturnUserVideos() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Video> result = videoRepository.findByUploadedByUserIdWithUser(testUser.getId(), pageable);

        // Then
        assertNotNull(result);
        assertEquals(3, result.getTotalElements());
        assertTrue(result.getContent().stream()
                .allMatch(video -> video.getUploadedBy().getId().equals(testUser.getId())));
    }

    @Test
    void findTop10ByOrderByViewCountDescWithUser_ShouldReturnMostViewedVideos() {
        // When
        List<Video> result = videoRepository.findTop10ByOrderByViewCountDescWithUser();

        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        assertEquals(200, result.get(0).getViewCount()); // testVideo2
        assertEquals(100, result.get(1).getViewCount()); // testVideo1
        assertEquals(50, result.get(2).getViewCount());  // testVideo3
    }

    @Test
    void findTop10ByOrderByLikeCountDescWithUser_ShouldReturnMostLikedVideos() {
        // When
        List<Video> result = videoRepository.findTop10ByOrderByLikeCountDescWithUser();

        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        assertEquals(20, result.get(0).getLikeCount()); // testVideo2
        assertEquals(10, result.get(1).getLikeCount()); // testVideo1
        assertEquals(5, result.get(2).getLikeCount());  // testVideo3
    }

    @Test
    void findByLikedByUsersIdOrderByCreatedAtDescWithUser_ShouldReturnLikedVideos() {
        // Given
        testUser.getLikedVideos().add(testVideo1);
        testUser.getLikedVideos().add(testVideo3);
        entityManager.persistAndFlush(testUser);
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Video> result = videoRepository.findByLikedByUsersIdOrderByCreatedAtDescWithUser(testUser.getId(), pageable);

        // Then
        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        assertTrue(result.getContent().stream()
                .anyMatch(video -> video.getTitle().equals("Test Video 1")));
        assertTrue(result.getContent().stream()
                .anyMatch(video -> video.getTitle().equals("Searchable Video")));
    }

    @Test
    void findByFavoritedByUsersIdOrderByCreatedAtDescWithUser_ShouldReturnFavoriteVideos() {
        // Given
        testUser.getFavoriteVideos().add(testVideo2);
        testUser.getFavoriteVideos().add(testVideo3);
        entityManager.persistAndFlush(testUser);
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Video> result = videoRepository.findByFavoritedByUsersIdOrderByCreatedAtDescWithUser(testUser.getId(), pageable);

        // Then
        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        assertTrue(result.getContent().stream()
                .anyMatch(video -> video.getTitle().equals("Premium Video")));
        assertTrue(result.getContent().stream()
                .anyMatch(video -> video.getTitle().equals("Searchable Video")));
    }

    @Test
    void findByKeywordWithUser_WithNoMatches_ShouldReturnEmptyPage() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Video> result = videoRepository.findByKeywordWithUser("nonexistent", pageable);

        // Then
        assertNotNull(result);
        assertEquals(0, result.getTotalElements());
        assertTrue(result.getContent().isEmpty());
    }    @Test
    void findAllByOrderByCreatedAtDesc_ShouldWorkWithoutUserFetch() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Video> result = videoRepository.findAllByOrderByCreatedAtDesc(pageable);

        // Then
        assertNotNull(result);
        assertEquals(3, result.getTotalElements());
        List<Video> videos = result.getContent();
        
        // Print actual video order and timestamps to help diagnose the issue
        System.out.println("--- findAllByOrderByCreatedAtDesc Actual Order: ---");
        for (Video video : videos) {
            System.out.println(video.getTitle() + " - " + video.getCreatedAt());
        }
        
        // Videos should be in descending order of creation date (most recent first)
        assertEquals("Searchable Video", videos.get(0).getTitle()); // Jan 3rd
        assertEquals("Test Video 1", videos.get(1).getTitle());     // Jan 2nd
        assertEquals("Premium Video", videos.get(2).getTitle());    // Jan 1st
    }

    @Test
    void findByContentType_ShouldWorkWithoutUserFetch() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Video> result = videoRepository.findByContentType(ContentType.FREE, pageable);

        // Then
        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        assertTrue(result.getContent().stream()
                .allMatch(video -> video.getContentType() == ContentType.FREE));
    }
}
