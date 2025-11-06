import { Component, signal } from '@angular/core';
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
  providers: [MessageService],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4">
      <p-toast />

      <p-card class="w-full max-w-2xl shadow-2xl">
        <ng-template pTemplate="header">
          <div class="text-center py-4">
            <h1 class="text-4xl font-bold text-gray-800 mb-2">
              <i class="pi pi-link mr-3"></i>URL Shortener
            </h1>
            <p class="text-gray-600 text-lg">
              Transform long URLs into short, shareable links
            </p>
          </div>
        </ng-template>

        <ng-template pTemplate="content">
          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="flex flex-col sm:flex-row gap-3">
              <p-floatlabel class="flex-1">
                <input
                  pInputText
                  id="longUrl"
                  [(ngModel)]="longUrl"
                  name="longUrl"
                  [disabled]="isLoading()"
                  class="w-full"
                  placeholder="Enter your long URL here..."
                />
                <label for="longUrl">Long URL</label>
              </p-floatlabel>

              <p-button
                type="submit"
                [label]="isLoading() ? 'Shortening...' : 'Shorten URL'"
                icon="pi pi-link"
                [loading]="isLoading()"
                [disabled]="isLoading()"
                severity="primary"
                styleClass="whitespace-nowrap"
              />
            </div>

            @if (errorMessage()) {
              <p-message
                severity="error"
                [text]="errorMessage()!"
                styleClass="w-full"
              />
            }
          </form>

          @if (shortenedUrl()) {
            <div
              class="mt-8 pt-6 border-t border-gray-200 space-y-4 animate-fade-in"
            >
              <h2 class="text-2xl font-semibold text-gray-800 mb-4">
                <i class="pi pi-check-circle text-green-500 mr-2"></i>
                Your Shortened URL
              </h2>

              <div class="flex flex-col sm:flex-row gap-3">
                <input
                  pInputText
                  [value]="shortenedUrl()!"
                  readonly
                  class="flex-1 font-mono text-sm"
                />
                <p-button
                  label="Copy"
                  icon="pi pi-copy"
                  (onClick)="copyToClipboard()"
                  severity="secondary"
                  outlined
                />
              </div>

              <div class="flex flex-wrap gap-2">
                <p-button
                  [label]="showQrCode() ? 'Hide QR Code' : 'Show QR Code'"
                  [icon]="showQrCode() ? 'pi pi-eye-slash' : 'pi pi-qrcode'"
                  (onClick)="toggleQrCode()"
                  severity="secondary"
                  outlined
                />
                <p-button
                  label="Shorten Another"
                  icon="pi pi-plus"
                  (onClick)="reset()"
                  severity="secondary"
                  outlined
                />
              </div>

              @if (showQrCode() && shortenedUrl()) {
                <div
                  class="mt-6 p-6 bg-gray-50 rounded-lg text-center animate-fade-in"
                >
                  <h3 class="text-lg font-semibold text-gray-800 mb-4">
                    <i class="pi pi-qrcode mr-2"></i>QR Code
                  </h3>
                  <div class="inline-block bg-white p-4 rounded-lg shadow-md">
                    <qrcode
                      [qrdata]="shortenedUrl()!"
                      [width]="256"
                      [errorCorrectionLevel]="'M'"
                    ></qrcode>
                  </div>
                </div>
              }
            </div>
          }
        </ng-template>

        <ng-template pTemplate="footer">
          <div class="text-center text-sm text-gray-500">
            <i class="pi pi-info-circle mr-1"></i>
            Powered by Angular, PrimeNG, and TailwindCSS
          </div>
        </ng-template>
      </p-card>
    </div>
  `,
  styles: `
    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fade-in {
      animation: fade-in 0.5s ease-out;
    }
  `,
})
export class UrlShortenerComponent {
  longUrl = signal('');
  shortenedUrl = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);
  showQrCode = signal(false);

  constructor(
    private readonly urlShortenerService: UrlShortenerService,
    private readonly messageService: MessageService,
  ) {}

  /**
   * Validate if the input is a valid URL
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Handle form submission to shorten the URL
   */
  onSubmit(): void {
    this.errorMessage.set(null);
    this.shortenedUrl.set(null);
    this.showQrCode.set(false);

    const url = this.longUrl().trim();

    if (!url) {
      this.errorMessage.set('Please enter a URL');
      return;
    }

    if (!this.isValidUrl(url)) {
      this.errorMessage.set('Please enter a valid URL');
      return;
    }

    this.isLoading.set(true);

    this.urlShortenerService.shortenUrl(url).subscribe({
      next: (response: ShortenUrlResponse) => {
        const fullShortUrl = this.urlShortenerService.getFullShortUrl(
          response.shortCode,
        );
        this.shortenedUrl.set(fullShortUrl);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error shortening URL:', error);
        this.errorMessage.set('Failed to shorten URL. Please try again later.');
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Copy shortened URL to clipboard
   */
  copyToClipboard(): void {
    const url = this.shortenedUrl();
    if (url) {
      navigator.clipboard.writeText(url).then(
        () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'URL copied to clipboard!',
            life: 3000,
          });
        },
        (err) => {
          console.error('Failed to copy:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to copy URL',
            life: 3000,
          });
        },
      );
    }
  }

  /**
   * Toggle QR code visibility
   */
  toggleQrCode(): void {
    this.showQrCode.set(!this.showQrCode());
  }

  /**
   * Reset the form
   */
  reset(): void {
    this.longUrl.set('');
    this.shortenedUrl.set(null);
    this.errorMessage.set(null);
    this.showQrCode.set(false);
  }
}
