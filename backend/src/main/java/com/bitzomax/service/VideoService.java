package com.bitzomax.service;

import com.bitzomax.dto.VideoRequest;
import com.bitzomax.model.User;
import com.bitzomax.model.Video;
import com.bitzomax.model.Video.ContentType;
import com.bitzomax.repository.VideoRepository;
import com.bitzomax.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@Transactional
public class VideoService {

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    public Video uploadVideo(VideoRequest videoRequest, MultipartFile videoFile, 
                           MultipartFile coverImage, Long uploaderId) throws IOException {
        
        // Validate files
        if (!fileStorageService.isValidVideoFile(videoFile)) {
            throw new IllegalArgumentException("Ongeldig videobestand");
        }

        User uploader = userRepository.findById(uploaderId)
            .orElseThrow(() -> new RuntimeException("Gebruiker niet gevonden"));

        // Store files
        String videoPath = fileStorageService.storeFile(videoFile, "videos");
        String coverImagePath = null;
        
        if (coverImage != null && !coverImage.isEmpty()) {
            if (!fileStorageService.isValidImageFile(coverImage)) {
                throw new IllegalArgumentException("Ongeldig afbeeldingsbestand");
            }
            coverImagePath = fileStorageService.storeFile(coverImage, "covers");
        }

        // Create video entity
        Video video = new Video();
        video.setTitle(videoRequest.getTitle());
        video.setDescription(videoRequest.getDescription());
        video.setPoemText(videoRequest.getPoemText());
        video.setVideoUrl(videoPath);
        video.setCoverImageUrl(coverImagePath);
        video.setHashtags(videoRequest.getHashtags());
        video.setContentType(videoRequest.getContentType());
        video.setUploadedBy(uploader);
        
        // SEO data
        video.setSeoTitle(videoRequest.getSeoTitle());
        video.setSeoDescription(videoRequest.getSeoDescription());
        video.setSeoKeywords(videoRequest.getSeoKeywords());
        
        // Store links
        video.setSpotifyLink(videoRequest.getSpotifyLink());
        video.setAmazonLink(videoRequest.getAmazonLink());
        video.setAppleMusicLink(videoRequest.getAppleMusicLink());
        video.setItunesLink(videoRequest.getItunesLink());
        video.setYoutubeMusicLink(videoRequest.getYoutubeMusicLink());
        video.setInstagramLink(videoRequest.getInstagramLink());

        return videoRepository.save(video);
    }    public Page<Video> getAllVideos(Pageable pageable) {
        return videoRepository.findAllByOrderByCreatedAtDescWithUser(pageable);
    }

    public Page<Video> getAllVideos(Pageable pageable, Long userId) {
        Page<Video> videos = videoRepository.findAllByOrderByCreatedAtDescWithUser(pageable);
        if (userId != null) {
            populateUserSpecificDataBatch(videos.getContent(), userId);
        }
        return videos;
    }

    public Page<Video> getPublicVideos(Pageable pageable) {
        return videoRepository.findByContentTypeWithUser(ContentType.FREE, pageable);
    }

    public Page<Video> getPublicVideos(Pageable pageable, Long userId) {
        Page<Video> videos = videoRepository.findByContentTypeWithUser(ContentType.FREE, pageable);
        if (userId != null) {
            populateUserSpecificDataBatch(videos.getContent(), userId);
        }
        return videos;
    }public Optional<Video> getVideoById(Long id) {
        return videoRepository.findById(id);
    }

    public Optional<Video> getVideoById(Long id, Long userId) {
        Optional<Video> videoOpt = videoRepository.findById(id);
        if (videoOpt.isPresent()) {
            Video video = videoOpt.get();
            populateUserSpecificData(video, userId);
            return Optional.of(video);
        }
        return Optional.empty();
    }    public Page<Video> searchVideos(String keyword, Pageable pageable) {
        return videoRepository.findByKeywordWithUser(keyword, pageable);
    }

    public List<Video> getTrendingVideos() {
        return videoRepository.findTop10ByOrderByViewCountDescWithUser();
    }

    public List<Video> getPopularVideos() {
        return videoRepository.findTop10ByOrderByLikeCountDescWithUser();
    }

