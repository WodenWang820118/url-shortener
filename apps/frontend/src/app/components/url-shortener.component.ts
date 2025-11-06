import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QRCodeComponent } from 'angularx-qrcode';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import {
  UrlShortenerService,
  ShortenUrlResponse,
} from '../services/url-shortener.service';
import {
  UrlValidatorService,
  ClipboardService,
  UrlShortenerStateService,
} from '../services';

@Component({
  selector: 'app-url-shortener',
  imports: [
    CommonModule,
    FormsModule,
    QRCodeComponent,
    ButtonModule,
    CardModule,
    InputTextModule,
    MessageModule,
    FloatLabelModule,
    ToastModule,
  ],
  providers: [MessageService, UrlShortenerStateService],
  templateUrl: './url-shortener.component.html',
  styleUrls: ['./url-shortener.component.scss'],
})
export class UrlShortenerComponent {
  longUrl = '';

  constructor(
    private readonly urlShortenerService: UrlShortenerService,
    private readonly messageService: MessageService,
    private readonly urlValidator: UrlValidatorService,
    private readonly clipboardService: ClipboardService,
    readonly state: UrlShortenerStateService,
  ) {}

  /**
   * Handle form submission to shorten the URL
   */
  onSubmit(): void {
    this.state.clearResults();

    const validationError = this.urlValidator.validateWithMessage(this.longUrl);
    if (validationError) {
      this.state.setErrorMessage(validationError);
      return;
    }

    this.state.setIsLoading(true);

    this.urlShortenerService.shortenUrl(this.longUrl.trim()).subscribe({
      next: (response: ShortenUrlResponse) => {
        const fullShortUrl = this.urlShortenerService.getFullShortUrl(
          response.shortCode,
        );
        this.state.setShortenedUrl(fullShortUrl);
        this.state.setIsLoading(false);
      },
      error: (error) => {
        console.error('Error shortening URL:', error);
        this.state.setErrorMessage(
          'Failed to shorten URL. Please try again later.',
        );
        this.state.setIsLoading(false);
      },
    });
  }

  /**
   * Copy shortened URL to clipboard
   */
  copyToClipboard(): void {
    const url = this.state.shortenedUrl();
    if (!url) {
      return;
    }

    this.clipboardService.copyToClipboard(url).subscribe((result) => {
      if (result.success) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'URL copied to clipboard!',
          life: 3000,
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: result.error || 'Failed to copy URL',
          life: 3000,
        });
      }
    });
  }

  /**
   * Toggle QR code visibility
   */
  toggleQrCode(): void {
    this.state.toggleQrCode();
  }

  /**
   * Reset the form
   */
  reset(): void {
    this.longUrl = '';
    this.state.reset();
  }
}
