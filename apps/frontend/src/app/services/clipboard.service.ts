import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Result of a clipboard operation
 */
export interface ClipboardResult {
  success: boolean;
  error?: string;
}

/**
 * Service responsible for clipboard operations
 * Follows Single Responsibility Principle - only handles clipboard interactions
 */
@Injectable({
  providedIn: 'root',
})
export class ClipboardService {
  /**
   * Copy text to clipboard
   * @param text - The text to copy
   * @returns Observable with the result of the operation
   */
  copyToClipboard(text: string): Observable<ClipboardResult> {
    return from(navigator.clipboard.writeText(text)).pipe(
      map(() => ({ success: true })),
      catchError((error) => {
        console.error('Failed to copy to clipboard:', error);
        return of({ success: false, error: 'Failed to copy to clipboard' });
      }),
    );
  }
}
