package com.bitzomax.dto;

import com.bitzomax.model.Video.ContentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class VideoRequest {
    @NotBlank(message = "Titel is verplicht")
    @Size(max = 200, message = "Titel mag maximaal 200 tekens zijn")
    private String title;

    @Size(max = 1000, message = "Beschrijving mag maximaal 1000 tekens zijn")
    private String description;

    @Size(max = 2000, message = "Gedichttekst mag maximaal 2000 tekens zijn")
    private String poemText;

    private String hashtags;
    private ContentType contentType = ContentType.FREE;
    
    // SEO fields
    private String seoTitle;
    private String seoDescription;
    private String seoKeywords;
    
    // Store links
    private String spotifyLink;
    private String amazonLink;
    private String appleMusicLink;
    private String itunesLink;
    private String youtubeMusicLink;
    private String instagramLink;

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPoemText() { return poemText; }
    public void setPoemText(String poemText) { this.poemText = poemText; }

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
}
