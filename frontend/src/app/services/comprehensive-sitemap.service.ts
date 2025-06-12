import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { VideoService } from './video.service';

@Injectable({
  providedIn: 'root'
})
export class ComprehensiveSitemapService {

  constructor(
    private videoService: VideoService,
    private http: HttpClient
  ) {}

  generateComprehensiveSitemap(): Observable<string> {
    return this.videoService.getVideos(0, 1000).pipe(
      map(videos => {
        const sitemap = this.buildComprehensiveSitemapXml(videos);
        return sitemap;
      })
    );
  }

  private buildComprehensiveSitemapXml(videos: any[]): string {
    const baseUrl = 'https://bitzomax.nl';
    const now = new Date().toISOString();
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${baseUrl}/assets/images/bitzomax-og-image.jpg</image:loc>
      <image:title>Bitzomax - Nederlandse Video Streaming Platform</image:title>
      <image:caption>De #1 Nederlandse video streaming platform</image:caption>
    </image:image>
  </url>
  
  <!-- Home page -->
  <url>
    <loc>${baseUrl}/home</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <image:image>
      <image:loc>${baseUrl}/banner.png</image:loc>
      <image:title>Bitzomax Banner</image:title>
      <image:caption>Welkom bij Bitzomax - Nederlandse Video Streaming</image:caption>
    </image:image>
  </url>
  
  <!-- Static pages -->
  <url>
    <loc>${baseUrl}/register</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/login</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${now}</lastmod>
    <changefreq>quarterly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/terms</loc>
    <lastmod>${now}</lastmod>
    <changefreq>quarterly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <!-- Category pages -->
  <url>
    <loc>${baseUrl}/category/free</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/category/premium</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/category/music</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/category/documentary</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;

    // Add video pages with comprehensive video markup
    videos.forEach(video => {
      const videoUrl = `${baseUrl}/video/${video.id}`;
      const videoDescription = this.escapeXml(video.seoDescription || video.description || video.title);
      const videoTitle = this.escapeXml(video.seoTitle || video.title);
      const thumbnailUrl = video.coverImageUrl ? `${baseUrl}/uploads/covers/${video.coverImageUrl}` : '';
      const uploadDate = video.createdAt ? new Date(video.createdAt).toISOString() : now;
      const duration = video.duration || 0;
      const tags = video.hashtags ? video.hashtags.split(',').map((tag: string) => tag.trim()) : [];

      sitemap += `
  <!-- Video: ${videoTitle} -->
  <url>
    <loc>${videoUrl}</loc>
    <lastmod>${uploadDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <video:video>
      <video:thumbnail_loc>${thumbnailUrl}</video:thumbnail_loc>
      <video:title>${videoTitle}</video:title>
      <video:description>${videoDescription}</video:description>
      <video:content_loc>${baseUrl}/uploads/videos/${video.videoUrl}</video:content_loc>
      <video:duration>${duration}</video:duration>
      <video:publication_date>${uploadDate}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
      <video:requires_subscription>${video.contentType === 'PREMIUM' ? 'yes' : 'no'}</video:requires_subscription>
      <video:view_count>${video.viewCount || 0}</video:view_count>
      <video:uploader info="${baseUrl}">Bitzomax</video:uploader>
      <video:platform allow="web mobile tablet tv">all</video:platform>
      <video:price currency="EUR">${video.contentType === 'PREMIUM' ? '7.00' : '0.00'}</video:price>
      <video:category>Nederlandse Content</video:category>
      <video:rating>5.0</video:rating>
      <video:rating_count>${video.likeCount || 0}</video:rating_count>`;

      // Add tags
      tags.forEach(tag => {
        sitemap += `
      <video:tag>${this.escapeXml(tag)}</video:tag>`;
      });

      sitemap += `
    </video:video>`;

      // Add image markup for video thumbnail
      if (thumbnailUrl) {
        sitemap += `
    <image:image>
      <image:loc>${thumbnailUrl}</image:loc>
      <image:title>${videoTitle}</image:title>
      <image:caption>${videoDescription}</image:caption>
    </image:image>`;
      }

      sitemap += `
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

  generateAdvancedRobotsTxt(): string {
    const baseUrl = 'https://bitzomax.nl';
    
    return `# Robots.txt voor Bitzomax - Nederlandse Video Streaming Platform
# Optimized for Dutch SEO and video content

User-agent: *
Allow: /
Allow: /home
Allow: /video/*
Allow: /category/*
Allow: /register
Allow: /login
Allow: /contact
Allow: /privacy
Allow: /terms
Allow: /help
Allow: /about
Allow: /premium

# Disallow admin and private areas
Disallow: /admin
Disallow: /admin/*
Disallow: /profile
Disallow: /profile/*
Disallow: /api/

# Allow search engines to index cover images but not videos
Allow: /uploads/covers/*
Disallow: /uploads/videos/*
Disallow: /uploads/audios/*
Disallow: /uploads/lyrics/*

# Allow important static files for SEO
Allow: /assets/
Allow: /*.css
Allow: /*.js
Allow: /*.png
Allow: /*.jpg
Allow: /*.jpeg
Allow: /*.gif
Allow: /*.svg
Allow: /*.webp
Allow: /favicon.ico
Allow: /site.webmanifest
Allow: /apple-touch-icon.png

# Crawl delay to be respectful to server resources
Crawl-delay: 1

# Sitemap locations
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-videos.xml
Sitemap: ${baseUrl}/sitemap-images.xml

# Specific rules for major search engines optimized for Dutch content
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 2

User-agent: YandexBot
Allow: /
Crawl-delay: 2

User-agent: DuckDuckBot
Allow: /
Crawl-delay: 2

User-agent: facebookexternalhit
Allow: /
Allow: /video/*
Allow: /uploads/covers/*

User-agent: Twitterbot
Allow: /
Allow: /video/*
Allow: /uploads/covers/*

User-agent: LinkedInBot
Allow: /
Allow: /video/*

User-agent: WhatsApp
Allow: /
Allow: /video/*
Allow: /uploads/covers/*

# Block AI training scrapers to protect content
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /

User-agent: PerplexityBot
Disallow: /

# Block SEO analysis bots that might waste resources
User-agent: SemrushBot
Disallow: /

User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: BLEXBot
Disallow: /

# Allow legitimate research and archiving bots
User-agent: ia_archiver
Allow: /

User-agent: Wayback
Allow: /

# Host information
# Host: bitzomax.nl

# Additional info for Dutch market
# This robots.txt is optimized for Nederlandse video content
# Last updated: ${new Date().toISOString().split('T')[0]}
`;
  }

  updateSitemapFile(): Observable<any> {
    return this.generateComprehensiveSitemap().pipe(
      map(sitemapContent => {
        // In a real implementation, this would call a backend endpoint
        // to update the sitemap.xml file
        console.log('Generated comprehensive sitemap:', sitemapContent);
        return { success: true, content: sitemapContent };
      })
    );
  }

  generateVideoSitemap(): Observable<string> {
    return this.videoService.getVideos(0, 1000).pipe(
      map(videos => {
        return this.buildVideoOnlySitemap(videos);
      })
    );
  }

  private buildVideoOnlySitemap(videos: any[]): string {
    const baseUrl = 'https://bitzomax.nl';
    const now = new Date().toISOString();
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`;

    videos.forEach(video => {
      const videoUrl = `${baseUrl}/video/${video.id}`;
      const videoDescription = this.escapeXml(video.seoDescription || video.description || video.title);
      const videoTitle = this.escapeXml(video.seoTitle || video.title);
      const thumbnailUrl = video.coverImageUrl ? `${baseUrl}/uploads/covers/${video.coverImageUrl}` : '';
      const uploadDate = video.createdAt ? new Date(video.createdAt).toISOString() : now;
      const duration = video.duration || 0;
      const tags = video.hashtags ? video.hashtags.split(',').map((tag: string) => tag.trim()) : [];

      sitemap += `
  <url>
    <loc>${videoUrl}</loc>
    <video:video>
      <video:thumbnail_loc>${thumbnailUrl}</video:thumbnail_loc>
      <video:title>${videoTitle}</video:title>
      <video:description>${videoDescription}</video:description>
      <video:content_loc>${baseUrl}/uploads/videos/${video.videoUrl}</video:content_loc>
      <video:duration>${duration}</video:duration>
      <video:publication_date>${uploadDate}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
      <video:requires_subscription>${video.contentType === 'PREMIUM' ? 'yes' : 'no'}</video:requires_subscription>
      <video:view_count>${video.viewCount || 0}</video:view_count>
      <video:uploader info="${baseUrl}">Bitzomax</video:uploader>
      <video:platform allow="web mobile tablet tv">all</video:platform>
      <video:price currency="EUR">${video.contentType === 'PREMIUM' ? '7.00' : '0.00'}</video:price>
      <video:category>Nederlandse Content</video:category>
      <video:rating>5.0</video:rating>
      <video:rating_count>${video.likeCount || 0}</video:rating_count>`;

      tags.forEach(tag => {
        sitemap += `
      <video:tag>${this.escapeXml(tag)}</video:tag>`;
      });

      sitemap += `
    </video:video>
  </url>`;
    });

    sitemap += `
</urlset>`;

    return sitemap;
  }

  generateImageSitemap(): Observable<string> {
    return this.videoService.getVideos(0, 1000).pipe(
      map(videos => {
        return this.buildImageSitemap(videos);
      })
    );
  }

  private buildImageSitemap(videos: any[]): string {
    const baseUrl = 'https://bitzomax.nl';
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Main site images -->
  <url>
    <loc>${baseUrl}/</loc>
    <image:image>
      <image:loc>${baseUrl}/assets/images/bitzomax-og-image.jpg</image:loc>
      <image:title>Bitzomax - Nederlandse Video Streaming Platform</image:title>
      <image:caption>De #1 Nederlandse video streaming platform</image:caption>
    </image:image>
    <image:image>
      <image:loc>${baseUrl}/banner.png</image:loc>
      <image:title>Bitzomax Banner</image:title>
      <image:caption>Welkom bij Bitzomax</image:caption>
    </image:image>
  </url>`;

    videos.forEach(video => {
      if (video.coverImageUrl) {
        const videoUrl = `${baseUrl}/video/${video.id}`;
        const videoTitle = this.escapeXml(video.seoTitle || video.title);
        const videoDescription = this.escapeXml(video.seoDescription || video.description || video.title);
        const thumbnailUrl = `${baseUrl}/uploads/covers/${video.coverImageUrl}`;

        sitemap += `
  <url>
    <loc>${videoUrl}</loc>
    <image:image>
      <image:loc>${thumbnailUrl}</image:loc>
      <image:title>${videoTitle}</image:title>
      <image:caption>${videoDescription}</image:caption>
    </image:image>
  </url>`;
      }
    });

    sitemap += `
</urlset>`;

    return sitemap;
  }
}
