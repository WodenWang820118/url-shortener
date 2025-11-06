import { TestBed } from '@angular/core/testing';
import { UrlShortenerStateService } from './url-shortener-state.service';

describe('UrlShortenerStateService', () => {
  let service: UrlShortenerStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UrlShortenerStateService],
    });
    service = TestBed.inject(UrlShortenerStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(service.longUrl()).toBe('');
    expect(service.shortenedUrl()).toBeNull();
    expect(service.errorMessage()).toBeNull();
    expect(service.isLoading()).toBe(false);
    expect(service.showQrCode()).toBe(false);
  });

  describe('setLongUrl', () => {
    it('should update longUrl', () => {
      service.setLongUrl('https://example.com');
      expect(service.longUrl()).toBe('https://example.com');
    });
  });

  describe('setShortenedUrl', () => {
    it('should update shortenedUrl', () => {
      service.setShortenedUrl('https://short.url/abc');
      expect(service.shortenedUrl()).toBe('https://short.url/abc');
    });

    it('should allow setting to null', () => {
      service.setShortenedUrl('https://short.url/abc');
      service.setShortenedUrl(null);
      expect(service.shortenedUrl()).toBeNull();
    });
  });

  describe('setErrorMessage', () => {
    it('should update errorMessage', () => {
      service.setErrorMessage('Error occurred');
      expect(service.errorMessage()).toBe('Error occurred');
    });

    it('should allow setting to null', () => {
      service.setErrorMessage('Error occurred');
      service.setErrorMessage(null);
      expect(service.errorMessage()).toBeNull();
    });
  });

  describe('setIsLoading', () => {
    it('should update isLoading', () => {
      service.setIsLoading(true);
      expect(service.isLoading()).toBe(true);

      service.setIsLoading(false);
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('toggleQrCode', () => {
    it('should toggle QR code visibility', () => {
      expect(service.showQrCode()).toBe(false);

      service.toggleQrCode();
      expect(service.showQrCode()).toBe(true);

      service.toggleQrCode();
      expect(service.showQrCode()).toBe(false);
    });
  });

  describe('setShowQrCode', () => {
    it('should set QR code visibility', () => {
      service.setShowQrCode(true);
      expect(service.showQrCode()).toBe(true);

      service.setShowQrCode(false);
      expect(service.showQrCode()).toBe(false);
    });
  });

  describe('clearResults', () => {
    it('should clear results and errors but preserve longUrl', () => {
      service.setLongUrl('https://example.com');
      service.setShortenedUrl('https://short.url/abc');
      service.setErrorMessage('Some error');
      service.setShowQrCode(true);

      service.clearResults();

      expect(service.longUrl()).toBe('https://example.com');
      expect(service.shortenedUrl()).toBeNull();
      expect(service.errorMessage()).toBeNull();
      expect(service.showQrCode()).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      service.setLongUrl('https://example.com');
      service.setShortenedUrl('https://short.url/abc');
      service.setErrorMessage('Some error');
      service.setIsLoading(true);
      service.setShowQrCode(true);

      service.reset();

      expect(service.longUrl()).toBe('');
      expect(service.shortenedUrl()).toBeNull();
      expect(service.errorMessage()).toBeNull();
      expect(service.isLoading()).toBe(false);
      expect(service.showQrCode()).toBe(false);
    });
  });
});
