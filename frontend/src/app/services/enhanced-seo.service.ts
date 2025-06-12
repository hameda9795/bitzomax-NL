import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { Video } from './video.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnhancedSeoService {
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
    'Dutch content platform',
    'Nederlandse online streaming',
    'video platform Nederland',
    'streaming Nederland',
    'Nederlandse mediasite',
    'online Nederlandse content',
    'Nederlandse VOD service',
    'Nederlandse streamingdienst',
    'video website Nederland',
    'Nederlandse online video',
    'streaming website Nederland'
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
    author?: string;
    publishDate?: string;
    modifiedDate?: string;
    language?: string;
    category?: string;
    tags?: string[];
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
    }

    if (metaTags.image) {
      this.meta.updateTag({ property: 'og:image', content: metaTags.image });
      this.meta.updateTag({ name: 'twitter:image', content: metaTags.image });
      this.meta.updateTag({ property: 'og:image:alt', content: metaTags.title || 'Bitzomax Video' });
      this.meta.updateTag({ property: 'og:image:width', content: '1200' });
      this.meta.updateTag({ property: 'og:image:height', content: '630' });
    }

    if (metaTags.url) {
      this.meta.updateTag({ property: 'og:url', content: metaTags.url });
      this.updateCanonicalUrl(metaTags.url);
    }

    if (metaTags.type) {
      this.meta.updateTag({ property: 'og:type', content: metaTags.type });
    }

    if (metaTags.author) {
      this.meta.updateTag({ name: 'author', content: metaTags.author });
    }

    if (metaTags.publishDate) {
      this.meta.updateTag({ name: 'article:published_time', content: metaTags.publishDate });
    }

    if (metaTags.modifiedDate) {
      this.meta.updateTag({ name: 'article:modified_time', content: metaTags.modifiedDate });
    }

    if (metaTags.language) {
      this.meta.updateTag({ name: 'language', content: metaTags.language });
      this.meta.updateTag({ property: 'og:locale', content: metaTags.language });
    }

    if (metaTags.category) {
      this.meta.updateTag({ name: 'article:section', content: metaTags.category });
    }

    if (metaTags.tags && metaTags.tags.length > 0) {
      // Remove existing tags first
      const existingTags = document.querySelectorAll('meta[name="article:tag"]');
      existingTags.forEach(tag => tag.remove());
      
      metaTags.tags.forEach(tag => {
        this.meta.addTag({ name: 'article:tag', content: tag });
      });
    }

    // Add Netherlands-specific meta tags
    this.meta.updateTag({ property: 'og:locale', content: 'nl_NL' });
    this.meta.updateTag({ property: 'og:site_name', content: 'Bitzomax' });
    this.meta.updateTag({ name: 'geo.region', content: 'NL' });
    this.meta.updateTag({ name: 'geo.country', content: 'Netherlands' });
    this.meta.updateTag({ name: 'language', content: 'Dutch' });
    this.meta.updateTag({ name: 'content-language', content: 'nl' });
    this.meta.updateTag({ name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' });
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
    const seoTitle = video.seoTitle || video.title;
    const seoDescription = video.seoDescription || video.description || `Bekijk ${video.title} op Bitzomax - De beste Nederlandse video streaming platform`;
    const baseKeywords = this.dutchKeywords.slice(0, 15).join(', ');
    const videoKeywords = video.seoKeywords || video.hashtags || '';
    const combinedKeywords = `${baseKeywords}, ${videoKeywords}`.substring(0, 500);
    const imageUrl = video.coverImageUrl ? `${environment.uploadsUrl}/${video.coverImageUrl}` : '';

    this.updateMetaTags({
      title: `${seoTitle} | Bitzomax`,
      description: seoDescription,
      keywords: combinedKeywords,
      image: imageUrl,
      url: currentUrl,
      type: 'video.other',
      author: 'Bitzomax',
      publishDate: video.createdAt,
      language: 'nl-NL',
      category: 'Nederlandse Video Content',
      tags: video.hashtags ? video.hashtags.split(',').map(tag => tag.trim()) : []
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
          "userInteractionCount": video.viewCount || 0
        },
        {
          "@type": "InteractionCounter", 
          "interactionType": "https://schema.org/LikeAction",
          "userInteractionCount": video.likeCount || 0
        }
      ],
      "publisher": {
        "@type": "Organization",
        "name": "Bitzomax",
        "url": "https://bitzomax.nl",
        "logo": {
          "@type": "ImageObject",
          "url": "https://bitzomax.nl/assets/images/bitzomax-logo.png"
        }
      },
      "contentUrl": video.videoUrl ? `${environment.uploadsUrl}/${video.videoUrl}` : '',
      "embedUrl": `https://bitzomax.nl/video/${video.id}`,
      "inLanguage": "nl-NL",
      "isAccessibleForFree": video.contentType === 'FREE',
      "keywords": video.seoKeywords || video.hashtags,
      "genre": "Nederlandse Content",
      "isFamilyFriendly": true,
      "regionsAllowed": ["NL", "BE", "SR"],
      "requiresSubscription": video.contentType === 'PREMIUM'
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-video-schema', 'true');
    script.textContent = JSON.stringify(videoStructuredData);
    document.head.appendChild(script);
  }

  addOrganizationStructuredData(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Remove existing organization structured data
    const existingScript = document.querySelector('script[type="application/ld+json"][data-org-schema]');
    if (existingScript) {
      existingScript.remove();
    }

    const organizationData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Bitzomax",
      "url": "https://bitzomax.nl",
      "logo": "https://bitzomax.nl/assets/images/bitzomax-logo.png",
      "description": "De beste Nederlandse video streaming platform met gratis en premium content",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "NL"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "url": "https://bitzomax.nl/contact"
      },
      "sameAs": [
        "https://bitzomax.nl"
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-org-schema', 'true');
    script.textContent = JSON.stringify(organizationData);
    document.head.appendChild(script);
  }

  addWebsiteStructuredData(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Remove existing website structured data
    const existingScript = document.querySelector('script[type="application/ld+json"][data-website-schema]');
    if (existingScript) {
      existingScript.remove();
    }

    const websiteData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Bitzomax",
      "url": "https://bitzomax.nl",
      "description": "Nederlandse Video Streaming Platform",
      "inLanguage": "nl-NL",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://bitzomax.nl/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-website-schema', 'true');
    script.textContent = JSON.stringify(websiteData);
    document.head.appendChild(script);
  }

  setDefaultMeta(): void {
    const baseKeywords = this.dutchKeywords.slice(0, 20).join(', ');
    
    this.updateMetaTags({
      title: 'Bitzomax - Nederlandse Video Streaming Platform',
      description: 'Ontdek de beste Nederlandse video content op Bitzomax. Stream gratis en premium video\'s in hoge kwaliteit. De #1 Nederlandse streaming service.',
      keywords: baseKeywords,
      type: 'website',
      url: 'https://bitzomax.nl',
      language: 'nl-NL'
    });

    this.addOrganizationStructuredData();
    this.addWebsiteStructuredData();
  }

  setPageMeta(title: string, description: string, keywords?: string): void {
    const baseKeywords = this.dutchKeywords.slice(0, 10).join(', ');
    const combinedKeywords = keywords ? `${keywords}, ${baseKeywords}` : baseKeywords;
    
    this.updateMetaTags({
      title: `${title} | Bitzomax`,
      description: description,
      keywords: combinedKeywords,
      type: 'website',
      language: 'nl-NL'
    });
  }

  generateDutchKeywords(category?: string): string {
    let keywords = [...this.dutchKeywords];
    
    if (category) {
      const categoryKeywords = this.getCategoryKeywords(category);
      keywords = [...categoryKeywords, ...keywords];
    }
    
    return keywords.slice(0, 25).join(', ');
  }

  private getCategoryKeywords(category: string): string[] {
    const categoryMap: { [key: string]: string[] } = {
      'music': [
        'Nederlandse muziek',
        'Nederlandse liedjes',
        'Nederlandse artiesten',
        'Nederlandse muziekvideos',
        'Nederlandse pop',
        'Nederlandse rap',
        'Nederlandse folk'
      ],
      'documentary': [
        'Nederlandse documentaires',
        'Nederlandse documentaire films',
        'Nederlandse educatie',
        'Nederlandse geschiedenis',
        'Nederlandse cultuur documentaires'
      ],
      'entertainment': [
        'Nederlandse entertainment',
        'Nederlandse shows',
        'Nederlandse comedy',
        'Nederlandse humor',
        'Nederlandse cabaret'
      ],
      'news': [
        'Nederlands nieuws',
        'Nederlandse actualiteiten',
        'Nederlandse journalistiek',
        'Nederlandse media'
      ]
    };

    return categoryMap[category] || [];
  }

  addBreadcrumbStructuredData(breadcrumbs: Array<{name: string, url: string}>): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Remove existing breadcrumb structured data
    const existingScript = document.querySelector('script[type="application/ld+json"][data-breadcrumb-schema]');
    if (existingScript) {
      existingScript.remove();
    }

    const breadcrumbData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": crumb.url
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-breadcrumb-schema', 'true');
    script.textContent = JSON.stringify(breadcrumbData);
    document.head.appendChild(script);
  }

  addGoogleSearchConsoleVerification(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Add Google Search Console verification meta tag
    // Replace 'YOUR_VERIFICATION_CODE' with actual verification code from Google Search Console
    this.meta.updateTag({ name: 'google-site-verification', content: 'YOUR_VERIFICATION_CODE' });
    
    // Add Bing Webmaster verification
    this.meta.updateTag({ name: 'msvalidate.01', content: 'YOUR_BING_VERIFICATION_CODE' });
    
    // Add Yandex verification
    this.meta.updateTag({ name: 'yandex-verification', content: 'YOUR_YANDEX_VERIFICATION_CODE' });
  }
}
