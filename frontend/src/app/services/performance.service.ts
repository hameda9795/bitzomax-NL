import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.initializePerformanceOptimizations();
    }
  }

  private initializePerformanceOptimizations() {
    // Only run in browser
    if (!this.isBrowser) return;
    
    // Preload critical resources
    this.preloadCriticalResources();
    
    // Optimize font loading
    this.optimizeFontLoading();
    
    // Initialize Web Vitals monitoring
    this.initWebVitalsMonitoring();
  }
  private preloadCriticalResources() {
    if (!this.isBrowser) return;
    
    const criticalResources = [
      { href: '/banner.png', as: 'image' },
      { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', as: 'style' }
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.as === 'style') {
        link.onload = () => {
          link.rel = 'stylesheet';
        };
      }
      document.head.appendChild(link);
    });
  }
  private optimizeFontLoading() {
    if (!this.isBrowser) return;
    
    // Add font-display: swap to improve CLS
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Inter';
        font-display: swap;
        src: local('Inter');
      }
    `;
    document.head.appendChild(style);
  }
  private initWebVitalsMonitoring() {
    if (!this.isBrowser) return;
    
    // Monitor Core Web Vitals if web-vitals library is available
    if (typeof window !== 'undefined') {
      // Log performance metrics
      this.measurePerformance();
    }
  }

  private measurePerformance() {
    if (!this.isBrowser) return;
    
    // Measure First Contentful Paint (FCP)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          console.log('FCP:', entry.startTime);
        }
      }
    }).observe({ entryTypes: ['paint'] });

    // Measure Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Measure Cumulative Layout Shift (CLS)
    new PerformanceObserver((list) => {
      let clsValue = 0;
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      console.log('CLS:', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });

    // Measure First Input Delay (FID)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('FID:', (entry as any).processingStart - entry.startTime);
      }
    }).observe({ entryTypes: ['first-input'] });
  }
  // Image optimization helpers
  getOptimizedImageUrl(originalUrl: string, width?: number, height?: number): string {
    if (!originalUrl) return originalUrl;
    if (!this.isBrowser) return originalUrl;
    
    // Add responsive image parameters if backend supports it
    const url = new URL(originalUrl, window.location.origin);
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    url.searchParams.set('q', '80'); // Quality parameter
    url.searchParams.set('f', 'webp'); // Format parameter
    
    return url.toString();
  }
  // Lazy loading helper for videos
  enableVideoLazyLoading() {
    if (!this.isBrowser) return;
    
    const videos = document.querySelectorAll('video[data-lazy]');
    
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const video = entry.target as HTMLVideoElement;
          const src = video.dataset['src'];
          if (src) {
            video.src = src;
            video.load();
            video.removeAttribute('data-lazy');
            videoObserver.unobserve(video);
          }
        }
      });
    }, {
      rootMargin: '100px 0px'
    });

    videos.forEach(video => videoObserver.observe(video));
  }  // Defer non-critical JavaScript
  deferNonCriticalScripts() {
    if (!this.isBrowser) return;
    
    const scripts: string[] = [
      // Add URLs of non-critical scripts here
    ];

    scripts.forEach((src: string) => {
      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      document.body.appendChild(script);
    });
  }
  // Optimize images for better Core Web Vitals
  optimizeImageLoading() {
    if (!this.isBrowser) return;
    
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // Add loading="lazy" if not already present
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      
      // Add decoding="async" for better performance
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }
      
      // Ensure proper aspect ratio to prevent CLS
      if (!img.style.aspectRatio && img.width && img.height) {
        img.style.aspectRatio = `${img.width} / ${img.height}`;
      }
    });
  }
  // Resource hints for better performance
  addResourceHints() {
    if (!this.isBrowser) return;
    
    const hints = [
      { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: '//localhost:8080' },
      { rel: 'preconnect', href: 'http://localhost:8080' }
    ];

    hints.forEach(hint => {
      const link = document.createElement('link');
      link.rel = hint.rel;
      link.href = hint.href;
      document.head.appendChild(link);
    });
  }
}
