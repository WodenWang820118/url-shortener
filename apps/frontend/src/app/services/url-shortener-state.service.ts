import { Injectable, signal, WritableSignal } from '@angular/core';

/**
 * Interface representing the state of the URL shortener component
 */
export interface UrlShortenerState {
  longUrl: string;
  shortenedUrl: string | null;
  errorMessage: string | null;
  isLoading: boolean;
  showQrCode: boolean;
}

/**
 * Service responsible for managing URL shortener state
 * Follows Single Responsibility Principle - only handles state management
 */
@Injectable()
export class UrlShortenerStateService {
  private readonly _longUrl: WritableSignal<string> = signal('');
  private readonly _shortenedUrl: WritableSignal<string | null> = signal(null);
  private readonly _errorMessage: WritableSignal<string | null> = signal(null);
  private readonly _isLoading: WritableSignal<boolean> = signal(false);
  private readonly _showQrCode: WritableSignal<boolean> = signal(false);

  // Read-only signals exposed to the component
  readonly longUrl = this._longUrl.asReadonly();
  readonly shortenedUrl = this._shortenedUrl.asReadonly();
  readonly errorMessage = this._errorMessage.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly showQrCode = this._showQrCode.asReadonly();

  /**
   * Update the long URL
   */
  setLongUrl(url: string): void {
    this._longUrl.set(url);
  }

  /**
   * Update the shortened URL
   */
  setShortenedUrl(url: string | null): void {
    this._shortenedUrl.set(url);
  }

  /**
   * Update the error message
   */
  setErrorMessage(message: string | null): void {
    this._errorMessage.set(message);
  }

  /**
   * Update the loading state
   */
  setIsLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }

  /**
   * Toggle QR code visibility
   */
  toggleQrCode(): void {
    this._showQrCode.set(!this._showQrCode());
  }

  /**
   * Set QR code visibility
   */
  setShowQrCode(show: boolean): void {
    this._showQrCode.set(show);
  }

  /**
   * Reset the entire state
   */
  reset(): void {
    this._longUrl.set('');
    this._shortenedUrl.set(null);
    this._errorMessage.set(null);
    this._isLoading.set(false);
    this._showQrCode.set(false);
  }

  /**
   * Clear results and errors (used when starting a new shortening operation)
   */
  clearResults(): void {
    this._shortenedUrl.set(null);
    this._errorMessage.set(null);
    this._showQrCode.set(false);
  }
}
