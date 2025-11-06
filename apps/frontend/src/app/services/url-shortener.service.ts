import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ShortenUrlRequest {
  longUrl: string;
}

export interface ShortenUrlResponse {
  shortUrl: string;
  shortCode: string;
  originalUrl: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class UrlShortenerService {
  private readonly apiUrl = 'http://localhost:3000/api'; // Producer service URL

  constructor(private readonly http: HttpClient) {}

  /**
   * Send a long URL to the producer service to be shortened
   */
  shortenUrl(longUrl: string): Observable<ShortenUrlResponse> {
    return this.http.post<ShortenUrlResponse>(`${this.apiUrl}/shorten`, {
      longUrl,
    });
  }

  /**
   * Get the full shortened URL
   */
  getFullShortUrl(shortCode: string): string {
    return `http://localhost:3000/${shortCode}`;
  }
}
