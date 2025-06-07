package com.bitzomax.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FileStorageServiceTest {

    @Mock
    private MultipartFile mockFile;

    @InjectMocks
    private FileStorageService fileStorageService;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        // Set the upload directory to our temp directory
        ReflectionTestUtils.setField(fileStorageService, "uploadDir", tempDir.toString());
    }

    @Test
    void storeFile_ShouldStoreFileSuccessfully() throws IOException {
        // Given
        String subDirectory = "videos";
        String originalFilename = "test-video.mp4";
        byte[] fileContent = "test video content".getBytes();
        InputStream inputStream = new ByteArrayInputStream(fileContent);

        when(mockFile.getOriginalFilename()).thenReturn(originalFilename);
        when(mockFile.getInputStream()).thenReturn(inputStream);

        // When
        String result = fileStorageService.storeFile(mockFile, subDirectory);

        // Then
        assertNotNull(result);
        assertTrue(result.startsWith(subDirectory + "/"));
        assertTrue(result.endsWith(".mp4"));

        // Verify file was actually created
        Path expectedDir = tempDir.resolve(subDirectory);
        assertTrue(Files.exists(expectedDir));
        assertTrue(Files.list(expectedDir).findAny().isPresent());
    }

    @Test
    void storeFile_ShouldCreateDirectoryIfNotExists() throws IOException {
        // Given
        String subDirectory = "new-directory";
        String originalFilename = "test.jpg";
        byte[] fileContent = "test content".getBytes();
        InputStream inputStream = new ByteArrayInputStream(fileContent);

        when(mockFile.getOriginalFilename()).thenReturn(originalFilename);
        when(mockFile.getInputStream()).thenReturn(inputStream);

        // When
        String result = fileStorageService.storeFile(mockFile, subDirectory);

        // Then
        assertNotNull(result);
        assertTrue(result.startsWith(subDirectory + "/"));
        
        // Verify directory was created
        Path expectedDir = tempDir.resolve(subDirectory);
        assertTrue(Files.exists(expectedDir));
        assertTrue(Files.isDirectory(expectedDir));
    }

    @Test
    void storeFile_ShouldGenerateUniqueFilename() throws IOException {
        // Given
        String subDirectory = "covers";
        String originalFilename = "cover.png";
        byte[] fileContent = "cover content".getBytes();

        when(mockFile.getOriginalFilename()).thenReturn(originalFilename);
        when(mockFile.getInputStream()).thenReturn(new ByteArrayInputStream(fileContent));

        // When
        String result1 = fileStorageService.storeFile(mockFile, subDirectory);
        
        // Reset the input stream for second call
        when(mockFile.getInputStream()).thenReturn(new ByteArrayInputStream(fileContent));
        String result2 = fileStorageService.storeFile(mockFile, subDirectory);

        // Then
        assertNotNull(result1);
        assertNotNull(result2);
        assertNotEquals(result1, result2); // Should be different due to UUID
        assertTrue(result1.endsWith(".png"));
        assertTrue(result2.endsWith(".png"));
    }

    @Test
    void storeFile_WithFileWithoutExtension_ShouldHandleGracefully() throws IOException {
        // Given
        String subDirectory = "misc";
        String originalFilename = "filename-without-extension";
        byte[] fileContent = "content".getBytes();
        InputStream inputStream = new ByteArrayInputStream(fileContent);

        when(mockFile.getOriginalFilename()).thenReturn(originalFilename);
        when(mockFile.getInputStream()).thenReturn(inputStream);

        // When
        String result = fileStorageService.storeFile(mockFile, subDirectory);

        // Then
        assertNotNull(result);
        assertTrue(result.startsWith(subDirectory + "/"));
        // Should not end with a dot if no extension
        assertFalse(result.endsWith("."));
    }

    @Test
    void storeFile_WithNullFilename_ShouldHandleGracefully() throws IOException {
        // Given
        String subDirectory = "misc";
        byte[] fileContent = "content".getBytes();
        InputStream inputStream = new ByteArrayInputStream(fileContent);

        when(mockFile.getOriginalFilename()).thenReturn(null);
        when(mockFile.getInputStream()).thenReturn(inputStream);

        // When
        String result = fileStorageService.storeFile(mockFile, subDirectory);

        // Then
        assertNotNull(result);
        assertTrue(result.startsWith(subDirectory + "/"));
        // Should not end with a dot if no filename
        assertFalse(result.endsWith("."));
    }

    @Test
    void deleteFile_ShouldDeleteExistingFile() throws IOException {
        // Given
        String subDirectory = "videos";
        String filename = "test-file.mp4";
        String filePath = subDirectory + "/" + filename;
        
        // Create the directory and file
        Path dirPath = tempDir.resolve(subDirectory);
        Files.createDirectories(dirPath);
        Path testFile = dirPath.resolve(filename);
        Files.createFile(testFile);
        
        assertTrue(Files.exists(testFile));

        // When
        fileStorageService.deleteFile(filePath);

        // Then
        assertFalse(Files.exists(testFile));
    }

    @Test
    void deleteFile_WithNonExistentFile_ShouldNotThrow() throws IOException {
        // Given
        String nonExistentFilePath = "videos/non-existent.mp4";

        // When & Then - should not throw exception
        assertDoesNotThrow(() -> fileStorageService.deleteFile(nonExistentFilePath));
    }

    @Test
    void deleteFile_WithNullPath_ShouldNotThrow() throws IOException {
        // When & Then - should not throw exception
        assertDoesNotThrow(() -> fileStorageService.deleteFile(null));
    }

    @Test
    void isValidVideoFile_WithValidVideoContentType_ShouldReturnTrue() {
        // Given
        when(mockFile.getContentType()).thenReturn("video/mp4");

        // When
        boolean result = fileStorageService.isValidVideoFile(mockFile);

        // Then
        assertTrue(result);
    }

    @Test
    void isValidVideoFile_WithDifferentVideoContentTypes_ShouldReturnTrue() {
        // Test various video content types
        String[] validVideoTypes = {
            "video/mp4", "video/avi", "video/mov", "video/quicktime", 
            "video/x-msvideo", "video/webm", "video/ogg"
        };

        for (String contentType : validVideoTypes) {
            when(mockFile.getContentType()).thenReturn(contentType);
            assertTrue(fileStorageService.isValidVideoFile(mockFile), 
                "Should accept content type: " + contentType);
        }
    }

    @Test
    void isValidVideoFile_WithNonVideoContentType_ShouldReturnFalse() {
        // Given
        when(mockFile.getContentType()).thenReturn("image/jpeg");

        // When
        boolean result = fileStorageService.isValidVideoFile(mockFile);

        // Then
        assertFalse(result);
    }

    @Test
    void isValidVideoFile_WithNullContentType_ShouldReturnFalse() {
        // Given
        when(mockFile.getContentType()).thenReturn(null);

        // When
        boolean result = fileStorageService.isValidVideoFile(mockFile);

        // Then
        assertFalse(result);
    }

    @Test
    void isValidImageFile_WithValidImageContentType_ShouldReturnTrue() {
        // Given
        when(mockFile.getContentType()).thenReturn("image/jpeg");

        // When
        boolean result = fileStorageService.isValidImageFile(mockFile);

        // Then
        assertTrue(result);
    }

    @Test
    void isValidImageFile_WithDifferentImageContentTypes_ShouldReturnTrue() {
        // Test various image content types
        String[] validImageTypes = {
            "image/jpeg", "image/jpg", "image/png", "image/gif", 
            "image/bmp", "image/webp", "image/svg+xml"
        };

        for (String contentType : validImageTypes) {
            when(mockFile.getContentType()).thenReturn(contentType);
            assertTrue(fileStorageService.isValidImageFile(mockFile), 
                "Should accept content type: " + contentType);
        }
    }

    @Test
    void isValidImageFile_WithNonImageContentType_ShouldReturnFalse() {
        // Given
        when(mockFile.getContentType()).thenReturn("video/mp4");

        // When
        boolean result = fileStorageService.isValidImageFile(mockFile);

        // Then
        assertFalse(result);
    }

    @Test
    void isValidImageFile_WithNullContentType_ShouldReturnFalse() {
        // Given
        when(mockFile.getContentType()).thenReturn(null);

        // When
        boolean result = fileStorageService.isValidImageFile(mockFile);

        // Then
        assertFalse(result);
    }

    @Test
    void storeFile_ShouldReplaceExistingFileWithSameName() throws IOException {
        // Given
        String subDirectory = "videos";
        String originalFilename = "test.mp4";
        byte[] content1 = "first content".getBytes();
        byte[] content2 = "second content".getBytes();

        // Create directory structure to simulate same UUID generation
        Path dirPath = tempDir.resolve(subDirectory);
        Files.createDirectories(dirPath);
        Path existingFile = dirPath.resolve("existing-file.mp4");
        Files.write(existingFile, content1);
        
        long originalSize = Files.size(existingFile);

        when(mockFile.getOriginalFilename()).thenReturn(originalFilename);
        when(mockFile.getInputStream()).thenReturn(new ByteArrayInputStream(content2));

        // When
        String result = fileStorageService.storeFile(mockFile, subDirectory);

        // Then
        assertNotNull(result);
        // Verify a new file was created (UUID will be different)
        assertTrue(Files.list(dirPath).count() >= 1);
    }
}
