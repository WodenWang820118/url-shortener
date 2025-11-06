import { TestBed } from '@angular/core/testing';
import { ClipboardService } from './clipboard.service';
import { vi } from 'vitest';

describe('ClipboardService', () => {
  let service: ClipboardService;
  let mockClipboard: { writeText: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockClipboard = {
      writeText: vi.fn(),
    };

    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
      configurable: true,
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(ClipboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('copyToClipboard', () => {
    it('should successfully copy text to clipboard', async () => {
      const testText = 'https://short.url/abc123';
      mockClipboard.writeText.mockResolvedValue(undefined);

      let result: { success: boolean; error?: string } | undefined;
      service.copyToClipboard(testText).subscribe((res) => {
        result = res;
      });

      await vi.waitFor(() => expect(result).toBeDefined());

      expect(result?.success).toBe(true);
      expect(result?.error).toBeUndefined();
      expect(mockClipboard.writeText).toHaveBeenCalledWith(testText);
    });

    it('should handle clipboard write failure', async () => {
      const testText = 'https://short.url/abc123';
      const testError = new Error('Clipboard write failed');
      mockClipboard.writeText.mockRejectedValue(testError);

      let result: { success: boolean; error?: string } | undefined;
      service.copyToClipboard(testText).subscribe((res) => {
        result = res;
      });

      await vi.waitFor(() => expect(result).toBeDefined());

      expect(result?.success).toBe(false);
      expect(result?.error).toBe('Failed to copy to clipboard');
    });
  });
});
