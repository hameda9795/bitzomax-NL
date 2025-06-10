import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { VideoService } from '../../../services/video.service';

@Component({
  selector: 'app-video-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './video-upload.component.html',
  styleUrls: ['./video-upload.component.scss']
})
export class VideoUploadComponent implements OnInit {
  uploadForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedVideoFile: File | null = null;
  selectedImageFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private videoService: VideoService,
    private router: Router
  ) {
    // Initialize the form in constructor to avoid template errors
    this.uploadForm = this.fb.group({
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
  }

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/home']);
      return;
    }
  }

  onVideoFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedVideoFile = input.files[0];
    }
  }

  onImageFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImageFile = input.files[0];
    }
  }  onSubmit(): void {
    // Refresh authentication state before making request
    this.authService.refreshAuthState();
    
    // Debug authentication status
    console.log('=== AUTHENTICATION DEBUG ===');
    console.log('Is authenticated:', this.authService.isAuthenticated());
    console.log('Is admin:', this.authService.isAdmin());
    console.log('Current user:', this.authService.getCurrentUser());
    console.log('Has valid session:', this.authService.hasValidSession());
    console.log('Token:', this.authService.getToken());

    if (!this.authService.isAuthenticated()) {
      this.errorMessage = 'Je bent niet ingelogd. Log eerst in.';
      this.router.navigate(['/login']);
      return;
    }

    if (!this.authService.isAdmin()) {
      this.errorMessage = 'Je hebt geen admin rechten om videos te uploaden.';
      // Optionally redirect to login to refresh session
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }

    if (this.uploadForm.valid && this.selectedVideoFile) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const videoData = this.uploadForm.value;

      this.videoService.uploadVideo(videoData, this.selectedVideoFile, this.selectedImageFile || undefined).subscribe({
        next: (response) => {
          this.successMessage = 'Video succesvol geüpload!';
          setTimeout(() => {
            this.router.navigate(['/admin']);
          }, 2000);
        },
        error: (error) => {
          console.error('Upload error details:', error);
          
          if (error.status === 403) {
            this.errorMessage = 'Toegang geweigerd. Controleer of je ingelogd bent als admin en probeer opnieuw in te loggen.';
            // Clear potentially corrupted session data
            this.authService.logout();
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else if (error.status === 401) {
            this.errorMessage = 'Je sessie is verlopen. Log opnieuw in.';
            this.authService.logout();
            this.router.navigate(['/login']);
          } else if (error.status === 413) {
            this.errorMessage = 'Het videobestand is te groot. Probeer een kleiner bestand.';
          } else if (error.status === 0) {
            this.errorMessage = 'Kan geen verbinding maken met de server. Controleer je internetverbinding.';
          } else {
            this.errorMessage = `Fout bij het uploaden: ${error.status} - ${error.statusText || 'Onbekende fout'}`;
          }
          
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
  get title() {
    return this.uploadForm?.get('title');
  }
}
