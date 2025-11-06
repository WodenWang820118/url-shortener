import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  UrlShortenerService,
  ShortenUrlResponse,
} from './url-shortener.service';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('UrlShortenerService', () => {
  let service: UrlShortenerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UrlShortenerService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(UrlShortenerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('shortenUrl', () => {
    it('should send POST request to shorten URL', () => {
      const mockResponse: ShortenUrlResponse = {
        shortUrl: 'http://localhost:3000/abc123',
        shortCode: 'abc123',
        originalUrl: 'https://example.com/very-long-url',
        createdAt: new Date().toISOString(),
      };

      const longUrl = 'https://example.com/very-long-url';

      service.shortenUrl(longUrl).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.shortCode).toBe('abc123');
        expect(response.originalUrl).toBe(longUrl);
      });

      const req = httpMock.expectOne('http://localhost:3000/api/shorten');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ longUrl });

      req.flush(mockResponse);
    });

    it('should handle error response', () => {
      const longUrl = 'https://example.com/test';

      service.shortenUrl(longUrl).subscribe({
        next: () => {
          throw new Error('should have failed with 500 error');
        },
        error: (error) => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/api/shorten');
      req.flush('Internal Server Error', {
        status: 500,
        statusText: 'Internal Server Error',
      });
    });
  });

  describe('getFullShortUrl', () => {
    it('should return full shortened URL with short code', () => {
      const shortCode = 'abc123';
      const result = service.getFullShortUrl(shortCode);

      expect(result).toBe('http://localhost:3000/abc123');
    });

    it('should handle different short codes', () => {
      expect(service.getFullShortUrl('xyz789')).toBe(
        'http://localhost:3000/xyz789',
      );
      expect(service.getFullShortUrl('test')).toBe(
        'http://localhost:3000/test',
      );
    });
  });
});
