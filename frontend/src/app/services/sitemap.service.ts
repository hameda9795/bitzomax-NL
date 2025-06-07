import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { VideoService } from './video.service';

@Injectable({
  providedIn: 'root'
})
export class SitemapService {

  constructor(private videoService: VideoService) {}

  generateSitemap(): Observable<string> {
    return this.videoService.getVideos(0, 1000).pipe(
      map(videos => {
        const sitemap = this.buildSitemapXml(videos);
        return sitemap;
      })
    );
  }

  private buildSitemapXml(videos: any[]): string {
    const baseUrl = 'https://bitzomax.nl';
    const now = new Date().toISOString();
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Static pages -->
  <url>
    <loc>${baseUrl}/home</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/login</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/register</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/legal/privacy</loc>
    <lastmod>${now}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/legal/terms</loc>
    <lastmod>${now}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/legal/contact</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
`;

    // Add video pages
    videos.forEach(video => {
      const videoUrl = `${baseUrl}/video/${video.id}`;
      const videoDescription = this.escapeXml(video.seoDescription || video.description || video.title);
      const videoTitle = this.escapeXml(video.seoTitle || video.title);
      const thumbnailUrl = video.coverImageUrl ? `${baseUrl}/uploads/${video.coverImageUrl}` : '';
      const uploadDate = video.createdAt ? new Date(video.createdAt).toISOString() : now;
      const duration = video.duration || 0;
      
      sitemap += `
  <!-- Video: ${videoTitle} -->
  <url>
    <loc>${videoUrl}</loc>
    <lastmod>${uploadDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <video:video>
      <video:thumbnail_loc>${thumbnailUrl}</video:thumbnail_loc>
      <video:title>${videoTitle}</video:title>
      <video:description>${videoDescription}</video:description>
      <video:content_loc>${baseUrl}/uploads/${video.videoUrl}</video:content_loc>
      <video:duration>${duration}</video:duration>
      <video:publication_date>${uploadDate}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
      <video:requires_subscription>${video.contentType === 'PREMIUM' ? 'yes' : 'no'}</video:requires_subscription>
      <video:view_count>${video.viewCount || 0}</video:view_count>
      ${video.hashtags ? `<video:tag>${this.escapeXml(video.hashtags.split(',').map(tag => tag.trim()).join(', '))}</video:tag>` : ''}
      <video:category>Nederlandse Content</video:category>
      <video:uploader info="${baseUrl}">Bitzomax</video:uploader>
    </video:video>
  </url>`;
    });

    sitemap += `
</urlset>`;

    return sitemap;
  }

  private escapeXml(text: string): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // Method to generate robots.txt dynamically
  generateRobotsTxt(): string {
    const baseUrl = 'https://bitzomax.nl';
    
    return `# Robots.txt voor Bitzomax - Nederlandse Video Streaming Platform

User-agent: *
Allow: /
Allow: /home
Allow: /video/*
Allow: /legal/*

# Disallow admin and private areas
Disallow: /admin/*
Disallow: /api/*
Disallow: /uploads/videos/*
Disallow: /profile/*

# Allow search engines to index cover images but not videos
Allow: /uploads/covers/*
Disallow: /uploads/videos/*

# Crawl delay to be respectful to server resources
Crawl-delay: 1

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Specific rules for major search engines
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 2

User-agent: YandexBot
Allow: /
Crawl-delay: 2

# Block AI training scrapers if desired
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /
`;
  }

  // Method to update sitemap file (would need backend endpoint)
  updateSitemapFile(): Observable<any> {
    return this.generateSitemap().pipe(
      map(sitemapContent => {
        // In a real implementation, this would call a backend endpoint
        // to update the sitemap.xml file
        console.log('Generated sitemap:', sitemapContent);
        return { success: true, content: sitemapContent };
      })
    );
  }
}
