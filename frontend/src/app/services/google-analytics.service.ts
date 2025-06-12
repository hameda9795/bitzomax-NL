import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

declare let gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService {
  private isBrowser: boolean;
  private gtag: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    if (this.isBrowser) {
      this.initializeGoogleAnalytics();
      this.trackRouteChanges();
    }
  }

  private initializeGoogleAnalytics(): void {
    // Replace 'GA_MEASUREMENT_ID' with your actual Google Analytics 4 measurement ID
    const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
    
    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    script.onload = () => {
      (window as any).dataLayer = (window as any).dataLayer || [];
      this.gtag = function() {
        (window as any).dataLayer.push(arguments);
      };
      
      this.gtag('js', new Date());
      this.gtag('config', GA_MEASUREMENT_ID, {
        page_title: document.title,
        page_location: window.location.href,
        custom_map: {
          'custom_parameter_1': 'dutch_content',
          'custom_parameter_2': 'video_streaming'
        }
      });

      // Track initial page view
      this.trackPageView(window.location.pathname);
    };
  }

  private trackRouteChanges(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.trackPageView(event.urlAfterRedirects);
    });
  }

  trackPageView(url: string): void {
    if (!this.isBrowser || !this.gtag) return;

    this.gtag('config', 'G-XXXXXXXXXX', {
      page_path: url,
      page_title: document.title,
      page_location: window.location.href,
      content_group1: 'Nederlandse Content',
      content_group2: 'Video Streaming'
    });
  }

  trackEvent(eventName: string, parameters: any = {}): void {
    if (!this.isBrowser || !this.gtag) return;

    this.gtag('event', eventName, {
      event_category: 'Video Streaming',
      event_label: 'Nederlandse Content',
      ...parameters
    });
  }

  trackVideoPlay(videoId: number, videoTitle: string, contentType: string): void {
    this.trackEvent('video_play', {
      video_id: videoId,
      video_title: videoTitle,
      content_type: contentType,
      event_category: 'Video Engagement',
      event_label: 'Video Play'
    });
  }

  trackVideoComplete(videoId: number, videoTitle: string, watchTime: number): void {
    this.trackEvent('video_complete', {
      video_id: videoId,
      video_title: videoTitle,
      watch_time: watchTime,
      event_category: 'Video Engagement',
      event_label: 'Video Complete'
    });
  }

  trackVideoLike(videoId: number, videoTitle: string): void {
    this.trackEvent('video_like', {
      video_id: videoId,
      video_title: videoTitle,
      event_category: 'Video Engagement',
      event_label: 'Video Like'
    });
  }

  trackVideoShare(videoId: number, videoTitle: string, shareMethod: string): void {
    this.trackEvent('share', {
      method: shareMethod,
      content_type: 'video',
      item_id: videoId,
      video_title: videoTitle,
      event_category: 'Video Engagement',
      event_label: 'Video Share'
    });
  }

  trackUserRegistration(method: string = 'email'): void {
    this.trackEvent('sign_up', {
      method: method,
      event_category: 'User Engagement',
      event_label: 'User Registration'
    });
  }

  trackUserLogin(method: string = 'email'): void {
    this.trackEvent('login', {
      method: method,
      event_category: 'User Engagement',
      event_label: 'User Login'
    });
  }

  trackPremiumSubscription(): void {
    this.trackEvent('purchase', {
      transaction_id: Date.now().toString(),
      value: 7.00,
      currency: 'EUR',
      items: [{
        item_id: 'premium_subscription',
        item_name: 'Premium Subscription',
        item_category: 'Subscription',
        quantity: 1,
        price: 7.00
      }],
      event_category: 'Ecommerce',
      event_label: 'Premium Subscription'
    });
  }

  trackSearch(searchTerm: string, resultCount: number): void {
    this.trackEvent('search', {
      search_term: searchTerm,
      search_results: resultCount,
      event_category: 'Site Search',
      event_label: 'Video Search'
    });
  }

  trackError(errorMessage: string, errorType: string): void {
    this.trackEvent('exception', {
      description: errorMessage,
      fatal: false,
      error_type: errorType,
      event_category: 'Error Tracking',
      event_label: errorType
    });
  }

  trackDownload(fileName: string, fileType: string): void {
    this.trackEvent('file_download', {
      file_name: fileName,
      file_extension: fileType,
      event_category: 'File Download',
      event_label: fileName
    });
  }

  trackSocialShare(platform: string, url: string): void {
    this.trackEvent('share', {
      method: platform,
      content_type: 'webpage',
      item_id: url,
      event_category: 'Social Media',
      event_label: `Share on ${platform}`
    });
  }

  // Enhanced ecommerce tracking for premium features
  trackProductView(videoId: number, videoTitle: string, contentType: string): void {
    this.trackEvent('view_item', {
      currency: 'EUR',
      value: contentType === 'PREMIUM' ? 7.00 : 0.00,
      items: [{
        item_id: videoId.toString(),
        item_name: videoTitle,
        item_category: 'Nederlandse Video Content',
        item_category2: contentType,
        quantity: 1,
        price: contentType === 'PREMIUM' ? 7.00 : 0.00
      }],
      event_category: 'Enhanced Ecommerce',
      event_label: 'Product View'
    });
  }

  trackAddToWishlist(videoId: number, videoTitle: string): void {
    this.trackEvent('add_to_wishlist', {
      currency: 'EUR',
      value: 0.00,
      items: [{
        item_id: videoId.toString(),
        item_name: videoTitle,
        item_category: 'Nederlandse Video Content',
        quantity: 1
      }],
      event_category: 'Enhanced Ecommerce',
      event_label: 'Add to Favorites'
    });
  }

  // Custom dimensions for Dutch content
  setCustomDimensions(): void {
    if (!this.isBrowser || !this.gtag) return;

    this.gtag('config', 'G-XXXXXXXXXX', {
      custom_map: {
        'custom_parameter_1': 'content_language',
        'custom_parameter_2': 'user_type',
        'custom_parameter_3': 'subscription_status'
      }
    });
  }

  // Page timing tracking
  trackPageTiming(timingCategory: string, timingVar: string, timingValue: number): void {
    this.trackEvent('timing_complete', {
      name: timingVar,
      value: timingValue,
      event_category: timingCategory,
      event_label: 'Page Performance'
    });
  }
}

