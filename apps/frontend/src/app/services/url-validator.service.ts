import { Injectable } from '@angular/core';

/**
 * Service responsible for URL validation
 * Follows Single Responsibility Principle - only handles URL validation
 */
@Injectable({
  providedIn: 'root',
})
export class UrlValidatorService {
  /**
   * Validate if the input is a valid URL
   * @param url - The URL string to validate
   * @returns true if valid, false otherwise
   */
  isValidUrl(url: string): boolean {
    if (!url?.trim()) {
      return false;
    }

    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate and return error message if invalid
   * @param url - The URL string to validate
   * @returns null if valid, error message if invalid
   */
  validateWithMessage(url: string): string | null {
    const trimmedUrl = url?.trim();

    if (!trimmedUrl) {
      return 'Please enter a URL';
    }

    if (!this.isValidUrl(trimmedUrl)) {
      return 'Please enter a valid URL';
    }

    return null;
  }
}