    public Video incrementViewCount(Long videoId) {
        Optional<Video> videoOpt = videoRepository.findById(videoId);
        if (videoOpt.isPresent()) {
            Video video = videoOpt.get();
            video.setViewCount(video.getViewCount() + 1);
            return videoRepository.save(video);
        }
        return null;
    }    public Video toggleLike(Long videoId, Long userId) {
        Optional<Video> videoOpt = videoRepository.findById(videoId);
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (videoOpt.isPresent() && userOpt.isPresent()) {
            Video video = videoOpt.get();
            User user = userOpt.get();
              // Ensure collections are initialized and mutable
            Set<Video> likedVideos = user.getLikedVideos();
            if (likedVideos == null) {
                likedVideos = new HashSet<>();
                user.setLikedVideos(likedVideos);
            } else {
                // Create a new mutable HashSet to avoid UnsupportedOperationException
                // when dealing with Hibernate collection proxies
                likedVideos = new HashSet<>(likedVideos);
                user.setLikedVideos(likedVideos);
            }
            
            if (likedVideos.contains(video)) {
                likedVideos.remove(video);
                video.setLikeCount(video.getLikeCount() - 1);
                video.setIsLiked(false);
            } else {
                likedVideos.add(video);
                video.setLikeCount(video.getLikeCount() + 1);
                video.setIsLiked(true);
            }
            
            userRepository.save(user);
            return videoRepository.save(video);
        }
        return null;
    }public Video toggleFavorite(Long videoId, Long userId) {
        Optional<Video> videoOpt = videoRepository.findById(videoId);
        Optional<User> userOpt = userRepository.findById(userId);
          if (videoOpt.isPresent() && userOpt.isPresent()) {
            Video video = videoOpt.get();
            User user = userOpt.get();
            
            // Ensure collections are initialized and mutable
            Set<Video> favoriteVideos = user.getFavoriteVideos();
            if (favoriteVideos == null) {
                favoriteVideos = new HashSet<>();
                user.setFavoriteVideos(favoriteVideos);
            } else {
                // Create a new mutable HashSet to avoid UnsupportedOperationException
                // when dealing with Hibernate collection proxies
                favoriteVideos = new HashSet<>(favoriteVideos);
                user.setFavoriteVideos(favoriteVideos);
            }
            
            if (favoriteVideos.contains(video)) {
                favoriteVideos.remove(video);
                video.setIsFavorited(false);
            } else {
                favoriteVideos.add(video);
                video.setIsFavorited(true);
            }
            
            userRepository.save(user);
            return video;
        }
        return null;
    }    public Page<Video> getLikedVideosByUser(Long userId, Pageable pageable) {
        return videoRepository.findByLikedByUsersIdOrderByCreatedAtDescWithUser(userId, pageable);
    }    public Page<Video> getFavoriteVideosByUser(Long userId, Pageable pageable) {
        return videoRepository.findByFavoritedByUsersIdOrderByCreatedAtDescWithUser(userId, pageable);
    }private void populateUserSpecificData(Video video, Long userId) {
        if (userId != null) {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                video.setIsLiked(user.getLikedVideos().contains(video));
                video.setIsFavorited(user.getFavoriteVideos().contains(video));
            }
        }
    }

    // Optimized batch method to avoid N+1 queries
    private void populateUserSpecificDataBatch(List<Video> videos, Long userId) {
        if (userId == null || videos.isEmpty()) {
            return;
        }
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Get user's liked and favorite videos in batch
            Set<Video> likedVideos = user.getLikedVideos();
            Set<Video> favoriteVideos = user.getFavoriteVideos();
            
            // Set flags for each video
            for (Video video : videos) {
                video.setIsLiked(likedVideos.contains(video));
                video.setIsFavorited(favoriteVideos.contains(video));
            }
        }
    }

    public Video updateVideo(Long videoId, VideoRequest videoRequest, MultipartFile videoFile, 
                           MultipartFile coverImage) throws IOException {
        
        Optional<Video> videoOpt = videoRepository.findById(videoId);
        if (!videoOpt.isPresent()) {
            throw new RuntimeException("Video niet gevonden");
        }
        
        Video video = videoOpt.get();
        
        // Update video file if provided
        if (videoFile != null && !videoFile.isEmpty()) {
            if (!fileStorageService.isValidVideoFile(videoFile)) {
                throw new IllegalArgumentException("Ongeldig videobestand");
            }
            
            // Delete old video file
            if (video.getVideoUrl() != null) {
                fileStorageService.deleteFile(video.getVideoUrl());
            }
            
            // Store new video file
            String videoPath = fileStorageService.storeFile(videoFile, "videos");
            video.setVideoUrl(videoPath);
        }
        
        // Update cover image if provided
        if (coverImage != null && !coverImage.isEmpty()) {
            if (!fileStorageService.isValidImageFile(coverImage)) {
                throw new IllegalArgumentException("Ongeldig afbeeldingsbestand");
            }
            
            // Delete old cover image
            if (video.getCoverImageUrl() != null) {
                fileStorageService.deleteFile(video.getCoverImageUrl());
            }
            
            // Store new cover image
            String coverImagePath = fileStorageService.storeFile(coverImage, "covers");
            video.setCoverImageUrl(coverImagePath);
        }
        
        // Update video metadata
        video.setTitle(videoRequest.getTitle());
        video.setDescription(videoRequest.getDescription());
        video.setPoemText(videoRequest.getPoemText());
        video.setHashtags(videoRequest.getHashtags());
        video.setContentType(videoRequest.getContentType());
        
        // Update SEO data
        video.setSeoTitle(videoRequest.getSeoTitle());
        video.setSeoDescription(videoRequest.getSeoDescription());
        video.setSeoKeywords(videoRequest.getSeoKeywords());
        
        // Update social media links
        video.setSpotifyLink(videoRequest.getSpotifyLink());
        video.setAmazonLink(videoRequest.getAmazonLink());
        video.setAppleMusicLink(videoRequest.getAppleMusicLink());
        video.setItunesLink(videoRequest.getItunesLink());
        video.setYoutubeMusicLink(videoRequest.getYoutubeMusicLink());
        video.setInstagramLink(videoRequest.getInstagramLink());

        return videoRepository.save(video);
    }

    public void deleteVideo(Long videoId) throws IOException {
        Optional<Video> videoOpt = videoRepository.findById(videoId);
        if (videoOpt.isPresent()) {
            Video video = videoOpt.get();
            
            // Delete files
            if (video.getVideoUrl() != null) {
                fileStorageService.deleteFile(video.getVideoUrl());
            }
            if (video.getCoverImageUrl() != null) {
                fileStorageService.deleteFile(video.getCoverImageUrl());
            }
            
            videoRepository.delete(video);
        }
    }
}