@Injectable({
  providedIn: 'root'
})
export class GoogleSearchConsoleService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Add Google Search Console verification
  addSearchConsoleVerification(): void {
    if (!this.isBrowser) return;

    // Add meta tag for Google Search Console verification
    const existingMeta = document.querySelector('meta[name="google-site-verification"]');
    if (!existingMeta) {
      const meta = document.createElement('meta');
      meta.name = 'google-site-verification';
      meta.content = 'YOUR_GOOGLE_VERIFICATION_CODE'; // Replace with actual code
      document.head.appendChild(meta);
    }
  }

  // Add structured data for rich results
  addRichResultsStructuredData(): void {
    if (!this.isBrowser) return;

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Bitzomax",
      "alternateName": "Bitzomax Nederlandse Video Streaming",
      "url": "https://bitzomax.nl",
      "description": "De beste Nederlandse video streaming platform",
      "inLanguage": "nl-NL",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://bitzomax.nl/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      },
      "sameAs": [
        "https://bitzomax.nl"
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }

  // Submit URL to Google for indexing (requires Google Search Console API)
  requestIndexing(url: string): void {
    // This would require server-side implementation with Google Search Console API
    console.log(`Requesting indexing for URL: ${url}`);
  }

  // Generate sitemap index for multiple sitemaps
  generateSitemapIndex(): string {
    const baseUrl = 'https://bitzomax.nl';
    const now = new Date().toISOString();

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-videos.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-images.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-news.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;
  }
}
