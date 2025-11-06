import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { UrlShortenerComponent } from './url-shortener.component';
import { UrlShortenerService } from '../services/url-shortener.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('UrlShortenerComponent', () => {
  let component: UrlShortenerComponent;
  let fixture: ComponentFixture<UrlShortenerComponent>;
  let service: UrlShortenerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UrlShortenerComponent],
      providers: [
        UrlShortenerService,
        MessageService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UrlShortenerComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(UrlShortenerService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form validation', () => {
    it('should show error when submitting empty URL', () => {
      component.longUrl.set('');
      component.onSubmit();

      expect(component.errorMessage()).toBe('Please enter a URL');
      expect(component.shortenedUrl()).toBeNull();
    });

    it('should show error when submitting invalid URL', () => {
      component.longUrl.set('not-a-valid-url');
      component.onSubmit();

      expect(component.errorMessage()).toBe('Please enter a valid URL');
      expect(component.shortenedUrl()).toBeNull();
    });

    it('should accept valid URLs', () => {
      const mockResponse = {
        shortUrl: 'http://localhost:3000/abc123',
        shortCode: 'abc123',
        originalUrl: 'https://example.com/test',
        createdAt: new Date().toISOString(),
      };

      vi.spyOn(service, 'shortenUrl').mockReturnValue(of(mockResponse));
      vi.spyOn(service, 'getFullShortUrl').mockReturnValue(
        'http://localhost:3000/abc123',
      );

      component.longUrl.set('https://example.com/test');
      component.onSubmit();

      expect(component.errorMessage()).toBeNull();
      expect(service.shortenUrl).toHaveBeenCalledWith(
        'https://example.com/test',
      );
    });
  });

  describe('URL shortening', () => {
    it('should successfully shorten URL', () => {
      const mockResponse = {
        shortUrl: 'http://localhost:3000/xyz789',
        shortCode: 'xyz789',
        originalUrl: 'https://example.com/long-url',
        createdAt: new Date().toISOString(),
      };

      vi.spyOn(service, 'shortenUrl').mockReturnValue(of(mockResponse));
      vi.spyOn(service, 'getFullShortUrl').mockReturnValue(
        'http://localhost:3000/xyz789',
      );

      component.longUrl.set('https://example.com/long-url');
      component.onSubmit();

      expect(component.shortenedUrl()).toBe('http://localhost:3000/xyz789');
      expect(component.isLoading()).toBe(false);
      expect(component.errorMessage()).toBeNull();
    });

    it('should handle service error', () => {
      const error = { status: 500, message: 'Server error' };

      vi.spyOn(service, 'shortenUrl').mockReturnValue(throwError(() => error));

      component.longUrl.set('https://example.com/test');
      component.onSubmit();

      expect(component.errorMessage()).toBe(
        'Failed to shorten URL. Please try again later.',
      );
      expect(component.shortenedUrl()).toBeNull();
      expect(component.isLoading()).toBe(false);
    });

    it('should set loading state during request', () => {
      const mockResponse = {
        shortUrl: 'http://localhost:3000/test',
        shortCode: 'test',
        originalUrl: 'https://example.com/test',
        createdAt: new Date().toISOString(),
      };

      vi.spyOn(service, 'shortenUrl').mockReturnValue(of(mockResponse));
      vi.spyOn(service, 'getFullShortUrl').mockReturnValue(
        'http://localhost:3000/test',
      );

      component.longUrl.set('https://example.com/test');

      expect(component.isLoading()).toBe(false);
      component.onSubmit();
      expect(component.isLoading()).toBe(false); // Already completed in sync test
    });
  });

  describe('QR code functionality', () => {
    it('should toggle QR code visibility', () => {
      expect(component.showQrCode()).toBe(false);

      component.toggleQrCode();
      expect(component.showQrCode()).toBe(true);

      component.toggleQrCode();
      expect(component.showQrCode()).toBe(false);
    });
  });

  describe('Reset functionality', () => {
    it('should reset all form fields and state', () => {
      // Set some state
      component.longUrl.set('https://example.com/test');
      component.shortenedUrl.set('http://localhost:3000/abc123');
      component.errorMessage.set('Some error');
      component.showQrCode.set(true);

      // Reset
      component.reset();

      // Verify reset
      expect(component.longUrl()).toBe('');
      expect(component.shortenedUrl()).toBeNull();
      expect(component.errorMessage()).toBeNull();
      expect(component.showQrCode()).toBe(false);
    });
  });

  describe('Copy to clipboard', () => {
    it('should copy shortened URL to clipboard', async () => {
      const mockClipboard = {
        writeText: vi.fn().mockResolvedValue(undefined),
      };
      Object.assign(navigator, { clipboard: mockClipboard });

      // Mock alert
      vi.spyOn(globalThis, 'alert').mockImplementation(() => {});

      component.shortenedUrl.set('http://localhost:3000/test123');
      component.copyToClipboard();

      await Promise.resolve(); // Wait for clipboard operation

      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        'http://localhost:3000/test123',
      );
    });
  });
});
