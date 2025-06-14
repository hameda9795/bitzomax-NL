import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { Video } from './video.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly dutchKeywords = [
    'Nederlandse video streaming',
    'Nederlandse films',
    'Nederlandse series',
    'Nederlandse documentaires',
    'Nederlandse muziekvideos',
    'Nederlandse content',
    'Nederlandse entertainment',
    'gratis Nederlandse videos',
    'premium Nederlandse content',
    'streaming platform Nederland',
    'online video kijken',
    'Nederlandse video platform',
    'Bitzomax Nederland',
    'Nederlandse video website',
    'streaming service Nederland',
    'Nederlandse online videos',
    'video on demand Nederland',
    'Nederlandse media streaming',
    'Dutch video streaming',
    'Dutch content platform'
  ];

  constructor(
    private meta: Meta,
    private title: Title,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  updateTitle(newTitle: string): void {
    this.title.setTitle(newTitle);
  }

  updateMetaTags(metaTags: {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
  }): void {
    if (metaTags.title) {
      this.title.setTitle(metaTags.title);
      this.meta.updateTag({ property: 'og:title', content: metaTags.title });
      this.meta.updateTag({ name: 'twitter:title', content: metaTags.title });
    }

    if (metaTags.description) {
      this.meta.updateTag({ name: 'description', content: metaTags.description });
      this.meta.updateTag({ property: 'og:description', content: metaTags.description });
      this.meta.updateTag({ name: 'twitter:description', content: metaTags.description });
    }

    if (metaTags.keywords) {
      this.meta.updateTag({ name: 'keywords', content: metaTags.keywords });
    }    if (metaTags.image) {
      this.meta.updateTag({ property: 'og:image', content: metaTags.image });
      this.meta.updateTag({ name: 'twitter:image', content: metaTags.image });
    }

    if (metaTags.url) {
      this.meta.updateTag({ property: 'og:url', content: metaTags.url });
      this.updateCanonicalUrl(metaTags.url);
    }

    if (metaTags.type) {
      this.meta.updateTag({ property: 'og:type', content: metaTags.type });
    }
  }

  private updateCanonicalUrl(url: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Find existing canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    
    if (canonicalLink) {
      // Update existing canonical link
      canonicalLink.href = url;
    } else {
      // Create new canonical link
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      canonicalLink.href = url;
      document.head.appendChild(canonicalLink);
    }
  }

  updateVideoMeta(video: Video, currentUrl?: string): void {
    const seoTitle = video.seoTitle || video.title;    const seoDescription = video.seoDescription || video.description || `Bekijk ${video.title} op Bitzomax`;
    const seoKeywords = video.seoKeywords || video.hashtags || 'nederlandse video, streaming, bitzomax';
    const imageUrl = video.coverImageUrl ? `${environment.uploadsUrl}/${video.coverImageUrl}` : '';

    this.updateMetaTags({
      title: `${seoTitle} | Bitzomax`,
      description: seoDescription,
      keywords: seoKeywords,
      image: imageUrl,
      url: currentUrl,
      type: 'video.other'
    });

    // Add video-specific structured data
    this.addVideoStructuredData(video);
  }

  addVideoStructuredData(video: Video): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"][data-video-schema]');
    if (existingScript) {
      existingScript.remove();
    }

    const videoStructuredData = {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": video.seoTitle || video.title,
      "description": video.seoDescription || video.description,
      "thumbnailUrl": video.coverImageUrl ? `${environment.uploadsUrl}/${video.coverImageUrl}` : '',
      "uploadDate": video.createdAt,
      "duration": video.duration ? `PT${Math.floor(video.duration / 60)}M${video.duration % 60}S` : undefined,
      "interactionStatistic": [
        {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/WatchAction",
          "userInteractionCount": video.viewCount
        },
        {
          "@type": "InteractionCounter", 
          "interactionType": "https://schema.org/LikeAction",
          "userInteractionCount": video.likeCount
        }
      ],      "publisher": {
        "@type": "Organization",
        "name": "Bitzomax",
        "url": "https://bitzomax.nl"
      },
      "contentUrl": video.videoUrl ? `${environment.uploadsUrl}/${video.videoUrl}` : '',
      "embedUrl": `https://bitzomax.nl/video/${video.id}`,
      "inLanguage": "nl-NL",
      "isAccessibleForFree": video.contentType === 'FREE',
      "keywords": video.seoKeywords || video.hashtags
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-video-schema', 'true');
    script.textContent = JSON.stringify(videoStructuredData);
    document.head.appendChild(script);
  }
  setDefaultMeta(): void {
    this.updateMetaTags({
      title: 'Bitzomax - Nederlandse Video Streaming Platform',
      description: 'Ontdek de beste Nederlandse video content op Bitzomax. Stream gratis en premium video\'s in hoge kwaliteit.',
      keywords: 'nederlandse video, streaming, bitzomax, gratis video, premium content, nederlandse liedjes',
      type: 'website',
      url: 'https://bitzomax.nl'
    });
  }

  setPageMeta(title: string, description: string, keywords?: string): void {
    this.updateMetaTags({
      title: `${title} | Bitzomax`,
      description: description,
      keywords: keywords || 'bitzomax, nederlandse video streaming',
      type: 'website'
    });
  }
}
