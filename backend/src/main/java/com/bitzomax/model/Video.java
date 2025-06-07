package com.bitzomax.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "videos")
public class Video {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 200)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(length = 2000)
    private String poemText;

    @NotBlank
    private String videoUrl;

    private String coverImageUrl;

    @Column(name = "hashtags")
    private String hashtags;

    @Enumerated(EnumType.STRING)
    private ContentType contentType = ContentType.FREE;

    @Column(name = "seo_title")
    private String seoTitle;

    @Column(name = "seo_description")
    private String seoDescription;

    @Column(name = "seo_keywords")
    private String seoKeywords;

    @Column(name = "spotify_link")
    private String spotifyLink;

    @Column(name = "amazon_link")
    private String amazonLink;

    @Column(name = "apple_music_link")
    private String appleMusicLink;

    @Column(name = "itunes_link")
    private String itunesLink;

    @Column(name = "youtube_music_link")
    private String youtubeMusicLink;

    @Column(name = "instagram_link")
    private String instagramLink;

    @Column(name = "view_count")
    private Long viewCount = 0L;

    @Column(name = "like_count")
    private Long likeCount = 0L;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "likedVideos", "favoriteVideos"})
    private User uploadedBy;    @ManyToMany(mappedBy = "likedVideos")
    @JsonIgnore
    private Set<User> likedByUsers = new HashSet<>();    @ManyToMany(mappedBy = "favoriteVideos")
    @JsonIgnore
    private Set<User> favoritedByUsers = new HashSet<>();

    // Transient fields for user-specific data
    @Transient
    private Boolean isLiked;

    @Transient
    private Boolean isFavorited;    @PrePersist
    protected void onCreate() {
        // Only set the createdAt if it hasn't been set manually
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        // Only set the updatedAt if it hasn't been set manually
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public Video() {}

    public Video(String title, String videoUrl, User uploadedBy) {
        this.title = title;
        this.videoUrl = videoUrl;
        this.uploadedBy = uploadedBy;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPoemText() { return poemText; }
    public void setPoemText(String poemText) { this.poemText = poemText; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public String getCoverImageUrl() { return coverImageUrl; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }

    public String getHashtags() { return hashtags; }
    public void setHashtags(String hashtags) { this.hashtags = hashtags; }

    public ContentType getContentType() { return contentType; }
    public void setContentType(ContentType contentType) { this.contentType = contentType; }

    public String getSeoTitle() { return seoTitle; }
    public void setSeoTitle(String seoTitle) { this.seoTitle = seoTitle; }

    public String getSeoDescription() { return seoDescription; }
    public void setSeoDescription(String seoDescription) { this.seoDescription = seoDescription; }

    public String getSeoKeywords() { return seoKeywords; }
    public void setSeoKeywords(String seoKeywords) { this.seoKeywords = seoKeywords; }

    public String getSpotifyLink() { return spotifyLink; }
    public void setSpotifyLink(String spotifyLink) { this.spotifyLink = spotifyLink; }

    public String getAmazonLink() { return amazonLink; }
    public void setAmazonLink(String amazonLink) { this.amazonLink = amazonLink; }

    public String getAppleMusicLink() { return appleMusicLink; }
    public void setAppleMusicLink(String appleMusicLink) { this.appleMusicLink = appleMusicLink; }

    public String getItunesLink() { return itunesLink; }
    public void setItunesLink(String itunesLink) { this.itunesLink = itunesLink; }

    public String getYoutubeMusicLink() { return youtubeMusicLink; }
    public void setYoutubeMusicLink(String youtubeMusicLink) { this.youtubeMusicLink = youtubeMusicLink; }

    public String getInstagramLink() { return instagramLink; }
    public void setInstagramLink(String instagramLink) { this.instagramLink = instagramLink; }

    public Long getViewCount() { return viewCount; }
    public void setViewCount(Long viewCount) { this.viewCount = viewCount; }

    public Long getLikeCount() { return likeCount; }
    public void setLikeCount(Long likeCount) { this.likeCount = likeCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public User getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(User uploadedBy) { this.uploadedBy = uploadedBy; }

    public Set<User> getLikedByUsers() { return likedByUsers; }
    public void setLikedByUsers(Set<User> likedByUsers) { this.likedByUsers = likedByUsers; }    public Set<User> getFavoritedByUsers() { return favoritedByUsers; }
    public void setFavoritedByUsers(Set<User> favoritedByUsers) { this.favoritedByUsers = favoritedByUsers; }

    public Boolean getIsLiked() { return isLiked; }
    public void setIsLiked(Boolean isLiked) { this.isLiked = isLiked; }

    public Boolean getIsFavorited() { return isFavorited; }
    public void setIsFavorited(Boolean isFavorited) { this.isFavorited = isFavorited; }

    public enum ContentType {
        FREE, PREMIUM
    }
}
