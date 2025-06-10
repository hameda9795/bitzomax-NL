import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { VideoService, Video } from '../../../services/video.service';

@Component({
  selector: 'app-video-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './video-edit.component.html',
  styleUrls: ['./video-edit.component.scss']
})
export class VideoEditComponent implements OnInit {
  editForm: FormGroup;
  isLoading = false;
  isLoadingVideo = true;
  errorMessage = '';
  successMessage = '';
  selectedVideoFile: File | null = null;
  selectedImageFile: File | null = null;
  videoId: number;
  currentVideo: Video | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private videoService: VideoService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Initialize the form in constructor to avoid template errors
    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      poemText: [''],
      hashtags: [''],
      contentType: ['FREE', [Validators.required]],
      seoTitle: [''],
      seoDescription: [''],
      seoKeywords: [''],
      spotifyLink: [''],
      amazonLink: [''],
      appleMusicLink: [''],
      itunesLink: [''],
      youtubeMusicLink: [''],
      instagramLink: ['']
    });

    this.videoId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/home']);
      return;
    }

    this.loadVideo();
  }

  loadVideo(): void {
    this.isLoadingVideo = true;
    this.videoService.getVideo(this.videoId).subscribe({
      next: (video) => {
        this.currentVideo = video;
        this.populateForm(video);
        this.isLoadingVideo = false;
      },
      error: (error) => {
        console.error('Error loading video:', error);
        this.errorMessage = 'Fout bij het laden van de video';
        this.isLoadingVideo = false;
      }
    });
  }

  populateForm(video: Video): void {
    this.editForm.patchValue({
      title: video.title,
      description: video.description,
      poemText: video.poemText,
      hashtags: video.hashtags,
      contentType: video.contentType,
      seoTitle: video.seoTitle,
      seoDescription: video.seoDescription,
      seoKeywords: video.seoKeywords,
      spotifyLink: video.spotifyLink,
      amazonLink: video.amazonLink,
      appleMusicLink: video.appleMusicLink,
      itunesLink: video.itunesLink,
      youtubeMusicLink: video.youtubeMusicLink,
      instagramLink: video.instagramLink
    });
  }

  onVideoFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        this.selectedVideoFile = file;
        this.errorMessage = '';
      } else {
        this.errorMessage = 'Selecteer een geldig videobestand';
        event.target.value = '';
      }
    }
  }

  onImageFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        this.selectedImageFile = file;
        this.errorMessage = '';
      } else {
        this.errorMessage = 'Selecteer een geldige afbeelding';
        event.target.value = '';
      }
    }
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.editForm.value;

      this.videoService.updateVideo(
        this.videoId,
        formData,
        this.selectedVideoFile || undefined,
        this.selectedImageFile || undefined
      ).subscribe({
        next: (response) => {
          this.successMessage = 'Video succesvol bijgewerkt!';
          this.isLoading = false;
          
          // Navigate back to admin dashboard after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/admin/dashboard']);
          }, 2000);
        },
        error: (error) => {
          console.error('Upload Error:', error);
          this.errorMessage = error.error?.message || 'Er is een fout opgetreden bij het bijwerken van de video';
          this.isLoading = false;
        }
      });
    } else {
      this.errorMessage = 'Vul alle verplichte velden in';
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  getCurrentVideoUrl(): string {
    return this.currentVideo ? this.videoService.getVideoUrl(this.currentVideo.videoUrl) : '';
  }

  getCurrentCoverImageUrl(): string {
    return this.currentVideo && this.currentVideo.coverImageUrl 
      ? this.videoService.getCoverImageUrl(this.currentVideo.coverImageUrl) 
      : '';
  }
}
