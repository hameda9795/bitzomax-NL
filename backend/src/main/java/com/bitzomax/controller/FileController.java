package com.bitzomax.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/uploads")
public class FileController {

    @Value("${bitzomax.file.upload-dir}")
    private String uploadDir;

    @GetMapping("/videos/{filename:.+}")
    public ResponseEntity<Resource> serveVideo(@PathVariable String filename) {
        return serveFile("videos", filename, MediaType.parseMediaType("video/mp4"));
    }

    @GetMapping("/covers/{filename:.+}")
    public ResponseEntity<Resource> serveCover(@PathVariable String filename) {
        return serveFile("covers", filename, MediaType.IMAGE_JPEG);
    }

    private ResponseEntity<Resource> serveFile(String directory, String filename, MediaType mediaType) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(directory).resolve(filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(mediaType)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
