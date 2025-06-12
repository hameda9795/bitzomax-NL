import { Component, OnInit, OnDestroy, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';
import { VideoService } from '../../services/video.service';
import { AuthService } from '../../services/auth.service';
import { SeoService } from '../../services/seo.service';
import { PerformanceService } from '../../services/performance.service';
import { GoogleAnalyticsService } from '../../services/google-analytics.service';
import { SchemaMarkupService } from '../../services/schema-markup.service';
import { LazyLoadImageDirective } from '../../directives/lazy-load-image.directive';
import { RegistrationPromptComponent } from '../auth/registration-prompt/registration-prompt.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    RouterModule,
    RegistrationPromptComponent,
    LazyLoadImageDirective
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  videos: any[] = [];
  loading = true;
  error = '';
  selectedCategory = 'all';
  playingVideoId: number | null = null;
  viewIncrementedVideos: Set<number> = new Set(); // Track which videos have had their view count incremented
  showRegistrationPrompt = false;
  loadingVideoId: number | null = null; // Track which video is currently loading
  private isBrowser: boolean;
  categories = [
    { value: 'all', label: 'Alle video\'s' },
    { value: 'free', label: 'Gratis' },
    { value: 'premium', label: 'Premium' }
  ];  constructor(
    private videoService: VideoService,
    public authService: AuthService,
    private seoService: SeoService,
    private performanceService: PerformanceService,
    private googleAnalytics: GoogleAnalyticsService,
    private schemaMarkupService: SchemaMarkupService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }ngOnInit(): void {
    // Set comprehensive SEO for home page
    this.seoService.setPageMeta(
      'Nederlandse Video Streaming Platform', 
      'Ontdek de beste Nederlandse video content op Bitzomax. Stream gratis en premium Nederlandse films, series, muziekvideos en documentaires in hoge kwaliteit. De #1 Nederlandse streaming service met uitgebreide collectie Nederlandse entertainment.',
      'Nederlandse video streaming, Nederlandse films, Nederlandse series, Nederlandse documentaires, Nederlandse muziekvideos, Nederlandse content, streaming platform Nederland, online video kijken, Nederlandse video platform, Bitzomax Nederland, gratis Nederlandse videos, premium Nederlandse content, streaming service Nederland, Nederlandse online videos, video on demand Nederland, Nederlandse media streaming, Dutch video streaming, Dutch content platform'
    );
    
    this.loadVideos();
  }
  ngAfterViewInit(): void {
    // Only run performance optimizations in browser
    if (this.isBrowser) {
      // Initialize performance optimizations after view is initialized
      this.performanceService.addResourceHints();
      this.performanceService.optimizeImageLoading();
      
      // Initialize comprehensive schema markup
      this.schemaMarkupService.initializeBasicSchemas();
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }
  loadVideos(): void {
    this.loading = true;
    this.error = '';
      this.videoService.getVideos().subscribe({
      next: (videos: any[]) => {
        this.videos = videos.filter((video: any) => {
          if (this.selectedCategory === 'all') return true;
          if (this.selectedCategory === 'free') return video.contentType === 'FREE';
          if (this.selectedCategory === 'premium') return video.contentType === 'PREMIUM';
          return true;
        });
        this.loading = false;
        
        // Add collection page schema markup after videos are loaded
        if (this.isBrowser && this.videos.length > 0) {
          const categoryLabel = this.selectedCategory === 'all' ? undefined : this.selectedCategory;
          this.schemaMarkupService.addCollectionPageSchema(this.videos, categoryLabel);
        }
      },
      error: (err: any) => {
        this.error = 'Fout bij het laden van video\'s';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.loadVideos();
  }

  canWatchVideo(video: any): boolean {
    if (video.contentType === 'FREE') return true;
    return this.authService.isAuthenticated() && this.authService.getCurrentUser()?.premium;
  }  getVideoThumbnail(video: any): string {
    if (video.coverImageUrl) {
      return this.videoService.getCoverImageUrl(video.coverImageUrl);
    }
    return 'assets/images/default-thumbnail.svg';
  }

  getVideoUrl(videoUrl: string): string {
    return this.videoService.getVideoUrl(videoUrl);
  }  playVideo(video: any): void {
    // Check if user is authenticated first
    if (!this.authService.isAuthenticated()) {
      this.showRegistrationPrompt = true;
      return;
    }

    // Check if user can watch the video (premium content)
    if (!this.canWatchVideo(video)) {
      // Handle premium content or navigate to login
      return;
    }
    
    if (this.playingVideoId === video.id) {
      this.stopVideo();
    } else {
      this.stopVideo(); // Stop any currently playing video
      
      // Set loading state
      this.loadingVideoId = video.id;
      
      // Load video immediately (no timeout needed)
      this.playingVideoId = video.id;
      this.loadingVideoId = null;
    }
  }

  onVideoLoadStart(videoId: number): void {
    this.loadingVideoId = videoId;
  }

  onVideoCanPlay(videoId: number): void {
    this.loadingVideoId = null;
  }

  isVideoLoading(videoId: number): boolean {
    return this.loadingVideoId === videoId;
  }
  onVideoPlay(video: any): void {
    // Only increment view count once per video session
    if (this.viewIncrementedVideos.has(video.id)) {
      return;
    }
    
    this.viewIncrementedVideos.add(video.id);
    
    // Track video play in Google Analytics
    this.googleAnalytics.trackVideoPlay(video.id, video.title, video.contentType);
    
    // Increment view count when video actually starts playing
    this.videoService.incrementView(video.id).subscribe({
      next: (updatedVideo) => {
        // Update the video in the array with new view count
        const index = this.videos.findIndex(v => v.id === video.id);
        if (index !== -1) {
          this.videos[index].viewCount = updatedVideo.viewCount;
        }
      },
      error: (error) => {
        console.error('Error incrementing view:', error);
        // Remove from tracked set on error so it can be retried
        this.viewIncrementedVideos.delete(video.id);
        // Error is handled gracefully - view increment failure doesn't break video playback
      }
    });
  }
  stopVideo(): void {
    this.playingVideoId = null;
  }

  closeRegistrationPrompt(): void {
    this.showRegistrationPrompt = false;
  }
  onImageError(event: any): void {
    event.target.src = 'assets/images/default-thumbnail.svg';
  }

  formatDuration(duration: number): string {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  formatViews(views: number): string {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  }
  hasExternalLinks(video: any): boolean {
    return !!(video.spotifyLink || video.amazonLink || video.appleMusicLink || 
              video.itunesLink || video.youtubeMusicLink || video.instagramLink);
  }
  toggleLike(video: any): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.videoService.toggleLike(video.id).subscribe({
      next: (updatedVideo) => {
        const index = this.videos.findIndex(v => v.id === video.id);
        if (index !== -1) {
          this.videos[index].likeCount = updatedVideo.likeCount;
          this.videos[index].isLiked = updatedVideo.isLiked;
          
          // Track like action in Google Analytics
          if (updatedVideo.isLiked) {
            this.googleAnalytics.trackVideoLike(video.id, video.title);
          }
        }
      },
      error: (error) => {
        console.error('Error toggling like:', error);
      }
    });
  }

  toggleFavorite(video: any): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.videoService.toggleFavorite(video.id).subscribe({
      next: (updatedVideo) => {
        const index = this.videos.findIndex(v => v.id === video.id);
        if (index !== -1) {
          this.videos[index].isFavorited = updatedVideo.isFavorited;
          if (updatedVideo.favoriteCount !== undefined) {
            this.videos[index].favoriteCount = updatedVideo.favoriteCount;
          }
          
          // Track add to wishlist in Google Analytics
          if (updatedVideo.isFavorited) {
            this.googleAnalytics.trackAddToWishlist(video.id, video.title);
          }
        }
      },
      error: (error) => {
        console.error('Error toggling favorite:', error);
      }
    });
  }
}
