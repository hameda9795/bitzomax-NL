import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appLazyLoadImage]',
  standalone: true
})
export class LazyLoadImageDirective implements OnInit, OnDestroy {
  @Input('appLazyLoadImage') imageSrc!: string;
  @Input() placeholderSrc: string = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxhZGVuLi4uPC90ZXh0Pjwvc3ZnPg==';
  @Input() loadingClass: string = 'loading';
  @Input() loadedClass: string = 'loaded';
  @Input() errorClass: string = 'error';

  private observer!: IntersectionObserver;
  private isLoaded = false;
  private isBrowser: boolean;

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    // Set placeholder image initially
    this.renderer.setAttribute(this.el.nativeElement, 'src', this.placeholderSrc);
    this.renderer.addClass(this.el.nativeElement, this.loadingClass);

    // Only use IntersectionObserver in browser
    if (this.isBrowser && 'IntersectionObserver' in window) {
      // Create intersection observer for lazy loading
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !this.isLoaded) {
              this.loadImage();
            }
          });
        },
        {
          rootMargin: '50px 0px', // Start loading 50px before the image comes into view
          threshold: 0.1
        }
      );

      this.observer.observe(this.el.nativeElement);
    } else {
      // Fallback for SSR or browsers without IntersectionObserver
      this.loadImage();
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private loadImage() {
    if (this.isLoaded) return;

    this.isLoaded = true;
    
    // Only use Image preloading in browser
    if (this.isBrowser) {
      // Create a new image element to preload the actual image
      const img = new Image();
      
      img.onload = () => {
        // Image loaded successfully
        this.renderer.setAttribute(this.el.nativeElement, 'src', this.imageSrc);
        this.renderer.removeClass(this.el.nativeElement, this.loadingClass);
        this.renderer.addClass(this.el.nativeElement, this.loadedClass);
        
        // Add fade-in effect
        this.renderer.setStyle(this.el.nativeElement, 'opacity', '0');
        this.renderer.setStyle(this.el.nativeElement, 'transition', 'opacity 0.3s ease-in-out');
        
        // Trigger reflow and set opacity to 1
        this.el.nativeElement.offsetHeight;
        this.renderer.setStyle(this.el.nativeElement, 'opacity', '1');
      };

      img.onerror = () => {
        // Image failed to load, keep placeholder or set error image
        this.renderer.removeClass(this.el.nativeElement, this.loadingClass);
        this.renderer.addClass(this.el.nativeElement, this.errorClass);
        console.warn('Failed to load image:', this.imageSrc);
      };

      // Start loading the actual image
      img.src = this.imageSrc;
    } else {
      // Direct loading for SSR
      this.renderer.setAttribute(this.el.nativeElement, 'src', this.imageSrc);
      this.renderer.removeClass(this.el.nativeElement, this.loadingClass);
      this.renderer.addClass(this.el.nativeElement, this.loadedClass);
    }
    
    // Disconnect observer after loading starts
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
