import { TestBed } from '@angular/core/testing';
import { UrlValidatorService } from './url-validator.service';

describe('UrlValidatorService', () => {
  let service: UrlValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UrlValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isValidUrl', () => {
    it('should return true for valid URLs', () => {
      expect(service.isValidUrl('https://example.com')).toBe(true);
      expect(service.isValidUrl('http://example.com')).toBe(true);
      expect(service.isValidUrl('https://example.com/path')).toBe(true);
      expect(service.isValidUrl('https://example.com/path?query=value')).toBe(
        true,
      );
    });

    it('should return false for invalid URLs', () => {
      expect(service.isValidUrl('')).toBe(false);
      expect(service.isValidUrl('   ')).toBe(false);
      expect(service.isValidUrl('not a url')).toBe(false);
      expect(service.isValidUrl('example.com')).toBe(false);
    });

    it('should handle null or undefined', () => {
      expect(service.isValidUrl(null as unknown as string)).toBe(false);
      expect(service.isValidUrl(undefined as unknown as string)).toBe(false);
    });
  });

  describe('validateWithMessage', () => {
    it('should return null for valid URLs', () => {
      expect(service.validateWithMessage('https://example.com')).toBeNull();
    });

    it('should return error message for empty URLs', () => {
      expect(service.validateWithMessage('')).toBe('Please enter a URL');
      expect(service.validateWithMessage('   ')).toBe('Please enter a URL');
    });

    it('should return error message for invalid URLs', () => {
      expect(service.validateWithMessage('not a url')).toBe(
        'Please enter a valid URL',
      );
      expect(service.validateWithMessage('example.com')).toBe(
        'Please enter a valid URL',
      );
    });

    it('should handle null or undefined', () => {
      expect(service.validateWithMessage(null as unknown as string)).toBe(
        'Please enter a URL',
      );
      expect(service.validateWithMessage(undefined as unknown as string)).toBe(
        'Please enter a URL',
      );
    });
  });
});
