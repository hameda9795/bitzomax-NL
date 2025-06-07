package com.bitzomax.repository;

import com.bitzomax.model.Video;
import com.bitzomax.model.Video.ContentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {
    // Original methods with JOIN FETCH optimization
    @Query("SELECT v FROM Video v LEFT JOIN FETCH v.uploadedBy ORDER BY v.createdAt DESC")
    Page<Video> findAllByOrderByCreatedAtDescWithUser(Pageable pageable);
    
    @Query("SELECT v FROM Video v LEFT JOIN FETCH v.uploadedBy WHERE v.contentType = :contentType ORDER BY v.createdAt DESC")
    Page<Video> findByContentTypeWithUser(@Param("contentType") ContentType contentType, Pageable pageable);
    
    // Keep original methods for backward compatibility
    Page<Video> findByContentType(ContentType contentType, Pageable pageable);
    Page<Video> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    @Query("SELECT v FROM Video v LEFT JOIN FETCH v.uploadedBy WHERE v.title LIKE %:keyword% OR v.description LIKE %:keyword% OR v.hashtags LIKE %:keyword%")
    Page<Video> findByKeywordWithUser(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT v FROM Video v WHERE v.title LIKE %:keyword% OR v.description LIKE %:keyword% OR v.hashtags LIKE %:keyword%")
    Page<Video> findByKeyword(@Param("keyword") String keyword, Pageable pageable);    @Query("SELECT v FROM Video v LEFT JOIN FETCH v.uploadedBy WHERE v.uploadedBy.id = :userId ORDER BY v.createdAt DESC")
    Page<Video> findByUploadedByUserIdWithUser(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT v FROM Video v WHERE v.uploadedBy.id = :userId ORDER BY v.createdAt DESC")
    Page<Video> findByUploadedByUserId(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT v FROM Video v LEFT JOIN FETCH v.uploadedBy JOIN v.likedByUsers u WHERE u.id = :userId ORDER BY v.createdAt DESC")
    Page<Video> findByLikedByUsersIdOrderByCreatedAtDescWithUser(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT v FROM Video v JOIN v.likedByUsers u WHERE u.id = :userId ORDER BY v.createdAt DESC")
    Page<Video> findByLikedByUsersIdOrderByCreatedAtDesc(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT v FROM Video v LEFT JOIN FETCH v.uploadedBy JOIN v.favoritedByUsers u WHERE u.id = :userId ORDER BY v.createdAt DESC")
    Page<Video> findByFavoritedByUsersIdOrderByCreatedAtDescWithUser(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT v FROM Video v JOIN v.favoritedByUsers u WHERE u.id = :userId ORDER BY v.createdAt DESC")
    Page<Video> findByFavoritedByUsersIdOrderByCreatedAtDesc(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT v FROM Video v LEFT JOIN FETCH v.uploadedBy ORDER BY v.viewCount DESC")
    List<Video> findTop10ByOrderByViewCountDescWithUser();
    
    @Query("SELECT v FROM Video v LEFT JOIN FETCH v.uploadedBy ORDER BY v.likeCount DESC")
    List<Video> findTop10ByOrderByLikeCountDescWithUser();
    
    List<Video> findTop10ByOrderByViewCountDesc();
    List<Video> findTop10ByOrderByLikeCountDesc();
}
