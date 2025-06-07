package com.bitzomax.service;

import com.bitzomax.dto.VideoRequest;
import com.bitzomax.model.User;
import com.bitzomax.model.Video;
import com.bitzomax.repository.UserRepository;
import com.bitzomax.repository.VideoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VideoServiceTest {

    @Mock
    private VideoRepository videoRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private MultipartFile videoFile;

    @Mock
    private MultipartFile coverImageFile;

    @InjectMocks
    private VideoService videoService;

    private User testUser;
    private Video testVideo;
    private VideoRequest videoRequest;

    @BeforeEach
    void setUp() {
        testUser = new User("testuser", "test@example.com", "password");
        testUser.setId(1L);

        testVideo = new Video();
        testVideo.setId(1L);
        testVideo.setTitle("Test Video");
        testVideo.setDescription("Test Description");
        testVideo.setVideoUrl("test-video.mp4");
        testVideo.setCoverImageUrl("test-cover.jpg");        testVideo.setUploadedBy(testUser);
        testVideo.setViewCount(10L);
        testVideo.setLikeCount(5L);
        testVideo.setContentType(Video.ContentType.FREE);
        testVideo.setCreatedAt(LocalDateTime.now());

        videoRequest = new VideoRequest();
        videoRequest.setTitle("Test Video");
        videoRequest.setDescription("Test Description");
        videoRequest.setContentType(Video.ContentType.FREE);
    }

    @Test
    void uploadVideo_ShouldCreateVideoSuccessfully() throws IOException {
        // Given
        when(fileStorageService.isValidVideoFile(videoFile)).thenReturn(true);
        when(fileStorageService.isValidImageFile(coverImageFile)).thenReturn(true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(fileStorageService.storeFile(videoFile, "videos")).thenReturn("stored-video.mp4");
        when(fileStorageService.storeFile(coverImageFile, "covers")).thenReturn("stored-cover.jpg");
        when(videoRepository.save(any(Video.class))).thenReturn(testVideo);

        // When
        Video result = videoService.uploadVideo(videoRequest, videoFile, coverImageFile, 1L);

        // Then
        assertNotNull(result);
        assertEquals("Test Video", result.getTitle());
        assertEquals("Test Description", result.getDescription());
        verify(fileStorageService).storeFile(videoFile, "videos");
        verify(fileStorageService).storeFile(coverImageFile, "covers");
        verify(videoRepository).save(any(Video.class));
    }

    @Test
    void uploadVideo_WithInvalidVideoFile_ShouldThrowException() {
        // Given
        when(fileStorageService.isValidVideoFile(videoFile)).thenReturn(false);

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            videoService.uploadVideo(videoRequest, videoFile, null, 1L);
        });

        verify(videoRepository, never()).save(any(Video.class));
    }

    @Test
    void uploadVideo_WithNonExistentUser_ShouldThrowException() {
        // Given
        when(fileStorageService.isValidVideoFile(videoFile)).thenReturn(true);
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            videoService.uploadVideo(videoRequest, videoFile, null, 999L);
        });

        verify(videoRepository, never()).save(any(Video.class));
    }

    @Test
    void getAllVideos_ShouldReturnPagedVideos() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Video> videoPage = new PageImpl<>(Arrays.asList(testVideo));
        when(videoRepository.findAllByOrderByCreatedAtDescWithUser(pageable)).thenReturn(videoPage);

        // When
        Page<Video> result = videoService.getAllVideos(pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("Test Video", result.getContent().get(0).getTitle());
        verify(videoRepository).findAllByOrderByCreatedAtDescWithUser(pageable);
    }

    @Test
    void getVideoById_ShouldReturnVideo() {
        // Given
        when(videoRepository.findById(1L)).thenReturn(Optional.of(testVideo));

        // When
        Optional<Video> result = videoService.getVideoById(1L);

        // Then
        assertTrue(result.isPresent());
        assertEquals("Test Video", result.get().getTitle());
        verify(videoRepository).findById(1L);
    }

    @Test
    void getVideoById_WithNonExistentId_ShouldReturnEmpty() {
        // Given
        when(videoRepository.findById(999L)).thenReturn(Optional.empty());

        // When
        Optional<Video> result = videoService.getVideoById(999L);

        // Then
        assertFalse(result.isPresent());
        verify(videoRepository).findById(999L);
    }

    @Test
    void incrementViewCount_ShouldIncreaseViewCount() {
        // Given
        when(videoRepository.findById(1L)).thenReturn(Optional.of(testVideo));
        when(videoRepository.save(any(Video.class))).thenReturn(testVideo);

        // When
        Video result = videoService.incrementViewCount(1L);

        // Then
        assertNotNull(result);
        assertEquals(11, result.getViewCount()); // Original was 10
        verify(videoRepository).findById(1L);
        verify(videoRepository).save(testVideo);
    }

    @Test
    void incrementViewCount_WithNonExistentVideo_ShouldReturnNull() {
        // Given
        when(videoRepository.findById(999L)).thenReturn(Optional.empty());

        // When
        Video result = videoService.incrementViewCount(999L);

        // Then
        assertNull(result);
        verify(videoRepository).findById(999L);
        verify(videoRepository, never()).save(any(Video.class));
    }

    @Test
    void toggleLike_ShouldAddLikeForNewUser() {
        // Given
        User user = new User("newuser", "new@example.com", "password");
        user.setId(2L);
        user.setLikedVideos(Set.of()); // Empty set

        when(videoRepository.findById(1L)).thenReturn(Optional.of(testVideo));
        when(userRepository.findById(2L)).thenReturn(Optional.of(user));
        when(videoRepository.save(any(Video.class))).thenReturn(testVideo);

        // When
        Video result = videoService.toggleLike(1L, 2L);

        // Then
        assertNotNull(result);
        verify(videoRepository).findById(1L);
        verify(userRepository).findById(2L);
        verify(videoRepository).save(testVideo);
    }

    @Test
    void searchVideos_ShouldReturnMatchingVideos() {
        // Given
        String keyword = "test";
        Pageable pageable = PageRequest.of(0, 10);
        Page<Video> videoPage = new PageImpl<>(Arrays.asList(testVideo));
        when(videoRepository.findByKeywordWithUser(keyword, pageable)).thenReturn(videoPage);

        // When
        Page<Video> result = videoService.searchVideos(keyword, pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        verify(videoRepository).findByKeywordWithUser(keyword, pageable);
    }

    @Test
    void getTrendingVideos_ShouldReturnTopViewedVideos() {
        // Given
        List<Video> trendingVideos = Arrays.asList(testVideo);
        when(videoRepository.findTop10ByOrderByViewCountDescWithUser()).thenReturn(trendingVideos);

        // When
        List<Video> result = videoService.getTrendingVideos();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Video", result.get(0).getTitle());
        verify(videoRepository).findTop10ByOrderByViewCountDescWithUser();
    }

    @Test
    void getPopularVideos_ShouldReturnTopLikedVideos() {
        // Given
        List<Video> popularVideos = Arrays.asList(testVideo);
        when(videoRepository.findTop10ByOrderByLikeCountDescWithUser()).thenReturn(popularVideos);

        // When
        List<Video> result = videoService.getPopularVideos();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Video", result.get(0).getTitle());
        verify(videoRepository).findTop10ByOrderByLikeCountDescWithUser();
    }

    @Test
    void deleteVideo_ShouldRemoveVideoAndFiles() throws IOException {
        // Given
        testVideo.setVideoUrl("video-to-delete.mp4");
        testVideo.setCoverImageUrl("cover-to-delete.jpg");
        when(videoRepository.findById(1L)).thenReturn(Optional.of(testVideo));

        // When
        videoService.deleteVideo(1L);

        // Then
        verify(videoRepository).findById(1L);
        verify(fileStorageService).deleteFile("video-to-delete.mp4");
        verify(fileStorageService).deleteFile("cover-to-delete.jpg");
        verify(videoRepository).delete(testVideo);
    }

    @Test
    void deleteVideo_WithNonExistentVideo_ShouldNotDeleteAnything() throws IOException {
        // Given
        when(videoRepository.findById(999L)).thenReturn(Optional.empty());

        // When
        videoService.deleteVideo(999L);

        // Then
        verify(videoRepository).findById(999L);
        verify(fileStorageService, never()).deleteFile(any());
        verify(videoRepository, never()).delete(any());
    }

    @Test
    void getPublicVideos_ShouldReturnFreeContentOnly() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Video> videoPage = new PageImpl<>(Arrays.asList(testVideo));
        when(videoRepository.findByContentTypeWithUser(Video.ContentType.FREE, pageable)).thenReturn(videoPage);

        // When
        Page<Video> result = videoService.getPublicVideos(pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(Video.ContentType.FREE, result.getContent().get(0).getContentType());
        verify(videoRepository).findByContentTypeWithUser(Video.ContentType.FREE, pageable);
    }
}
