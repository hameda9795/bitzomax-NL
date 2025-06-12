import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SchemaMarkupService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  addOrganizationSchema(): void {
    if (!this.isBrowser) return;

    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Bitzomax",
      "alternateName": "Bitzomax Nederlandse Video Streaming",
      "url": "https://bitzomax.nl",
      "logo": {
        "@type": "ImageObject",
        "url": "https://bitzomax.nl/assets/images/bitzomax-logo.png",
        "width": 300,
        "height": 100
      },
      "description": "De beste Nederlandse video streaming platform met gratis en premium content",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "NL",
        "addressLocality": "Nederland"
      },
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "contactType": "Customer Service",
          "url": "https://bitzomax.nl/contact",
          "availableLanguage": ["Dutch", "Nederlands"]
        }
      ],
      "sameAs": [
        "https://bitzomax.nl",
        "https://www.facebook.com/bitzomax",
        "https://www.twitter.com/bitzomax",
        "https://www.instagram.com/bitzomax"
      ],
      "foundingDate": "2024",
      "founder": {
        "@type": "Organization",
        "name": "Bitzomax Team"
      },
      "slogan": "De #1 Nederlandse Video Streaming Platform",
      "knowsAbout": [
        "Nederlandse video streaming",
        "Nederlandse films",
        "Nederlandse series",
        "Nederlandse documentaires",
        "Nederlandse muziekvideos"
      ]
    };

    this.insertStructuredData(organizationSchema, 'organization-schema');
  }

  addWebSiteSchema(): void {
    if (!this.isBrowser) return;

    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Bitzomax",
      "alternateName": "Bitzomax Nederlandse Video Streaming Platform",
      "url": "https://bitzomax.nl",
      "description": "Nederlandse Video Streaming Platform met gratis en premium content",
      "inLanguage": "nl-NL",
      "isAccessibleForFree": true,
      "audience": {
        "@type": "Audience",
        "audienceType": "Nederlandse video liefhebbers",
        "geographicArea": {
          "@type": "Country",
          "name": "Netherlands"
        }
      },
      "potentialAction": [
        {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://bitzomax.nl/search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        },
        {
          "@type": "WatchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://bitzomax.nl/video/{video_id}"
          },
          "object": {
            "@type": "VideoObject",
            "name": "Nederlandse Video Content"
          }
        }
      ]
    };

    this.insertStructuredData(websiteSchema, 'website-schema');
  }

  addBreadcrumbSchema(breadcrumbs: Array<{name: string, url: string}>): void {
    if (!this.isBrowser) return;

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": {
          "@type": "WebPage",
          "@id": crumb.url,
          "url": crumb.url,
          "name": crumb.name
        }
      }))
    };

    this.insertStructuredData(breadcrumbSchema, 'breadcrumb-schema');
  }

  addVideoSchema(video: any): void {
    if (!this.isBrowser) return;

    const videoSchema = {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": video.seoTitle || video.title,
      "description": video.seoDescription || video.description,
      "thumbnailUrl": video.coverImageUrl ? `https://bitzomax.nl/uploads/covers/${video.coverImageUrl}` : '',
      "uploadDate": video.createdAt,
      "duration": video.duration ? `PT${Math.floor(video.duration / 60)}M${video.duration % 60}S` : undefined,
      "contentUrl": video.videoUrl ? `https://bitzomax.nl/uploads/videos/${video.videoUrl}` : '',
      "embedUrl": `https://bitzomax.nl/video/${video.id}`,
      "inLanguage": "nl-NL",
      "isFamilyFriendly": true,
      "isAccessibleForFree": video.contentType === 'FREE',
      "requiresSubscription": video.contentType === 'PREMIUM',
      "keywords": video.seoKeywords || video.hashtags,
      "genre": "Nederlandse Content",
      "creator": {
        "@type": "Organization",
        "name": "Bitzomax",
        "url": "https://bitzomax.nl"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Bitzomax",
        "url": "https://bitzomax.nl",
        "logo": {
          "@type": "ImageObject",
          "url": "https://bitzomax.nl/assets/images/bitzomax-logo.png"
        }
      },
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
      "aggregateRating": video.likeCount > 0 ? {
        "@type": "AggregateRating",
        "ratingValue": "4.5",
        "ratingCount": video.likeCount,
        "bestRating": "5",
        "worstRating": "1"
      } : undefined,
      "regionsAllowed": ["NL", "BE", "SR"],
      "countryOfOrigin": {
        "@type": "Country",
        "name": "Netherlands"
      }
    };

    this.insertStructuredData(videoSchema, 'video-schema');
  }

  addCollectionPageSchema(videos: any[], category?: string): void {
    if (!this.isBrowser) return;

    const collectionSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": category ? `Nederlandse ${category} Videos` : "Nederlandse Video Collectie",
      "description": `Ontdek ${category || 'alle'} Nederlandse video content op Bitzomax`,
      "url": window.location.href,
      "inLanguage": "nl-NL",
      "isPartOf": {
        "@type": "WebSite",
        "name": "Bitzomax",
        "url": "https://bitzomax.nl"
      },
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": videos.length,
        "itemListElement": videos.slice(0, 10).map((video, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "VideoObject",
            "name": video.title,
            "description": video.description,
            "thumbnailUrl": video.coverImageUrl ? `https://bitzomax.nl/uploads/covers/${video.coverImageUrl}` : '',
            "url": `https://bitzomax.nl/video/${video.id}`,
            "duration": video.duration ? `PT${Math.floor(video.duration / 60)}M${video.duration % 60}S` : undefined,
            "uploadDate": video.createdAt,
            "isAccessibleForFree": video.contentType === 'FREE'
          }
        }))
      },
      "audience": {
        "@type": "Audience",
        "audienceType": "Nederlandse video kijkers"
      }
    };

    this.insertStructuredData(collectionSchema, 'collection-schema');
  }

  addLocalBusinessSchema(): void {
    if (!this.isBrowser) return;

    const localBusinessSchema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Bitzomax",
      "description": "Nederlandse Video Streaming Platform",
      "url": "https://bitzomax.nl",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "NL"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "url": "https://bitzomax.nl/contact",
        "availableLanguage": "Dutch"
      },
      "openingHours": "Mo-Su 00:00-23:59",
      "currenciesAccepted": "EUR",
      "paymentAccepted": "Credit Card, Bank Transfer",
      "priceRange": "Free - €7.00",
      "serviceArea": {
        "@type": "Country",
        "name": "Netherlands"
      },
      "knowsAbout": [
        "Video Streaming",
        "Nederlandse Content",
        "Entertainment",
        "Digital Media"
      ]
    };

    this.insertStructuredData(localBusinessSchema, 'local-business-schema');
  }

  addFAQSchema(faqs: Array<{question: string, answer: string}>): void {
    if (!this.isBrowser) return;

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    this.insertStructuredData(faqSchema, 'faq-schema');
  }

  addSoftwareApplicationSchema(): void {
    if (!this.isBrowser) return;

    const appSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Bitzomax",
      "operatingSystem": "Web Browser",
      "applicationCategory": "Entertainment",
      "description": "Nederlandse Video Streaming Web Application",
      "url": "https://bitzomax.nl",
      "downloadUrl": "https://bitzomax.nl",
      "softwareVersion": "1.0",
      "datePublished": "2024-01-01",
      "inLanguage": "nl-NL",
      "countriesSupported": "NL",
      "featureList": [
        "Video Streaming",
        "Nederlandse Content",
        "Free and Premium Content",
        "User Profiles",
        "Video Likes and Favorites"
      ],
      "screenshot": "https://bitzomax.nl/assets/images/app-screenshot.png",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.7",
        "ratingCount": "100",
        "bestRating": "5",
        "worstRating": "1"
      },
      "offers": [
        {
          "@type": "Offer",
          "name": "Free Tier",
          "price": "0",
          "priceCurrency": "EUR",
          "description": "Access to free Nederlandse video content"
        },
        {
          "@type": "Offer",
          "name": "Premium Subscription",
          "price": "7.00",
          "priceCurrency": "EUR",
          "billingIncrement": "P1M",
          "description": "Access to all premium Nederlandse video content"
        }
      ]
    };

    this.insertStructuredData(appSchema, 'software-app-schema');
  }

  private insertStructuredData(schema: any, dataAttribute: string): void {
    if (!this.isBrowser) return;

    // Remove existing schema with same data attribute
    const existingScript = document.querySelector(`script[type="application/ld+json"][data-${dataAttribute}]`);
    if (existingScript) {
      existingScript.remove();
    }

    // Create new script tag
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute(`data-${dataAttribute}`, 'true');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  removeStructuredData(dataAttribute: string): void {
    if (!this.isBrowser) return;

    const script = document.querySelector(`script[type="application/ld+json"][data-${dataAttribute}]`);
    if (script) {
      script.remove();
    }
  }

  // Initialize all basic schema markup for the site
  initializeBasicSchemas(): void {
    this.addOrganizationSchema();
    this.addWebSiteSchema();
    this.addLocalBusinessSchema();
    this.addSoftwareApplicationSchema();
  }
}
